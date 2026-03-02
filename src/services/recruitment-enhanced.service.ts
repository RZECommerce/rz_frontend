/**
 * Enhanced Recruitment service (manpower requests, job offers, compliance, checklists)
 */

import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export interface JobOffer {
  id: string;
  offer_code: string;
  candidate_id: string;
  job_posting_id: string;
  salary: number;
  currency: string;
  start_date: string;
  offer_letter_content?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'accepted' | 'rejected' | 'revoked' | 'expired';
  expiry_date?: string;
  approval_matrix?: Record<string, any>;
  created_at: string;
}

export interface PreEmploymentCompliance {
  id: string;
  candidate_id: string;
  compliance_type: string;
  status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'waived';
  required_date?: string;
  completed_date?: string;
  expiry_date?: string;
  notes?: string;
  documents?: string[];
}

export interface HiringChecklist {
  id: string;
  candidate_id: string;
  employee_id?: string;
  checklist_item: string;
  category: 'pre_employment' | 'onboarding' | 'post_hire';
  status: 'pending' | 'in_progress' | 'completed' | 'not_applicable';
  due_date?: string;
  completed_date?: string;
  notes?: string;
  requires_hr_signoff: boolean;
  hr_signed_at?: string;
}

export interface HiringFreeze {
  id: string;
  freeze_code: string;
  title: string;
  description?: string;
  scope: 'company' | 'department' | 'position';
  department_id?: string;
  position_id?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  reason?: string;
}

export const recruitmentEnhancedService = {
  // Hiring Freezes
  getHiringFreezes: async (params?: {
    is_active?: boolean;
  }): Promise<HiringFreeze[]> => {
    const searchParams = new URLSearchParams();
    if (params?.is_active !== undefined) searchParams.append("is_active", params.is_active.toString());

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.hiringFreezes.list}?${query}`
      : API_ENDPOINTS.hiringFreezes.list;

    const response = await api.get<{ data: HiringFreeze[] }>(url);
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  },

  checkHiringFreeze: async (departmentId?: string, positionId?: string): Promise<{ is_frozen: boolean }> => {
    const params = new URLSearchParams();
    if (departmentId) params.append("department_id", departmentId);
    if (positionId) params.append("position_id", positionId);

    const response = await api.get<{ is_frozen: boolean }>(`${API_ENDPOINTS.hiringFreezes.checkStatus}?${params.toString()}`);
    return response.data;
  },

  // Job Offers
  getJobOffers: async (params?: {
    status?: string;
  }): Promise<JobOffer[]> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.jobOffers.list}?${query}`
      : API_ENDPOINTS.jobOffers.list;

    const response = await api.get<{ data: JobOffer[] }>(url);
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  },

  createJobOffer: async (data: Partial<JobOffer>): Promise<JobOffer> => {
    const response = await api.post<JobOffer>(API_ENDPOINTS.jobOffers.create, data);
    return response.data;
  },

  approveJobOffer: async (id: string): Promise<JobOffer> => {
    const response = await api.post<JobOffer>(API_ENDPOINTS.jobOffers.approve(id));
    return response.data;
  },

  sendJobOffer: async (id: string): Promise<JobOffer> => {
    const response = await api.post<JobOffer>(API_ENDPOINTS.jobOffers.send(id));
    return response.data;
  },

  revokeJobOffer: async (id: string, reason: string): Promise<JobOffer> => {
    const response = await api.post<JobOffer>(API_ENDPOINTS.jobOffers.revoke(id), { reason });
    return response.data;
  },

  // Pre-Employment Compliance
  getPreEmploymentCompliance: async (candidateId?: string): Promise<PreEmploymentCompliance[]> => {
    const searchParams = new URLSearchParams();
    if (candidateId) searchParams.append("candidate_id", candidateId);

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.preEmploymentCompliance.list}?${query}`
      : API_ENDPOINTS.preEmploymentCompliance.list;

    const response = await api.get<{ data: PreEmploymentCompliance[] }>(url);
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  },

  createCompliance: async (data: Partial<PreEmploymentCompliance>): Promise<PreEmploymentCompliance> => {
    const response = await api.post<PreEmploymentCompliance>(API_ENDPOINTS.preEmploymentCompliance.create, data);
    return response.data;
  },

  verifyCompliance: async (id: string, status: 'passed' | 'failed', notes?: string): Promise<PreEmploymentCompliance> => {
    const response = await api.post<PreEmploymentCompliance>(API_ENDPOINTS.preEmploymentCompliance.verify(id), { status, notes });
    return response.data;
  },

  // Hiring Checklists
  getHiringChecklists: async (candidateId?: string): Promise<HiringChecklist[]> => {
    const searchParams = new URLSearchParams();
    if (candidateId) searchParams.append("candidate_id", candidateId);

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.hiringChecklists.list}?${query}`
      : API_ENDPOINTS.hiringChecklists.list;

    const response = await api.get<{ data: HiringChecklist[] }>(url);
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  },

  createChecklist: async (data: Partial<HiringChecklist>): Promise<HiringChecklist> => {
    const response = await api.post<HiringChecklist>(API_ENDPOINTS.hiringChecklists.create, data);
    return response.data;
  },

  completeChecklist: async (id: string, notes?: string): Promise<HiringChecklist> => {
    const response = await api.post<HiringChecklist>(API_ENDPOINTS.hiringChecklists.complete(id), { notes });
    return response.data;
  },

  hrSignoffChecklist: async (id: string): Promise<HiringChecklist> => {
    const response = await api.post<HiringChecklist>(API_ENDPOINTS.hiringChecklists.hrSignoff(id));
    return response.data;
  },
};
