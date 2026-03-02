import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export interface EmployeeProfileFilters {
  employee_id?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface ListResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

const buildListResponse = <T>(
  responseData: { data: T[] } | ListResponse<T>,
  filters?: EmployeeProfileFilters
): ListResponse<T> => {
  if ("data" in responseData && Array.isArray(responseData.data) && "current_page" in responseData) {
    return responseData as ListResponse<T>;
  }

  if ("data" in responseData && Array.isArray(responseData.data)) {
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
    per_page: filters?.per_page || 15,
    total: 0,
    last_page: 1,
  };
};

const buildParams = (filters?: EmployeeProfileFilters): string => {
  const params = new URLSearchParams();
  if (filters?.employee_id) params.append("employee_id", filters.employee_id);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.per_page) params.append("per_page", filters.per_page.toString());
  if (filters?.page) params.append("page", filters.page.toString());
  return params.toString();
};

export interface EmployeeBankAccountApi {
  id: string;
  employee_id: string;
  account_title: string;
  account_number: string;
  bank_name: string;
  bank_code?: string | null;
  bank_branch?: string | null;
}

export interface EmployeeWorkExperienceApi {
  id: string;
  employee_id: string;
  company_name: string;
  from_date: string;
  to_date?: string | null;
  post: string;
  description?: string | null;
}

export interface EmployeeQualificationApi {
  id: string;
  employee_id: string;
  school_name: string;
  education_level: string;
  time_period: string;
  description?: string | null;
}

export interface EmployeeEmergencyContactApi {
  id: string;
  employee_id: string;
  name: string;
  relation: string;
  email: string;
  phone: string;
  address?: string | null;
}

export const employeeBankAccountService = {
  getAll: async (filters?: EmployeeProfileFilters): Promise<ListResponse<EmployeeBankAccountApi>> => {
    const params = buildParams(filters);
    const url = params ? `${API_ENDPOINTS.employeeBankAccounts.list}?${params}` : API_ENDPOINTS.employeeBankAccounts.list;
    const response = await api.get<{ data: EmployeeBankAccountApi[] } | ListResponse<EmployeeBankAccountApi>>(url);
    return buildListResponse(response.data, filters);
  },
  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.employeeBankAccounts.delete(id));
  },
};

export const employeeWorkExperienceService = {
  getAll: async (filters?: EmployeeProfileFilters): Promise<ListResponse<EmployeeWorkExperienceApi>> => {
    const params = buildParams(filters);
    const url = params
      ? `${API_ENDPOINTS.employeeWorkExperiences.list}?${params}`
      : API_ENDPOINTS.employeeWorkExperiences.list;
    const response = await api.get<{ data: EmployeeWorkExperienceApi[] } | ListResponse<EmployeeWorkExperienceApi>>(url);
    return buildListResponse(response.data, filters);
  },
  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.employeeWorkExperiences.delete(id));
  },
};

export const employeeQualificationService = {
  getAll: async (filters?: EmployeeProfileFilters): Promise<ListResponse<EmployeeQualificationApi>> => {
    const params = buildParams(filters);
    const url = params
      ? `${API_ENDPOINTS.employeeQualifications.list}?${params}`
      : API_ENDPOINTS.employeeQualifications.list;
    const response = await api.get<{ data: EmployeeQualificationApi[] } | ListResponse<EmployeeQualificationApi>>(url);
    return buildListResponse(response.data, filters);
  },
  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.employeeQualifications.delete(id));
  },
};

export const employeeEmergencyContactService = {
  getAll: async (filters?: EmployeeProfileFilters): Promise<ListResponse<EmployeeEmergencyContactApi>> => {
    const params = buildParams(filters);
    const url = params
      ? `${API_ENDPOINTS.employeeEmergencyContacts.list}?${params}`
      : API_ENDPOINTS.employeeEmergencyContacts.list;
    const response = await api.get<{ data: EmployeeEmergencyContactApi[] } | ListResponse<EmployeeEmergencyContactApi>>(url);
    return buildListResponse(response.data, filters);
  },
  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.employeeEmergencyContacts.delete(id));
  },
};
