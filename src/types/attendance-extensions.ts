export interface ShiftSchedule {
  id: string;
  shift_code: string;
  name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
  break_duration_minutes: number | null;
  rest_days: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateShiftScheduleDto {
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  break_start?: string;
  break_end?: string;
  break_duration_minutes?: number;
  rest_days?: string[];
  is_active?: boolean;
}

export type UpdateShiftScheduleDto = Partial<CreateShiftScheduleDto>;

export interface OvertimePolicy {
  id: string;
  policy_code: string;
  name: string;
  description: string | null;
  regular_ot_rate: number;
  rest_day_ot_rate: number;
  holiday_regular_ot_rate: number;
  holiday_special_ot_rate: number;
  rest_day_holiday_ot_rate: number;
  night_diff_rate: number;
  max_ot_hours_per_day: number | null;
  max_ot_hours_per_week: number | null;
  max_ot_hours_per_month: number | null;
  requires_approval: boolean;
  auto_approve_threshold_hours: number | null;
  requires_manager_approval: boolean;
  requires_hr_approval: boolean;
  hr_approval_threshold_hours: number | null;
  min_ot_hours: number | null;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOvertimePolicyDto {
  name: string;
  description?: string;
  regular_ot_rate: number;
  rest_day_ot_rate: number;
  holiday_regular_ot_rate: number;
  holiday_special_ot_rate: number;
  rest_day_holiday_ot_rate: number;
  night_diff_rate: number;
  max_ot_hours_per_day?: number;
  max_ot_hours_per_week?: number;
  max_ot_hours_per_month?: number;
  requires_approval?: boolean;
  auto_approve_threshold_hours?: number;
  requires_manager_approval?: boolean;
  requires_hr_approval?: boolean;
  hr_approval_threshold_hours?: number;
  min_ot_hours?: number;
  is_active?: boolean;
  is_default?: boolean;
}

export type UpdateOvertimePolicyDto = Partial<CreateOvertimePolicyDto>;

export interface AttendanceAuditTrail {
  id: string;
  attendance_id: string;
  action: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  changed_by: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}
