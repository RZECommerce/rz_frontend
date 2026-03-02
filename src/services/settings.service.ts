import { api } from "./api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { 
  SettingsByCategory, 
  UpdateSettingsDto, 
  BirTaxTable,
  BirTaxBracket,
  HolidayRate, 
  ComputationLegend 
} from "@/types/settings";

export const settingsService = {
  getAll: async (category?: string): Promise<{ data: SettingsByCategory }> => {
    const url = category
      ? `${API_ENDPOINTS.settings.list}?category=${category}`
      : API_ENDPOINTS.settings.list;
    const response = await api.get<{ data: SettingsByCategory }>(url);
    return response.data;
  },

  update: async (data: UpdateSettingsDto): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>(API_ENDPOINTS.settings.update, data);
    return response.data;
  },

  uploadLogo: async (file: File): Promise<{ message: string; url: string }> => {
    const formData = new FormData();
    formData.append("logo", file);
    const response = await api.post<{ message: string; url: string }>(
      API_ENDPOINTS.settings.uploadLogo,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  getBirTaxTable: async (): Promise<BirTaxTable> => {
    const response = await api.get<{ success: boolean; data: BirTaxTable }>(
      API_ENDPOINTS.settings.birTaxTable
    );
    return response.data.data;
  },

  createBirTaxBracket: async (data: Omit<BirTaxBracket, 'id'>): Promise<BirTaxBracket> => {
    const response = await api.post<{ success: boolean; data: BirTaxBracket }>(
      `${API_ENDPOINTS.settings.birTaxTable}/brackets`,
      data
    );
    return response.data.data;
  },

  updateBirTaxBracket: async (bracket: string, data: Partial<BirTaxBracket>): Promise<BirTaxBracket> => {
    const response = await api.put<{ success: boolean; data: BirTaxBracket }>(
      `${API_ENDPOINTS.settings.birTaxTable}/brackets/${bracket}`,
      data
    );
    return response.data.data;
  },

  deleteBirTaxBracket: async (bracket: string): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.settings.birTaxTable}/brackets/${bracket}`);
  },

  getHolidayRates: async (): Promise<HolidayRate[]> => {
    const response = await api.get<{ success: boolean; data: HolidayRate[] }>(
      API_ENDPOINTS.settings.holidayRates
    );
    return response.data.data;
  },

  getComputationLegends: async (): Promise<ComputationLegend[]> => {
    const response = await api.get<{ success: boolean; data: ComputationLegend[] }>(
      API_ENDPOINTS.settings.computationLegends
    );
    return response.data.data;
  },
};

