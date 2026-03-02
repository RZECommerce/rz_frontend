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

export function MonthlyAttendancesTab() {
  const canExport = useHasPermission("reports.export");
  const [filters, setFilters] = useState<ReportFilters>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const { data: report, isLoading } = useQuery({
    queryKey: ["monthlyAttendancesReport", filters],
    queryFn: () => reportService.getMonthlyAttendancesReport(filters),
    enabled: !!filters.month && !!filters.year,
  });

  const handleExport = () => {
    toast.info("Export functionality coming soon!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select month and year for monthly attendance report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="number"
                min="1"
                max="12"
                value={filters.month || ""}
                onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min="2020"
                max="2100"
                value={filters.year || ""}
                onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
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
                <CardDescription>Total Working Days</CardDescription>
                <CardTitle className="text-2xl">{report.summary?.total_working_days || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Average Present</CardDescription>
                <CardTitle className="text-2xl">{report.summary?.avg_present || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Average Absent</CardDescription>
                <CardTitle className="text-2xl">{report.summary?.avg_absent || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Monthly Attendance Rate</CardDescription>
                <CardTitle className="text-2xl">{report.summary?.attendance_rate || 0}%</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance by Employee</CardTitle>
              <CardDescription>Attendance summary for {filters.month}/{filters.year}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Present Days</TableHead>
                      <TableHead>Absent Days</TableHead>
                      <TableHead>Late Days</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Attendance Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.by_employee && report.by_employee.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No attendance data found for this month
                        </TableCell>
                      </TableRow>
                    ) : (
                      report.by_employee?.map((emp: any, index: number) => (
                        <TableRow key={emp.employee_id || index}>
                          <TableCell className="font-medium">{emp.employee_code}</TableCell>
                          <TableCell>{emp.employee_name}</TableCell>
                          <TableCell>{emp.department}</TableCell>
                          <TableCell>{emp.present_days || 0}</TableCell>
                          <TableCell>{emp.absent_days || 0}</TableCell>
                          <TableCell>{emp.late_days || 0}</TableCell>
                          <TableCell>{emp.total_hours ? emp.total_hours.toFixed(2) : "0"}</TableCell>
                          <TableCell>{emp.attendance_rate ? `${emp.attendance_rate.toFixed(2)}%` : "0%"}</TableCell>
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
            No data available. Please select month and year.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
