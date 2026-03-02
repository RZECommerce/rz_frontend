/**
 * Employee-related types
 */

export interface Department {
  id: string;
  company_id?: string;
  department_code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: string;
  company_id?: string;
  position_code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmploymentType {
  id: string;
  employment_type_code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type EmployeeStatus =
  | "active"
  | "on_leave"
  | "probation"
  | "inactive"
  | "terminated";

export type Gender = "male" | "female" | "other";

export interface Employee {
  id: string;
  company_id?: string;
  employee_code: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: Gender;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  hire_date: string;
  probation_end_date?: string;
  contract_end_date?: string;
  status: EmployeeStatus;
  salary?: number;
  currency: string;
  employee_id_number?: string;
  tax_id_number?: string;
  sss_number?: string;
  philhealth_number?: string;
  pagibig_number?: string;
  pension_provider?: string;
  pension_account_number?: string;
  pension_enrollment_date?: string;
  pension_contribution_rate?: number;
  pension_enrolled?: boolean;
  tax_dependents?: number;
  tax_status?: "single" | "married" | "head_of_household";
  notes?: string;
  face_encoding?: number[] | null;
  company?: {
    id: string;
    company_code: string;
    name: string;
    legal_name?: string | null;
  };
  department?: Department;
  position?: Position;
  employment_type?: EmploymentType;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeDto {
  company_id?: string;
  user_id?: string;
  create_new_user?: boolean;
  department_id: string;
  position_id: string;
  employment_type_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: Gender;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  hire_date: string;
  probation_end_date?: string;
  contract_end_date?: string;
  status: EmployeeStatus;
  salary?: number;
  currency?: string;
  employee_id_number?: string;
  tax_id_number?: string;
  sss_number?: string;
  philhealth_number?: string;
  pagibig_number?: string;
  tax_dependents?: number;
  tax_status?: "single" | "married" | "head_of_household";
  notes?: string;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}

export interface EmployeeListParams {
  company_id?: string;
  status?: EmployeeStatus;
  department_id?: string;
  position_id?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

