/**
 * HR Policy service
 */

import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export interface HrPolicy {
  id: string;
  policy_code: string;
  title: string;
  description?: string;
  policy_category: 'leave' | 'attendance' | 'discipline' | 'compensation' | 'payroll' | 'benefits' | 'recruitment' | 'performance' | 'training' | 'exit' | 'compliance' | 'general';
  status: 'draft' | 'active' | 'archived' | 'superseded';
  version: number;
  effective_date?: string;
  expiry_date?: string;
  review_date?: string;
  review_cycle_months?: number;
  policy_content?: string;
  authority_matrix?: Record<string, any>;
  compliance_owner?: string;
  applicable_to?: Record<string, any>;
  requires_acknowledgment: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateHrPolicyDto {
  title: string;
  description?: string;
  policy_category: HrPolicy['policy_category'];
  policy_content?: string;
  effective_date?: string;
  review_cycle_months?: number;
  authority_matrix?: Record<string, any>;
  compliance_owner?: string;
  applicable_to?: Record<string, any>;
  requires_acknowledgment?: boolean;
}

export interface UpdateHrPolicyDto extends Partial<CreateHrPolicyDto> {}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const hrPolicyService = {
  getAll: async (params?: {
    category?: string;
    status?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<HrPolicy>> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append("category", params.category);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.per_page) searchParams.append("per_page", params.per_page.toString());
    if (params?.page) searchParams.append("page", params.page.toString());

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.hrPolicies.list}?${query}`
      : API_ENDPOINTS.hrPolicies.list;

    const response = await api.get<PaginatedResponse<HrPolicy>>(url);
    return response.data;
  },

  getById: async (id: string): Promise<HrPolicy> => {
    const response = await api.get<HrPolicy>(API_ENDPOINTS.hrPolicies.detail(id));
    return response.data;
  },

  create: async (data: CreateHrPolicyDto): Promise<HrPolicy> => {
    const response = await api.post<HrPolicy>(API_ENDPOINTS.hrPolicies.create, data);
    return response.data;
  },

  update: async (id: string, data: UpdateHrPolicyDto): Promise<HrPolicy> => {
    const response = await api.put<HrPolicy>(API_ENDPOINTS.hrPolicies.update(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.hrPolicies.delete(id));
  },

  approve: async (id: string): Promise<HrPolicy> => {
    const response = await api.post<HrPolicy>(API_ENDPOINTS.hrPolicies.approve(id));
    return response.data;
  },

  createVersion: async (id: string, data: {
    policy_content?: string;
    changes_summary?: Record<string, any>;
    effective_date?: string;
  }): Promise<any> => {
    const response = await api.post<any>(API_ENDPOINTS.hrPolicies.createVersion(id), data);
    return response.data;
  },

  scheduleReview: async (id: string): Promise<any> => {
    const response = await api.post<any>(API_ENDPOINTS.hrPolicies.scheduleReview(id));
    return response.data;
  },
};
