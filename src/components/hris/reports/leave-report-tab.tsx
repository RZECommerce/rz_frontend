
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

export function LeaveReportTab() {
  const canExport = useHasPermission("reports.export");
  const [filters, setFilters] = useState<ReportFilters>({
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
    end_date: new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0],
  });

  const { data: report, isLoading } = useQuery({
    queryKey: ["leaveReport", filters],
    queryFn: () => reportService.getLeaveReport(filters),
  });

  const handleExport = () => {
    toast.info("Export functionality coming soon!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select date range for the leave report</CardDescription>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Requests</CardDescription>
                <CardTitle className="text-2xl">{report.summary.total_requests}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Approved</CardDescription>
                <CardTitle className="text-2xl">{report.summary.approved}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Pending</CardDescription>
                <CardTitle className="text-2xl">{report.summary.pending}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Rejected</CardDescription>
                <CardTitle className="text-2xl">{report.summary.rejected}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Days</CardDescription>
                <CardTitle className="text-2xl">{report.summary.total_days}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>By Leave Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Requests</TableHead>
                      <TableHead>Approved Days</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.by_leave_type.map((type) => (
                      <TableRow key={type.leave_type_id}>
                        <TableCell>{type.leave_type_name}</TableCell>
                        <TableCell>{type.total_requests}</TableCell>
                        <TableCell>{type.approved_days}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By Employee</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Requests</TableHead>
                        <TableHead>Approved Days</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.by_employee.slice(0, 10).map((emp) => (
                        <TableRow key={emp.employee_id}>
                          <TableCell>{emp.employee_name}</TableCell>
                          <TableCell>{emp.total_requests}</TableCell>
                          <TableCell>{emp.approved_days}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
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

