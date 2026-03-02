import type { Employee } from "./employee";
import type { PaginatedResponse } from "./common";

export type OvertimeRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface OvertimeRequest {
  id: string;
  overtime_request_code: string;
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
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  hours: number; // Rendered/requested hours
  approved_hours: number | null; // Hours approved for payment
  reason: string | null;
  status: OvertimeRequestStatus;
  remarks: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateOvertimeRequestDto {
  employee_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  reason?: string | null;
  hours?: number;
}

export interface UpdateOvertimeRequestDto {
  employee_id?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  reason?: string | null;
  hours?: number;
  approved_hours?: number | null;
  status?: OvertimeRequestStatus;
  remarks?: string | null;
  rejection_reason?: string | null;
}

export interface ApproveOvertimeRequestDto {
  approved_hours?: number | null;
  remarks?: string | null;
}

export interface RejectOvertimeRequestDto {
  rejection_reason: string;
  remarks?: string | null;
}

export interface GenerateOTFromAttendanceDto {
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  employee_id?: string;
}

export interface GenerateOTFromAttendanceResponse {
  message: string;
  data: {
    generated: number;
    skipped: number;
    errors: Array<{
      employee_id: string;
      date: string;
      error: string;
    }>;
    total_processed: number;
  };
}

export interface AdjustOvertimeHoursDto {
  hours: number;
  adjustment_reason: string;
}

export interface OvertimeRequestFilters {
  employee_id?: string;
  status?: OvertimeRequestStatus;
  date_from?: string;
  date_to?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

export type PaginatedOvertimeRequests = PaginatedResponse<OvertimeRequest>;
