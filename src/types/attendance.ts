import type { Employee } from "./employee";

export interface Attendance {
  id: string;
  company_id?: string;
  attendance_code: string;
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
  break_start: string | null;
  break_end: string | null;
  total_hours: number;
  overtime_hours: number;
  night_differential_hours?: number;
  status: "present" | "absent" | "late" | "half_day" | "on_leave";
  late_minutes: number | null;
  undertime_minutes?: number | null;
  approval_status?: "pending" | "approved" | "rejected";
  approved_by?: string | null;
  approved_at?: string | null;
  approval_remarks?: string | null;
  is_locked?: boolean;
  locked_by?: string | null;
  locked_at?: string | null;
  shift_schedule_id?: string | null;
  attendance_cutoff_period_id?: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAttendanceDto {
  employee_id: string;
  date: string;
  time_in?: string | null;
  time_out?: string | null;
  break_start?: string | null;
  break_end?: string | null;
  status?: "present" | "absent" | "late" | "half_day" | "on_leave";
  late_minutes?: number | null;
  notes?: string | null;
}

export interface UpdateAttendanceDto {
  employee_id?: string;
  date?: string;
  time_in?: string | null;
  time_out?: string | null;
  break_start?: string | null;
  break_end?: string | null;
  status?: "present" | "absent" | "late" | "half_day" | "on_leave";
  late_minutes?: number | null;
  notes?: string | null;
}

export interface AttendanceFilters {
  company_id?: string;
  employee_id?: string;
  date_from?: string;
  date_to?: string;
  status?: "present" | "absent" | "late" | "half_day" | "on_leave";
  search?: string;
  per_page?: number;
  page?: number;
}

export interface AttendanceListResponse {
  data: Attendance[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

