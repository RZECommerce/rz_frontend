/**
 * Authentication service
 * Uses session-based authentication with HRIS Auth service
 */

import { api } from "./api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { User, LoginCredentials, RegisterData, AuthResponse } from "@/types/auth";

interface ApiAuthResponse {
  success: boolean;
  data: User;
  message?: string;
}

export const authService = {
  /**
   * Get CSRF token (no auth required, works with CORS)
   */
  getCsrfToken: async (): Promise<void> => {
    await api.get(API_ENDPOINTS.auth.csrfToken);
  },

  /**
   * Login user (proxy API route)
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<ApiAuthResponse>(
      API_ENDPOINTS.auth.login,
      credentials
    );
    
    // Transform API response to match expected AuthResponse format
    return {
      user: response.data.data,
      token: "", // Session-based auth doesn't use tokens
      expires_at: "",
    };
  },

  /**
   * Register new user (proxy API route)
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<ApiAuthResponse>(
      API_ENDPOINTS.auth.register,
      data
    );
    
    // Transform API response to match expected AuthResponse format
    return {
      user: response.data.data,
      token: "", // Session-based auth doesn't use tokens
      expires_at: "",
    };
  },

  /**
   * Logout user (proxy API route - doesn't require auth)
   */
  logout: async (): Promise<void> => {
    try {
      await api.post<void>(
        API_ENDPOINTS.auth.logout,
        undefined
      );
    } finally {
      // Clear any local storage
      if (typeof window !== "undefined") {
        localStorage.clear();
      }
    }
  },

  /**
   * Refresh session (proxy API route - works with session cookie)
   */
  refresh: async (): Promise<void> => {
    await api.post<void>(
      API_ENDPOINTS.auth.refresh,
      undefined
    );
  },

  /**
   * Get current authenticated user (proxy API route)
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<{ success: boolean; data: User }>(
      API_ENDPOINTS.auth.me
    );
    
    return response.data.data;
  },

  /**
   * Verify email (proxy API route)
   */
  verifyEmail: async (id: string): Promise<void> => {
    await api.get(API_ENDPOINTS.auth.verifyEmail(id));
  },

  /**
   * Resend verification email (requires authentication)
   */
  resendVerificationEmail: async (): Promise<void> => {
    await api.post(API_ENDPOINTS.auth.resendVerificationEmail);
  },

  /**
   * Forgot password (proxy API route - no auth required)
   */
  forgotPassword: async (email: string): Promise<void> => {
    await api.post(API_ENDPOINTS.auth.forgotPassword, { email });
  },

  /**
   * Reset password (proxy API route - no auth required)
   */
  resetPassword: async (email: string, token: string, password: string, password_confirmation: string): Promise<void> => {
    await api.post(API_ENDPOINTS.auth.resetPassword, {
      email,
      token,
      password,
      password_confirmation,
    });
  },

  /**
   * Change password (requires authentication)
   */
  changePassword: async (current_password: string, password: string, password_confirmation: string): Promise<void> => {
    await api.post(API_ENDPOINTS.auth.changePassword, {
      current_password,
      password,
      password_confirmation,
    });
  },
};

