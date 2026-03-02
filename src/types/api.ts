/**
 * API-related types
 */

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface RequestConfig {
  params?: Record<string, string>;
  headers?: Record<string, string>;
}

