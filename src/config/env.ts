/**
 * Environment variable validation with Zod
 */

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  VITE_API_URL: z.string().url().optional(),
  VITE_APP_URL: z.string().url().optional(),
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().min(32).optional(),
});

export const env = envSchema.parse({
  NODE_ENV: import.meta.env.MODE || import.meta.env.NODE_ENV,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_APP_URL: import.meta.env.VITE_APP_URL,
  DATABASE_URL: import.meta.env.DATABASE_URL,
  AUTH_SECRET: import.meta.env.AUTH_SECRET,
});

