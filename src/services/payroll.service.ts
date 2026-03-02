import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  CreateDeductionDto,
  CreateDeductionTypeDto,
  CreatePayrollPeriodDto,
  CreatePayrollRunDto,
  CreateSalaryComponentDto,
  CreateSalaryComponentTypeDto,
  Deduction,
  DeductionFilters,
  DeductionTypeData,
  PaginatedDeductions,
  PaginatedPayrollEntries,
  PaginatedPayrollRuns,
  PaginatedSalaryComponents,
  PayrollEntry,
  PayrollEntryFilters,
  PayrollPeriod,
  PayrollRun,
  PayrollRunFilters,
  SalaryComponent,
  SalaryComponentFilters,
  SalaryComponentTypeData,
  UpdateDeductionDto,
  UpdateDeductionTypeDto,
  UpdatePayrollEntryDto,
  UpdatePayrollPeriodDto,
  UpdatePayrollRunDto,
  UpdateSalaryComponentDto,
  UpdateSalaryComponentTypeDto,
} from "@/types/payroll";
import type { PaginatedResponse } from "@/types/common";

// Helper to extract data from Laravel API Resource collections
const extractData = <T>(response: T | { data: T }): T => {
  if (response && typeof response === "object" && "data" in response) {
    return response.data as T;
  }
  return response as T;
};

export const payrollPeriodService = {
  getAll: async (activeOnly = false): Promise<PayrollPeriod[]> => {
    const params = new URLSearchParams();
    if (activeOnly) params.append("active_only", "1");

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.payrollPeriods.list}?${queryString}`
      : API_ENDPOINTS.payrollPeriods.list;

    const response = await api.get<PayrollPeriod[] | { data: PayrollPeriod[] }>(
      url
    );
    const responseData = response.data;
    return Array.isArray(responseData) ? responseData : responseData.data || [];
  },

  getById: async (id: string): Promise<PayrollPeriod> => {
    const response = await api.get<PayrollPeriod>(
      API_ENDPOINTS.payrollPeriods.detail(id)
    );
    return response.data;
  },

  create: async (data: CreatePayrollPeriodDto): Promise<PayrollPeriod> => {
    const response = await api.post<PayrollPeriod>(
      API_ENDPOINTS.payrollPeriods.create,
      data
    );
    return response.data;
  },

  update: async (
    id: string,
    data: UpdatePayrollPeriodDto
  ): Promise<PayrollPeriod> => {
    const response = await api.put<PayrollPeriod>(
      API_ENDPOINTS.payrollPeriods.update(id),
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.payrollPeriods.delete(id));
  },
};

export const payrollRunService = {
  getAll: async (
    filters?: PayrollRunFilters
  ): Promise<PaginatedPayrollRuns> => {
    const params = new URLSearchParams();
    if (filters?.payroll_period_id)
      params.append("payroll_period_id", filters.payroll_period_id);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.per_page)
      params.append("per_page", filters.per_page.toString());
    if (filters?.page) params.append("page", filters.page.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.payrollRuns.list}?${queryString}`
      : API_ENDPOINTS.payrollRuns.list;

    const response = await api.get<PaginatedPayrollRuns>(url);
    return response.data;
  },

  getById: async (id: string): Promise<PayrollRun> => {
    const response = await api.get<PayrollRun>(
      API_ENDPOINTS.payrollRuns.detail(id)
    );
    return response.data;
  },

  create: async (data: CreatePayrollRunDto): Promise<PayrollRun> => {
    const response = await api.post<PayrollRun>(
      API_ENDPOINTS.payrollRuns.create,
      data
    );
    return response.data;
  },

  update: async (
    id: string,
    data: UpdatePayrollRunDto
  ): Promise<PayrollRun> => {
    const response = await api.put<PayrollRun>(
      API_ENDPOINTS.payrollRuns.update(id),
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.payrollRuns.delete(id));
  },

  process: async (id: string): Promise<PayrollRun> => {
    const response = await api.post<PayrollRun>(
      API_ENDPOINTS.payrollRuns.process(id)
    );
    return response.data;
  },

  approve: async (id: string): Promise<PayrollRun> => {
    const response = await api.post<PayrollRun>(
      API_ENDPOINTS.payrollRuns.approve(id)
    );
    return response.data;
  },

  reprocess: async (id: string): Promise<PayrollRun> => {
    const response = await api.post<{ success: boolean; message: string; data: PayrollRun }>(
      `${API_ENDPOINTS.payrollRuns.detail(id)}/reprocess`
    );
    return response.data.data;
  },

  export: async (id: string) => {
    const response = await api.get(API_ENDPOINTS.payrollRuns.export(id), {
      responseType: "blob",
    });
    return response.data;
  },

  getEntries: async (
    id: string,
    filters?: PayrollEntryFilters
  ): Promise<PaginatedPayrollEntries> => {
    const params = new URLSearchParams();
    if (filters?.employee_id) params.append("employee_id", filters.employee_id);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.per_page)
      params.append("per_page", filters.per_page.toString());
    if (filters?.page) params.append("page", filters.page.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.payrollRuns.entries(id)}?${queryString}`
      : API_ENDPOINTS.payrollRuns.entries(id);

    const response = await api.get<PaginatedPayrollEntries>(url);
    return response.data;
  },
};

export const payrollEntryService = {
  getAll: async (
    filters?: PayrollEntryFilters
  ): Promise<PaginatedPayrollEntries> => {
    const params = new URLSearchParams();
    if (filters?.payroll_run_id)
      params.append("payroll_run_id", filters.payroll_run_id);
    if (filters?.employee_id) params.append("employee_id", filters.employee_id);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.per_page)
      params.append("per_page", filters.per_page.toString());
    if (filters?.page) params.append("page", filters.page.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.payrollEntries.list}?${queryString}`
      : API_ENDPOINTS.payrollEntries.list;

    const response = await api.get<PaginatedPayrollEntries>(url);
    return response.data;
  },

  getById: async (id: string): Promise<PayrollEntry> => {
    const response = await api.get<PayrollEntry>(
      API_ENDPOINTS.payrollEntries.detail(id)
    );
    return response.data;
  },

  update: async (
    id: string,
    data: UpdatePayrollEntryDto
  ): Promise<PayrollEntry> => {
    const response = await api.put<PayrollEntry>(
      API_ENDPOINTS.payrollEntries.update(id),
      data
    );
    return response.data;
  },

  downloadPayslip: async (id: string) => {
    const response = await api.get(API_ENDPOINTS.payrollEntries.pdf(id), {
      responseType: "blob",
    });
    return response.data;
  },
};

