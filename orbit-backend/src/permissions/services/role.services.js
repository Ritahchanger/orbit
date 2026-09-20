// services/role.service.js
const roleRepository = require("../repositories/role.repository");
const permissionRepository = require("../repositories/permission.repository");
const userReadRepository = require("../repositories/user-read.repository");

class RoleService {
    /**
     * Get all roles with optional filtering
     */
    async getAllRoles(options = {}) {

        const { includeSystemRoles = true, sortBy = 'level', sortOrder = 'desc' } = options;

        let query = {};

        if (!includeSystemRoles) {
            query.isSystemRole = false;
        }

        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const roles = await roleRepository.findAll(query, sort);

        // Get user counts for each role
        const rolesWithUserCounts = await Promise.all(
            roles.map(async (role) => {
                const userCount = await userReadRepository.countByRole(role.name);
                return {
                    ...role,
                    userCount
                };
            })
        );

        return rolesWithUserCounts;

    }

    /**
     * Get role by ID
     */
    async getRoleById(roleId) {

        const role = await roleRepository.findById(roleId);
        if (!role) {
            throw new Error("Role not found");
        }

        // Get user count
        const userCount = await userReadRepository.countByRole(role.name);

        return {
            ...role,
            userCount
        };

    }

    /**
     * Get role by name
     */
    async getRoleByName(roleName) {

        const role = await roleRepository.findByName(roleName);
        if (!role) {
            throw new Error(`Role '${roleName}' not found`);
        }

        // Get user count
        const userCount = await userReadRepository.countByRole(role.name);

        return {
            ...role,
            userCount
        };

    }

    /**
     * Get role by name — thin passthrough for external consumers (no throw,
     * no userCount enrichment). Matches how permissionValidator middleware and
     * normal-auth.service used to query the Role model directly.
     */
    async findRoleByName(name) {
        return await roleRepository.findByNameRaw(name);
    }

    /**
     * Create a new role
     */
    async createRole(roleData) {

        const existingRole = await roleRepository.findOneByName(roleData.name);

        if (existingRole) {
            throw new Error(`Role '${roleData.name}' already exists`);
        }

        // Validate permissions exist
        if (roleData.permissions && roleData.permissions.length > 0) {
            await this.validatePermissions(roleData.permissions);
        }

        // Validate level
        if (roleData.level < 1 || roleData.level > 10) {
            throw new Error("Role level must be between 1 and 10");
        }

        const savedRole = await roleRepository.create({
            name: roleData.name.toLowerCase(),
            description: roleData.description || "",
            permissions: roleData.permissions || [],
            isSystemRole: roleData.isSystemRole || false,
            canAssign: roleData.canAssign || false,
            level: roleData.level || 4
        });

        return savedRole.toObject();

    }

    /**
     * Update an existing role
     */
    async updateRole(roleId, updates) {

        const role = await roleRepository.findByIdForUpdate(roleId);
        if (!role) {
            throw new Error("Role not found");
        }

        // Prevent editing system roles
        if (role.isSystemRole) {
            throw new Error("Cannot edit system roles");
        }

        // If name is being updated, check for duplicates
        if (updates.name && updates.name.toLowerCase() !== role.name) {
            const existingRole = await roleRepository.findByNameExcludingId(updates.name, roleId);

            if (existingRole) {
                throw new Error(`Role '${updates.name}' already exists`);
            }
            updates.name = updates.name.toLowerCase();
        } else {
            delete updates.name;
        }

        // Validate permissions if being updated
        if (updates.permissions) {
            await this.validatePermissions(updates.permissions);
        }

        // Validate level
        if (updates.level && (updates.level < 1 || updates.level > 10)) {
            throw new Error("Role level must be between 1 and 10");
        }

        Object.assign(role, updates);
        const updatedRole = await roleRepository.save(role);

        return updatedRole.toObject();

    }

    /**
     * Delete a role
     */
    async deleteRole(roleId) {

        const role = await roleRepository.findByIdForUpdate(roleId);
        if (!role) {
            throw new Error("Role not found");
        }

        // Prevent deleting system roles
        if (role.isSystemRole) {
            throw new Error("Cannot delete system roles");
        }

        // Check if any users are assigned to this role
        const userCount = await userReadRepository.countByRole(role.name);
        if (userCount > 0) {
            throw new Error(`Cannot delete role. ${userCount} user(s) are assigned to this role.`);
        }

        await roleRepository.deleteOne(role);

        return {
            success: true,
            message: `Role '${role.name}' deleted successfully`
        };

    }

    /**
     * Add permission to role
     */
    async addPermissionToRole(roleId, permissionKey) {

        const role = await roleRepository.findByIdForUpdate(roleId);
        if (!role) {
            throw new Error("Role not found");
        }

        // Validate permission exists
        await this.validatePermissions([permissionKey]);

        // Check if permission already exists
        if (role.permissions.includes(permissionKey)) {
            throw new Error(`Role already has permission '${permissionKey}'`);
        }

        role.permissions.push(permissionKey);
        await roleRepository.save(role);

        return role.toObject();

    }

