import { api } from "@/lib/api/client";
import type {
  Skill,
  CreateSkillDto,
  UpdateSkillDto,
  EmployeeSkill,
  CreateEmployeeSkillDto,
  UpdateEmployeeSkillDto,
  CertificationExpiryTracking,
  CreateCertificationExpiryDto,
  UpdateCertificationExpiryDto,
} from "@/types/skills";

export const skillService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    const response = await api.get<{ data: Skill[] }>(`/api/skills${query}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ data: Skill }>(`/api/skills/${id}`);
    return response.data;
  },
  create: async (data: CreateSkillDto) => {
    const response = await api.post<{ data: Skill }>("/api/skills", data);
    return response.data;
  },
  update: async (id: string, data: UpdateSkillDto) => {
    const response = await api.put<{ data: Skill }>(`/api/skills/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/skills/${id}`);
  },
};

export const employeeSkillService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    const response = await api.get<{ data: EmployeeSkill[] }>(`/api/employee-skills${query}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ data: EmployeeSkill }>(`/api/employee-skills/${id}`);
    return response.data;
  },
  create: async (data: CreateEmployeeSkillDto) => {
    const response = await api.post<{ data: EmployeeSkill }>("/api/employee-skills", data);
    return response.data;
  },
  update: async (id: string, data: UpdateEmployeeSkillDto) => {
    const response = await api.put<{ data: EmployeeSkill }>(`/api/employee-skills/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/employee-skills/${id}`);
  },
};

export const certificationExpiryTrackingService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    const response = await api.get<{ data: CertificationExpiryTracking[] }>(`/api/certification-expiry-tracking${query}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ data: CertificationExpiryTracking }>(`/api/certification-expiry-tracking/${id}`);
    return response.data;
  },
  create: async (data: CreateCertificationExpiryDto) => {
    const response = await api.post<{ data: CertificationExpiryTracking }>("/api/certification-expiry-tracking", data);
    return response.data;
  },
  update: async (id: string, data: UpdateCertificationExpiryDto) => {
    const response = await api.put<{ data: CertificationExpiryTracking }>(`/api/certification-expiry-tracking/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/certification-expiry-tracking/${id}`);
  },
  refreshStatus: async () => {
    const response = await api.post<{ data: { updated_count: number } }>("/api/certification-expiry-tracking/refresh-status");
    return response.data;
  },
};
