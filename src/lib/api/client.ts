import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth-store";
import { getCookie, isAuthEndpoint } from "./utils";

// Environment configuration
// Set to 'local' for local development or 'staging' for staging environment
// You can set VITE_ENVIRONMENT=staging in your .env file or vite.config.ts
const ENVIRONMENT: "local" | "staging" =
  (import.meta.env.VITE_ENVIRONMENT as "local" | "staging") || "local";

// Centralized API URL configuration
// VITE_API_URL should include /api (e.g., http://backend:8000/api or https://api.example.com/api)
// In development, use empty string to leverage Vite proxy for proper cookie handling
const API_CONFIG = {
  local: {
    // In development, always use empty string to leverage Vite proxy
    // Vite proxy will forward /api requests to backend
    // This ensures cookies are properly forwarded between frontend and backend
    baseURL: "",
    authURL: "", // Use proxy in dev
  },
  staging: {
    // Staging/production API URL (can be overridden by VITE_API_URL)
    baseURL: "https://rzerp-api.chysev.cloud",
    authURL: "https://rz-auth.chysev.cloud",
  },
} as const;

/**
 * Get the base URL for API requests
 * - In development: uses empty string to leverage Vite proxy
 * - In production: uses VITE_API_URL if provided, otherwise falls back to API_CONFIG
 * - VITE_API_URL should include /api (e.g., http://backend:8000/api)
 */
function getApiBaseURL(): string {
  if (import.meta.env.DEV) {
    // Development: use Vite proxy
    return API_CONFIG[ENVIRONMENT]?.baseURL || "";
  }
  
  // Production: use centralized VITE_API_URL
  // If VITE_API_URL includes /api, we need to strip it since axios will add the path
  const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_HOST || API_CONFIG[ENVIRONMENT]?.baseURL || "";
  
  // If the URL ends with /api, remove it since we'll add paths like /api/users
  return apiUrl.replace(/\/api\/?$/, "");
}

/**
 * Get the base URL for Auth service requests
 * - In development: uses empty string to leverage Vite proxy
 * - In production: uses VITE_AUTH_URL to make direct requests to auth service
 */
function getAuthBaseURL(): string {
  if (import.meta.env.DEV) {
    // Development: use Vite proxy
    return "";
  }
  
  // Production: use VITE_AUTH_URL for direct auth service requests
  return import.meta.env.VITE_AUTH_URL || API_CONFIG[ENVIRONMENT]?.authURL || "";
}

/**
 * Get the API base URL (without /api) for constructing storage URLs, etc.
 * This is exported for use in components that need to construct full URLs.
 * In development, returns empty string (relative URLs work with proxy).
 * In production, returns the base URL without /api.
 */
export function getApiBaseUrlForUrls(): string {
  if (import.meta.env.DEV) {
    // Development: use empty string for relative URLs (proxy handles it)
    return "";
  }
  
  // Production: use centralized VITE_API_URL and strip /api
  const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_HOST || API_CONFIG[ENVIRONMENT]?.baseURL || "";
  return apiUrl.replace(/\/api\/?$/, "");
}

/**
 * Fetch CSRF cookie from auth service
 * In production, makes direct request to auth service
 * In development, uses proxy
 */
export async function fetchCsrfCookie(): Promise<void> {
  try {
    const authBaseURL = getAuthBaseURL();
    const url = authBaseURL ? `${authBaseURL}/auth/csrf-cookie` : "/auth/csrf-cookie";
    await api.get(url);
  } catch {
    // Silently fail - CSRF might not be required for all endpoints
  }
}

/**
 * Axios instance with credentials and CSRF handling
 * Uses centralized API URL configuration
 * In development, uses empty baseURL to leverage Vite proxy for proper cookie handling
 * The proxy ensures cookies are forwarded correctly between frontend and backend
 */
