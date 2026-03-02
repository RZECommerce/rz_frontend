/**
 * RBAC (Role-Based Access Control) store
 * Manages user roles and permissions state
 * Supports JSON-based permission structure: { module: [permissions] }
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Permissions } from "@/types/auth";

interface RbacState {
  roles: string[];
  permissions: Permissions; // JSON structure: { module: [permissions] }
  permissionsFlat: string[]; // Flattened array for backward compatibility
}

interface RbacActions {
  setRoles: (roles: string[]) => void;
  setPermissions: (permissions: Permissions | string[]) => void;
  isSuperAdmin: () => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  getPermissionsByModule: (module: string) => string[];
  getAllModules: () => string[];
  getSubModules: (module: string) => string[];
  getPermissionsBySubModule: (module: string, subModule: string) => string[];
  hasModulePermission: (module: string, subModule?: string) => boolean;
}

/**
 * Flatten permissions from JSON structure to array
 * Handles both flat and nested structures:
 * - Flat: { "employees": ["employees.view"] }
 * - Nested: { "hris": { "employees": ["employees.view"] } }
 */
function flattenPermissions(permissions: Permissions | string[]): string[] {
  if (Array.isArray(permissions)) {
    return permissions; // Already flat array (legacy format)
  }

  // Flatten JSON structure (handles both flat and nested)
  const flat: string[] = [];
  for (const module in permissions) {
    const modulePerms = permissions[module];
    if (Array.isArray(modulePerms)) {
      // Flat structure: { "employees": ["employees.view"] }
      flat.push(...modulePerms);
    } else if (typeof modulePerms === 'object' && modulePerms !== null && !Array.isArray(modulePerms)) {
      // Nested structure: { "hris": { "employees": ["employees.view"] } }
      const nestedPerms = modulePerms as Record<string, string[]>;
      for (const subModule in nestedPerms) {
        if (Array.isArray(nestedPerms[subModule])) {
          flat.push(...nestedPerms[subModule]);
        }
      }
    }
  }
  return flat;
}

/**
 * Normalize permissions to JSON structure
 * Handles both flat arrays and nested structures from API
 */
function normalizePermissions(permissions: Permissions | string[]): Permissions {
  if (Array.isArray(permissions)) {
    // Convert flat array to JSON structure by parsing permission names
    // e.g., "employees.view" -> { employees: ["employees.view"] }
    const normalized: Permissions = {};
    for (const perm of permissions) {
      const parts = perm.split('.');
      if (parts.length >= 2) {
        const module = parts[0];
        if (!normalized[module]) {
          normalized[module] = [];
        }
        if (Array.isArray(normalized[module])) {
          normalized[module].push(perm);
        }
      }
    }
    return normalized;
  }
  
  // If it's already an object, check if it's nested and keep as-is
  // The API returns nested structure like { "hris": { "employees": [...] } }
  // which is already in the correct format
  return permissions;
}

export const useRbacStore = create<RbacState & RbacActions>()(
  devtools(
    (set, get) => ({
      roles: [],
      permissions: {},
      permissionsFlat: [],

      setRoles: (roles) =>
        set({ roles }),

      setPermissions: (permissions) => {
        const normalized = normalizePermissions(permissions);
        const flat = flattenPermissions(normalized);
        set({ 
          permissions: normalized,
          permissionsFlat: flat,
        });
      },

      isSuperAdmin: () => {
        const { roles } = get();
        return roles.includes("super-admin");
      },

      hasPermission: (permission) => {
        const { isSuperAdmin, permissions, permissionsFlat } = get();
        
        // Super-admin always returns true
        if (isSuperAdmin()) {
          return true;
        }

        // Check in flattened array (faster for simple checks)
        if (permissionsFlat.includes(permission)) {
          return true;
        }

        // Also check in JSON structure (handles both flat and nested)
        for (const module in permissions) {
          const modulePerms = permissions[module];
          if (Array.isArray(modulePerms)) {
            // Flat structure
            if (modulePerms.includes(permission)) {
              return true;
            }
          } else if (typeof modulePerms === 'object' && modulePerms !== null && !Array.isArray(modulePerms)) {
            // Nested structure
            const nestedPerms = modulePerms as Record<string, string[]>;
            for (const subModule in nestedPerms) {
              if (Array.isArray(nestedPerms[subModule]) && nestedPerms[subModule].includes(permission)) {
                return true;
              }
            }
          }
        }

        return false;
      },

      hasAnyPermission: (permissionsToCheck) => {
        const { isSuperAdmin, hasPermission } = get();
        
        // Super-admin always returns true
        if (isSuperAdmin()) {
          return true;
        }

        return permissionsToCheck.some((perm) => hasPermission(perm));
      },

      hasAllPermissions: (permissionsToCheck) => {
        const { isSuperAdmin, hasPermission } = get();
        
        // Super-admin always returns true
        if (isSuperAdmin()) {
          return true;
        }

        return permissionsToCheck.every((perm) => hasPermission(perm));
      },

      getPermissionsByModule: (module) => {
        const { permissions } = get();
        const modulePerms = permissions[module];
        if (Array.isArray(modulePerms)) {
          return modulePerms;
        }
        if (typeof modulePerms === 'object' && modulePerms !== null && !Array.isArray(modulePerms)) {
          // Nested structure - flatten all sub-module permissions
          const flat: string[] = [];
          const nestedPerms = modulePerms as Record<string, string[]>;
          for (const subModule in nestedPerms) {
            if (Array.isArray(nestedPerms[subModule])) {
              flat.push(...nestedPerms[subModule]);
            }
          }
          return flat;
        }
        return [];
      },
      
      getSubModules: (module: string) => {
        const { permissions } = get();
        const modulePerms = permissions[module];
        if (typeof modulePerms === 'object' && modulePerms !== null && !Array.isArray(modulePerms)) {
          return Object.keys(modulePerms);
        }
        return [];
      },
      
      getPermissionsBySubModule: (module: string, subModule: string) => {
        const { permissions } = get();
        const modulePerms = permissions[module];
        if (typeof modulePerms === 'object' && modulePerms !== null && !Array.isArray(modulePerms)) {
          return Array.isArray(modulePerms[subModule]) ? modulePerms[subModule] : [];
        }
        return [];
      },
      
      hasModulePermission: (module: string, subModule?: string) => {
        const { isSuperAdmin, permissions, hasAnyPermission } = get();
        
        if (isSuperAdmin()) {
          return true;
        }
        
        const modulePerms = permissions[module];
        if (!modulePerms) {
          return false;
        }
        
        if (subModule) {
          // Check if user has any permission in the sub-module
          const subModulePerms = get().getPermissionsBySubModule(module, subModule);
          return subModulePerms.length > 0;
        } else {
          // Check if user has any permission in the module
          const allModulePerms = get().getPermissionsByModule(module);
          return allModulePerms.length > 0;
        }
      },

      getAllModules: () => {
        const { permissions } = get();
        return Object.keys(permissions);
      },
    }),
    { name: "rbac-store" }
  )
);
