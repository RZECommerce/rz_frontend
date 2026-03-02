import { api } from "./api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { User } from "@/types/auth";

export interface UpdateProfileDto {
  name: string;
  email: string;
}

export interface ChangePasswordDto {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export const profileService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>(API_ENDPOINTS.profile.get);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileDto): Promise<User> => {
    const response = await api.put<User>(API_ENDPOINTS.profile.update, data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordDto): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(API_ENDPOINTS.profile.changePassword, data);
    return response.data;
  },
};

