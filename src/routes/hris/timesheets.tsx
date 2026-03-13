import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TimesheetHeader } from "@/components/hris/timesheets/timesheet-header";
import { TimesheetStats } from "@/components/hris/timesheets/timesheet-stats";
import { TimesheetTable } from "@/components/hris/timesheets/timesheet-table";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { cn } from "@/lib/utils";
import { requireAuth } from "@/lib/auth/route-guards";
import { timesheetService } from "@/services/timesheet.service";

export const Route = createFileRoute("/hris/timesheets")({
  beforeLoad: requireAuth(),
  component: TimesheetsPage,
});

function TimesheetsPage() {
  // Get current week (Monday to Sunday)
  const getWeekStart = (date: Date = new Date()): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split("T")[0];
  };

  const getWeekEnd = (date: Date = new Date()): string => {
    const weekStart = getWeekStart(date);
    const sunday = new Date(weekStart);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return sunday.toISOString().split("T")[0];
  };

  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>();

  const weekStart = getWeekStart(currentWeek);
  const weekEnd = getWeekEnd(currentWeek);

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const handleExport = async () => {
    try {
      // Create CSV export
      const timesheets = await timesheetService.getWeekly(weekStart, weekEnd, {
        employee_id: selectedEmployeeId,
      });

      const headers = [
        "Employee",
        "Employee Code",
        "Department",
        "Position",
        ...Array.from({ length: 7 }, (_, i) => {
          const date = new Date(weekStart);
          date.setDate(date.getDate() + i);
          return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        }),
        "Total Hours",
        "Overtime Hours",
      ];

      const escapeCSV = (value: string | number | null | undefined): string => {
        if (value === null || value === undefined) return "";
        const str = String(value);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows: string[][] = timesheets.map((timesheet) => {
        const row = [
          escapeCSV(timesheet.employee?.full_name),
          escapeCSV(timesheet.employee?.employee_code),
          escapeCSV(timesheet.employee?.department?.name),
          escapeCSV(timesheet.employee?.position?.name),
        ];

        timesheet.days.forEach((day) => {
          row.push(escapeCSV(day.hours > 0 ? `${day.hours.toFixed(1)}h` : "-"));
        });

        row.push(escapeCSV(timesheet.total_hours.toFixed(1)));
        row.push(escapeCSV(timesheet.overtime_hours.toFixed(1)));

        return row;
      });

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
        `timesheets-${weekStart}-to-${weekEnd}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting timesheets:", error);
      alert("Failed to export timesheets");
    }
  };

  return (
    <DashboardLayout>
      <TimesheetHeader
        weekStart={weekStart}
        weekEnd={weekEnd}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onExport={handleExport}
      />
      <main
        className={cn(
          "w-full flex-1 overflow-auto font-sans",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
        style={{ scrollbarGutter: "stable" }}
      >
        <TimesheetStats
          weekStart={weekStart}
          weekEnd={weekEnd}
          employeeId={selectedEmployeeId}
        />
        <TimesheetTable
          weekStart={weekStart}
          weekEnd={weekEnd}
          employeeId={selectedEmployeeId}
          onEmployeeChange={setSelectedEmployeeId}
        />
      </main>
    </DashboardLayout>
  );
}
