import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  Promotion,
  CreatePromotionDto,
  UpdatePromotionDto,
  Award,
  CreateAwardDto,
  UpdateAwardDto,
  Travel,
  CreateTravelDto,
  UpdateTravelDto,
  Transfer,
  CreateTransferDto,
  UpdateTransferDto,
  Resignation,
  CreateResignationDto,
  UpdateResignationDto,
  Complaint,
  CreateComplaintDto,
  UpdateComplaintDto,
  Warning,
  CreateWarningDto,
  UpdateWarningDto,
  Termination,
  CreateTerminationDto,
  UpdateTerminationDto,
  CoreHrFilters,
  CoreHrListResponse,
} from "@/types/core-hr";

const buildListResponse = <T>(
  responseData: { data: T[] } | CoreHrListResponse<T>,
  filters?: CoreHrFilters
): CoreHrListResponse<T> => {
  if ("data" in responseData && Array.isArray(responseData.data) && "current_page" in responseData) {
    return responseData as CoreHrListResponse<T>;
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
    per_page: 15,
    total: 0,
    last_page: 1,
  };
};

const buildParams = (filters?: CoreHrFilters): string => {
  const params = new URLSearchParams();
  if (filters?.employee_id) params.append("employee_id", filters.employee_id);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.per_page) params.append("per_page", filters.per_page.toString());
  if (filters?.page) params.append("page", filters.page.toString());
  return params.toString();
};

export const promotionService = {
  getAll: async (filters?: CoreHrFilters): Promise<CoreHrListResponse<Promotion>> => {
    const params = buildParams(filters);
    const url = params ? `${API_ENDPOINTS.promotions.list}?${params}` : API_ENDPOINTS.promotions.list;
    const response = await api.get<{ data: Promotion[] } | CoreHrListResponse<Promotion>>(url);
    return buildListResponse(response.data, filters);
  },
  getById: async (id: string): Promise<Promotion> => {
    const response = await api.get<Promotion>(API_ENDPOINTS.promotions.detail(id));
    return response.data;
  },
  create: async (data: CreatePromotionDto): Promise<Promotion> => {
    const response = await api.post<Promotion>(API_ENDPOINTS.promotions.create, data);
    return response.data;
  },
  update: async (id: string, data: UpdatePromotionDto): Promise<Promotion> => {
    const response = await api.put<Promotion>(API_ENDPOINTS.promotions.update(id), data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.promotions.delete(id));
  },
};

export const awardService = {
  getAll: async (filters?: CoreHrFilters): Promise<CoreHrListResponse<Award>> => {
    const params = buildParams(filters);
    const url = params ? `${API_ENDPOINTS.awards.list}?${params}` : API_ENDPOINTS.awards.list;
    const response = await api.get<{ data: Award[] } | CoreHrListResponse<Award>>(url);
    return buildListResponse(response.data, filters);
  },
  getById: async (id: string): Promise<Award> => {
    const response = await api.get<Award>(API_ENDPOINTS.awards.detail(id));
    return response.data;
  },
  create: async (data: CreateAwardDto): Promise<Award> => {
    const response = await api.post<Award>(API_ENDPOINTS.awards.create, data);
    return response.data;
  },
  update: async (id: string, data: UpdateAwardDto): Promise<Award> => {
    const response = await api.put<Award>(API_ENDPOINTS.awards.update(id), data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.awards.delete(id));
  },
};

export const travelService = {
  getAll: async (filters?: CoreHrFilters): Promise<CoreHrListResponse<Travel>> => {
    const params = buildParams(filters);
    const url = params ? `${API_ENDPOINTS.travels.list}?${params}` : API_ENDPOINTS.travels.list;
    const response = await api.get<{ data: Travel[] } | CoreHrListResponse<Travel>>(url);
    return buildListResponse(response.data, filters);
  },
  getById: async (id: string): Promise<Travel> => {
    const response = await api.get<Travel>(API_ENDPOINTS.travels.detail(id));
    return response.data;
  },
  create: async (data: CreateTravelDto): Promise<Travel> => {
    const response = await api.post<Travel>(API_ENDPOINTS.travels.create, data);
    return response.data;
  },
  update: async (id: string, data: UpdateTravelDto): Promise<Travel> => {
    const response = await api.put<Travel>(API_ENDPOINTS.travels.update(id), data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.travels.delete(id));
  },
};

export const transferService = {
  getAll: async (filters?: CoreHrFilters): Promise<CoreHrListResponse<Transfer>> => {
    const params = buildParams(filters);
    const url = params ? `${API_ENDPOINTS.transfers.list}?${params}` : API_ENDPOINTS.transfers.list;
    const response = await api.get<{ data: Transfer[] } | CoreHrListResponse<Transfer>>(url);
    return buildListResponse(response.data, filters);
  },
  getById: async (id: string): Promise<Transfer> => {
    const response = await api.get<Transfer>(API_ENDPOINTS.transfers.detail(id));
    return response.data;
  },
  create: async (data: CreateTransferDto): Promise<Transfer> => {
    const response = await api.post<Transfer>(API_ENDPOINTS.transfers.create, data);
    return response.data;
  },
  update: async (id: string, data: UpdateTransferDto): Promise<Transfer> => {
    const response = await api.put<Transfer>(API_ENDPOINTS.transfers.update(id), data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.transfers.delete(id));
  },
};

