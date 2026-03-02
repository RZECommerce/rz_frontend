import { api } from "@/lib/api/client";
import type {
  GoalType,
  CreateGoalTypeDto,
  UpdateGoalTypeDto,
  PerformanceGoal,
  CreatePerformanceGoalDto,
  UpdatePerformanceGoalDto,
  PerformanceIndicator,
  CreatePerformanceIndicatorDto,
  UpdatePerformanceIndicatorDto,
  PerformanceAppraisal,
  CreatePerformanceAppraisalDto,
  UpdatePerformanceAppraisalDto,
} from "@/types/performance";

export const goalTypeService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    const response = await api.get<{ data: GoalType[] }>(`/api/goal-types${query}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ data: GoalType }>(`/api/goal-types/${id}`);
    return response.data;
  },
  create: async (data: CreateGoalTypeDto) => {
    const response = await api.post<{ data: GoalType }>("/api/goal-types", data);
    return response.data;
  },
  update: async (id: string, data: UpdateGoalTypeDto) => {
    const response = await api.put<{ data: GoalType }>(`/api/goal-types/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/goal-types/${id}`);
  },
};

export const performanceGoalService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    const response = await api.get<{ data: PerformanceGoal[] }>(`/api/performance-goals${query}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ data: PerformanceGoal }>(`/api/performance-goals/${id}`);
    return response.data;
  },
  create: async (data: CreatePerformanceGoalDto) => {
    const response = await api.post<{ data: PerformanceGoal }>("/api/performance-goals", data);
    return response.data;
  },
  update: async (id: string, data: UpdatePerformanceGoalDto) => {
    const response = await api.put<{ data: PerformanceGoal }>(`/api/performance-goals/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/performance-goals/${id}`);
  },
  updateProgress: async (id: string, progress_percent: number) => {
    const response = await api.post<{ data: PerformanceGoal }>(`/api/performance-goals/${id}/update-progress`, { progress_percent });
    return response.data;
  },
};

export const performanceIndicatorService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    const response = await api.get<{ data: PerformanceIndicator[] }>(`/api/performance-indicators${query}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ data: PerformanceIndicator }>(`/api/performance-indicators/${id}`);
    return response.data;
  },
  create: async (data: CreatePerformanceIndicatorDto) => {
    const response = await api.post<{ data: PerformanceIndicator }>("/api/performance-indicators", data);
    return response.data;
  },
  update: async (id: string, data: UpdatePerformanceIndicatorDto) => {
    const response = await api.put<{ data: PerformanceIndicator }>(`/api/performance-indicators/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/performance-indicators/${id}`);
  },
};

export const performanceAppraisalService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    const response = await api.get<{ data: PerformanceAppraisal[] }>(`/api/performance-appraisals${query}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<{ data: PerformanceAppraisal }>(`/api/performance-appraisals/${id}`);
    return response.data;
  },
  create: async (data: CreatePerformanceAppraisalDto) => {
    const response = await api.post<{ data: PerformanceAppraisal }>("/api/performance-appraisals", data);
    return response.data;
  },
  update: async (id: string, data: UpdatePerformanceAppraisalDto) => {
    const response = await api.put<{ data: PerformanceAppraisal }>(`/api/performance-appraisals/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/performance-appraisals/${id}`);
  },
  recalculate: async (id: string) => {
    const response = await api.post<{ data: PerformanceAppraisal }>(`/api/performance-appraisals/${id}/recalculate`);
    return response.data;
  },
  calibrate: async (id: string, data: { calibrated_rating: number; calibration_notes?: string }) => {
    const response = await api.post<{ data: PerformanceAppraisal }>(`/api/performance-appraisals/${id}/calibrate`, data);
    return response.data;
  },
};
