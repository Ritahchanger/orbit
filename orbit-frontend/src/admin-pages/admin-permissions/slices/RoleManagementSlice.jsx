// store/slices/roleManagementSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  roles: [],
  permissions: [],
  selectedRole: null,
  editingRole: null,
  isAddingNewRole: false,
  newRole: {
    name: '',
    description: '',
    level: 4,
    canAssign: false,
    permissions: []
  },
  filter: {
    search: '',
    module: 'all',
    level: 'all'
  },
  loading: false,
  error: null,
  uiState: {
    isRolesLoading: false,
    isPermissionsLoading: false
  }
};

const roleManagementSlice = createSlice({
  name: 'roleManagement',
  initialState,
  reducers: {
    // Sync actions to update state from React Query hooks
    setRoles: (state, action) => {
      state.roles = action.payload;
    },

    setPermissions: (state, action) => {
      state.permissions = action.payload;
    },

    setRolesLoading: (state, action) => {
      state.uiState.isRolesLoading = action.payload;
    },

    setPermissionsLoading: (state, action) => {
      state.uiState.isPermissionsLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Role selection and editing
    selectRole: (state, action) => {
      state.selectedRole = action.payload;
      state.editingRole = null;
    },

    startEditingRole: (state, action) => {
      state.editingRole = { ...action.payload };
      state.selectedRole = null;
    },

    cancelEditing: (state) => {
      state.editingRole = null;
      state.selectedRole = null;
    },

    updateEditingRole: (state, action) => {
      if (state.editingRole) {
        state.editingRole = { ...state.editingRole, ...action.payload };
      }
    },

    // New role creation
    startAddingNewRole: (state) => {
      state.isAddingNewRole = true;
      state.newRole = initialState.newRole;
      state.selectedRole = null;
      state.editingRole = null;
    },

    updateNewRole: (state, action) => {
      state.newRole = { ...state.newRole, ...action.payload };
    },

    cancelNewRole: (state) => {
      state.isAddingNewRole = false;
      state.newRole = initialState.newRole;
    },

    // Add role after successful mutation (optimistic update)
    addRoleOptimistic: (state, action) => {
      state.roles.push(action.payload);
      state.isAddingNewRole = false;
      state.newRole = initialState.newRole;
    },

    // Update role after successful mutation (optimistic update)
    updateRoleOptimistic: (state, action) => {
      const index = state.roles.findIndex(role => role._id === action.payload._id);
      if (index !== -1) {
        state.roles[index] = action.payload;
      }
      if (state.editingRole && state.editingRole._id === action.payload._id) {
        state.editingRole = action.payload;
      }
    },

    // Delete role after successful mutation (optimistic update)
    deleteRoleOptimistic: (state, action) => {
      state.roles = state.roles.filter(role => role._id !== action.payload);
      if (state.selectedRole?._id === action.payload) {
        state.selectedRole = null;
      }
      if (state.editingRole?._id === action.payload) {
        state.editingRole = null;
      }
    },

    // Permission management
    togglePermission: (state, action) => {
      const { roleId, permissionKey, isNewRole = false } = action.payload;

      if (isNewRole) {
        const currentPermissions = state.newRole.permissions;
        if (currentPermissions.includes(permissionKey)) {
          state.newRole.permissions = currentPermissions.filter(p => p !== permissionKey);
        } else {
          state.newRole.permissions = [...currentPermissions, permissionKey];
        }
      } else if (state.editingRole) {
        const currentPermissions = state.editingRole.permissions;
        if (currentPermissions.includes(permissionKey)) {
          state.editingRole.permissions = currentPermissions.filter(p => p !== permissionKey);
        } else {
          state.editingRole.permissions = [...currentPermissions, permissionKey];
        }
      }
    },

    // Update permissions after mutation
    updateRolePermissions: (state, action) => {
      const { roleId, permissions } = action.payload;
      const index = state.roles.findIndex(role => role._id === roleId);
      if (index !== -1) {
        state.roles[index].permissions = permissions;
      }
      if (state.editingRole && state.editingRole._id === roleId) {
        state.editingRole.permissions = permissions;
      }
    },

    // Filtering
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },

    clearFilter: (state) => {
      state.filter = initialState.filter;
    },

    // Reset state
    resetRoleState: (state) => {
      return initialState;
    }
  }
});

