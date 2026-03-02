
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useHasPermission } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/lib/utils/status-badge";
import { payrollEntryService } from "@/services/payroll.service";
import type { PayrollEntry, PayrollEntryFilters } from "@/types/payroll";
import {
  ChevronLeft as ArrowLeft01Icon,
  ChevronRight as ArrowRight01Icon,
  Visibility as EyeIcon,
  FileUpload as FileExportIcon,
  Search as Search01Icon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useState } from "react";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface PayrollEntriesTableProps {
  payrollRunId: string;
}

export function PayrollEntriesTable({ payrollRunId }: PayrollEntriesTableProps) {
  const canView = useHasPermission("payroll.view");
  const canExport = useHasPermission("payroll.export");
  
  const [filters, setFilters] = useState<PayrollEntryFilters>({
    payroll_run_id: payrollRunId,
    per_page: 20,
  });
  const [searchQuery, setSearchQuery] = useState("");

  const { data: entriesData, isLoading } = useQuery({
    queryKey: ["payrollEntries", filters],
    queryFn: () => payrollEntryService.getAll(filters),
  });

  const entries = React.useMemo(
    () => entriesData?.data || [],
    [entriesData]
  );

  const totalPages = entriesData?.last_page || 1;
  const currentPage = entriesData?.current_page || 1;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Note: Backend search would need to be implemented
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handlePageSizeChange = (size: number) => {
    setFilters({ ...filters, per_page: size, page: 1 });
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b">
        <div className="flex items-center gap-2">
          <span className="font-medium text-muted-foreground">
            Payroll Entries ({entriesData?.total || 0})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search01Icon
              className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground"
            />
            <Input
              placeholder="Search employee..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 w-full sm:w-[220px] h-9"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="min-w-[150px] text-muted-foreground font-medium">
                Employee
              </TableHead>
              <TableHead className="min-w-[120px] text-muted-foreground font-medium">
                Department
              </TableHead>
              <TableHead className="min-w-[120px] text-muted-foreground font-medium">
                Gross Pay
              </TableHead>
              <TableHead className="min-w-[120px] text-muted-foreground font-medium">
                Deductions
              </TableHead>
              <TableHead className="min-w-[120px] text-muted-foreground font-medium">
                Net Pay
              </TableHead>
              <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                Status
              </TableHead>
              <TableHead className="text-right min-w-[150px] text-muted-foreground font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Loading payroll entries...
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No payroll entries found.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry: PayrollEntry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{entry.employee?.full_name || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.employee?.employee_code || ""}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {entry.employee?.department?.name || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(entry.total_earnings)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatCurrency(entry.total_deductions)}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(entry.net_pay)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={entry.status}>
                      {entry.status.toUpperCase()}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canView && (
                        <Link
                          to="/hris/payroll/entries/$id"
                          params={{ id: entry.id }}
                        >
                          <Button variant="ghost" size="sm" title="View Payslip">
                            <EyeIcon className="size-5" />
                          </Button>
                        </Link>
                      )}
                      {canExport && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Download Payslip"
                          onClick={async () => {
                            try {
                              const blob = await payrollEntryService.downloadPayslip(entry.id);
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `payslip-${entry.payroll_entry_code}.pdf`;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            } catch (error) {
                              console.error("Error downloading payslip:", error);
                              alert("Failed to download payslip");
                            }
                          }}
                        >
                          <FileExportIcon className="size-5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t">
        <div className="flex items-center gap-6">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ArrowLeft01Icon className="size-5" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (currentPage <= 4) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = currentPage - 3 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => handlePageChange(pageNum)}
                  className={cn(currentPage === pageNum && "bg-muted")}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ArrowRight01Icon className="size-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * (filters.per_page || 10) + 1} to{" "}
            {Math.min(
              currentPage * (filters.per_page || 10),
              entriesData?.total || 0
            )}{" "}
            of {entriesData?.total || 0} entries
          </span>
        </div>
      </div>
    </div>
  );
}

