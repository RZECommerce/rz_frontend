import { api } from "@/lib/api/client";
import type {
  ShiftSchedule,
  CreateShiftScheduleDto,
  UpdateShiftScheduleDto,
  OvertimePolicy,
  CreateOvertimePolicyDto,
  UpdateOvertimePolicyDto,
} from "@/types/attendance-extensions";

export const shiftScheduleService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    const response = await api.get<{ data: ShiftSchedule[] }>(`/api/shift-schedules${query}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ data: ShiftSchedule }>(`/api/shift-schedules/${id}`);
    return response.data;
  },
  create: async (data: CreateShiftScheduleDto) => {
    const response = await api.post<{ data: ShiftSchedule }>("/api/shift-schedules", data);
    return response.data;
  },
  update: async (id: string, data: UpdateShiftScheduleDto) => {
    const response = await api.put<{ data: ShiftSchedule }>(`/api/shift-schedules/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/shift-schedules/${id}`);
  },
};

export const overtimePolicyService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    const response = await api.get<{ data: OvertimePolicy[] }>(`/api/overtime-policies${query}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ data: OvertimePolicy }>(`/api/overtime-policies/${id}`);
    return response.data;
  },
  create: async (data: CreateOvertimePolicyDto) => {
    const response = await api.post<{ data: OvertimePolicy }>("/api/overtime-policies", data);
    return response.data;
  },
  update: async (id: string, data: UpdateOvertimePolicyDto) => {
    const response = await api.put<{ data: OvertimePolicy }>(`/api/overtime-policies/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/overtime-policies/${id}`);
  },
};
