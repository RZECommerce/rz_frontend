export interface GoalType {
  id: string;
  goal_type_code: string;
  name: string;
  description: string | null;
  default_weight: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalTypeDto {
  name: string;
  description?: string;
  default_weight?: number;
  is_active?: boolean;
}

export type UpdateGoalTypeDto = Partial<CreateGoalTypeDto>;

export interface PerformanceGoal {
  id: string;
  goal_code: string;
  employee_id: string;
  goal_type_id: string;
  title: string;
  description: string | null;
  start_date: string;
  due_date: string;
  status: "draft" | "active" | "completed" | "cancelled";
  progress_percent: number;
  weight: number;
  created_by: string | null;
  updated_by: string | null;
  employee?: { id: string; first_name: string; last_name: string; employee_code: string };
  goal_type?: GoalType;
  created_at: string;
  updated_at: string;
}

export interface CreatePerformanceGoalDto {
  employee_id: string;
  goal_type_id: string;
  title: string;
  description?: string;
  start_date: string;
  due_date: string;
  weight?: number;
}

export type UpdatePerformanceGoalDto = Partial<CreatePerformanceGoalDto>;

export interface PerformanceIndicator {
  id: string;
  indicator_code: string;
  name: string;
  description: string | null;
  scoring_method: string;
  min_score: number;
  max_score: number;
  default_weight: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePerformanceIndicatorDto {
  name: string;
  description?: string;
  scoring_method: string;
  min_score?: number;
  max_score?: number;
  default_weight?: number;
  is_active?: boolean;
}

export type UpdatePerformanceIndicatorDto = Partial<CreatePerformanceIndicatorDto>;

export interface PerformanceAppraisalItem {
  id: string;
  performance_appraisal_id: string;
  performance_goal_id: string | null;
  performance_indicator_id: string | null;
  name: string;
  description: string | null;
  weight: number;
  target_value: number | null;
  actual_value: number | null;
  raw_score: number | null;
  weighted_score: number | null;
  employee_comment: string | null;
  reviewer_comment: string | null;
}

export interface PerformanceAppraisal {
  id: string;
  appraisal_code: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  status: "draft" | "in_progress" | "completed" | "calibrated" | "acknowledged";
  overall_rating: number | null;
  overall_weighted_score: number | null;
  calibrated_rating: number | null;
  calibrated_weighted_score: number | null;
  calibrated_by: string | null;
  calibrated_at: string | null;
  calibration_notes: string | null;
  primary_reviewer_id: string | null;
  secondary_reviewer_id: string | null;
  compensation_action: string | null;
  compensation_change_amount: number | null;
  employee?: { id: string; first_name: string; last_name: string; employee_code: string };
  items?: PerformanceAppraisalItem[];
  created_at: string;
  updated_at: string;
}

export interface CreatePerformanceAppraisalDto {
  employee_id: string;
  period_start: string;
  period_end: string;
  primary_reviewer_id?: string;
  secondary_reviewer_id?: string;
}

export type UpdatePerformanceAppraisalDto = Partial<CreatePerformanceAppraisalDto> & {
  status?: string;
};
