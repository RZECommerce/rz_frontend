import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  OvertimeRequest,
  CreateOvertimeRequestDto,
  UpdateOvertimeRequestDto,
  ApproveOvertimeRequestDto,
  RejectOvertimeRequestDto,
  OvertimeRequestFilters,
  PaginatedOvertimeRequests,
  GenerateOTFromAttendanceDto,
  GenerateOTFromAttendanceResponse,
  AdjustOvertimeHoursDto,
} from "@/types/overtime-request";

export const overtimeRequestService = {
  getAll: async (filters?: OvertimeRequestFilters): Promise<PaginatedOvertimeRequests> => {
    const params = new URLSearchParams();
    
    if (filters?.employee_id) params.append("employee_id", filters.employee_id);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.per_page) params.append("per_page", filters.per_page.toString());
    if (filters?.page) params.append("page", filters.page.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.overtimeRequests.list}?${queryString}`
      : API_ENDPOINTS.overtimeRequests.list;

    const response = await api.get<PaginatedOvertimeRequests>(url);
    return response.data;
  },

  getById: async (id: string): Promise<OvertimeRequest> => {
    const response = await api.get<OvertimeRequest>(API_ENDPOINTS.overtimeRequests.detail(id));
    return response.data;
  },

  create: async (data: CreateOvertimeRequestDto): Promise<OvertimeRequest> => {
    const response = await api.post<OvertimeRequest>(API_ENDPOINTS.overtimeRequests.create, data);
    return response.data;
  },

  update: async (id: string, data: UpdateOvertimeRequestDto): Promise<OvertimeRequest> => {
    const response = await api.put<OvertimeRequest>(API_ENDPOINTS.overtimeRequests.update(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.overtimeRequests.delete(id));
  },

  approve: async (id: string, data: ApproveOvertimeRequestDto): Promise<OvertimeRequest> => {
    const response = await api.post<OvertimeRequest>(
      API_ENDPOINTS.overtimeRequests.approve(id),
      data
    );
    return response.data;
  },

  reject: async (id: string, data: RejectOvertimeRequestDto): Promise<OvertimeRequest> => {
    const response = await api.post<OvertimeRequest>(
      API_ENDPOINTS.overtimeRequests.reject(id),
      data
    );
    return response.data;
  },

  cancel: async (id: string): Promise<OvertimeRequest> => {
    const response = await api.post<OvertimeRequest>(API_ENDPOINTS.overtimeRequests.cancel(id));
    return response.data;
  },

  getByEmployee: async (
    employeeId: string,
    filters?: OvertimeRequestFilters
  ): Promise<PaginatedOvertimeRequests> => {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append("status", filters.status);
    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);
    if (filters?.per_page) params.append("per_page", filters.per_page.toString());
    if (filters?.page) params.append("page", filters.page.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.overtimeRequests.byEmployee(employeeId)}?${queryString}`
      : API_ENDPOINTS.overtimeRequests.byEmployee(employeeId);

    const response = await api.get<PaginatedOvertimeRequests>(url);
    return response.data;
  },

  generateFromAttendance: async (
    data: GenerateOTFromAttendanceDto
  ): Promise<GenerateOTFromAttendanceResponse> => {
    const response = await api.post<GenerateOTFromAttendanceResponse>(
      API_ENDPOINTS.overtimeRequests.generateFromAttendance,
      data
    );
    return response.data;
  },

  adjustHours: async (
    id: string,
    data: AdjustOvertimeHoursDto
  ): Promise<OvertimeRequest> => {
    const response = await api.post<OvertimeRequest>(
      API_ENDPOINTS.overtimeRequests.adjustHours(id),
      data
    );
    return response.data;
  },
};