export const api = axios.create({
  baseURL: getApiBaseURL(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Track refresh promise to prevent concurrent refresh requests
let refreshPromise: Promise<void> | null = null;
// Track failed refresh attempts to prevent infinite loops
let refreshFailed = false;
// Track if we're already redirecting to prevent redirect loops
let isRedirecting = false;

/**
 * Attempt to refresh the session
 * Uses a shared promise to prevent concurrent refresh requests
 * Only refreshes if session exists in database (backend validates this)
 */
async function attemptRefresh(): Promise<void> {
  // If refresh already failed, don't try again
  if (refreshFailed) {
    throw new Error("Refresh already failed - session invalid");
  }

  // If a refresh is already in progress, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  // Create a new refresh promise
  refreshPromise = (async () => {
    try {
      const authBaseURL = getAuthBaseURL();
      const refreshUrl = authBaseURL ? `${authBaseURL}/auth/refresh` : "/auth/refresh";
      const response = await api.post(refreshUrl);
      // If refresh succeeds, check if it actually validated the session
      if (response.data?.success) {
        // Reset failed flag on success
        refreshFailed = false;
        return;
      }
      // If refresh returns non-success, session doesn't exist - logout
      refreshFailed = true;
      useAuthStore.getState().logout();
      throw new Error("Refresh failed - session not found in database");
    } catch (error) {
      // Only logout if it's a 401 (unauthorized) - means session doesn't exist in database
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        // Session doesn't exist in database - force logout to clear cookies
        refreshFailed = true;
        useAuthStore.getState().logout();
      }
      throw error;
    } finally {
      // Clear the promise after completion
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Request interceptor: attach CSRF token and company header
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Skip XSRF token for auth endpoints (they are CSRF-exempt on the server)
  if (!isAuthEndpoint(config.url)) {
    const token = getCookie("XSRF-TOKEN");
    if (token && !config.headers["X-XSRF-TOKEN"]) {
      config.headers["X-XSRF-TOKEN"] = token;
    }
  }

  return config;
});

// Response interceptor: handle errors and retries
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Initialize retry count
    if (originalRequest._retryCount === undefined) {
      originalRequest._retryCount = 0;
    }

    // CSRF token mismatch (419)
    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;
      await fetchCsrfCookie();
      return api(originalRequest);
    }

    // Unauthorized (401) – try refresh once only if session might exist
    // Skip if this is an auth endpoint (including refresh) or already retried
    // Backend /user endpoint validates session exists in database before returning 401
    if (
      error.response?.status === 401 &&
      originalRequest._retryCount < 1 && // Only retry once
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      try {
        // Attempt to refresh - backend will check if session exists in database
        // If session doesn't exist, refresh will return 401 and logout will be called
        await attemptRefresh();
        // If refresh succeeded, session exists in database - retry original request
        try {
          const retryResponse = await api(originalRequest);
          return retryResponse;
        } catch (retryError) {
          // If retry still fails with 401, mark refresh as failed to prevent further attempts
          const retryAxiosError = retryError as AxiosError;
          if (retryAxiosError.response?.status === 401) {
            refreshFailed = true;
            useAuthStore.getState().logout();
            // Redirect to login page on 401, but only if not already on login page
            if (
              typeof window !== "undefined" &&
              !isAuthEndpoint(originalRequest.url) &&
              !isRedirecting &&
              !window.location.pathname.includes("/login")
            ) {
              isRedirecting = true;
              window.location.href = "/login";
            }
          }
          return Promise.reject(retryError);
        }
      } catch (refreshError) {
        // Refresh failed - session doesn't exist in database
        // Logout already handled in attemptRefresh (clears cookies and state)
        refreshFailed = true;
        // Redirect to login page on 401, but only if not already on login page
        if (
          typeof window !== "undefined" &&
          !isAuthEndpoint(originalRequest.url) &&
          !isRedirecting &&
          !window.location.pathname.includes("/login")
        ) {
          isRedirecting = true;
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    }

    // If 401 and not retrying (already retried or auth endpoint), redirect to login
    // But only if we're not already on the login page to prevent loops
    if (
      error.response?.status === 401 &&
      !isAuthEndpoint(originalRequest.url) &&
      typeof window !== "undefined" &&
      !isRedirecting &&
      !window.location.pathname.includes("/login")
    ) {
      // Clear auth state
      useAuthStore.getState().logout();
      // Redirect to login page
      isRedirecting = true;
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Export ApiError for compatibility
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}
