/**
 * Authentication-related types
 */

/**
 * Permission structure: module-based JSON format
 * Supports both flat and nested structures:
 * - Flat: { "employees": ["employees.view", "employees.create"] }
 * - Nested: { "hris": { "employees": ["employees.view"] } }
 */
export type Permissions = Record<string, string[] | Record<string, string[]>>;

export interface User {
  id: number | string;
  user_code?: string;
  name: string;
  email: string;
  email_verified_at?: string;
  avatar?: string;
  roles?: string[]; // Array of role names
  permissions?: Permissions | string[]; // JSON structure: { module: [permissions] } OR legacy array format
  role?: {
    id: string;
    name: string;
    slug: string;
    permissions?: Array<{
      id: string;
      slug: string;
      name: string;
    }>;
  };
  role_id?: string;
  last_login_at?: string | null;
  is_active?: boolean;
  failed_login_attempts?: number;
  locked_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