// Export actions
export const {
  setRoles,
  setPermissions,
  setRolesLoading,
  setPermissionsLoading,
  setError,
  clearError,
  selectRole,
  startEditingRole,
  cancelEditing,
  updateEditingRole,
  startAddingNewRole,
  updateNewRole,
  cancelNewRole,
  addRoleOptimistic,
  updateRoleOptimistic,
  deleteRoleOptimistic,
  togglePermission,
  updateRolePermissions,
  setFilter,
  clearFilter,
  resetRoleState
} = roleManagementSlice.actions;

// Selectors
export const selectAllRoles = (state) => state.roleManagement.roles;
export const selectFilteredRoles = (state) => {
  const { roles, filter, permissions } = state.roleManagement;
  const { search, module, level } = filter;

  return roles.filter(role => {
    // Search filter
    if (search && !role.name.toLowerCase().includes(search.toLowerCase()) &&
      !role.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    // Module filter
    if (module !== 'all') {
      // Check if role has any permission from the selected module
      const hasModulePermission = role.permissions.some(permKey => {
        const permission = permissions.find(p => p.key === permKey);
        return permission?.module === module;
      });
      if (!hasModulePermission) return false;
    }

    // Level filter
    if (level !== 'all' && role.level !== parseInt(level)) {
      return false;
    }

    return true;
  });
};
export const selectSelectedRole = (state) => state.roleManagement.selectedRole;
export const selectEditingRole = (state) => state.roleManagement.editingRole;
export const selectIsAddingNewRole = (state) => state.roleManagement.isAddingNewRole;
export const selectNewRole = (state) => state.roleManagement.newRole;
export const selectAllPermissions = (state) => state.roleManagement.permissions;
export const selectPermissionsByModule = (state) => {
  const permissions = state.roleManagement.permissions;
  const grouped = {};

  permissions.forEach(perm => {
    if (!grouped[perm.module]) {
      grouped[perm.module] = [];
    }
    grouped[perm.module].push(perm);
  });

  return grouped;
};
export const selectFilter = (state) => state.roleManagement.filter;
export const selectLoading = (state) => state.roleManagement.uiState;
export const selectError = (state) => state.roleManagement.error;

// Helper selectors
export const getModules = (state) => {
  const permissions = state.roleManagement.permissions;
  const modules = [...new Set(permissions.map(p => p.module))];
  return modules;
};

export const getRoleById = (state, roleId) => {
  return state.roleManagement.roles.find(role => role._id === roleId);
};

export const selectSystemRoles = (state) => {
  return state.roleManagement.roles.filter(role => role.isSystemRole);
};

export const selectCustomRoles = (state) => {
  return state.roleManagement.roles.filter(role => !role.isSystemRole);
};

export const selectRolesByLevel = (state, minLevel = 1, maxLevel = 10) => {
  return state.roleManagement.roles.filter(
    role => role.level >= minLevel && role.level <= maxLevel
  );
};

// Helper functions for use with React Query hooks
export const syncRolesFromQuery = (data, dispatch) => {
  if (data) {
    dispatch(setRoles(data));
    dispatch(setRolesLoading(false));
  }
};

export const syncPermissionsFromQuery = (data, dispatch) => {
  if (data) {
    dispatch(setPermissions(data));
    dispatch(setPermissionsLoading(false));
  }
};

export const handleMutationSuccess = (data, mutationType, dispatch) => {
  switch (mutationType) {
    case 'create':
      dispatch(addRoleOptimistic(data));
      break;
    case 'update':
      dispatch(updateRoleOptimistic(data));
      break;
    case 'delete':
      dispatch(deleteRoleOptimistic(data._id || data));
      break;
    case 'addPermission':
    case 'removePermission':
      dispatch(updateRolePermissions({
        roleId: data._id,
        permissions: data.permissions
      }));
      break;
  }
};

export const handleMutationError = (error, dispatch) => {
  dispatch(setError(error.message || 'Operation failed'));
};

export default roleManagementSlice;