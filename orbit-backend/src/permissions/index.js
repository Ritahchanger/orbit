// src/permissions/index.js
// Public API of the permissions module. Other modules should require THIS file
// only — never reach into permissions/models or permissions/services directly.
const roleService = require("./services/role.services");
const permissionService = require("./services/permission.service");

module.exports = {
    // Used by permissionValidator middleware and normal-auth.service
    resolveUserPermissions: permissionService.resolveUserPermissions,
    findRoleByName: roleService.findRoleByName,

    // Used by seeders (orbit-test.seed.js, business.seed.js)
    countRoles: roleService.countRoles,
    findAllRoles: roleService.findAllRoles,
    deleteAllRoles: roleService.deleteAllRoles,
    insertRoles: roleService.insertRoles,
};
