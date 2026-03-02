import { api } from "./api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { User } from "@/types/auth";
import type { PaginatedResponse } from "@/types/common";

export interface UpdateUserRoleDto {
  role_id: string;
}

export interface AssignRolesDto {
  role_ids: string[];
}

export interface UserFilters {
  role_id?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_ids?: number[];
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role_ids?: number[];
}

export interface PaginatedUsers extends PaginatedResponse<User> {}

export const userService = {
  /**
   * Get list of users with optional filters and pagination
   * Requires: users.view permission
   */
  getAll: async (filters?: UserFilters) => {
    const params: Record<string, string | number> = {};
    if (filters?.role_id) params.role_id = filters.role_id;
    if (filters?.search) params.search = filters.search;
    if (filters?.per_page) params.per_page = filters.per_page;
    if (filters?.page) params.page = filters.page;

    const response = await api.get<{ success: boolean; data: PaginatedUsers }>(API_ENDPOINTS.users.list, { params });
    return response.data;
  },

  /**
   * Get a single user by ID
   * Requires: users.view permission
   */
  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: User }>(API_ENDPOINTS.users.detail(id));
    return response.data;
  },

  /**
   * Create a new user
   * Requires: users.create permission
   */
  create: async (data: CreateUserDto) => {
    const response = await api.post<{ success: boolean; data: User }>(API_ENDPOINTS.users.create, data);
    return response.data;
  },

  /**
   * Update a user
   * Requires: users.update permission
   */
  update: async (id: string, data: UpdateUserDto) => {
    const response = await api.put<{ success: boolean; data: User }>(API_ENDPOINTS.users.update(id), data);
    return response.data;
  },

  /**
   * Delete a user
   * Requires: users.delete permission
   */
  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(API_ENDPOINTS.users.delete(id));
    return response.data;
  },

  /**
   * Assign roles to a user
   * Requires: users.update permission
   */
  assignRoles: async (id: string, data: AssignRolesDto) => {
    const response = await api.post<{ success: boolean; data: User }>(API_ENDPOINTS.users.assignRoles(id), data);
    return response.data;
  },

  /**
   * Get roles list for user management
   * Requires: users.view permission
   * This endpoint is from the proxy API for user management
   */
  getRoles: async () => {
    const response = await api.get<{ success: boolean; data: Array<{ id: string; name: string; slug: string; description?: string; is_active?: boolean }> }>(API_ENDPOINTS.userRoles.list);
    return response.data;
  },

  /**
   * Get users with employee status
   * Requires: users.view permission
   * Returns users with information about whether they have an employee record
   */
  getUsersWithEmployeeStatus: async (filters?: UserFilters) => {
    const params: Record<string, string | number> = {};
    if (filters?.role_id) params.role_id = filters.role_id;
    if (filters?.search) params.search = filters.search;
    if (filters?.per_page) params.per_page = filters.per_page;
    if (filters?.page) params.page = filters.page;

    const response = await api.get<{ success: boolean; data: { users: Array<User & { has_employee: boolean; employee?: { id: string; employee_code: string; full_name: string; status: string } }>; pagination: any } }>("/api/users/with-employee-status", { params });
    return response.data;
  },

  /**
   * Update user role (legacy method, use assignRoles instead)
   */
  updateRole: async (userId: string, data: UpdateUserRoleDto) => {
    const response = await api.put<{ success: boolean; message: string }>(API_ENDPOINTS.users.updateRole(userId), data);
    return response.data;
  },
};
