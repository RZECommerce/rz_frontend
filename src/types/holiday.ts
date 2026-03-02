export type HolidayType = "regular" | "special_non_working";

export interface Holiday {
  id: string;
  holiday_code: string;
  name: string;
  date: string;
  type: HolidayType;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateHolidayDto {
  name: string;
  date: string;
  type: HolidayType;
  description?: string | null;
  is_active?: boolean;
}

export interface UpdateHolidayDto extends Partial<CreateHolidayDto> {}

export interface HolidayListParams {
  type?: HolidayType;
  is_active?: boolean;
  year?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
  per_page?: number;
}

