import { api } from "./api";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export interface DashboardStats {
  employees: {
    total: number;
    active: number;
    inactive: number;
    on_leave: number;
  };
  attendance: {
    rate: number;
    present: number;
    late: number;
    absent: number;
    total: number;
  };
  leaves: {
    pending: number;
    upcoming: number;
  };
  payroll: {
    total_expense: number;
    this_month: number;
    upcoming_runs: Array<{
      id: string;
      period_name: string;
      status: string;
      total_net_pay: number;
      created_at: string;
    }>;
    latest_run: {
      id: string;
      period_name: string;
      total_net_pay: number;
      pay_date: string;
    } | null;
  };
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>(API_ENDPOINTS.dashboard.stats);
    return response.data;
  },
};

