import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  LeaveType,
  LeaveRequest,
  LeaveBalance,
  CreateLeaveTypeDto,
  UpdateLeaveTypeDto,
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  ApproveLeaveRequestDto,
  RejectLeaveRequestDto,
  LeaveRequestFilters,
  PaginatedLeaveRequests,
} from "@/types/leave";

// Helper to extract data from Laravel API Resource collections
const extractData = <T>(response: T | { data: T }): T => {
  if (response && typeof response === "object" && "data" in response) {
    return response.data as T;
  }
  return response as T;
};

export const leaveTypeService = {
  getAll: async (activeOnly = false): Promise<LeaveType[]> => {
    const params = new URLSearchParams();
    if (activeOnly) params.append("active_only", "1");

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.leaveTypes.list}?${queryString}`
      : API_ENDPOINTS.leaveTypes.list;

    const response = await api.get<LeaveType[] | { data: LeaveType[] }>(url);
    const responseData = response.data;
    return Array.isArray(responseData) ? responseData : responseData.data || [];
  },

  getById: async (id: string): Promise<LeaveType> => {
    const response = await api.get<LeaveType>(API_ENDPOINTS.leaveTypes.detail(id));
    return response.data;
  },

  create: async (data: CreateLeaveTypeDto): Promise<LeaveType> => {
    const response = await api.post<LeaveType>(API_ENDPOINTS.leaveTypes.create, data);
    return response.data;
  },

  update: async (id: string, data: UpdateLeaveTypeDto): Promise<LeaveType> => {
    const response = await api.put<LeaveType>(API_ENDPOINTS.leaveTypes.update(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.leaveTypes.delete(id));
  },
};

export const leaveRequestService = {
  getAll: async (filters?: LeaveRequestFilters): Promise<PaginatedLeaveRequests> => {
    const params = new URLSearchParams();
    if (filters?.employee_id) params.append("employee_id", filters.employee_id);
    if (filters?.leave_type_id) params.append("leave_type_id", filters.leave_type_id);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.per_page) params.append("per_page", filters.per_page.toString());
    if (filters?.page) params.append("page", filters.page.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.leaveRequests.list}?${queryString}`
      : API_ENDPOINTS.leaveRequests.list;

    const response = await api.get<PaginatedLeaveRequests>(url);
    return response.data;
  },

  getById: async (id: string): Promise<LeaveRequest> => {
    const response = await api.get<LeaveRequest>(API_ENDPOINTS.leaveRequests.detail(id));
    return response.data;
  },

  create: async (data: CreateLeaveRequestDto): Promise<LeaveRequest> => {
    const response = await api.post<LeaveRequest>(API_ENDPOINTS.leaveRequests.create, data);
    return response.data;
  },

  update: async (id: string, data: UpdateLeaveRequestDto): Promise<LeaveRequest> => {
    const response = await api.put<LeaveRequest>(API_ENDPOINTS.leaveRequests.update(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.leaveRequests.delete(id));
  },

  approve: async (id: string, data: ApproveLeaveRequestDto): Promise<LeaveRequest> => {
    const response = await api.post<LeaveRequest>(API_ENDPOINTS.leaveRequests.approve(id), data);
    return response.data;
  },

  reject: async (id: string, data: RejectLeaveRequestDto): Promise<LeaveRequest> => {
    const response = await api.post<LeaveRequest>(API_ENDPOINTS.leaveRequests.reject(id), data);
    return response.data;
  },

  cancel: async (id: string): Promise<LeaveRequest> => {
    const response = await api.post<LeaveRequest>(API_ENDPOINTS.leaveRequests.cancel(id));
    return response.data;
  },

  getByEmployee: async (employeeId: string, filters?: LeaveRequestFilters): Promise<PaginatedLeaveRequests> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.date_from) params.append("date_from", filters.date_from);
    if (filters?.date_to) params.append("date_to", filters.date_to);
    if (filters?.per_page) params.append("per_page", filters.per_page.toString());
    if (filters?.page) params.append("page", filters.page.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.leaveRequests.byEmployee(employeeId)}?${queryString}`
      : API_ENDPOINTS.leaveRequests.byEmployee(employeeId);

    const response = await api.get<PaginatedLeaveRequests>(url);
    return response.data;
  },

  getLeaveBalances: async (employeeId: string, year?: number): Promise<LeaveBalance[]> => {
    const params = new URLSearchParams();
    if (year) params.append("year", year.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.leaveRequests.balances(employeeId)}?${queryString}`
      : API_ENDPOINTS.leaveRequests.balances(employeeId);

    const response = await api.get<LeaveBalance[] | { data: LeaveBalance[] }>(url);
    const responseData = response.data;
    return Array.isArray(responseData) ? responseData : responseData.data || [];
  },
};

