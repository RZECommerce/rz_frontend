/**
 * Permission utility functions
 * Helper functions for working with the JSON-based permission structure
 */

import type { Permissions } from "@/types/auth";

/**
 * Flatten permissions from JSON structure to array
 * Example: { "employees": ["employees.view"], "payroll": ["payroll.process"] }
 * Returns: ["employees.view", "payroll.process"]
 */
export function flattenPermissions(permissions: Permissions | string[]): string[] {
  if (Array.isArray(permissions)) {
    return permissions; // Already flat array (legacy format)
  }

  // Flatten JSON structure
  const flat: string[] = [];
  for (const module in permissions) {
    if (Array.isArray(permissions[module])) {
      flat.push(...permissions[module]);
    }
  }
  return flat;
}

/**
 * Check if a permission exists in the permissions structure
 */
export function hasPermission(
  permissions: Permissions | string[],
  permission: string
): boolean {
  if (Array.isArray(permissions)) {
    return permissions.includes(permission);
  }

  // Check in JSON structure
  for (const module in permissions) {
    const modulePerms = permissions[module];
    if (Array.isArray(modulePerms) && modulePerms.includes(permission)) {
      return true;
    }
  }

  return false;
}

/**
 * Get permissions for a specific module
 */
export function getPermissionsByModule(
  permissions: Permissions | string[],
  module: string
): string[] {
  if (Array.isArray(permissions)) {
    // Filter permissions that start with the module name
    return permissions.filter((perm) => perm.startsWith(`${module}.`));
  }

  const modulePerms = permissions[module];
  return Array.isArray(modulePerms) ? modulePerms : [];
}

/**
 * Get all module names from permissions
 */
export function getModules(permissions: Permissions | string[]): string[] {
  if (Array.isArray(permissions)) {
    // Extract unique module names from permission strings
    const modules = new Set<string>();
    for (const perm of permissions) {
      const parts = perm.split('.');
      if (parts.length >= 2) {
        modules.add(parts[0]);
      }
    }
    return Array.from(modules);
  }

  return Object.keys(permissions);
}

/**
 * Normalize permissions to JSON structure
 * Converts flat array to JSON structure if needed
 */
export function normalizePermissions(
  permissions: Permissions | string[]
): Permissions {
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
  return permissions;
}

/**
 * Check if user has any of the given permissions
 */
export function hasAnyPermission(
  permissions: Permissions | string[],
  permissionsToCheck: string[]
): boolean {
  return permissionsToCheck.some((perm) => hasPermission(permissions, perm));
}

/**
 * Check if user has all of the given permissions
 */
export function hasAllPermissions(
  permissions: Permissions | string[],
  permissionsToCheck: string[]
): boolean {
  return permissionsToCheck.every((perm) => hasPermission(permissions, perm));
}
