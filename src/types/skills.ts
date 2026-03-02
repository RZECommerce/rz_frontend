export interface Skill {
  id: string;
  skill_code: string;
  name: string;
  category: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSkillDto {
  name: string;
  category: string;
  description?: string;
  is_active?: boolean;
}

export type UpdateSkillDto = Partial<CreateSkillDto>;

export interface EmployeeSkill {
  id: string;
  employee_id: string;
  skill_id: string;
  proficiency_level: number;
  proficiency_label: string | null;
  last_assessed_at: string | null;
  source: string | null;
  notes: string | null;
  employee?: { id: string; first_name: string; last_name: string; employee_code: string };
  skill?: Skill;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeSkillDto {
  employee_id: string;
  skill_id: string;
  proficiency_level: number;
  proficiency_label?: string;
  last_assessed_at?: string;
  source?: string;
  notes?: string;
}

export type UpdateEmployeeSkillDto = Partial<CreateEmployeeSkillDto>;

export interface CertificationExpiryTracking {
  id: string;
  employee_id: string;
  training_id: string | null;
  certification_name: string;
  certification_number: string | null;
  issuing_organization: string | null;
  issue_date: string | null;
  expiry_date: string;
  status: "active" | "expiring_soon" | "expired";
  days_until_expiry: number | null;
  renewal_date: string | null;
  notes: string | null;
  employee?: { id: string; first_name: string; last_name: string; employee_code: string };
  training?: { id: string; title: string } | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCertificationExpiryDto {
  employee_id: string;
  training_id?: string;
  certification_name: string;
  certification_number?: string;
  issuing_organization?: string;
  issue_date?: string;
  expiry_date: string;
  renewal_date?: string;
  notes?: string;
}

export type UpdateCertificationExpiryDto = Partial<CreateCertificationExpiryDto>;
