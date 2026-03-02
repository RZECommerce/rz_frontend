import { api } from "@/lib/api/client";
import type {
  LeaveEncashment,
  CreateLeaveEncashmentDto,
  UpdateLeaveEncashmentDto,
  LeaveExpiryRule,
  CreateLeaveExpiryRuleDto,
  UpdateLeaveExpiryRuleDto,
} from "@/types/leave-extensions";

export const leaveEncashmentService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    const response = await api.get<{ data: LeaveEncashment[] }>(`/api/leave-encashments${query}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ data: LeaveEncashment }>(`/api/leave-encashments/${id}`);
    return response.data;
  },
  create: async (data: CreateLeaveEncashmentDto) => {
    const response = await api.post<{ data: LeaveEncashment }>("/api/leave-encashments", data);
    return response.data;
  },
  update: async (id: string, data: UpdateLeaveEncashmentDto) => {
    const response = await api.put<{ data: LeaveEncashment }>(`/api/leave-encashments/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/leave-encashments/${id}`);
  },
  approve: async (id: string, remarks?: string) => {
    const response = await api.post<{ data: LeaveEncashment }>(`/api/leave-encashments/${id}/approve`, { remarks });
    return response.data;
  },
  reject: async (id: string, remarks?: string) => {
    const response = await api.post<{ data: LeaveEncashment }>(`/api/leave-encashments/${id}/reject`, { remarks });
    return response.data;
  },
  markAsPaid: async (id: string, payment_date?: string) => {
    const response = await api.post<{ data: LeaveEncashment }>(`/api/leave-encashments/${id}/mark-paid`, { payment_date });
    return response.data;
  },
};

export const leaveExpiryRuleService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    const response = await api.get<{ data: LeaveExpiryRule[] }>(`/api/leave-expiry-rules${query}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ data: LeaveExpiryRule }>(`/api/leave-expiry-rules/${id}`);
    return response.data;
  },
  create: async (data: CreateLeaveExpiryRuleDto) => {
    const response = await api.post<{ data: LeaveExpiryRule }>("/api/leave-expiry-rules", data);
    return response.data;
  },
  update: async (id: string, data: UpdateLeaveExpiryRuleDto) => {
    const response = await api.put<{ data: LeaveExpiryRule }>(`/api/leave-expiry-rules/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/leave-expiry-rules/${id}`);
  },
};
