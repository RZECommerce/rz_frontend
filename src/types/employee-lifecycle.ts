export interface EmployeeLifecycleEvent {
  id: string;
  employee_id: string;
  event_type: string;
  from_department_id: string | null;
  to_department_id: string | null;
  from_position_id: string | null;
  to_position_id: string | null;
  from_status: string | null;
  to_status: string | null;
  meta: Record<string, unknown> | null;
  effective_at: string;
  created_by: string | null;
  employee?: { id: string; first_name: string; last_name: string; employee_code: string };
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeLifecycleEventDto {
  employee_id: string;
  event_type: string;
  from_department_id?: string;
  to_department_id?: string;
  from_position_id?: string;
  to_position_id?: string;
  from_status?: string;
  to_status?: string;
  meta?: Record<string, unknown>;
  effective_at: string;
}

export type UpdateEmployeeLifecycleEventDto = Partial<CreateEmployeeLifecycleEventDto>;

export interface EmployeeStatusDefinition {
  id: string;
  status_code: string;
  status_name: string;
  description: string | null;
  category: string;
  payroll_eligible: boolean;
  leave_accrual_eligible: boolean;
  benefits_eligible: boolean;
  eligibility_rules: Record<string, unknown>[] | null;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeStatusDefinitionDto {
  status_code: string;
  status_name: string;
  description?: string;
  category: string;
  payroll_eligible?: boolean;
  leave_accrual_eligible?: boolean;
  benefits_eligible?: boolean;
  eligibility_rules?: Record<string, unknown>[];
  is_active?: boolean;
  order?: number;
}

export type UpdateEmployeeStatusDefinitionDto = Partial<CreateEmployeeStatusDefinitionDto>;
