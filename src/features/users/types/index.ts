/**
 * Users feature types
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
}

