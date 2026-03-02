import { useAuthStore } from "@/stores/auth-store";
import { useRbacStore } from "@/stores/rbac";
import type { Permissions } from "@/types/auth";

/**
 * Hook to check if the current user has a specific permission
 */
export function useHasPermission(permission: string): boolean {
  const hasPermissionFn = useRbacStore((state) => state.hasPermission);
  const permissions = useRbacStore((state) => state.permissions);
  const permissionsFlat = useRbacStore((state) => state.permissionsFlat);
  const user = useAuthStore((state) => state.user);

  // Use RBAC store first (synced from user permissions)
  if (Object.keys(permissions).length > 0 || permissionsFlat.length > 0) {
    return hasPermissionFn(permission);
  }

  // Fallback: check user permissions directly
  if (user?.permissions) {
    if (Array.isArray(user.permissions)) {
      // Legacy array format
      return user.permissions.includes(permission);
    } else {
      // JSON format: { module: [permissions] } or nested { module: { subModule: [permissions] } }
      for (const module in user.permissions) {
        const modulePerms = user.permissions[module];
        if (Array.isArray(modulePerms)) {
          // Flat structure: { "employees": ["employees.view"] }
          if (modulePerms.includes(permission)) {
            return true;
          }
        } else if (typeof modulePerms === 'object' && modulePerms !== null && !Array.isArray(modulePerms)) {
          // Nested structure: { "user_management": { "roles": ["roles.view"] } }
          const nestedPerms = modulePerms as Record<string, string[]>;
          for (const subModule in nestedPerms) {
            if (Array.isArray(nestedPerms[subModule]) && nestedPerms[subModule].includes(permission)) {
              return true;
            }
          }
        }
      }
    }
  }

  // Fallback: check role.permissions (for local database structure)
  if (user?.role?.permissions && Array.isArray(user.role.permissions)) {
    return user.role.permissions.some((p) => 
      typeof p === 'string' ? p === permission : p.slug === permission
    );
  }

  return false;
}

/**
 * Hook to check if the current user has a specific role
 */
export function useHasRole(roleSlug: string): boolean {
  const roles = useRbacStore((state) => state.roles);
  const user = useAuthStore((state) => state.user);

  // Check RBAC store first (synced from user roles)
  if (roles && roles.length > 0) {
    return roles.includes(roleSlug);
  }

  // Fallback: check user roles directly
  if (user?.roles && Array.isArray(user.roles)) {
    return user.roles.includes(roleSlug);
  }

  // Fallback: check role.slug (for local database structure)
  if (user?.role?.slug) {
    return user.role.slug === roleSlug;
  }

  return false;
}

/**
 * Hook to check if the current user is an admin
 */
export function useIsAdmin(): boolean {
  return useHasRole("admin");
}

/**
 * Hook to get all user permissions as a flattened array
 */
export function usePermissions(): string[] {
  const permissionsFlat = useRbacStore((state) => state.permissionsFlat);
  const user = useAuthStore((state) => state.user);

  // Use RBAC store first (synced from user permissions)
  if (permissionsFlat && permissionsFlat.length > 0) {
    return permissionsFlat;
  }

  // Fallback: check user permissions directly
  if (user?.permissions) {
    if (Array.isArray(user.permissions)) {
      // Legacy array format
      return user.permissions;
    } else {
      // JSON format: flatten it
      const flat: string[] = [];
      for (const module in user.permissions) {
        const modulePerms = user.permissions[module];
        if (Array.isArray(modulePerms)) {
          flat.push(...modulePerms);
        }
      }
      return flat;
    }
  }

  // Fallback: check role.permissions (for local database structure)
  if (user?.role?.permissions && Array.isArray(user.role.permissions)) {
    return user.role.permissions.map((p) => 
      typeof p === 'string' ? p : p.slug
    );
  }

  return [];
}

/**
 * Hook to get permissions by module
 * Returns permissions for a specific module (e.g., "employees", "payroll")
 */
export function usePermissionsByModule(module: string): string[] {
  const getPermissionsByModule = useRbacStore((state) => state.getPermissionsByModule);
  const permissions = useRbacStore((state) => state.permissions);
  const user = useAuthStore((state) => state.user);

  // Use RBAC store first
  if (Object.keys(permissions).length > 0) {
    return getPermissionsByModule(module);
  }

  // Fallback: check user permissions directly
  if (user?.permissions && !Array.isArray(user.permissions)) {
    const modulePerms = user.permissions[module];
    return Array.isArray(modulePerms) ? modulePerms : [];
  }

  return [];
}

/**
 * Hook to get all permission modules
 * Returns array of module names (e.g., ["employees", "payroll", "attendance"])
 */
export function usePermissionModules(): string[] {
  const getAllModules = useRbacStore((state) => state.getAllModules);
  const permissions = useRbacStore((state) => state.permissions);
  const user = useAuthStore((state) => state.user);

  // Use RBAC store first
  if (Object.keys(permissions).length > 0) {
    return getAllModules();
  }

  // Fallback: check user permissions directly
  if (user?.permissions && !Array.isArray(user.permissions)) {
    return Object.keys(user.permissions);
  }

  return [];
}

/**
 * Hook to get permissions in JSON structure
 * Returns: { module: [permissions] }
 */
export function usePermissionsStructure(): Permissions {
  const permissions = useRbacStore((state) => state.permissions);
  const user = useAuthStore((state) => state.user);

  // Use RBAC store first
  if (Object.keys(permissions).length > 0) {
    return permissions;
  }

  // Fallback: check user permissions directly
  if (user?.permissions) {
    if (Array.isArray(user.permissions)) {
      // Convert flat array to structure
      const structured: Permissions = {};
      for (const perm of user.permissions) {
        const parts = perm.split('.');
        if (parts.length >= 2) {
          const module = parts[0];
          if (!structured[module]) {
            structured[module] = [];
          }
          if (Array.isArray(structured[module])) {
            structured[module].push(perm);
          }
        }
      }
      return structured;
    } else {
      return user.permissions;
    }
  }

  return {};
}

