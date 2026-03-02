import type { Employee } from "./employee";
import type { PaginatedResponse } from "./common";

export type LeaveRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveType {
  id: string;
  company_id?: string;
  leave_type_code: string;
  name: string;
  description: string | null;
  max_days_per_year: number | null;
  requires_approval: boolean;
  is_paid: boolean;
  can_carry_over: boolean;
  max_carry_over_days: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaveBalance {
  id: string;
  leave_balance_code: string;
  employee_id: string;
  employee?: {
    id: string;
    employee_code: string;
    full_name: string;
  };
  leave_type_id: string;
  leave_type?: {
    id: string;
    name: string;
  };
  year: number;
  total_days: number;
  used_days: number;
  pending_days: number;
  available_days: number;
  carried_over_days: number;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  company_id?: string;
  leave_request_code: string;
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
  leave_type_id: string;
  leave_type?: {
    id: string;
    name: string;
    is_paid: boolean;
  };
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  total_days: number;
  status: LeaveRequestStatus;
  reason: string | null;
  remarks: string | null;
  approved_by: string | null;
  approver?: {
    id: string;
    name: string;
  } | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLeaveTypeDto {
  name: string;
  description?: string | null;
  max_days_per_year?: number | null;
  requires_approval?: boolean;
  is_paid?: boolean;
  can_carry_over?: boolean;
  max_carry_over_days?: number | null;
  is_active?: boolean;
}

export interface UpdateLeaveTypeDto {
  name?: string;
  description?: string | null;
  max_days_per_year?: number | null;
  requires_approval?: boolean;
  is_paid?: boolean;
  can_carry_over?: boolean;
  max_carry_over_days?: number | null;
  is_active?: boolean;
}

export interface CreateLeaveRequestDto {
  employee_id: string;
  leave_type_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  reason?: string | null;
  remarks?: string | null;
}

export interface UpdateLeaveRequestDto {
  employee_id?: string;
  leave_type_id?: string;
  start_date?: string;
  end_date?: string;
  status?: LeaveRequestStatus;
  reason?: string | null;
  remarks?: string | null;
  rejection_reason?: string | null;
}

export interface ApproveLeaveRequestDto {
  remarks?: string | null;
}

export interface RejectLeaveRequestDto {
  rejection_reason: string;
  remarks?: string | null;
}

export interface LeaveRequestFilters {
  company_id?: string;
  employee_id?: string;
  leave_type_id?: string;
  status?: LeaveRequestStatus;
  date_from?: string;
  date_to?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

export type PaginatedLeaveRequests = PaginatedResponse<LeaveRequest>;
export type PaginatedLeaveTypes = PaginatedResponse<LeaveType>;

