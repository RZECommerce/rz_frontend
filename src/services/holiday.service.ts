/**
 * Holiday service
 */

import { api } from "./api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  Holiday,
  CreateHolidayDto,
  UpdateHolidayDto,
  HolidayListParams,
} from "@/types/holiday";

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const holidayService = {
  getAll: async (params?: HolidayListParams): Promise<PaginatedResponse<Holiday>> => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append("type", params.type);
    if (params?.is_active !== undefined)
      searchParams.append("is_active", params.is_active.toString());
    if (params?.year) searchParams.append("year", params.year.toString());
    if (params?.start_date) searchParams.append("start_date", params.start_date);
    if (params?.end_date) searchParams.append("end_date", params.end_date);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.per_page)
      searchParams.append("per_page", params.per_page.toString());

    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.holidays.list}?${query}`
      : API_ENDPOINTS.holidays.list;

    const response = await api.get<PaginatedResponse<Holiday>>(url);
    return response.data;
  },

  getById: async (id: string): Promise<Holiday> => {
    const response = await api.get<Holiday>(API_ENDPOINTS.holidays.detail(id));
    return response.data;
  },

  create: async (data: CreateHolidayDto): Promise<Holiday> => {
    const response = await api.post<Holiday>(API_ENDPOINTS.holidays.create, data);
    return response.data;
  },

  update: async (id: string, data: UpdateHolidayDto): Promise<Holiday> => {
    const response = await api.patch<Holiday>(API_ENDPOINTS.holidays.update(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.holidays.delete(id));
  },

  import: async (year?: number): Promise<{
    message: string;
    imported: number;
    skipped: number;
    total: number;
  }> => {
    const searchParams = new URLSearchParams();
    if (year) searchParams.append("year", year.toString());
    
    const query = searchParams.toString();
    const url = query
      ? `${API_ENDPOINTS.holidays.import}?${query}`
      : API_ENDPOINTS.holidays.import;
    
    const response = await api.post<{
      message: string;
      imported: number;
      skipped: number;
      total: number;
    }>(url);
    return response.data;
  },
};

