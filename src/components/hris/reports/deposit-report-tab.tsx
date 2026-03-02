import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useHasPermission } from "@/hooks/use-permissions";
import { formatCurrency } from "@/lib/utils";
import { reportService } from "@/services/report.service";
import type { ReportFilters } from "@/types/report";
import { FileUpload as FileExportIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function DepositReportTab() {
  const canExport = useHasPermission("reports.export");
  const [filters, setFilters] = useState<ReportFilters>({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0],
  });

  const { data: report, isLoading } = useQuery({
    queryKey: ["depositReport", filters],
    queryFn: () => reportService.getDepositReport(filters),
    enabled: !!filters.start_date && !!filters.end_date,
  });

  const handleExport = () => {
    toast.info("Export functionality coming soon!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select date range for deposit report</CardDescription>
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
                <CardDescription>Total Deposits</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(report.summary?.total_deposits || 0, "PHP")}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Transactions</CardDescription>
                <CardTitle className="text-2xl">{report.summary?.total_transactions || 0}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Average Deposit</CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(report.summary?.avg_deposit || 0, "PHP")}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Accounts</CardDescription>
                <CardTitle className="text-2xl">{report.summary?.total_accounts || 0}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Deposit Details</CardTitle>
              <CardDescription>Deposit records from {filters.start_date} to {filters.end_date}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Deposited By</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.deposits && report.deposits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No deposit data found
                        </TableCell>
                      </TableRow>
                    ) : (
                      report.deposits?.map((deposit: any, index: number) => (
                        <TableRow key={deposit.id || index}>
                          <TableCell>{deposit.date}</TableCell>
                          <TableCell className="font-medium">{deposit.account_name}</TableCell>
                          <TableCell>{deposit.description}</TableCell>
                          <TableCell>{formatCurrency(deposit.amount || 0, "PHP")}</TableCell>
                          <TableCell>{deposit.deposited_by}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              deposit.status === "completed" ? "bg-green-100 text-green-800" :
                              deposit.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {deposit.status || "pending"}
                            </span>
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
