
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useHasPermission } from "@/hooks/use-permissions";
import { formatCurrency } from "@/lib/utils";
import { reportService } from "@/services/report.service";
import type { ReportFilters } from "@/types/report";
import { FileUpload as FileExportIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function EmployeeReportTab() {
  const canExport = useHasPermission("reports.export");
  const [filters, setFilters] = useState<ReportFilters>({});

  const { data: report, isLoading } = useQuery({
    queryKey: ["employeeReport", filters],
    queryFn: () => reportService.getEmployeeReport(filters),
  });

  const handleExport = () => {
    toast.info("Export functionality coming soon!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter employees by department, position, or status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">
                Filters can be added here (department, position, status dropdowns)
              </p>
            </div>
            {canExport && (
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <FileExportIcon className="size-5" />
                Export Report
              </Button>
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
                <CardDescription>Total Employees</CardDescription>
                <CardTitle className="text-2xl">{report.summary.total_employees}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Active</CardDescription>
                <CardTitle className="text-2xl">{report.summary.active}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Inactive</CardDescription>
                <CardTitle className="text-2xl">{report.summary.inactive}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Terminated</CardDescription>
                <CardTitle className="text-2xl">{report.summary.terminated}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>By Department</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.by_department.map((dept) => (
                      <TableRow key={dept.department_id}>
                        <TableCell>{dept.department_name}</TableCell>
                        <TableCell>{dept.total_employees}</TableCell>
                        <TableCell>{dept.active}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By Position</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Total Employees</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.by_position.map((pos) => (
                      <TableRow key={pos.position_id}>
                        <TableCell>{pos.position_name}</TableCell>
                        <TableCell>{pos.total_employees}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>Complete list of employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Salary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.employees.slice(0, 50).map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">{emp.employee_code}</TableCell>
                        <TableCell>{emp.full_name}</TableCell>
                        <TableCell>{emp.email}</TableCell>
                        <TableCell>{emp.department}</TableCell>
                        <TableCell>{emp.position}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            emp.status === "active" ? "bg-green-100 text-green-800" :
                            emp.status === "inactive" ? "bg-gray-100 text-gray-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {emp.status}
                          </span>
                        </TableCell>
                        <TableCell>{formatCurrency(emp.salary, "PHP")}</TableCell>
                      </TableRow>
                    ))}
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

