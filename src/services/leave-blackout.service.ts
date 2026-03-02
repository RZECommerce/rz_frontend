/**
 * Leave Blackout Period service
 */

import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export interface LeaveBlackoutPeriod {
  id: string;
  leave_type_id?: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  scope: 'all' | 'department' | 'position' | 'employee';
  department_id?: string;
  position_id?: string;
  employee_id?: string;
  is_active: boolean;
}

export const leaveBlackoutService = {
  getAll: async (params?: {
    is_active?: boolean;
  }): Promise<LeaveBlackoutPeriod[]> => {
    const searchParams = new URLSearchParams();
    if (params?.is_active !== undefined) searchParams.append("is_active", params.is_active.toString());

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.leaveBlackoutPeriods.list}?${query}`
      : API_ENDPOINTS.leaveBlackoutPeriods.list;

    const response = await api.get<{ data: LeaveBlackoutPeriod[] }>(url);
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  },

  getById: async (id: string): Promise<LeaveBlackoutPeriod> => {
    const response = await api.get<LeaveBlackoutPeriod>(API_ENDPOINTS.leaveBlackoutPeriods.detail(id));
    return response.data;
  },

  create: async (data: Partial<LeaveBlackoutPeriod>): Promise<LeaveBlackoutPeriod> => {
    const response = await api.post<LeaveBlackoutPeriod>(API_ENDPOINTS.leaveBlackoutPeriods.create, data);
    return response.data;
  },

  update: async (id: string, data: Partial<LeaveBlackoutPeriod>): Promise<LeaveBlackoutPeriod> => {
    const response = await api.put<LeaveBlackoutPeriod>(API_ENDPOINTS.leaveBlackoutPeriods.update(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.leaveBlackoutPeriods.delete(id));
  },

  checkBlackout: async (params: {
    leave_type_id?: string;
    department_id?: string;
    position_id?: string;
    employee_id?: string;
    date: string;
  }): Promise<{ is_blackout: boolean }> => {
    const response = await api.post<{ is_blackout: boolean }>(API_ENDPOINTS.leaveBlackoutPeriods.check, params);
    return response.data;
  },
};
