import { api } from "@/lib/api/client";
import type {
  EmployeeLifecycleEvent,
  CreateEmployeeLifecycleEventDto,
  UpdateEmployeeLifecycleEventDto,
  EmployeeStatusDefinition,
  CreateEmployeeStatusDefinitionDto,
  UpdateEmployeeStatusDefinitionDto,
} from "@/types/employee-lifecycle";

export const employeeLifecycleEventService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    const response = await api.get<{ data: EmployeeLifecycleEvent[] }>(`/api/employee-lifecycle-events${query}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ data: EmployeeLifecycleEvent }>(`/api/employee-lifecycle-events/${id}`);
    return response.data;
  },

  create: async (data: CreateEmployeeLifecycleEventDto) => {
    const response = await api.post<{ data: EmployeeLifecycleEvent }>("/api/employee-lifecycle-events", data);
    return response.data;
  },

  update: async (id: string, data: UpdateEmployeeLifecycleEventDto) => {
    const response = await api.put<{ data: EmployeeLifecycleEvent }>(`/api/employee-lifecycle-events/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/api/employee-lifecycle-events/${id}`);
  },
};

export const employeeStatusDefinitionService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    const response = await api.get<{ data: EmployeeStatusDefinition[] }>(`/api/employee-status-definitions${query}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ data: EmployeeStatusDefinition }>(`/api/employee-status-definitions/${id}`);
    return response.data;
  },

  create: async (data: CreateEmployeeStatusDefinitionDto) => {
    const response = await api.post<{ data: EmployeeStatusDefinition }>("/api/employee-status-definitions", data);
    return response.data;
  },

  update: async (id: string, data: UpdateEmployeeStatusDefinitionDto) => {
    const response = await api.put<{ data: EmployeeStatusDefinition }>(`/api/employee-status-definitions/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/api/employee-status-definitions/${id}`);
  },
};
