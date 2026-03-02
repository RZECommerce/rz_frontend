import type { Attendance } from "./attendance";

export interface Timesheet {
  id: string;
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
  week_start: string;
  week_end: string;
  total_hours: number;
  overtime_hours: number;
  regular_hours: number;
  attendances: Attendance[];
  status: "draft" | "submitted" | "approved" | "rejected";
  submitted_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimesheetFilters {
  employee_id?: string;
  week_start?: string;
  week_end?: string;
  status?: "draft" | "submitted" | "approved" | "rejected";
  search?: string;
  per_page?: number;
  page?: number;
}

export interface TimesheetListResponse {
  data: Timesheet[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface WeeklyTimesheet {
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
  week_start: string;
  week_end: string;
  days: {
    date: string;
    day_name: string;
    attendance?: Attendance;
    hours: number;
    overtime_hours: number;
    status: "present" | "absent" | "late" | "half_day" | "on_leave" | "holiday";
  }[];
  total_hours: number;
  overtime_hours: number;
  regular_hours: number;
}

