import { api } from "./api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/types/common";

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  name: string;
  category: string;
  file_path: string;
  file_name: string;
  file_url?: string;
  mime_type?: string;
  file_size?: number;
  expiry_date?: string;
  description?: string;
  issue_date?: string;
  issue_by?: string;
  review_date?: string;
  expiry_status?: string;
  is_expired?: boolean;
  is_expiring_soon?: boolean;
  created_at: string;
  updated_at: string;
}

interface EmployeeDocumentListParams {
  category?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

export const employeeDocumentService = {
  getAll: async (
    params?: EmployeeDocumentListParams
  ): Promise<PaginatedResponse<EmployeeDocument> | EmployeeDocument[]> => {
    const response = await api.get<
      PaginatedResponse<EmployeeDocument> | { data: EmployeeDocument[] }
    >(API_ENDPOINTS.employeeDocuments.list, {
      params,
    });
    const responseData = response.data;
    if (
      "data" in responseData &&
      Array.isArray(responseData.data) &&
      "current_page" in responseData
    ) {
      return responseData as PaginatedResponse<EmployeeDocument>;
    }
    if ("data" in responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    }
    return [];
  },

  getByEmployee: async (
    employeeId: string,
    params?: EmployeeDocumentListParams
  ): Promise<PaginatedResponse<EmployeeDocument> | EmployeeDocument[]> => {
    const response = await api.get<
      PaginatedResponse<EmployeeDocument> | { data: EmployeeDocument[] }
    >(API_ENDPOINTS.employeeDocuments.byEmployee(employeeId), {
      params,
    });
    const responseData = response.data;
    if (
      "data" in responseData &&
      Array.isArray(responseData.data) &&
      "current_page" in responseData
    ) {
      return responseData as PaginatedResponse<EmployeeDocument>;
    }
    if ("data" in responseData && Array.isArray(responseData.data)) {
      return responseData.data;
    }
    return [];
  },

  getById: async (id: string): Promise<EmployeeDocument> => {
    const response = await api.get<
      { data: EmployeeDocument } | EmployeeDocument
    >(API_ENDPOINTS.employeeDocuments.detail(id));
    const responseData = response.data;
    return "data" in responseData ? responseData.data : responseData;
  },

  create: async (data: FormData): Promise<EmployeeDocument> => {
    const response = await api.post<
      { data: EmployeeDocument } | EmployeeDocument
    >(API_ENDPOINTS.employeeDocuments.create, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const responseData = response.data;
    return "data" in responseData ? responseData.data : responseData;
  },

  update: async (
    id: string,
    data: Partial<EmployeeDocument> | FormData
  ): Promise<EmployeeDocument> => {
    const headers: Record<string, string> = {};
    if (data instanceof FormData) {
      headers["Content-Type"] = "multipart/form-data";
    }
    const response = await api.put<
      { data: EmployeeDocument } | EmployeeDocument
    >(API_ENDPOINTS.employeeDocuments.update(id), data, { headers });
    const responseData = response.data;
    return "data" in responseData ? responseData.data : responseData;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.employeeDocuments.delete(id));
  },

  download: async (id: string): Promise<Blob> => {
    const response = await api.get<Blob>(
      API_ENDPOINTS.employeeDocuments.download(id),
      {
        responseType: "blob",
      }
    );
    return response.data;
  },
};
