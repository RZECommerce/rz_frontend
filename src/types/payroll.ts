import type { PaginatedResponse } from "./common";
import type { Employee } from "./employee";

export type PayrollPeriodType =
  | "monthly"
  | "semi_monthly"
  | "weekly"
  | "bi_weekly";
export type PayrollRunStatus =
  | "draft"
  | "processing"
  | "completed"
  | "approved"
  | "paid"
  | "cancelled";
export type PayrollEntryStatus = "draft" | "calculated" | "approved" | "paid";

export interface PayrollPeriod {
  id: string;
  period_code: string;
  name: string;
  type: PayrollPeriodType;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  pay_date: string; // YYYY-MM-DD
  is_active: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface PayrollRun {
  id: string;
  payroll_run_code: string;
  payroll_period_id: string;
  payroll_period?: PayrollPeriod;
  status: PayrollRunStatus;
  total_employees: number;
  total_gross_pay: number;
  total_deductions: number;
  total_net_pay: number;
  notes: string | null;
  created_by: string;
  creator?: {
    id: string;
    name: string;
  };
  approved_by: string | null;
  approver?: {
    id: string;
    name: string;
  };
  approved_at: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollEntry {
  id: string;
  company_id?: string;
  payroll_entry_code: string;
  payroll_run_id: string;
  employee_id: string;
  employee?: {
    id: string;
    employee_code: string;
    full_name: string;
    email: string;
    sss_number?: string | null;
    philhealth_number?: string | null;
    pagibig_number?: string | null;
    tax_id_number?: string | null;
    department?: {
      id: string;
      name: string;
    } | null;
    position?: {
      id: string;
      name: string;
    } | null;
  };
  // Earnings
  basic_salary: number;
  overtime_pay: number;
  holiday_pay: number;
  night_differential: number;
  commission_taxable: number;
  allowances: number;
  allowance_taxable: number;
  allowance_non_taxable: number;
  bonus: number;
  thirteenth_month: number;
  other_earnings: number;
  total_earnings: number;
  // Deductions
  sss_contribution: number;
  philhealth_contribution: number;
  pagibig_contribution: number;
  bir_withholding_tax: number;
  leave_deductions: number;
  loans: number;
  other_deductions: number;
  total_deductions: number;
  // Employer Contributions
  sss_employer_contribution?: number;
  philhealth_employer_contribution?: number;
  pagibig_employer_contribution?: number;
  hmo_employee_contribution?: number;
  hmo_employer_contribution?: number;
  insurance_employee_contribution?: number;
  insurance_employer_contribution?: number;
  pension_employee_contribution?: number;
  pension_employer_contribution?: number;
  // Net Pay
  net_pay: number;
  // Work days/hours
  days_worked: number;
  hours_worked: number;
  overtime_hours: number;
  // Status
  status: PayrollEntryStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePayrollPeriodDto {
  name: string;
  type: PayrollPeriodType;
  start_date: string;
  end_date: string;
  pay_date: string;
  is_active?: boolean;
}

export interface UpdatePayrollPeriodDto {
  name?: string;
  type?: PayrollPeriodType;
  start_date?: string;
  end_date?: string;
  pay_date?: string;
  is_active?: boolean;
  is_locked?: boolean;
}

export interface CreatePayrollRunDto {
  payroll_period_id: string;
  notes?: string | null;
}

export interface UpdatePayrollRunDto {
  notes?: string | null;
  status?: PayrollRunStatus;
}

export interface UpdatePayrollEntryDto {
  basic_salary?: number;
  overtime_pay?: number;
  holiday_pay?: number;
  night_differential?: number;
  commission_taxable?: number;
  allowance_taxable?: number;
  allowance_non_taxable?: number;
  bonus?: number;
  thirteenth_month?: number;
  other_earnings?: number;
  sss_contribution?: number;
  philhealth_contribution?: number;
  pagibig_contribution?: number;
  bir_withholding_tax?: number;
  leave_deductions?: number;
  loans?: number;
  other_deductions?: number;
  notes?: string | null;
}

export interface PayrollRunFilters {
  company_id?: string;
  payroll_period_id?: string;
  status?: PayrollRunStatus;
  per_page?: number;
  page?: number;
}

export interface PayrollEntryFilters {
  company_id?: string;
  payroll_run_id?: string;
  employee_id?: string;
  status?: PayrollEntryStatus;
  per_page?: number;
  page?: number;
}

export type PaginatedPayrollRuns = PaginatedResponse<PayrollRun>;
export type PaginatedPayrollEntries = PaginatedResponse<PayrollEntry>;

export type SalaryComponentType =
  | "allowance"
  | "bonus"
  | "commission"
  | "other";
export type SalaryComponentCalculationType =
  | "fixed"
  | "percentage"
  | "per_day"
  | "per_hour";
export type DeductionType = "loan" | "advance" | "insurance" | "penalty" | "other";
export type DeductionCalculationType = "fixed" | "percentage" | "installment";

export interface SalaryComponentTypeData {
  id: string;
  code: string;
  name: string;
  category: string;
  calculation_type: SalaryComponentCalculationType;
  is_taxable: boolean;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSalaryComponentTypeDto {
  code: string;
  name: string;
  category: string;
  calculation_type: SalaryComponentCalculationType;
  is_taxable?: boolean;
  is_active?: boolean;
  description?: string | null;
}

export interface UpdateSalaryComponentTypeDto {
  code?: string;
  name?: string;
  category?: string;
  calculation_type?: SalaryComponentCalculationType;
  is_taxable?: boolean;
  is_active?: boolean;
  description?: string | null;
}

export interface SalaryComponent {
  id: string;
  salary_component_code: string;
  employee_id: string;
  employee?: Employee;
  component_type_id?: string | null;
  componentType?: SalaryComponentTypeData;
  component_type: SalaryComponentType;
  name: string;
  calculation_type: SalaryComponentCalculationType;
  amount: number;
  percentage: number | null;
  is_taxable: boolean;
  is_active: boolean;
  effective_date: string; // YYYY-MM-DD
  end_date: string | null; // YYYY-MM-DD
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSalaryComponentDto {
  employee_id: string;
  component_type_id?: string | null;
  component_type: SalaryComponentType;
  name: string;
  calculation_type: SalaryComponentCalculationType;
  amount: number;
  percentage?: number | null;
  is_taxable?: boolean;
  is_active?: boolean;
  effective_date: string;
  end_date?: string | null;
  description?: string | null;
}

export interface UpdateSalaryComponentDto {
  employee_id?: string;
  component_type?: SalaryComponentType;
  name?: string;
  calculation_type?: SalaryComponentCalculationType;
  amount?: number;
  percentage?: number | null;
  is_taxable?: boolean;
  is_active?: boolean;
  effective_date?: string;
  end_date?: string | null;
  description?: string | null;
}

export interface DeductionTypeData {
  id: string;
  code: string;
  name: string;
  category: string;
  calculation_type: DeductionCalculationType;
  is_recurring: boolean;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDeductionTypeDto {
  code: string;
  name: string;
  category: string;
  calculation_type: DeductionCalculationType;
  is_recurring?: boolean;
  is_active?: boolean;
  description?: string | null;
}

export interface UpdateDeductionTypeDto {
  code?: string;
  name?: string;
  category?: string;
  calculation_type?: DeductionCalculationType;
  is_recurring?: boolean;
  is_active?: boolean;
  description?: string | null;
}

export interface Deduction {
  id: string;
  deduction_code: string;
  employee_id: string;
  employee?: Employee;
  deduction_type_id?: string | null;
  deductionType?: DeductionTypeData;
  deduction_type: DeductionType;
  name: string;
  calculation_type: DeductionCalculationType;
  amount: number;
  percentage: number | null;
  installment_count: number | null;
  installment_paid: number;
  remaining_balance: number;
  is_active: boolean;
  effective_date: string; // YYYY-MM-DD
  end_date: string | null; // YYYY-MM-DD
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDeductionDto {
  employee_id: string;
  deduction_type: DeductionType;
  name: string;
  calculation_type: DeductionCalculationType;
  amount: number;
  percentage?: number | null;
  installment_count?: number | null;
  is_active?: boolean;
  effective_date: string;
  end_date?: string | null;
  description?: string | null;
}

export interface UpdateDeductionDto {
  employee_id?: string;
  deduction_type?: DeductionType;
  name?: string;
  calculation_type?: DeductionCalculationType;
  amount?: number;
  percentage?: number | null;
  installment_count?: number | null;
  is_active?: boolean;
  effective_date?: string;
  end_date?: string | null;
  description?: string | null;
}

export interface SalaryComponentFilters {
  employee_id?: string;
  component_type?: SalaryComponentType;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}

export interface DeductionFilters {
  employee_id?: string;
  deduction_type?: DeductionType;
  is_active?: boolean;
  per_page?: number;
  page?: number;
}

export type PaginatedSalaryComponents = PaginatedResponse<SalaryComponent>;
export type PaginatedDeductions = PaginatedResponse<Deduction>;
