import { api } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  Attendance,
  AttendanceFilters,
  AttendanceListResponse,
} from "@/types/attendance";
import type {
  TimesheetFilters,
  WeeklyTimesheet,
} from "@/types/timesheet";

export const timesheetService = {
  /**
   * Get weekly timesheet data grouped by employee and week
   */
  getWeekly: async (
    weekStart: string,
    weekEnd: string,
    filters?: TimesheetFilters
  ): Promise<WeeklyTimesheet[]> => {
    const params = new URLSearchParams();
    params.append("date_from", weekStart);
    params.append("date_to", weekEnd);
    
    if (filters?.employee_id) {
      params.append("employee_id", filters.employee_id);
    }
    if (filters?.per_page) {
      params.append("per_page", filters.per_page.toString());
    } else {
      params.append("per_page", "1000"); // Get all records for the week
    }

    const url = `${API_ENDPOINTS.timesheets.list}?${params.toString()}`;
    const response = await api.get<{ data: Attendance[] } | AttendanceListResponse>(url);
    const responseData = response.data;
    
    // Handle Laravel pagination response
    let attendances: Attendance[] = [];
    if (Array.isArray(responseData)) {
      attendances = responseData;
    } else if ('data' in responseData && Array.isArray(responseData.data)) {
      attendances = responseData.data;
    } else if ('data' in responseData && Array.isArray((responseData as AttendanceListResponse).data)) {
      attendances = (responseData as AttendanceListResponse).data;
    }

    // Group attendances by employee and create weekly timesheet structure
    const employeeMap = new Map<string, WeeklyTimesheet>();

    attendances.forEach((attendance: Attendance) => {
      const employeeId = attendance.employee_id;
      
      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          employee_id: employeeId,
          employee: attendance.employee,
          week_start: weekStart,
          week_end: weekEnd,
          days: [],
          total_hours: 0,
          overtime_hours: 0,
          regular_hours: 0,
        });
      }

      const timesheet = employeeMap.get(employeeId)!;
      const date = new Date(attendance.date);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      
      timesheet.days.push({
        date: attendance.date,
        day_name: dayName,
        attendance,
        hours: attendance.total_hours,
        overtime_hours: attendance.overtime_hours,
        status: attendance.status,
      });

      timesheet.total_hours += attendance.total_hours;
      timesheet.overtime_hours += attendance.overtime_hours;
      timesheet.regular_hours += attendance.total_hours - attendance.overtime_hours;
    });

    // Fill in missing days for each employee
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekEnd);
    
    employeeMap.forEach((timesheet) => {
      const existingDates = new Set(timesheet.days.map(d => d.date));
      
      for (let d = new Date(weekStartDate); d <= weekEndDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        if (!existingDates.has(dateStr)) {
          const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
          timesheet.days.push({
            date: dateStr,
            day_name: dayName,
            hours: 0,
            overtime_hours: 0,
            status: "absent",
          });
        }
      }

      // Sort days by date
      timesheet.days.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });

    return Array.from(employeeMap.values());
  },

  /**
   * Get timesheet data for a specific employee
   */
  getByEmployee: async (
    employeeId: string,
    weekStart: string,
    weekEnd: string
  ): Promise<WeeklyTimesheet | null> => {
    const timesheets = await timesheetService.getWeekly(weekStart, weekEnd, {
      employee_id: employeeId,
    });

    return timesheets.find(t => t.employee_id === employeeId) || null;
  },
};

