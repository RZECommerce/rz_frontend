import type { Attendance, AttendanceFilters } from "@/types/attendance";
import type {
  OvertimeLog,
  OvertimeLogFilters,
  OvertimeLogListResponse,
} from "@/types/overtime";
import type {
  OvertimeRequest,
  OvertimeRequestFilters,
} from "@/types/overtime-request";
import { attendanceService } from "./attendance.service";
import { overtimeRequestService } from "./overtime-request.service";

export const overtimeService = {
  /**
   * Get all overtime logs combining attendance records and approved overtime requests
   */
  getAll: async (
    filters?: OvertimeLogFilters,
  ): Promise<OvertimeLogListResponse> => {
    // Get overtime from attendance records
    const attendanceFilters: AttendanceFilters = {
      date_from: filters?.date_from,
      date_to: filters?.date_to,
      employee_id: filters?.employee_id,
      search: filters?.search,
      per_page: 999, // Get all to combine with requests
      page: 1,
    };

    const attendanceResponse =
      await attendanceService.getAll(attendanceFilters);

    // Filter only attendances with overtime hours > 0
    const overtimeAttendances = (attendanceResponse.data || []).filter(
      (attendance: Attendance) => attendance.overtime_hours > 0,
    );

    // Transform attendance records to overtime logs
    const attendanceOvertimeLogs: OvertimeLog[] = overtimeAttendances.map(
      (attendance: Attendance) => ({
        id: `att_${attendance.id}`,
        attendance_id: attendance.id,
        attendance,
        employee_id: attendance.employee_id,
        employee: attendance.employee,
        date: attendance.date,
        time_in: attendance.time_in,
        time_out: attendance.time_out,
        total_hours: attendance.total_hours,
        regular_hours: attendance.total_hours - attendance.overtime_hours,
        overtime_hours: attendance.overtime_hours,
        status: "approved" as const, // Attendance overtime is already acknowledged
        approved_by: null,
        approved_at: attendance.created_at,
        rejection_reason: null,
        notes: "From attendance record",
        created_at: attendance.created_at,
        updated_at: attendance.updated_at,
      }),
    );

    // Get approved overtime requests
    const requestFilters: OvertimeRequestFilters = {
      employee_id: filters?.employee_id,
      date_from: filters?.date_from,
      date_to: filters?.date_to,
      search: filters?.search,
      status: filters?.status, // Use the filter status instead of hardcoded "approved"
      per_page: filters?.per_page || 999, // Use filter per_page or default to 999
      page: filters?.page || 1, // Use filter page or default to 1
    };

    let requestOvertimeLogs: OvertimeLog[] = [];
    try {
      const requestsResponse =
        await overtimeRequestService.getAll(requestFilters);
      requestOvertimeLogs = (requestsResponse.data || []).map(
        (request: OvertimeRequest) => ({
          id: `req_${request.id}`,
          attendance_id: null,
          attendance: undefined,
          employee_id: request.employee_id,
          employee: request.employee,
          date: request.date,
          time_in: request.start_time,
          time_out: request.end_time,
          total_hours: request.hours,
          regular_hours: 0, // Overtime requests are pure OT
          overtime_hours: request.hours,
          status:
            request.status === "approved"
              ? ("approved" as const)
              : ("pending" as const),
          approved_by: request.approved_by,
          approved_at: request.approved_at,
          rejection_reason: null,
          notes: `Overtime request: ${request.overtime_request_code}`,
          created_at: request.created_at,
          updated_at: request.updated_at,
          originalRequest: request, // Preserve the original request data
        }),
      );
    } catch (error) {
      console.warn("Failed to fetch overtime requests:", error);
    }

    // Combine both sources
    const allOvertimeLogs = [...attendanceOvertimeLogs, ...requestOvertimeLogs];

    // Apply status filter if provided (though we're only getting approved)
    let filteredLogs = allOvertimeLogs;
    if (filters?.status && filters.status !== "approved") {
      filteredLogs = allOvertimeLogs.filter(
        (log) => log.status === filters.status,
      );
    }

    // Sort by date descending
    filteredLogs.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Apply pagination
    const perPage = filters?.per_page || 50;
    const page = filters?.page || 1;
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    return {
      data: paginatedLogs,
      current_page: page,
      per_page: perPage,
      total: filteredLogs.length,
      last_page: Math.ceil(filteredLogs.length / perPage),
    };
  },

  /**
   * Get overtime log by ID
   */
  getById: async (id: string): Promise<OvertimeLog | null> => {
    try {
      const attendance = await attendanceService.getById(id);
      if (attendance.overtime_hours <= 0) {
        return null;
      }

      return {
        id: attendance.id,
        attendance_id: attendance.id,
        attendance,
        employee_id: attendance.employee_id,
        employee: attendance.employee,
        date: attendance.date,
        time_in: attendance.time_in,
        time_out: attendance.time_out,
        total_hours: attendance.total_hours,
        regular_hours: attendance.total_hours - attendance.overtime_hours,
        overtime_hours: attendance.overtime_hours,
        status: "pending" as const,
        created_at: attendance.created_at,
        updated_at: attendance.updated_at,
      };
    } catch {
      return null;
    }
  },

  /**
   * Get overtime logs for a specific employee
   */
  getByEmployee: async (
    employeeId: string,
    filters?: OvertimeLogFilters,
  ): Promise<OvertimeLogListResponse> => {
    return overtimeService.getAll({
      ...filters,
      employee_id: employeeId,
    });
  },
};
