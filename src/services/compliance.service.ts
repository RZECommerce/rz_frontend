/**
 * Compliance service
 */

import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export interface ComplianceCalendar {
  id: string;
  compliance_code: string;
  title: string;
  description?: string;
  compliance_type: 'dole' | 'bir' | 'sss' | 'philhealth' | 'pagibig' | 'custom';
  frequency: 'one_time' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  due_date: string;
  completion_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  requirements?: Record<string, any>;
  next_due_date?: string;
}

export interface PolicyViolation {
  id: string;
  violation_code: string;
  policy_id: string;
  employee_id?: string;
  violation_type: string;
  description: string;
  violation_date: string;
  severity: 'minor' | 'major' | 'critical';
  status: 'reported' | 'investigating' | 'resolved' | 'dismissed';
  is_repeat_violation: boolean;
}

export interface HrException {
  id: string;
  exception_code: string;
  exception_type: string;
  description: string;
  employee_id?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_review' | 'resolved' | 'escalated' | 'closed';
  resolution?: string;
}

export interface AuditReadinessReport {
  id: string;
  report_code: string;
  audit_type: string;
  audit_date: string;
  status: 'preparation' | 'in_progress' | 'completed' | 'failed';
  readiness_checklist?: Record<string, any>;
  findings?: Record<string, any>;
  recommendations?: Record<string, any>;
  readiness_score?: number;
  summary?: string;
}

export const complianceService = {
  // Compliance Calendar
  getCalendar: async (params?: {
    compliance_type?: string;
    status?: string;
  }): Promise<ComplianceCalendar[]> => {
    const searchParams = new URLSearchParams();
    if (params?.compliance_type) searchParams.append("compliance_type", params.compliance_type);
    if (params?.status) searchParams.append("status", params.status);

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.complianceCalendar.list}?${query}`
      : API_ENDPOINTS.complianceCalendar.list;

    const response = await api.get<{ data: ComplianceCalendar[] }>(url);
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  },

  createCalendarItem: async (data: Partial<ComplianceCalendar>): Promise<ComplianceCalendar> => {
    const response = await api.post<ComplianceCalendar>(API_ENDPOINTS.complianceCalendar.create, data);
    return response.data;
  },

  completeCalendarItem: async (id: string, notes?: string): Promise<ComplianceCalendar> => {
    const response = await api.post<ComplianceCalendar>(API_ENDPOINTS.complianceCalendar.complete(id), { notes });
    return response.data;
  },

  // Policy Violations
  getViolations: async (params?: {
    employee_id?: string;
    status?: string;
  }): Promise<PolicyViolation[]> => {
    const searchParams = new URLSearchParams();
    if (params?.employee_id) searchParams.append("employee_id", params.employee_id);
    if (params?.status) searchParams.append("status", params.status);

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.policyViolations.list}?${query}`
      : API_ENDPOINTS.policyViolations.list;

    const response = await api.get<{ data: PolicyViolation[] }>(url);
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  },

  createViolation: async (data: Partial<PolicyViolation>): Promise<PolicyViolation> => {
    const response = await api.post<PolicyViolation>(API_ENDPOINTS.policyViolations.create, data);
    return response.data;
  },

  investigateViolation: async (id: string): Promise<PolicyViolation> => {
    const response = await api.post<PolicyViolation>(API_ENDPOINTS.policyViolations.investigate(id));
    return response.data;
  },

  resolveViolation: async (id: string, notes: string, correctiveActions?: Record<string, any>): Promise<PolicyViolation> => {
    const response = await api.post<PolicyViolation>(API_ENDPOINTS.policyViolations.resolve(id), { notes, corrective_actions: correctiveActions });
    return response.data;
  },

  // HR Exceptions
  getExceptions: async (params?: {
    status?: string;
    exception_type?: string;
  }): Promise<HrException[]> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.exception_type) searchParams.append("exception_type", params.exception_type);

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.hrExceptions.list}?${query}`
      : API_ENDPOINTS.hrExceptions.list;

    const response = await api.get<{ data: HrException[] }>(url);
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  },

  createException: async (data: Partial<HrException>): Promise<HrException> => {
    const response = await api.post<HrException>(API_ENDPOINTS.hrExceptions.create, data);
    return response.data;
  },

  resolveException: async (id: string, resolution: string): Promise<HrException> => {
    const response = await api.post<HrException>(API_ENDPOINTS.hrExceptions.resolve(id), { resolution });
    return response.data;
  },

  escalateException: async (id: string, escalatedTo: string): Promise<HrException> => {
    const response = await api.post<HrException>(API_ENDPOINTS.hrExceptions.escalate(id), { escalated_to: escalatedTo });
    return response.data;
  },

  // Audit Readiness Reports
  getAuditReports: async (params?: {
    audit_type?: string;
    status?: string;
  }): Promise<AuditReadinessReport[]> => {
    const searchParams = new URLSearchParams();
    if (params?.audit_type) searchParams.append("audit_type", params.audit_type);
    if (params?.status) searchParams.append("status", params.status);

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.auditReadinessReports.list}?${query}`
      : API_ENDPOINTS.auditReadinessReports.list;

    const response = await api.get<{ data: AuditReadinessReport[] }>(url);
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  },

  createAuditReport: async (data: Partial<AuditReadinessReport>): Promise<AuditReadinessReport> => {
    const response = await api.post<AuditReadinessReport>(API_ENDPOINTS.auditReadinessReports.create, data);
    return response.data;
  },

  calculateReadinessScore: async (id: string): Promise<{ readiness_score: number; data: AuditReadinessReport }> => {
    const response = await api.post<{ readiness_score: number; data: AuditReadinessReport }>(API_ENDPOINTS.auditReadinessReports.calculateScore(id));
    return response.data;
  },
};