export const salaryComponentTypeService = {
  getAll: async (): Promise<SalaryComponentTypeData[]> => {
    const response = await api.get<{ data: SalaryComponentTypeData[] } | SalaryComponentTypeData[]>(
      '/api/salary-component-types'
    );
    return extractData(response.data);
  },

  getById: async (id: string): Promise<SalaryComponentTypeData> => {
    const response = await api.get<{ data: SalaryComponentTypeData }>(
      `/api/salary-component-types/${id}`
    );
    return extractData(response.data);
  },

  create: async (data: CreateSalaryComponentTypeDto): Promise<SalaryComponentTypeData> => {
    const response = await api.post<{ data: SalaryComponentTypeData }>(
      '/api/salary-component-types',
      data
    );
    return extractData(response.data);
  },

  update: async (
    id: string,
    data: UpdateSalaryComponentTypeDto
  ): Promise<SalaryComponentTypeData> => {
    const response = await api.put<{ data: SalaryComponentTypeData }>(
      `/api/salary-component-types/${id}`,
      data
    );
    return extractData(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/salary-component-types/${id}`);
  },
};

export const deductionTypeService = {
  getAll: async (): Promise<DeductionTypeData[]> => {
    const response = await api.get<{ data: DeductionTypeData[] } | DeductionTypeData[]>(
      '/api/deduction-types'
    );
    return extractData(response.data);
  },

  getById: async (id: string): Promise<DeductionTypeData> => {
    const response = await api.get<{ data: DeductionTypeData }>(
      `/api/deduction-types/${id}`
    );
    return extractData(response.data);
  },

  create: async (data: CreateDeductionTypeDto): Promise<DeductionTypeData> => {
    const response = await api.post<{ data: DeductionTypeData }>(
      '/api/deduction-types',
      data
    );
    return extractData(response.data);
  },

  update: async (
    id: string,
    data: UpdateDeductionTypeDto
  ): Promise<DeductionTypeData> => {
    const response = await api.put<{ data: DeductionTypeData }>(
      `/api/deduction-types/${id}`,
      data
    );
    return extractData(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/deduction-types/${id}`);
  },
};

