export type CandidateStatus =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export interface JobPosting {
  id: string;
  title: string;
  description?: string | null;
  department_id?: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
  position_id?: string | null;
  position?: {
    id: string;
    name: string;
  } | null;
  employment_type_id?: string | null;
  employment_type?: {
    id: string;
    name: string;
  } | null;
  location?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string | null;
  status: "draft" | "published" | "closed";
  posted_date?: string | null;
  closing_date?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  application_link?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  job_posting_id: string;
  employee_id?: string | null;
  job_posting?: JobPosting | null;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  resume_path?: string | null;
  resume_file_name?: string | null;
  cover_letter?: string | null;
  status: CandidateStatus;
  current_stage: string;
  notes?: string | null;
  rating?: number | null;
  source?: string | null;
  applied_date: string;
  attachments?: CandidateAttachment[] | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateAttachment {
  id: string;
  candidate_id: string;
  file_name: string;
  file_path: string;
  file_size?: number | null;
  mime_type?: string | null;
  uploaded_at: string;
}

export interface CreateJobPostingDto {
  title: string;
  description?: string | null;
  department_id?: string | null;
  position_id?: string | null;
  employment_type_id?: string | null;
  location?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string | null;
  status?: "draft" | "published" | "closed";
  posted_date?: string | null;
  closing_date?: string | null;
  requirements?: string | null;
  benefits?: string | null;
}

export interface CreateCandidateDto {
  job_posting_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  cover_letter?: string | null;
  source?: string | null;
  resume?: File | null;
  attachments?: File[] | null;
}

export interface PublicJobApplicationDto {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  cover_letter?: string | null;
  source?: string | null;
  resume?: File | null;
  attachments?: File[] | null;
}

export interface UpdateCandidateDto {
  status?: CandidateStatus;
  current_stage?: string;
  notes?: string | null;
  rating?: number | null;
  attachments?: File[] | null;
}

export interface MoveCandidateDto {
  candidate_id: string;
  new_status: CandidateStatus;
  new_stage: string;
}
