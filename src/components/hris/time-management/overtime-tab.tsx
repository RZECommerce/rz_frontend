import { useState } from "react";
import type { OvertimeLogFilters } from "@/types/overtime";
import { OvertimeStats } from "@/components/hris/overtime/overtime-stats";
import { OvertimeTable } from "@/components/hris/overtime/overtime-table";
import { overtimeService } from "@/services/overtime.service";

export function OvertimeTab() {
  const [filters, setFilters] = useState<OvertimeLogFilters>({
    per_page: 50,
    page: 1,
  });

  const handleExport = async () => {
    try {
      const overtimeData = await overtimeService.getAll({
        ...filters,
        per_page: 9999,
        page: 1,
      });

      const logs = overtimeData.data || [];

      const headers = [
        "Employee",
        "Employee Code",
        "Department",
        "Position",
        "Date",
        "Time In",
        "Time Out",
        "Total Hours",
        "Regular Hours",
        "Overtime Hours",
        "Status",
      ];

      const escapeCSV = (value: string | number | null | undefined): string => {
        if (value === null || value === undefined) return "";
        const str = String(value);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const formatTime = (dateString: string | null): string => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString("en-US");
      };

      const rows: string[][] = logs.map((log) => [
        escapeCSV(log.employee?.full_name),
        escapeCSV(log.employee?.employee_code),
        escapeCSV(log.employee?.department?.name),
        escapeCSV(log.employee?.position?.name),
        escapeCSV(formatDate(log.date)),
        escapeCSV(formatTime(log.time_in)),
        escapeCSV(formatTime(log.time_out)),
        escapeCSV(log.total_hours.toFixed(1)),
        escapeCSV(log.regular_hours.toFixed(1)),
        escapeCSV(log.overtime_hours.toFixed(1)),
        escapeCSV(log.status),
      ]);

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `overtime-logs-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting overtime logs:", error);
      alert("Failed to export overtime logs");
    }
  };

  return (
    <div className="space-y-6">
      <OvertimeStats filters={filters} />
      <OvertimeTable filters={filters} onFiltersChange={setFilters} />
    </div>
  );
}
