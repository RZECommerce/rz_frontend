import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  Attendance,
  AttendanceFilters,
  AttendanceListResponse,
  CreateAttendanceDto,
  UpdateAttendanceDto,
} from "@/types/attendance";

export const attendanceService = {
  getAll: async (filters?: AttendanceFilters): Promise<AttendanceListResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.employee_id) {
      params.append("employee_id", filters.employee_id);
    }
    if (filters?.date_from) {
      params.append("date_from", filters.date_from);
    }
    if (filters?.date_to) {
      params.append("date_to", filters.date_to);
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.per_page) {
      params.append("per_page", filters.per_page.toString());
    }
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }

    const url = params.toString()
      ? `${API_ENDPOINTS.attendances.list}?${params.toString()}`
      : API_ENDPOINTS.attendances.list;

    const response = await api.get<{ data: Attendance[] } | AttendanceListResponse>(url);
    const responseData = response.data;
    
    // Handle Laravel pagination response
    if ('data' in responseData && Array.isArray(responseData.data) && 'current_page' in responseData) {
      return responseData as AttendanceListResponse;
    }
    
    // Handle wrapped response
    if ('data' in responseData && Array.isArray(responseData.data)) {
      return {
        data: responseData.data,
        current_page: 1,
        per_page: filters?.per_page || 15,
        total: responseData.data.length,
        last_page: 1,
      };
    }
    
    // Fallback
    return {
      data: [],
      current_page: 1,
      per_page: 15,
      total: 0,
      last_page: 1,
    };
  },

  getById: async (id: string): Promise<Attendance> => {
    const response = await api.get<Attendance>(API_ENDPOINTS.attendances.detail(id));
    return response.data;
  },

  create: async (data: CreateAttendanceDto): Promise<Attendance> => {
    const response = await api.post<Attendance>(API_ENDPOINTS.attendances.create, data);
    return response.data;
  },

  update: async (id: string, data: UpdateAttendanceDto): Promise<Attendance> => {
    const response = await api.put<Attendance>(API_ENDPOINTS.attendances.update(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.attendances.delete(id));
  },

  getByEmployee: async (
    employeeId: string,
    filters?: AttendanceFilters
  ): Promise<AttendanceListResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.date_from) {
      params.append("date_from", filters.date_from);
    }
    if (filters?.date_to) {
      params.append("date_to", filters.date_to);
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.per_page) {
      params.append("per_page", filters.per_page.toString());
    }
    if (filters?.page) {
      params.append("page", filters.page.toString());
    }

    const url = params.toString()
      ? `${API_ENDPOINTS.attendances.byEmployee(employeeId)}?${params.toString()}`
      : API_ENDPOINTS.attendances.byEmployee(employeeId);

    const response = await api.get<{ data: Attendance[] } | AttendanceListResponse>(url);
    const responseData = response.data;
    
    // Handle Laravel pagination response
    if ('data' in responseData && Array.isArray(responseData.data) && 'current_page' in responseData) {
      return responseData as AttendanceListResponse;
    }
    
    // Handle wrapped response
    if ('data' in responseData && Array.isArray(responseData.data)) {
      return {
        data: responseData.data,
        current_page: 1,
        per_page: filters?.per_page || 15,
        total: responseData.data.length,
        last_page: 1,
      };
    }
    
    return {
      data: [],
      current_page: 1,
      per_page: 15,
      total: 0,
      last_page: 1,
    };
  },
};

