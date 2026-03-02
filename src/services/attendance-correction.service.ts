/**
 * Attendance Correction Window service
 */

import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export interface AttendanceCorrectionWindow {
  id: string;
  max_correction_days: number;
  applies_to: 'all' | 'employee' | 'manager' | 'hr';
  requires_approval: boolean;
  approval_level?: string;
  is_active: boolean;
}

export const attendanceCorrectionService = {
  getAll: async (params?: {
    is_active?: boolean;
  }): Promise<AttendanceCorrectionWindow[]> => {
    const searchParams = new URLSearchParams();
    if (params?.is_active !== undefined) searchParams.append("is_active", params.is_active.toString());

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.attendanceCorrectionWindows.list}?${query}`
      : API_ENDPOINTS.attendanceCorrectionWindows.list;

    const response = await api.get<{ data: AttendanceCorrectionWindow[] }>(url);
    return Array.isArray(response.data) ? response.data : response.data.data || [];
  },

  getById: async (id: string): Promise<AttendanceCorrectionWindow> => {
    const response = await api.get<AttendanceCorrectionWindow>(API_ENDPOINTS.attendanceCorrectionWindows.detail(id));
    return response.data;
  },

  create: async (data: Partial<AttendanceCorrectionWindow>): Promise<AttendanceCorrectionWindow> => {
    const response = await api.post<AttendanceCorrectionWindow>(API_ENDPOINTS.attendanceCorrectionWindows.create, data);
    return response.data;
  },

  update: async (id: string, data: Partial<AttendanceCorrectionWindow>): Promise<AttendanceCorrectionWindow> => {
    const response = await api.put<AttendanceCorrectionWindow>(API_ENDPOINTS.attendanceCorrectionWindows.update(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.attendanceCorrectionWindows.delete(id));
  },

  checkWindow: async (attendanceDate: string, correctorRole: string): Promise<{
    allowed: boolean;
    message?: string;
    requires_approval?: boolean;
    approval_level?: string;
  }> => {
    const response = await api.post<{
      allowed: boolean;
      message?: string;
      requires_approval?: boolean;
      approval_level?: string;
    }>(API_ENDPOINTS.attendanceCorrectionWindows.check, {
      attendance_date: attendanceDate,
      corrector_role: correctorRole,
    });
    return response.data;
  },
};
