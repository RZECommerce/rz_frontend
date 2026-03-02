import { api } from "@/lib/api/client";
import type {
  CompensationBand,
  CreateCompensationBandDto,
  UpdateCompensationBandDto,
  CompensationAdjustment,
  CreateCompensationAdjustmentDto,
  UpdateCompensationAdjustmentDto,
} from "@/types/compensation";

export const compensationBandService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    const response = await api.get<{ data: CompensationBand[] }>(`/api/compensation-bands${query}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ data: CompensationBand }>(`/api/compensation-bands/${id}`);
    return response.data;
  },
  create: async (data: CreateCompensationBandDto) => {
    const response = await api.post<{ data: CompensationBand }>("/api/compensation-bands", data);
    return response.data;
  },
  update: async (id: string, data: UpdateCompensationBandDto) => {
    const response = await api.put<{ data: CompensationBand }>(`/api/compensation-bands/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/compensation-bands/${id}`);
  },
};

export const compensationAdjustmentService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    const response = await api.get<{ data: CompensationAdjustment[] }>(`/api/compensation-adjustments${query}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ data: CompensationAdjustment }>(`/api/compensation-adjustments/${id}`);
    return response.data;
  },
  create: async (data: CreateCompensationAdjustmentDto) => {
    const response = await api.post<{ data: CompensationAdjustment }>("/api/compensation-adjustments", data);
    return response.data;
  },
  update: async (id: string, data: UpdateCompensationAdjustmentDto) => {
    const response = await api.put<{ data: CompensationAdjustment }>(`/api/compensation-adjustments/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/compensation-adjustments/${id}`);
  },
  approve: async (id: string, remarks?: string) => {
    const response = await api.post<{ data: CompensationAdjustment }>(`/api/compensation-adjustments/${id}/approve`, { remarks });
    return response.data;
  },
  reject: async (id: string, reason?: string) => {
    const response = await api.post<{ data: CompensationAdjustment }>(`/api/compensation-adjustments/${id}/reject`, { reason });
    return response.data;
  },
};
