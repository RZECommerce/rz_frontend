export interface DisciplinaryCase {
  id: string;
  case_code: string;
  employee_id: string;
  reporter_employee_id: string | null;
  case_type: string;
  title: string;
  description: string;
  incident_date: string;
  severity: "minor" | "moderate" | "major" | "critical";
  status: string;
  nte_issued_at: string | null;
  nte_due_at: string | null;
  nte_response_received_at: string | null;
  nte_response_text: string | null;
  sanction_type: string | null;
  sanction_description: string | null;
  sanction_effective_date: string | null;
  sanction_end_date: string | null;
  sanction_enforced: boolean;
  sanction_enforced_at: string | null;
  attachments: unknown[] | null;
  meta: Record<string, unknown> | null;
  created_by: string | null;
  updated_by: string | null;
  employee?: { id: string; first_name: string; last_name: string; employee_code: string };
  reporter?: { id: string; first_name: string; last_name: string; employee_code: string } | null;
  events?: DisciplinaryCaseEvent[];
  events_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDisciplinaryCaseDto {
  employee_id: string;
  reporter_employee_id?: string;
  case_type: string;
  title: string;
  description: string;
  incident_date: string;
  severity: "minor" | "moderate" | "major" | "critical";
}

export type UpdateDisciplinaryCaseDto = Partial<CreateDisciplinaryCaseDto> & {
  sanction_type?: string;
  sanction_description?: string;
  sanction_effective_date?: string;
  sanction_end_date?: string;
};

export interface DisciplinaryCaseEvent {
  id: string;
  disciplinary_case_id: string;
  event_type: string;
  from_status: string | null;
  to_status: string | null;
  actor_id: string | null;
  notes: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}
