import { api } from "./api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { Role, CreateRoleDto, UpdateRoleDto } from "@/types/role";

export const roleService = {
  getAll: async (): Promise<{ data: Role[] }> => {
    const response = await api.get<{ data: Role[] }>(API_ENDPOINTS.roles.list);
    return response.data;
  },

  getById: async (id: string): Promise<Role> => {
    const response = await api.get<Role>(API_ENDPOINTS.roles.detail(id));
    return response.data;
  },

  create: async (data: CreateRoleDto): Promise<Role> => {
    const response = await api.post<Role>(API_ENDPOINTS.roles.create, data);
    return response.data;
  },

  update: async (id: string, data: UpdateRoleDto): Promise<Role> => {
    const response = await api.put<Role>(API_ENDPOINTS.roles.update(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(API_ENDPOINTS.roles.delete(id));
    return response.data;
  },
};

// Permission service removed - permissions are now extracted from roles response

