export interface LeaveEncashment {
  id: string;
  encashment_code: string;
  employee_id: string;
  leave_type_id: string;
  leave_balance_id: string;
  year: number;
  days_encashed: number;
  daily_rate: number;
  encashment_rate: number;
  total_amount: number;
  status: "pending" | "approved" | "rejected" | "paid";
  approved_by: string | null;
  approved_at: string | null;
  approval_remarks: string | null;
  payment_date: string | null;
  notes: string | null;
  employee?: { id: string; first_name: string; last_name: string; employee_code: string };
  leave_type?: { id: string; name: string };
  created_at: string;
  updated_at: string;
}

export interface CreateLeaveEncashmentDto {
  employee_id: string;
  leave_type_id: string;
  leave_balance_id: string;
  year: number;
  days_encashed: number;
  daily_rate: number;
  encashment_rate: number;
  notes?: string;
}

export type UpdateLeaveEncashmentDto = Partial<CreateLeaveEncashmentDto>;

export interface LeaveExpiryRule {
  id: string;
  leave_type_id: string;
  expiry_type: string;
  expiry_days_after_accrual: number | null;
  custom_expiry_date: string | null;
  grace_period_type: string | null;
  grace_period_value: number | null;
  action_on_expiry: string;
  is_active: boolean;
  leave_type?: { id: string; name: string };
  created_at: string;
  updated_at: string;
}

export interface CreateLeaveExpiryRuleDto {
  leave_type_id: string;
  expiry_type: string;
  expiry_days_after_accrual?: number;
  custom_expiry_date?: string;
  grace_period_type?: string;
  grace_period_value?: number;
  action_on_expiry: string;
  is_active?: boolean;
}

export type UpdateLeaveExpiryRuleDto = Partial<CreateLeaveExpiryRuleDto>;
