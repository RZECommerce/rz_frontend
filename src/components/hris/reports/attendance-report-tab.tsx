
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useHasPermission } from "@/hooks/use-permissions";
import { reportService } from "@/services/report.service";
import type { ReportFilters } from "@/types/report";
import { FileUpload as FileExportIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function AttendanceReportTab() {
  const canExport = useHasPermission("reports.export");
  const [filters, setFilters] = useState<ReportFilters>({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0],
  });

  const { data: report, isLoading } = useQuery({
    queryKey: ["attendanceReport", filters],
    queryFn: () => reportService.getAttendanceReport(filters),
  });

  const handleExport = () => {
    toast.info("Export functionality coming soon!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select date range for the attendance report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date || ""}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date || ""}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              />
            </div>
            {canExport && (
              <div className="flex items-end">
                <Button onClick={handleExport} variant="outline" className="w-full gap-2">
                  <FileExportIcon className="size-5" />
                  Export Report
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-32 bg-muted animate-pulse rounded-xl" />
          <div className="h-96 bg-muted animate-pulse rounded-xl" />
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Records</CardDescription>
                <CardTitle className="text-2xl">{report.summary.total_records}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Present</CardDescription>
                <CardTitle className="text-2xl">{report.summary.present}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Late</CardDescription>
                <CardTitle className="text-2xl">{report.summary.late}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Attendance Rate</CardDescription>
                <CardTitle className="text-2xl">{report.summary.attendance_rate}%</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>By Employee</CardTitle>
              <CardDescription>Attendance breakdown by employee</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Late</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.by_employee.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No attendance data found
                        </TableCell>
                      </TableRow>
                    ) : (
                      report.by_employee.map((emp) => (
                        <TableRow key={emp.employee_id}>
                          <TableCell className="font-medium">{emp.employee_code}</TableCell>
                          <TableCell>{emp.employee_name}</TableCell>
                          <TableCell>{emp.department}</TableCell>
                          <TableCell>{emp.present}</TableCell>
                          <TableCell>{emp.late}</TableCell>
                          <TableCell>{emp.absent}</TableCell>
                          <TableCell>{emp.total_hours.toFixed(2)}</TableCell>
                          <TableCell>{emp.attendance_rate.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No data available
          </CardContent>
        </Card>
      )}
    </div>
  );
}