export const salaryComponentService = {
  getAll: async (
    filters?: SalaryComponentFilters
  ): Promise<PaginatedSalaryComponents> => {
    const params = new URLSearchParams();
    if (filters?.employee_id) params.append("employee_id", filters.employee_id);
    if (filters?.component_type)
      params.append("component_type", filters.component_type);
    if (filters?.is_active !== undefined)
      params.append("is_active", filters.is_active ? "1" : "0");
    if (filters?.per_page)
      params.append("per_page", filters.per_page.toString());
    if (filters?.page) params.append("page", filters.page.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.salaryComponents.list}?${queryString}`
      : API_ENDPOINTS.salaryComponents.list;

    const response = await api.get<PaginatedSalaryComponents>(url);
    return response.data;
  },

  getById: async (id: string): Promise<SalaryComponent> => {
    const response = await api.get<SalaryComponent>(
      API_ENDPOINTS.salaryComponents.detail(id)
    );
    return response.data;
  },

  create: async (data: CreateSalaryComponentDto): Promise<SalaryComponent> => {
    const response = await api.post<SalaryComponent>(
      API_ENDPOINTS.salaryComponents.create,
      data
    );
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateSalaryComponentDto
  ): Promise<SalaryComponent> => {
    const response = await api.put<SalaryComponent>(
      API_ENDPOINTS.salaryComponents.update(id),
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.salaryComponents.delete(id));
  },

  getByEmployee: async (
    employeeId: string,
    filters?: SalaryComponentFilters
  ): Promise<PaginatedSalaryComponents> => {
    const params = new URLSearchParams();
    if (filters?.component_type)
      params.append("component_type", filters.component_type);
    if (filters?.is_active !== undefined)
      params.append("is_active", filters.is_active ? "1" : "0");
    if (filters?.per_page)
      params.append("per_page", filters.per_page.toString());
    if (filters?.page) params.append("page", filters.page.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.salaryComponents.byEmployee(employeeId)}?${queryString}`
      : API_ENDPOINTS.salaryComponents.byEmployee(employeeId);

    const response = await api.get<PaginatedSalaryComponents>(url);
    return response.data;
  },
};

export const deductionService = {
  getAll: async (filters?: DeductionFilters): Promise<PaginatedDeductions> => {
    const params = new URLSearchParams();
    if (filters?.employee_id) params.append("employee_id", filters.employee_id);
    if (filters?.deduction_type)
      params.append("deduction_type", filters.deduction_type);
    if (filters?.is_active !== undefined)
      params.append("is_active", filters.is_active ? "1" : "0");
    if (filters?.per_page)
      params.append("per_page", filters.per_page.toString());
    if (filters?.page) params.append("page", filters.page.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.deductions.list}?${queryString}`
      : API_ENDPOINTS.deductions.list;

    const response = await api.get<PaginatedDeductions>(url);
    return response.data;
  },

  getById: async (id: string): Promise<Deduction> => {
    const response = await api.get<Deduction>(
      API_ENDPOINTS.deductions.detail(id)
    );
    return response.data;
  },

  create: async (data: CreateDeductionDto): Promise<Deduction> => {
    const response = await api.post<Deduction>(
      API_ENDPOINTS.deductions.create,
      data
    );
    return response.data;
  },

  update: async (id: string, data: UpdateDeductionDto): Promise<Deduction> => {
    const response = await api.put<Deduction>(
      API_ENDPOINTS.deductions.update(id),
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<void>(API_ENDPOINTS.deductions.delete(id));
  },

  getByEmployee: async (
    employeeId: string,
    filters?: DeductionFilters
  ): Promise<PaginatedDeductions> => {
    const params = new URLSearchParams();
    if (filters?.deduction_type)
      params.append("deduction_type", filters.deduction_type);
    if (filters?.is_active !== undefined)
      params.append("is_active", filters.is_active ? "1" : "0");
    if (filters?.per_page)
      params.append("per_page", filters.per_page.toString());
    if (filters?.page) params.append("page", filters.page.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.deductions.byEmployee(employeeId)}?${queryString}`
      : API_ENDPOINTS.deductions.byEmployee(employeeId);

    const response = await api.get<PaginatedDeductions>(url);
    return response.data;
  },
};

export interface PayrollStatisticsMonthlyData {
  expense: {
    chart_data: Array<{ month: string; year: string; value: number }>;
    total: number;
    change_percent: number;
  };
  deductions: {
    chart_data: Array<{ month: string; year: string; taxes: number; deductions: number }>;
    total: number;
    change_percent: number;
  };
  summary: {
    total_gross: number;
    total_deductions: number;
    total_net: number;
    total_employees: number;
    total_runs: number;
  };
}

export interface PayrollStatisticsSummaryData {
  total_expense: number;
  total_deductions: number;
  total_gross: number;
  total_employees: number;
  total_runs: number;
  expense_change_percent: number;
  deductions_change_percent: number;
  period_days: number;
}

export const payrollStatisticsService = {
  getMonthly: async (months = 6): Promise<PayrollStatisticsMonthlyData> => {
    const response = await api.get<{ success: boolean; data: PayrollStatisticsMonthlyData }>(
      `${API_ENDPOINTS.payrollStatistics.monthly}?months=${months}`
    );
    return response.data.data;
  },

  getSummary: async (days = 30): Promise<PayrollStatisticsSummaryData> => {
    const response = await api.get<{ success: boolean; data: PayrollStatisticsSummaryData }>(
      `${API_ENDPOINTS.payrollStatistics.summary}?days=${days}`
    );
    return response.data.data;
  },
};
