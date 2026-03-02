import type { Employee } from "./employee";
import type { Department } from "./employee";

export interface Promotion {
  id: string;
  employee_id: string;
  employee?: Employee;
  title: string;
  description?: string | null;
  promotion_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePromotionDto {
  employee_id: string;
  title: string;
  description?: string | null;
  promotion_date: string;
}

export interface UpdatePromotionDto {
  title?: string;
  description?: string | null;
  promotion_date?: string;
}

export interface Award {
  id: string;
  employee_id: string;
  employee?: Employee;
  department_id?: string | null;
  department?: Department;
  award_type: string;
  gift?: string | null;
  cash?: number | null;
  award_information?: string | null;
  award_date: string;
  award_photo?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAwardDto {
  employee_id: string;
  department_id?: string | null;
  award_type: string;
  gift?: string | null;
  cash?: number | null;
  award_information?: string | null;
  award_date: string;
  award_photo?: string | null;
}

export interface UpdateAwardDto {
  department_id?: string | null;
  award_type?: string;
  gift?: string | null;
  cash?: number | null;
  award_information?: string | null;
  award_date?: string;
  award_photo?: string | null;
}

export interface Travel {
  id: string;
  employee_id: string;
  employee?: Employee;
  arrangement_type?: string | null;
  place_of_visit: string;
  purpose_of_visit: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  expected_budget?: number | null;
  actual_budget?: number | null;
  travel_mode?: string | null;
  status?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTravelDto {
  employee_id: string;
  arrangement_type?: string | null;
  place_of_visit: string;
  purpose_of_visit: string;
  description?: string | null;
  start_date: string;
  end_date: string;
  expected_budget?: number | null;
  actual_budget?: number | null;
  travel_mode?: string | null;
  status?: string | null;
}

export interface UpdateTravelDto {
  arrangement_type?: string | null;
  place_of_visit?: string;
  purpose_of_visit?: string;
  description?: string | null;
  start_date?: string;
  end_date?: string;
  expected_budget?: number | null;
  actual_budget?: number | null;
  travel_mode?: string | null;
  status?: string | null;
}

export interface Transfer {
  id: string;
  employee_id: string;
  employee?: Employee;
  from_department_id?: string | null;
  from_department?: Department;
  to_department_id?: string | null;
  to_department?: Department;
  transfer_date: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTransferDto {
  employee_id: string;
  from_department_id?: string | null;
  to_department_id?: string | null;
  transfer_date: string;
  description?: string | null;
}

export interface UpdateTransferDto {
  from_department_id?: string | null;
  to_department_id?: string | null;
  transfer_date?: string;
  description?: string | null;
}

export interface Resignation {
  id: string;
  employee_id: string;
  employee?: Employee;
  department_id?: string | null;
  department?: Department;
  resignation_date: string;
  notice_date?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateResignationDto {
  employee_id: string;
  department_id?: string | null;
  resignation_date: string;
  notice_date?: string | null;
  description?: string | null;
}

export interface UpdateResignationDto {
  department_id?: string | null;
  resignation_date?: string;
  notice_date?: string | null;
  description?: string | null;
}

export interface Complaint {
  id: string;
  complaint_from: string;
  complaint_from_name?: string;
  complaint_against: string;
  complaint_against_name?: string;
  complaint_title: string;
  complaint_date: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateComplaintDto {
  complaint_from: string;
  complaint_against: string;
  complaint_title: string;
  complaint_date: string;
  description?: string | null;
}

export interface UpdateComplaintDto {
  complaint_title?: string;
  complaint_date?: string;
  description?: string | null;
}

export interface Warning {
  id: string;
  warning_to: string;
  warning_to_name?: string;
  warning_type?: string | null;
  subject: string;
  warning_date: string;
  description?: string | null;
  status?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWarningDto {
  warning_to: string;
  warning_type?: string | null;
  subject: string;
  warning_date: string;
  description?: string | null;
  status?: string | null;
}

export interface UpdateWarningDto {
  warning_type?: string | null;
  subject?: string;
  warning_date?: string;
  description?: string | null;
  status?: string | null;
}

export interface Termination {
  id: string;
  termination_to: string;
  termination_to_name?: string;
  termination_type?: string | null;
  termination_date: string;
  notice_date?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTerminationDto {
  termination_to: string;
  termination_type?: string | null;
  termination_date: string;
  notice_date?: string | null;
  description?: string | null;
}

export interface UpdateTerminationDto {
  termination_type?: string | null;
  termination_date?: string;
  notice_date?: string | null;
  description?: string | null;
}

export interface CoreHrFilters {
  employee_id?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface CoreHrListResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}
