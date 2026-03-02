/**
 * Utility functions to extract and format permissions from roles
 * Since permissions are now included in the roles response from HRIS Auth,
 * we extract all unique permissions from roles and format them for the UI
 */

import type { Permission, PermissionsByGroup, Role } from "@/types/role";

/**
 * Convert a permission slug to a human-readable name
 * Example: "employees.view" -> "View Employees"
 */
function slugToName(slug: string): string {
  const parts = slug.split(".");
  if (parts.length < 2) {
    return slug;
  }

  const [module, action] = parts;
  const moduleName = module
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const actionMap: Record<string, string> = {
    view: "View",
    create: "Create",
    update: "Update",
    edit: "Edit",
    delete: "Delete",
    manage: "Manage",
    approve: "Approve",
    reject: "Reject",
    process: "Process",
    export: "Export",
    pay: "Pay",
  };

  const actionName =
    actionMap[action] || action.charAt(0).toUpperCase() + action.slice(1);

  return `${actionName} ${moduleName}`;
}

/**
 * Get the group/module name from a permission slug
 * Example: "employees.view" -> "employees"
 */
function getGroupFromSlug(slug: string): string {
  const parts = slug.split(".");
  if (parts.length < 2) {
    return "other";
  }

  // Handle special cases like "leave-types" -> "leaves"
  const module = parts[0];
  if (module === "leave-types") {
    return "leaves";
  }
  if (module === "payroll-periods") {
    return "payroll";
  }
  if (module === "salary-components" || module === "deductions") {
    return "payroll";
  }
  if (module === "employment-types") {
    return "reference";
  }

  return module;
}

/**
 * Extract all unique permissions from roles and convert to Permission objects
 */
export function extractPermissionsFromRoles(roles: Role[]): Permission[] {
  const permissionMap = new Map<string, Permission>();

  for (const role of roles) {
    const perms: any = (role as any).permissions;

    // Case 1: permissions is already a flat array of slugs
    if (Array.isArray(perms)) {
      for (const permSlug of perms) {
        if (typeof permSlug === "string" && !permissionMap.has(permSlug)) {
          permissionMap.set(permSlug, {
            id: permSlug, // Use slug as ID since we don't have numeric IDs
            name: slugToName(permSlug),
            slug: permSlug,
            group: getGroupFromSlug(permSlug),
            description: undefined,
          });
        }
      }
      continue;
    }

    // Case 2: permissions is a JSON structure:
    // - Flat: { module: ["module.action", ...] }
    // - Nested: { category: { module: ["module.action", ...] } }
    if (perms && typeof perms === "object") {
      for (const key in perms as Record<string, unknown>) {
        const value = (perms as Record<string, unknown>)[key];

        // Direct array of permission slugs
        if (Array.isArray(value)) {
          for (const permSlug of value) {
            if (typeof permSlug === "string" && !permissionMap.has(permSlug)) {
              permissionMap.set(permSlug, {
                id: permSlug,
                name: slugToName(permSlug),
                slug: permSlug,
                group: getGroupFromSlug(permSlug),
                description: undefined,
              });
            }
          }
          continue;
        }

        // Nested object: { category: { module: ["module.action", ...] } }
        if (value && typeof value === "object") {
          for (const subKey in value as Record<string, unknown>) {
            const subValue = (value as Record<string, unknown>)[subKey];
            if (Array.isArray(subValue)) {
              for (const permSlug of subValue) {
                if (
                  typeof permSlug === "string" &&
                  !permissionMap.has(permSlug)
                ) {
                  permissionMap.set(permSlug, {
                    id: permSlug,
                    name: slugToName(permSlug),
                    slug: permSlug,
                    group: getGroupFromSlug(permSlug),
                    description: undefined,
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  return Array.from(permissionMap.values());
}

/**
 * Group permissions by their group/module
 */
export function groupPermissionsByModule(
  permissions: Permission[]
): PermissionsByGroup {
  const grouped: PermissionsByGroup = {};

  for (const permission of permissions) {
    const group = permission.group || "other";
    if (!grouped[group]) {
      grouped[group] = [];
    }
    grouped[group].push(permission);
  }

  // Sort permissions within each group by slug
  for (const group in grouped) {
    grouped[group].sort((a, b) => a.slug.localeCompare(b.slug));
  }

  return grouped;
}

/**
 * Extract and group permissions from roles in one step
 */
export function getPermissionsFromRoles(roles: Role[]): PermissionsByGroup {
  const permissions = extractPermissionsFromRoles(roles);
  return groupPermissionsByModule(permissions);
}
