export type SettingCategory = "company" | "payroll" | "leave" | "system" | "attendance";

export type SettingType = "string" | "number" | "boolean" | "json";

export interface Setting {
  id: string;
  key: string;
  value: string | number | boolean | null;
  type: SettingType;
  description?: string;
  order?: number;
}

export interface SettingsGroup {
  [group: string]: Setting[];
}

export interface SettingsByCategory {
  [category: string]: SettingsGroup;
}

export interface UpdateSettingsDto {
  settings: Array<{
    id?: string;
    key: string;
    value: string | number | boolean | null;
    type?: SettingType;
  }>;
}

export interface BirTaxBracket {
  bracket: string;
  compensation_from: number;
  compensation_to: number;
  base_tax: number;
  excess_over: number;
  tax_rate: number;
  description: string;
}

export interface BirTaxTable {
  tax_table: BirTaxBracket[];
  legend: string;
}

export interface HolidayRate {
  key: string;
  rate: number;
  description: string;
}

export interface ComputationLegend {
  key: string;
  description: string;
  explanation: string;
}

