export interface Permission {
  id: string;
  name: string;
  slug: string;
  group: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  permissions?: Permission[];
  created_at: string;
  updated_at: string;
}

export interface CreateRoleDto {
  name: string;
  slug: string;
  description?: string;
  permission_ids?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
  permission_ids?: string[];
}

export interface PermissionsByGroup {
  [group: string]: Permission[];
}

/**
 * Role from user management API (proxy)
 * Used for assigning roles to users
 */
export interface UserManagementRole {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active?: boolean;
}

