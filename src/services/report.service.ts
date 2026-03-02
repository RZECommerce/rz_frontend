import { api } from "./api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  PayrollReport,
  AttendanceReport,
  LeaveReport,
  EmployeeReport,
  ReportFilters,
} from "@/types/report";

export const reportService = {
  getPayrollReport: async (filters?: ReportFilters): Promise<PayrollReport> => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);
    if (filters?.employee_id) params.append("employee_id", filters.employee_id);
    if (filters?.department_id) params.append("department_id", filters.department_id);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.reports.payroll}?${queryString}`
      : API_ENDPOINTS.reports.payroll;

    const response = await api.get<PayrollReport>(url);
    return response.data;
  },

  getAttendanceReport: async (filters?: ReportFilters): Promise<AttendanceReport> => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);
    if (filters?.employee_id) params.append("employee_id", filters.employee_id);
    if (filters?.department_id) params.append("department_id", filters.department_id);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.reports.attendance}?${queryString}`
      : API_ENDPOINTS.reports.attendance;

    const response = await api.get<AttendanceReport>(url);
    return response.data;
  },

  getLeaveReport: async (filters?: ReportFilters): Promise<LeaveReport> => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);
    if (filters?.employee_id) params.append("employee_id", filters.employee_id);
    if (filters?.leave_type_id) params.append("leave_type_id", filters.leave_type_id);
    if (filters?.status) params.append("status", filters.status);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.reports.leave}?${queryString}`
      : API_ENDPOINTS.reports.leave;

    const response = await api.get<LeaveReport>(url);
    return response.data;
  },

  getEmployeeReport: async (filters?: ReportFilters): Promise<EmployeeReport> => {
    const params = new URLSearchParams();
    if (filters?.department_id) params.append("department_id", filters.department_id);
    if (filters?.position_id) params.append("position_id", filters.position_id);
    if (filters?.status) params.append("status", filters.status);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.reports.employee}?${queryString}`
      : API_ENDPOINTS.reports.employee;

    const response = await api.get<EmployeeReport>(url);
    return response.data;
  },

  getDailyAttendancesReport: async (filters?: ReportFilters): Promise<any> => {
    const params = new URLSearchParams();
    if (filters?.date) params.append("date", filters.date);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.reports.dailyAttendances || "/api/reports/daily-attendances"}?${queryString}`
      : API_ENDPOINTS.reports.dailyAttendances || "/api/reports/daily-attendances";

    const response = await api.get<any>(url);
    return response.data;
  },

  getDateWiseAttendancesReport: async (filters?: ReportFilters): Promise<any> => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.reports.dateWiseAttendances || "/api/reports/date-wise-attendances"}?${queryString}`
      : API_ENDPOINTS.reports.dateWiseAttendances || "/api/reports/date-wise-attendances";

    const response = await api.get<any>(url);
    return response.data;
  },

  getMonthlyAttendancesReport: async (filters?: ReportFilters): Promise<any> => {
    const params = new URLSearchParams();
    if (filters?.month) params.append("month", String(filters.month));
    if (filters?.year) params.append("year", String(filters.year));

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.reports.monthlyAttendances || "/api/reports/monthly-attendances"}?${queryString}`
      : API_ENDPOINTS.reports.monthlyAttendances || "/api/reports/monthly-attendances";

    const response = await api.get<any>(url);
    return response.data;
  },

  getTrainingReport: async (filters?: ReportFilters): Promise<any> => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.reports.training || "/api/reports/training"}?${queryString}`
      : API_ENDPOINTS.reports.training || "/api/reports/training";

    const response = await api.get<any>(url);
    return response.data;
  },

  getProjectReport: async (filters?: ReportFilters): Promise<any> => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.reports.project || "/api/reports/project"}?${queryString}`
      : API_ENDPOINTS.reports.project || "/api/reports/project";

    const response = await api.get<any>(url);
    return response.data;
  },

  getTaskReport: async (filters?: ReportFilters): Promise<any> => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.reports.task || "/api/reports/task"}?${queryString}`
      : API_ENDPOINTS.reports.task || "/api/reports/task";

    const response = await api.get<any>(url);
    return response.data;
  },

  getAccountReport: async (filters?: ReportFilters): Promise<any> => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.reports.account || "/api/reports/account"}?${queryString}`
      : API_ENDPOINTS.reports.account || "/api/reports/account";

    const response = await api.get<any>(url);
    return response.data;
  },

  getExpenseReport: async (filters?: ReportFilters): Promise<any> => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.reports.expense || "/api/reports/expense"}?${queryString}`
      : API_ENDPOINTS.reports.expense || "/api/reports/expense";

    const response = await api.get<any>(url);
    return response.data;
  },

  getDepositReport: async (filters?: ReportFilters): Promise<any> => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.reports.deposit || "/api/reports/deposit"}?${queryString}`
      : API_ENDPOINTS.reports.deposit || "/api/reports/deposit";

    const response = await api.get<any>(url);
    return response.data;
  },

  getTransactionReport: async (filters?: ReportFilters): Promise<any> => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.reports.transaction || "/api/reports/transaction"}?${queryString}`
      : API_ENDPOINTS.reports.transaction || "/api/reports/transaction";

    const response = await api.get<any>(url);
    return response.data;
  },

  getPensionReport: async (filters?: ReportFilters): Promise<any> => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append("start_date", filters.start_date);
    if (filters?.end_date) params.append("end_date", filters.end_date);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.reports.pension || "/api/reports/pension"}?${queryString}`
      : API_ENDPOINTS.reports.pension || "/api/reports/pension";

    const response = await api.get<any>(url);
    return response.data;
  },
};

