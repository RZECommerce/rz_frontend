import { api } from "./api";
import type {
  JobPosting,
  Candidate,
  CreateJobPostingDto,
  CreateCandidateDto,
  PublicJobApplicationDto,
  UpdateCandidateDto,
  MoveCandidateDto,
} from "@/types/recruitment";

export const recruitmentService = {
  // Job Postings
  getJobPostings: async (): Promise<JobPosting[]> => {
    const response = await api.get<{ data: JobPosting[] }>(
      "/api/recruitment/job-postings",
    );
    return response.data.data;
  },

  getJobPosting: async (id: string): Promise<JobPosting> => {
    const response = await api.get<{ data: JobPosting }>(
      `/api/recruitment/job-postings/${id}`,
    );
    return response.data.data;
  },

  createJobPosting: async (data: CreateJobPostingDto): Promise<JobPosting> => {
    const response = await api.post<{ data: JobPosting }>(
      "/api/recruitment/job-postings",
      data,
    );
    return response.data.data;
  },

  updateJobPosting: async (
    id: string,
    data: Partial<CreateJobPostingDto>,
  ): Promise<JobPosting> => {
    const response = await api.put<{ data: JobPosting }>(
      `/api/recruitment/job-postings/${id}`,
      data,
    );
    return response.data.data;
  },

  deleteJobPosting: async (id: string): Promise<void> => {
    await api.delete(`/api/recruitment/job-postings/${id}`);
  },

  // Candidates
  getCandidates: async (jobPostingId?: string): Promise<Candidate[]> => {
    const params = jobPostingId ? { job_posting_id: jobPostingId } : {};
    const response = await api.get<{ data: Candidate[] }>(
      "/api/recruitment/candidates",
      { params },
    );
    return response.data.data;
  },

  getCandidate: async (id: string): Promise<Candidate> => {
    const response = await api.get<{ data: Candidate }>(
      `/api/recruitment/candidates/${id}`,
    );
    return response.data.data;
  },

  createCandidate: async (data: CreateCandidateDto): Promise<Candidate> => {
    const formData = new FormData();
    formData.append("job_posting_id", data.job_posting_id);
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("email", data.email);
    if (data.phone) formData.append("phone", data.phone);
    if (data.cover_letter) formData.append("cover_letter", data.cover_letter);
    if (data.source) formData.append("source", data.source);
    if (data.resume) formData.append("resume", data.resume);
    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append("attachments[]", file);
      });
    }

    const response = await api.post<{ data: Candidate }>(
      "/api/recruitment/candidates",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.data;
  },

  updateCandidate: async (
    id: string,
    data: UpdateCandidateDto,
  ): Promise<Candidate> => {
    const formData = new FormData();
    if (data.status) formData.append("status", data.status);
    if (data.current_stage)
      formData.append("current_stage", data.current_stage);
    if (data.notes !== undefined) formData.append("notes", data.notes || "");
    if (data.rating !== undefined)
      formData.append("rating", String(data.rating));
    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append("attachments[]", file);
      });
    }

    const response = await api.put<{ data: Candidate }>(
      `/api/recruitment/candidates/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.data;
  },

  moveCandidate: async (data: MoveCandidateDto): Promise<Candidate> => {
    const response = await api.post<{ data: Candidate }>(
      "/api/recruitment/candidates/move",
      data,
    );
    return response.data.data;
  },

  deleteCandidate: async (id: string): Promise<void> => {
    await api.delete(`/api/recruitment/candidates/${id}`);
  },

  convertToEmployee: async (
    id: string,
    data: {
      position_id: string;
      department_id: string;
      employment_type_id: string;
      hire_date: string;
      salary?: number;
    },
  ): Promise<unknown> => {
    const response = await api.post(
      `/api/recruitment/candidates/${id}/convert-to-employee`,
      data,
    );
    return response.data;
  },

  // Public job application endpoints
  getPublicJobPosting: async (identifier: string): Promise<JobPosting> => {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: JobPosting;
    }>(`/api/recruitment/public/job-postings/${identifier}`);
    return response.data.data;
  },

  applyToJobPosting: async (
    identifier: string,
    data: PublicJobApplicationDto,
  ): Promise<Candidate> => {
    const formData = new FormData();
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("email", data.email);

    // Include optional values only when provided to keep payload clean.
    if (data.phone) formData.append("phone", data.phone);
    if (data.cover_letter) formData.append("cover_letter", data.cover_letter);
    if (data.source) formData.append("source", data.source);
    if (data.resume) formData.append("resume", data.resume);
    if (data.attachments) {
      data.attachments.forEach((file) => {
        formData.append("attachments[]", file);
      });
    }

    const response = await api.post<{
      success: boolean;
      message: string;
      data: Candidate;
    }>(`/api/recruitment/public/job-postings/${identifier}/apply`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },
};
