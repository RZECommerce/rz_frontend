export type TrainingStatus = "planned" | "scheduled" | "ongoing" | "completed" | "cancelled";
export type DeliveryMethod = "online" | "classroom" | "blended";

export interface TrainingType {
  id: string;
  training_type_code: string;
  name: string;
  description?: string | null;
  is_mandatory: boolean;
  default_duration_hours?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Trainer {
  id: string;
  trainer_code: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  is_internal: boolean;
  employee_id?: string | null;
  employee?: {
    id: string;
    full_name: string;
    employee_code: string;
  } | null;
  bio?: string | null;
  specialties?: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Training {
  id: string;
  training_code: string;
  training_type_id?: string | null;
  training_type?: TrainingType | null;
  title: string;
  description?: string | null;
  location?: string | null;
  delivery_method: DeliveryMethod;
  start_date?: string | null;
  end_date?: string | null;
  total_hours?: number | null;
  max_participants?: number | null;
  status: TrainingStatus;
  certificate_template?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  trainers?: Trainer[] | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTrainingDto {
  training_type_id?: string | null;
  title: string;
  description?: string | null;
  location?: string | null;
  delivery_method?: DeliveryMethod;
  start_date?: string | null;
  end_date?: string | null;
  total_hours?: number | null;
  max_participants?: number | null;
  status?: TrainingStatus;
  certificate_template?: string | null;
  trainer_ids?: string[] | null;
}

export interface CreateTrainingTypeDto {
  name: string;
  description?: string | null;
  is_mandatory?: boolean;
  default_duration_hours?: number | null;
  is_active?: boolean;
}

export interface CreateTrainerDto {
  name: string;
  email?: string | null;
  phone?: string | null;
  is_internal?: boolean;
  employee_id?: string | null;
  bio?: string | null;
  specialties?: string[] | null;
  is_active?: boolean;
}
