export interface PayrollReport {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_runs: number;
    total_employees: number;
    total_gross_pay: number;
    total_deductions: number;
    total_net_pay: number;
    deduction_breakdown: {
      bir_withholding: number;
      philhealth: number;
      sss: number;
      pagibig: number;
      loans: number;
      leave_deductions: number;
      other_deductions: number;
    };
    gross_pay_breakdown: {
      basic: number;
      bonus: number;
      commission_taxable: number;
      allowance_taxable: number;
      allowance_non_taxable: number;
      overtime: number;
      holiday_pay: number;
      night_differential: number;
      thirteenth_month: number;
      other_earnings: number;
    };
  };
  runs: Array<{
    id: string;
    code: string;
    period: string;
    period_dates: {
      start: string;
      end: string;
    };
    total_employees: number;
    total_gross_pay: number;
    total_deductions: number;
    total_net_pay: number;
    approved_at: string | null;
    deduction_breakdown: {
      bir_withholding: number;
      philhealth: number;
      sss: number;
      pagibig: number;
      loans: number;
      leave_deductions: number;
      other_deductions: number;
    };
    gross_pay_breakdown: {
      basic: number;
      bonus: number;
      commission_taxable: number;
      allowance_taxable: number;
      allowance_non_taxable: number;
      overtime: number;
      holiday_pay: number;
      night_differential: number;
      thirteenth_month: number;
      other_earnings: number;
    };
  }>;
}

export interface AttendanceReport {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_records: number;
    present: number;
    late: number;
    absent: number;
    on_leave: number;
    attendance_rate: number;
    total_hours: number;
    total_overtime_hours: number;
  };
  by_employee: Array<{
    employee_id: string;
    employee_code: string;
    employee_name: string;
    department: string;
    present: number;
    late: number;
    absent: number;
    total_hours: number;
    attendance_rate: number;
  }>;
}

export interface LeaveReport {
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_requests: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
    total_days: number;
  };
  by_leave_type: Array<{
    leave_type_id: string;
    leave_type_name: string;
    total_requests: number;
    approved_days: number;
  }>;
  by_employee: Array<{
    employee_id: string;
    employee_code: string;
    employee_name: string;
    department: string;
    total_requests: number;
    approved_days: number;
  }>;
}

export interface EmployeeReport {
  summary: {
    total_employees: number;
    active: number;
    inactive: number;
    terminated: number;
  };
  by_department: Array<{
    department_id: string;
    department_name: string;
    total_employees: number;
    active: number;
  }>;
  by_position: Array<{
    position_id: string;
    position_name: string;
    total_employees: number;
  }>;
  employees: Array<{
    id: string;
    employee_code: string;
    full_name: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    employment_type: string;
    status: string;
    hire_date: string | null;
    salary: number;
  }>;
}

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  date?: string;
  month?: number;
  year?: number;
  employee_id?: string;
  department_id?: string;
  position_id?: string;
  leave_type_id?: string;
  status?: string;
}
