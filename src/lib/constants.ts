/**
 * Application constants
 */

export const APP_NAME = "Human Resource";
export const APP_DESCRIPTION = "Human Resource - Comprehensive Human Resources Information System";

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const CACHE_KEYS = {
  USERS: "users",
  USER_DETAIL: (id: string) => `user-${id}`,
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  SETTINGS: "/settings",
} as const;

