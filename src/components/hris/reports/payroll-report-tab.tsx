import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useHasPermission } from "@/hooks/use-permissions";
import { formatCurrency } from "@/lib/utils";
import { reportService } from "@/services/report.service";
import type { ReportFilters } from "@/types/report";
import { FileUpload as FileExportIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function PayrollReportTab() {
  const canExport = useHasPermission("reports.export");

  const [filters, setFilters] = useState<ReportFilters>({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
  });

  const { data: report, isLoading } = useQuery({
    queryKey: ["payrollReport", filters],
    queryFn: () => reportService.getPayrollReport(filters),
  });

  const handleExport = () => {
    toast.info("Export functionality coming soon!");
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Select date range and filters for the payroll report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date || ""}
                onChange={(e) =>
                  setFilters({ ...filters, start_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date || ""}
                onChange={(e) =>
                  setFilters({ ...filters, end_date: e.target.value })
                }
              />
            </div>
            {canExport && (
              <div className="flex items-end">
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <FileExportIcon sx={{ fontSize: 16 }} />
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Runs</CardDescription>
                <CardTitle className="text-2xl">
                  {report.summary.total_runs}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Employees</CardDescription>
                <CardTitle className="text-2xl">
                  {report.summary.total_employees}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Gross Pay</CardDescription>
                <CardTitle className="text-2xl">
                  {formatCurrency(report.summary.total_gross_pay, "PHP")}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Deductions</CardDescription>
                <CardTitle className="text-2xl">
                  {formatCurrency(report.summary.total_deductions, "PHP")}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Net Pay</CardDescription>
                <CardTitle className="text-2xl">
                  {formatCurrency(report.summary.total_net_pay, "PHP")}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Gross Pay Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Gross Pay Breakdown</CardTitle>
              <CardDescription>Total Gross Pay Components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Basic Salary</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      report.summary.gross_pay_breakdown.basic,
                      "PHP",
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Bonus</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      report.summary.gross_pay_breakdown.bonus,
                      "PHP",
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Commission (Taxable)</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      report.summary.gross_pay_breakdown.commission_taxable || 0,
                      "PHP",
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Allowance (Taxable)</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      report.summary.gross_pay_breakdown.allowance_taxable || 0,
                      "PHP",
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Allowance (Non-Taxable)</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      report.summary.gross_pay_breakdown.allowance_non_taxable || 0,
                      "PHP",
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Overtime</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      report.summary.gross_pay_breakdown.overtime,
                      "PHP",
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Holiday Pay</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      report.summary.gross_pay_breakdown.holiday_pay,
                      "PHP",
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Night Differential
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      report.summary.gross_pay_breakdown.night_differential,
                      "PHP",
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">13th Month</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      report.summary.gross_pay_breakdown.thirteenth_month,
                      "PHP",
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Other Earnings
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      report.summary.gross_pay_breakdown.other_earnings,
                      "PHP",
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deductions Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Deductions Breakdown</CardTitle>
              <CardDescription>Total Deductions Components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    BIR Withholding Tax
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      report.summary.deduction_breakdown.bir_withholding,
                      "PHP",
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">PhilHealth</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      report.summary.deduction_breakdown.philhealth,
                      "PHP",
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">SSS</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      report.summary.deduction_breakdown.sss,
                      "PHP",
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Pag-IBIG</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      report.summary.deduction_breakdown.pagibig,
                      "PHP",
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Loans</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      report.summary.deduction_breakdown.loans,
                      "PHP",
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Leave Deductions
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      report.summary.deduction_breakdown.leave_deductions,
                      "PHP",
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Other Deductions
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      report.summary.deduction_breakdown.other_deductions,
                      "PHP",
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Period */}
          <Card>
            <CardHeader>
              <CardTitle>Report Period</CardTitle>
              <CardDescription>
                {new Date(report.period.start_date).toLocaleDateString()} -{" "}
                {new Date(report.period.end_date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Payroll Runs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payroll Runs</CardTitle>
              <CardDescription>
                List of all payroll runs in the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Run Code</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Gross Pay</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Approved At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.runs.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground"
                        >
                          No payroll runs found for the selected period
                        </TableCell>
                      </TableRow>
                    ) : (
                      report.runs.map((run) => (
                        <TableRow key={run.id}>
                          <TableCell className="font-medium">
                            {run.code}
                          </TableCell>
                          <TableCell>{run.period}</TableCell>
                          <TableCell>{run.total_employees}</TableCell>
                          <TableCell>
                            {formatCurrency(run.total_gross_pay, "PHP")}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(run.total_deductions, "PHP")}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(run.total_net_pay, "PHP")}
                          </TableCell>
                          <TableCell>
                            {run.approved_at
                              ? new Date(run.approved_at).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
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
