import type { Attendance } from "./attendance";
import type { OvertimeRequest } from "./overtime-request";

export interface OvertimeLog {
  id: string;
  attendance_id: string | null;
  attendance?: Attendance;
  employee_id: string;
  employee?: {
    id: string;
    employee_code: string;
    full_name: string;
    email: string;
    department?: {
      id: string;
      name: string;
    } | null;
    position?: {
      id: string;
      name: string;
    } | null;
  };
  date: string;
  time_in: string | null;
  time_out: string | null;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  overtime_rate?: number;
  overtime_pay?: number;
  status: "pending" | "approved" | "rejected";
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  originalRequest?: OvertimeRequest; // For overtime requests, preserve original data
}

export interface OvertimeLogFilters {
  employee_id?: string;
  date_from?: string;
  date_to?: string;
  status?: "pending" | "approved" | "rejected";
  search?: string;
  per_page?: number;
  page?: number;
}

export interface OvertimeLogListResponse {
  data: OvertimeLog[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}
