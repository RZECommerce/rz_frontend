import { deleteCookie } from "@/lib/api/utils";
import { api } from "@/services/api";
import { User } from "@/types/auth";
import { ApiResponse } from "@/types/common";
import { create } from "zustand";
import { useRbacStore } from "./rbac";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  isLoading: false,
  error: null,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  clearError: () => {
    set({ error: null });
  },

  fetchUser: async () => {
    const state = get();
    // Prevent concurrent calls - if already loading, return early
    if (state.loading || state.isLoading) {
      return;
    }
    // If user is already loaded and authenticated, skip fetch
    if (state.isAuthenticated && state.user) {
      return;
    }
    
    set({ loading: true, isLoading: true });
    try {
      const response = await api.get<ApiResponse<User>>("/api/user");
      if (response.data.success && response.data.data) {
        const user = response.data.data;
        set({
          user,
          isAuthenticated: true,
          loading: false,
          isLoading: false,
          error: null,
        });
        // Sync permissions and roles to RBAC store
        // setPermissions handles both JSON structure and array format
        if (user.permissions) {
          useRbacStore.getState().setPermissions(user.permissions);
        }
        if (user.roles) {
          useRbacStore.getState().setRoles(user.roles);
        }
      } else {
        // Session validation failed - clear state and cookies
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          isLoading: false,
        });
        useRbacStore.getState().setPermissions([]);
        useRbacStore.getState().setRoles([]);
        // Remove session cookie if session doesn't exist in database
        deleteCookie("laravel-session", "/");
        deleteCookie("laravel-session", "/", ".chysev.cloud");
        deleteCookie("laravel-session", "/", "localhost");
      }
    } catch (error: any) {
      // Handle 401 (session not found in database) or other errors
      // Just clear state - don't call logout here to avoid loops
      // Logout should only be called explicitly by user action
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        isLoading: false,
      });
      useRbacStore.getState().setPermissions([]);
      useRbacStore.getState().setRoles([]);

      // Clear cookies on 401
      if (error?.response?.status === 401) {
        deleteCookie("auth-session", "/");
        deleteCookie("auth-session", "/", ".chysev.cloud");
        deleteCookie("hris_auth_session", "/");
        deleteCookie("hris_auth_session", "/", ".chysev.cloud");
        deleteCookie("rzauth-session", "/");
        deleteCookie("rzauth-session", "/", ".chysev.cloud");
        deleteCookie("rz-auth-session", "/");
        deleteCookie("rz-auth-session", "/", ".chysev.cloud");
        deleteCookie("XSRF-TOKEN", "/");
        deleteCookie("XSRF-TOKEN", "/", ".chysev.cloud");
      }
    }
  },

  login: async (email: string, password: string, remember: boolean = false) => {
    set({ loading: true, isLoading: true, error: null });
    try {
      // Get auth base URL for production direct requests
      const authBaseURL = import.meta.env.PROD 
        ? (import.meta.env.VITE_AUTH_URL || "https://rz-auth.chysev.cloud")
        : "";
      
      // Fetch CSRF cookie first
      try {
        const csrfUrl = authBaseURL ? `${authBaseURL}/auth/csrf-cookie` : "/auth/csrf-cookie";
        await api.get(csrfUrl);
      } catch {
        // Silently continue - CSRF might not be required
      }

      interface LoginResponse {
        success: boolean;
        data: User;
        message?: string;
      }

      const loginUrl = authBaseURL ? `${authBaseURL}/auth/login` : "/auth/login";
      const response = await api.post<LoginResponse>(loginUrl, {
        email,
        password,
        remember,
      });

      if (response.data.success && response.data.data) {
        const user = response.data.data;
        set({
          user,
          isAuthenticated: true,
          loading: false,
          isLoading: false,
          error: null,
        });
        // Sync permissions and roles to RBAC store
        // setPermissions handles both JSON structure and array format
        if (user.permissions) {
          useRbacStore.getState().setPermissions(user.permissions);
        }
        if (user.roles) {
          useRbacStore.getState().setRoles(user.roles);
        }
      } else {
        const errorMessage = response.data.message || "Login failed";
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          isLoading: false,
          error: errorMessage,
        });
        useRbacStore.getState().setPermissions([]);
        useRbacStore.getState().setRoles([]);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Login failed";
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Get auth base URL for production direct requests
      const authBaseURL = import.meta.env.PROD 
        ? (import.meta.env.VITE_AUTH_URL || "https://rz-auth.chysev.cloud")
        : "";
      
      const logoutUrl = authBaseURL ? `${authBaseURL}/auth/logout` : "/auth/logout";
      const response = await api.post(logoutUrl);

      // If logout is successful, remove the laravel-session cookie
      if (response.data?.success) {
        // Delete session cookies for both localhost and production domain
        deleteCookie("auth-session", "/");
        deleteCookie("auth-session", "/", ".chysev.cloud");
        deleteCookie("hris_auth_session", "/");
        deleteCookie("hris_auth_session", "/", ".chysev.cloud");
        deleteCookie("rzauth-session", "/");
        deleteCookie("rzauth-session", "/", ".chysev.cloud");
        deleteCookie("XSRF-TOKEN", "/");
        deleteCookie("XSRF-TOKEN", "/", ".chysev.cloud");
      }
    } catch {
      // Continue even if logout fails, but still try to remove cookie
      deleteCookie("auth-session", "/");
      deleteCookie("auth-session", "/", ".chysev.cloud");
      deleteCookie("hris_auth_session", "/");
      deleteCookie("hris_auth_session", "/", ".chysev.cloud");
      deleteCookie("rzauth-session", "/");
      deleteCookie("rzauth-session", "/", ".chysev.cloud");
      deleteCookie("XSRF-TOKEN", "/");
      deleteCookie("XSRF-TOKEN", "/", ".chysev.cloud");
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        isLoading: false,
        error: null,
      });
      useRbacStore.getState().setPermissions([]);
      useRbacStore.getState().setRoles([]);
    }
  },
}));

