/**
 * Exit Clearance service
 */

import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export interface ExitClearance {
  id: string;
  clearance_code: string;
  employee_id: string;
  resignation_id?: string;
  termination_id?: string;
  exit_type: 'resignation' | 'termination' | 'redundancy' | 'awol' | 'retirement';
  effectivity_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  clearance_items?: Record<string, any>;
  asset_accountability?: Record<string, any>;
  final_pay_ready: boolean;
  benefits_cutoff_processed: boolean;
  benefits_cutoff_date?: string;
  statutory_documents_issued: boolean;
  exit_interview_notes?: string;
  exit_interview_date?: string;
  created_at: string;
}

export interface CreateExitClearanceDto {
  employee_id: string;
  resignation_id?: string;
  termination_id?: string;
  exit_type: ExitClearance['exit_type'];
  effectivity_date: string;
  clearance_items?: Record<string, any>;
  asset_accountability?: Record<string, any>;
}

export const exitClearanceService = {
  getAll: async (params?: {
    status?: string;
  }): Promise<ExitClearance[]> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.exitClearances.list}?${query}`
      : API_ENDPOINTS.exitClearances.list;

    const response = await api.get<{ data: ExitClearance[] }>(url);
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  },

  getById: async (id: string): Promise<ExitClearance> => {
    const response = await api.get<ExitClearance>(API_ENDPOINTS.exitClearances.detail(id));
    return response.data;
  },

  create: async (data: CreateExitClearanceDto): Promise<ExitClearance> => {
    const response = await api.post<ExitClearance>(API_ENDPOINTS.exitClearances.create, data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateExitClearanceDto>): Promise<ExitClearance> => {
    const response = await api.put<ExitClearance>(API_ENDPOINTS.exitClearances.update(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.exitClearances.delete(id));
  },

  completeItem: async (id: string, item: string): Promise<ExitClearance> => {
    const response = await api.post<ExitClearance>(API_ENDPOINTS.exitClearances.completeItem(id), { item });
    return response.data;
  },

  approveFinal: async (id: string): Promise<ExitClearance> => {
    const response = await api.post<ExitClearance>(API_ENDPOINTS.exitClearances.approveFinal(id));
    return response.data;
  },
};
