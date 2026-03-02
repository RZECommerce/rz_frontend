/**
 * Employee service
 */

import { api } from "./api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeListParams,
  Department,
  Position,
  EmploymentType,
} from "@/types/employee";

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const employeeService = {
  getAll: async (params?: EmployeeListParams): Promise<PaginatedResponse<Employee>> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.department_id)
      searchParams.append("department_id", params.department_id);
    if (params?.position_id)
      searchParams.append("position_id", params.position_id);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.per_page)
      searchParams.append("per_page", params.per_page.toString());

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.employees.list}?${query}`
      : API_ENDPOINTS.employees.list;

    const response = await api.get<PaginatedResponse<Employee>>(url);
    return response.data;
  },

  getById: async (id: string): Promise<Employee> => {
    const response = await api.get<Employee>(API_ENDPOINTS.employees.detail(id));
    return response.data;
  },

  create: async (data: CreateEmployeeDto): Promise<Employee> => {
    const response = await api.post<Employee>(API_ENDPOINTS.employees.create, data);
    return response.data;
  },

  update: async (id: string, data: UpdateEmployeeDto): Promise<Employee> => {
    const response = await api.patch<Employee>(API_ENDPOINTS.employees.update(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.employees.delete(id));
  },

  registerFace: async (id: string, imageData: string): Promise<{ message: string; data: Employee }> => {
    const response = await api.post<{ message: string; data: Employee }>(
      API_ENDPOINTS.employees.registerFace(id),
      { image: imageData }
    );
    return response.data;
  },

  getAssignedLeaveTypes: async (id: string, year?: number): Promise<any[]> => {
    const params = new URLSearchParams();
    if (year) params.append("year", year.toString());
    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.employees.assignedLeaveTypes(id)}?${queryString}`
      : API_ENDPOINTS.employees.assignedLeaveTypes(id);
    const response = await api.get<{ data: any[] } | any[]>(url);
    const responseData = response.data;
    if (Array.isArray(responseData)) {
      return responseData;
    }
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      const data = (responseData as { data: unknown }).data;
      return Array.isArray(data) ? data : [];
    }
    return [];
  },

  addLeaveType: async (employeeId: string, leaveTypeId: string, year?: number): Promise<any> => {
    const params = new URLSearchParams();
    if (year) params.append("year", year.toString());
    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.employees.addLeaveType(employeeId, leaveTypeId)}?${queryString}`
      : API_ENDPOINTS.employees.addLeaveType(employeeId, leaveTypeId);
    const response = await api.post<{ message: string; data: any }>(url);
    return response.data;
  },

  removeLeaveType: async (employeeId: string, leaveTypeId: string, year?: number): Promise<void> => {
    const params = new URLSearchParams();
    if (year) params.append("year", year.toString());
    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.employees.removeLeaveType(employeeId, leaveTypeId)}?${queryString}`
      : API_ENDPOINTS.employees.removeLeaveType(employeeId, leaveTypeId);
    await api.delete<void>(url);
  },
};

export const departmentService = {
  getAll: async (activeOnly = false): Promise<Department[]> => {
    const url = activeOnly
      ? `${API_ENDPOINTS.departments.list}?active_only=true`
      : API_ENDPOINTS.departments.list;
    const response = await api.get<{ data: Department[] } | Department[]>(url);
    const responseData = response.data;
    // Laravel API Resources wrap collections in a 'data' key
    if (Array.isArray(responseData)) {
      return responseData;
    }
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      const data = (responseData as { data: unknown }).data;
      return Array.isArray(data) ? data : [];
    }
    return [];
  },

  getById: async (id: string): Promise<Department> => {
    const response = await api.get<Department>(API_ENDPOINTS.departments.detail(id));
    return response.data;
  },

  create: (data: Omit<Department, "id" | "department_code" | "created_at" | "updated_at">) => {
    return api.post<Department>(API_ENDPOINTS.departments.list, data);
  },

  update: (id: string, data: Partial<Omit<Department, "id" | "department_code" | "created_at" | "updated_at">>) => {
    return api.patch<Department>(API_ENDPOINTS.departments.detail(id), data);
  },

  delete: (id: string) => {
    return api.delete<void>(API_ENDPOINTS.departments.detail(id));
  },
};

export const positionService = {
  getAll: async (activeOnly = false): Promise<Position[]> => {
    const url = activeOnly
      ? `${API_ENDPOINTS.positions.list}?active_only=true`
      : API_ENDPOINTS.positions.list;
    const response = await api.get<{ data: Position[] } | Position[]>(url);
    const responseData = response.data;
    // Laravel API Resources wrap collections in a 'data' key
    if (Array.isArray(responseData)) {
      return responseData;
    }
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      const data = (responseData as { data: unknown }).data;
      return Array.isArray(data) ? data : [];
    }
    return [];
  },

  getById: async (id: string): Promise<Position> => {
    const response = await api.get<Position>(API_ENDPOINTS.positions.detail(id));
    return response.data;
  },

  create: (data: Omit<Position, "id" | "position_code" | "created_at" | "updated_at">) => {
    return api.post<Position>(API_ENDPOINTS.positions.list, data);
  },

  update: (id: string, data: Partial<Omit<Position, "id" | "position_code" | "created_at" | "updated_at">>) => {
    return api.patch<Position>(API_ENDPOINTS.positions.detail(id), data);
  },

  delete: (id: string) => {
    return api.delete<void>(API_ENDPOINTS.positions.detail(id));
  },
};

export const employmentTypeService = {
  getAll: async (activeOnly = false): Promise<EmploymentType[]> => {
    const url = activeOnly
      ? `${API_ENDPOINTS.employmentTypes.list}?active_only=true`
      : API_ENDPOINTS.employmentTypes.list;
    const response = await api.get<{ data: EmploymentType[] } | EmploymentType[]>(url);
    const responseData = response.data;
    // Laravel API Resources wrap collections in a 'data' key
    if (Array.isArray(responseData)) {
      return responseData;
    }
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      const data = (responseData as { data: unknown }).data;
      return Array.isArray(data) ? data : [];
    }
    return [];
  },

  getById: async (id: string): Promise<EmploymentType> => {
    const response = await api.get<EmploymentType>(
      API_ENDPOINTS.employmentTypes.detail(id)
    );
    return response.data;
  },

  create: (data: Omit<EmploymentType, "id" | "employment_type_code" | "created_at" | "updated_at">) => {
    return api.post<EmploymentType>(API_ENDPOINTS.employmentTypes.list, data);
  },

  update: (id: string, data: Partial<Omit<EmploymentType, "id" | "employment_type_code" | "created_at" | "updated_at">>) => {
    return api.patch<EmploymentType>(API_ENDPOINTS.employmentTypes.detail(id), data);
  },

  delete: (id: string) => {
    return api.delete<void>(API_ENDPOINTS.employmentTypes.detail(id));
  },
};