export const resignationService = {
  getAll: async (filters?: CoreHrFilters): Promise<CoreHrListResponse<Resignation>> => {
    const params = buildParams(filters);
    const url = params ? `${API_ENDPOINTS.resignations.list}?${params}` : API_ENDPOINTS.resignations.list;
    const response = await api.get<{ data: Resignation[] } | CoreHrListResponse<Resignation>>(url);
    return buildListResponse(response.data, filters);
  },
  getById: async (id: string): Promise<Resignation> => {
    const response = await api.get<Resignation>(API_ENDPOINTS.resignations.detail(id));
    return response.data;
  },
  create: async (data: CreateResignationDto): Promise<Resignation> => {
    const response = await api.post<Resignation>(API_ENDPOINTS.resignations.create, data);
    return response.data;
  },
  update: async (id: string, data: UpdateResignationDto): Promise<Resignation> => {
    const response = await api.put<Resignation>(API_ENDPOINTS.resignations.update(id), data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.resignations.delete(id));
  },
};

export const complaintService = {
  getAll: async (filters?: CoreHrFilters): Promise<CoreHrListResponse<Complaint>> => {
    const params = buildParams(filters);
    const url = params ? `${API_ENDPOINTS.complaints.list}?${params}` : API_ENDPOINTS.complaints.list;
    const response = await api.get<{ data: Complaint[] } | CoreHrListResponse<Complaint>>(url);
    return buildListResponse(response.data, filters);
  },
  getById: async (id: string): Promise<Complaint> => {
    const response = await api.get<Complaint>(API_ENDPOINTS.complaints.detail(id));
    return response.data;
  },
  create: async (data: CreateComplaintDto): Promise<Complaint> => {
    const response = await api.post<Complaint>(API_ENDPOINTS.complaints.create, data);
    return response.data;
  },
  update: async (id: string, data: UpdateComplaintDto): Promise<Complaint> => {
    const response = await api.put<Complaint>(API_ENDPOINTS.complaints.update(id), data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.complaints.delete(id));
  },
};

export const warningService = {
  getAll: async (filters?: CoreHrFilters): Promise<CoreHrListResponse<Warning>> => {
    const params = buildParams(filters);
    const url = params ? `${API_ENDPOINTS.warnings.list}?${params}` : API_ENDPOINTS.warnings.list;
    const response = await api.get<{ data: Warning[] } | CoreHrListResponse<Warning>>(url);
    return buildListResponse(response.data, filters);
  },
  getById: async (id: string): Promise<Warning> => {
    const response = await api.get<Warning>(API_ENDPOINTS.warnings.detail(id));
    return response.data;
  },
  create: async (data: CreateWarningDto): Promise<Warning> => {
    const response = await api.post<Warning>(API_ENDPOINTS.warnings.create, data);
    return response.data;
  },
  update: async (id: string, data: UpdateWarningDto): Promise<Warning> => {
    const response = await api.put<Warning>(API_ENDPOINTS.warnings.update(id), data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.warnings.delete(id));
  },
};

export const terminationService = {
  getAll: async (filters?: CoreHrFilters): Promise<CoreHrListResponse<Termination>> => {
    const params = buildParams(filters);
    const url = params ? `${API_ENDPOINTS.terminations.list}?${params}` : API_ENDPOINTS.terminations.list;
    const response = await api.get<{ data: Termination[] } | CoreHrListResponse<Termination>>(url);
    return buildListResponse(response.data, filters);
  },
  getById: async (id: string): Promise<Termination> => {
    const response = await api.get<Termination>(API_ENDPOINTS.terminations.detail(id));
    return response.data;
  },
  create: async (data: CreateTerminationDto): Promise<Termination> => {
    const response = await api.post<Termination>(API_ENDPOINTS.terminations.create, data);
    return response.data;
  },
  update: async (id: string, data: UpdateTerminationDto): Promise<Termination> => {
    const response = await api.put<Termination>(API_ENDPOINTS.terminations.update(id), data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.terminations.delete(id));
  },
};

export interface Commission {
  id: string;
  employee_id: string;
  company_id?: string;
  title: string;
  amount: number;
  commission_date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCommissionDto {
  employee_id: string;
  company_id?: string;
  title: string;
  amount: number;
  commission_date: string;
  description?: string;
}

export interface UpdateCommissionDto {
  company_id?: string;
  title?: string;
  amount?: number;
  commission_date?: string;
  description?: string;
}

export const commissionService = {
  getAll: async (filters?: CoreHrFilters): Promise<CoreHrListResponse<Commission>> => {
    const params = buildParams(filters);
    const url = params ? `${API_ENDPOINTS.commissions.list}?${params}` : API_ENDPOINTS.commissions.list;
    const response = await api.get<{ data: Commission[] } | CoreHrListResponse<Commission>>(url);
    return buildListResponse(response.data, filters);
  },
  getById: async (id: string): Promise<Commission> => {
    const response = await api.get<Commission>(API_ENDPOINTS.commissions.detail(id));
    return response.data;
  },
  create: async (data: CreateCommissionDto): Promise<Commission> => {
    const response = await api.post<Commission>(API_ENDPOINTS.commissions.create, data);
    return response.data;
  },
  update: async (id: string, data: UpdateCommissionDto): Promise<Commission> => {
    const response = await api.put<Commission>(API_ENDPOINTS.commissions.update(id), data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.commissions.delete(id));
  },
};