    /**
     * Remove permission from role
     */
    async removePermissionFromRole(roleId, permissionKey) {

        const role = await roleRepository.findByIdForUpdate(roleId);
        if (!role) {
            throw new Error("Role not found");
        }

        // Prevent modifying system roles
        if (role.isSystemRole) {
            throw new Error("Cannot modify permissions of system roles");
        }

        // Check if permission exists
        const index = role.permissions.indexOf(permissionKey);
        if (index === -1) {
            throw new Error(`Role does not have permission '${permissionKey}'`);
        }

        role.permissions.splice(index, 1);
        await roleRepository.save(role);

        return role.toObject();

    }

    /**
     * Get users assigned to a role
     */
    async getUsersByRole(roleId, options = {}) {

        const role = await roleRepository.findById(roleId);
        if (!role) {
            throw new Error("Role not found");
        }

        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

        const [users, total] = await userReadRepository.findPaginatedByRole(role.name, {
            page,
            limit,
            sortBy,
            sortOrder
        });

        return {
            users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };

    }

    /**
     * Check if user has permission through role
     */
    async checkUserPermission(userId, permissionKey) {

        const user = await userReadRepository.findByIdLean(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Superadmin has all permissions
        if (user.role === 'superadmin') {
            return true;
        }

        const role = await roleRepository.findOneByName(user.role);
        if (!role) {
            return false;
        }

        return role.hasPermission(permissionKey);

    }

    /**
     * Get role hierarchy (roles that can be assigned by current role)
     */
    async getAssignableRoles(roleName) {

        const currentRole = await roleRepository.findByNameRaw(roleName);
        if (!currentRole) {
            throw new Error("Current role not found");
        }

        // If role cannot assign other roles, return empty array
        if (!currentRole.canAssign) {
            return [];
        }

        // Get roles at or below current role level
        const assignableRoles = await roleRepository.findAssignable(currentRole.level);

        return assignableRoles;

    }

    /**
     * Validate permissions exist in Permission model
     */
    async validatePermissions(permissionKeys) {

        const permissions = await permissionRepository.findByKeys(permissionKeys);

        const foundKeys = permissions.map(p => p.key);
        const invalidKeys = permissionKeys.filter(key => !foundKeys.includes(key));

        if (invalidKeys.length > 0) {
            throw new Error(`Invalid permissions: ${invalidKeys.join(', ')}`);
        }

        return true;

    }

    /**
     * Sync role with available permissions
     */
    async syncRolePermissions(roleId) {

        const role = await roleRepository.findByIdForUpdate(roleId);
        if (!role) {
            throw new Error("Role not found");
        }

        // Get all available permissions
        const allPermissions = await permissionRepository.findAllKeys();
        const allPermissionKeys = allPermissions.map(p => p.key);

        // Remove permissions that no longer exist
        const validPermissions = role.permissions.filter(perm =>
            allPermissionKeys.includes(perm)
        );

        // Update if there are changes
        if (validPermissions.length !== role.permissions.length) {
            role.permissions = validPermissions;
            await roleRepository.save(role);
        }

        return {
            removedCount: role.permissions.length - validPermissions.length,
            validPermissions: validPermissions.length
        };

    }

    /**
     * Seed default roles
     */
    async seedDefaultRoles() {

        const defaultRoles = roleRepository.getDefaultRoles();
        const results = [];

        for (const [key, roleData] of Object.entries(defaultRoles)) {
            const existingRole = await roleRepository.findOneByName(roleData.name);

            if (!existingRole) {
                await roleRepository.create(roleData);
                results.push({
                    role: roleData.name,
                    action: 'created',
                    status: 'success'
                });
            } else {
                results.push({
                    role: roleData.name,
                    action: 'skipped',
                    status: 'exists'
                });
            }
        }

        return results;

    }

    /**
     * Get role statistics
     */
    async getRoleStatistics() {

        const roles = await roleRepository.findAll();
        const statistics = {
            totalRoles: roles.length,
            systemRoles: roles.filter(r => r.isSystemRole).length,
            customRoles: roles.filter(r => !r.isSystemRole).length,
            byLevel: {},
            totalUsers: 0,
            rolesWithUsers: []
        };

        // Get user counts for each role
        for (const role of roles) {
            const userCount = await userReadRepository.countByRole(role.name);
            statistics.totalUsers += userCount;

            // Count by level
            statistics.byLevel[role.level] = (statistics.byLevel[role.level] || 0) + 1;

            statistics.rolesWithUsers.push({
                roleName: role.name,
                displayName: role.name.charAt(0).toUpperCase() + role.name.slice(1),
                userCount,
                level: role.level,
                isSystemRole: role.isSystemRole
            });
        }

        // Sort roles by user count
        statistics.rolesWithUsers.sort((a, b) => b.userCount - a.userCount);

        return statistics;

    }

    /**
     * Count all roles (raw passthrough — used by seeders)
     */
    async countRoles() {
        return await roleRepository.countAll();
    }

    /**
     * Get all roles, no enrichment (raw passthrough — used by seeders)
     */
    async findAllRoles() {
        return await roleRepository.findAll();
    }

    /**
     * Delete all roles (raw passthrough — used by seeders)
     */
    async deleteAllRoles() {
        return await roleRepository.deleteAll();
    }

    /**
     * Bulk insert roles (raw passthrough — used by seeders)
     */
    async insertRoles(docs) {
        return await roleRepository.insertMany(docs);
    }
}

module.exports = new RoleService();
