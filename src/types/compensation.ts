export interface CompensationBand {
  id: string;
  position_id: string;
  band_name: string;
  min_salary: number;
  mid_salary: number;
  max_salary: number;
  currency: string;
  description: string | null;
  effective_date: string;
  expiry_date: string | null;
  is_active: boolean;
  position?: { id: string; name: string };
  created_at: string;
  updated_at: string;
}

export interface CreateCompensationBandDto {
  position_id: string;
  band_name: string;
  min_salary: number;
  mid_salary: number;
  max_salary: number;
  currency?: string;
  description?: string;
  effective_date: string;
  expiry_date?: string;
  is_active?: boolean;
}

export type UpdateCompensationBandDto = Partial<CreateCompensationBandDto>;

export interface CompensationAdjustment {
  id: string;
  employee_id: string;
  adjustment_code: string;
  adjustment_type: string;
  old_salary: number;
  new_salary: number;
  adjustment_amount: number;
  adjustment_percentage: number;
  currency: string;
  effective_date: string;
  justification: string;
  status: "pending" | "approved" | "rejected";
  approval_history: Array<{ action: string; approved_by: string; approved_at: string }> | null;
  requested_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  employee?: { id: string; first_name: string; last_name: string; employee_code: string };
  created_at: string;
  updated_at: string;
}

export interface CreateCompensationAdjustmentDto {
  employee_id: string;
  adjustment_type: string;
  old_salary: number;
  new_salary: number;
  currency?: string;
  effective_date: string;
  justification: string;
  requested_by?: string;
}

export type UpdateCompensationAdjustmentDto = Partial<CreateCompensationAdjustmentDto>;
