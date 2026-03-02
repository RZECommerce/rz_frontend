export interface Company {
  id: string;
  company_code: string;
  name: string;
  legal_name?: string | null;
  registration_number?: string | null;
  tax_id_number?: string | null;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  timezone: string;
  currency: string;
  date_format: string;
  time_format: string;
  logo_path?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

