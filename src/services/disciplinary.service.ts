import { api } from "@/lib/api/client";
import type {
  DisciplinaryCase,
  CreateDisciplinaryCaseDto,
  UpdateDisciplinaryCaseDto,
} from "@/types/disciplinary";

export const disciplinaryCaseService = {
  getAll: async (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    const response = await api.get<{ data: DisciplinaryCase[] }>(`/api/disciplinary-cases${query}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ data: DisciplinaryCase }>(`/api/disciplinary-cases/${id}`);
    return response.data;
  },

  create: async (data: CreateDisciplinaryCaseDto) => {
    const response = await api.post<{ data: DisciplinaryCase }>("/api/disciplinary-cases", data);
    return response.data;
  },

  update: async (id: string, data: UpdateDisciplinaryCaseDto) => {
    const response = await api.put<{ data: DisciplinaryCase }>(`/api/disciplinary-cases/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/api/disciplinary-cases/${id}`);
  },

  updateStatus: async (id: string, data: { status: string; actor_id?: string; notes?: string }) => {
    const response = await api.post<{ data: DisciplinaryCase }>(`/api/disciplinary-cases/${id}/update-status`, data);
    return response.data;
  },

  issueNte: async (id: string, data: { due_at: string; actor_id?: string; notes?: string }) => {
    const response = await api.post<{ data: DisciplinaryCase }>(`/api/disciplinary-cases/${id}/issue-nte`, data);
    return response.data;
  },

  recordNteResponse: async (id: string, data: { response_text: string; actor_id?: string }) => {
    const response = await api.post<{ data: DisciplinaryCase }>(`/api/disciplinary-cases/${id}/nte-response`, data);
    return response.data;
  },

  enforceSanction: async (id: string, data?: { actor_id?: string }) => {
    const response = await api.post<{ data: DisciplinaryCase }>(`/api/disciplinary-cases/${id}/enforce-sanction`, data || {});
    return response.data;
  },
};
