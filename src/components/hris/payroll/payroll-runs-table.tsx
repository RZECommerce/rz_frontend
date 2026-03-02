
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { payrollEntryService, payrollPeriodService, payrollRunService } from "@/services/payroll.service";
import type { PayrollEntry, PayrollRun, PayrollRunFilters, PayrollRunStatus } from "@/types/payroll";
import {
    ChevronLeft as ArrowLeft01Icon,
    ChevronRight as ArrowRight01Icon,
    CalendarToday as Calendar01Icon,
    FileDownload as FileImportIcon,
    MoreHoriz as MoreHorizontalIcon,
    Search as Search01Icon,
    ViewList as ViewListIcon,
    People as PeopleIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { useState } from "react";
import { PayrollRunDetailModal } from "./payroll-run-detail-modal";

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const PAYROLL_RUN_STATUSES: PayrollRunStatus[] = [
  "draft",
  "processing",
  "completed",
  "approved",
  "paid",
  "cancelled",
];

// Status labels for display (icons removed for consistency)
const statusLabels: Record<PayrollRunStatus, string> = {
  draft: "Draft",
  processing: "Processing",
  completed: "Completed",
  approved: "Approved",
  paid: "Paid",
  cancelled: "Cancelled",
};

interface PayrollRunsTableProps {
  filters: PayrollRunFilters;
  onFiltersChange: (filters: PayrollRunFilters) => void;
  onProcess: (id: string) => void;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onReprocess: (id: string) => void;
  isProcessing?: boolean;
  isApproving?: boolean;
  isDeleting?: boolean;
  isReprocessing?: boolean;
}

export function PayrollRunsTable({
  filters,
  onFiltersChange,
  onProcess,
  onApprove,
  onDelete,
  onReprocess,
  isProcessing = false,
  isApproving = false,
  isDeleting = false,
  isReprocessing = false,
}: PayrollRunsTableProps) {
  const canView = useHasPermission("payroll.view");
  const canProcess = useHasPermission("payroll.process");
  const canApprove = useHasPermission("payroll.approve");
  const canDelete = useHasPermission("payroll.delete");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectedPayrollRun, setSelectedPayrollRun] = useState<PayrollRun | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"period" | "employee">("period");

  const handleRowClick = (payrollRun: PayrollRun) => {
    setSelectedPayrollRun(payrollRun);
    setIsDetailModalOpen(true);
  };

  const { data: payrollRunsData, isLoading } = useQuery({
    queryKey: ["payrollRuns", filters],
    queryFn: () => payrollRunService.getAll(filters),
  });

  const { data: payrollPeriodsData } = useQuery({
    queryKey: ["payrollPeriods"],
    queryFn: () => payrollPeriodService.getAll(true),
  });

  const { data: payrollEntriesData, isLoading: isLoadingEntries } = useQuery({
    queryKey: ["payrollEntries", { per_page: filters.per_page || 10, page: filters.page || 1, search: searchQuery }],
    queryFn: () => payrollEntryService.getAll({ 
      per_page: filters.per_page || 10, 
      page: filters.page || 1,
    }),
    enabled: viewMode === "employee",
  });

  const payrollPeriods = React.useMemo(() => {
    const data = payrollPeriodsData;
    return Array.isArray(data) ? data : [];
  }, [payrollPeriodsData]);

  const payrollRuns = React.useMemo(() => {
    if (!payrollRunsData?.data) return [];
    const data = payrollRunsData.data;
    return Array.isArray(data) ? data : [];
  }, [payrollRunsData]);

  const payrollEntries: PayrollEntry[] = React.useMemo(() => {
    if (!payrollEntriesData?.data) return [];
    const data = payrollEntriesData.data;
    return Array.isArray(data) ? data : [];
  }, [payrollEntriesData]);

  const filteredEntries = React.useMemo(() => {
    if (!searchQuery) return payrollEntries;
    const query = searchQuery.toLowerCase();
    return payrollEntries.filter((entry) =>
      entry.employee?.full_name?.toLowerCase().includes(query) ||
      entry.employee?.employee_code?.toLowerCase().includes(query) ||
      entry.payroll_entry_code?.toLowerCase().includes(query)
    );
  }, [payrollEntries, searchQuery]);

  const filteredRuns = React.useMemo(() => {
    if (!searchQuery) return payrollRuns;
    const query = searchQuery.toLowerCase();
    return payrollRuns.filter((run) =>
      run.payroll_period?.name?.toLowerCase().includes(query) ||
      run.payroll_run_code?.toLowerCase().includes(query)
    );
  }, [payrollRuns, searchQuery]);

  const entriesTotal = payrollEntriesData?.total || 0;
  const entriesTotalPages = payrollEntriesData?.last_page || 1;
  const entriesCurrentPage = payrollEntriesData?.current_page || 1;

  const totalPages = payrollRunsData?.last_page || 1;
  const currentPage = payrollRunsData?.current_page || 1;

  const handleStatusFilterChange = (status: PayrollRunStatus | "all") => {
    onFiltersChange({
      ...filters,
      status: status === "all" ? undefined : status,
      page: 1,
    });
  };

  const handlePeriodFilterChange = (periodId: string | "all") => {
    onFiltersChange({
      ...filters,
      payroll_period_id: periodId === "all" ? undefined : periodId,
      page: 1,
    });
  };

  const handlePageChange = (page: number) => {
    onFiltersChange({ ...filters, page });
  };

  const handlePageSizeChange = (size: number) => {
    onFiltersChange({ ...filters, per_page: size, page: 1 });
  };

  const formatStatus = (status: PayrollRunStatus) => {
    return statusLabels[status];
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };


  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(payrollRuns.map((pr: PayrollRun) => pr.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const getSelectedPeriodLabel = () => {
    if (!filters.payroll_period_id) return "All Dates";
    const period = payrollPeriods.find((p) => p.id === filters.payroll_period_id);
    return period?.name || "All Dates";
  };

  const getSelectedStatusLabel = () => {
    if (!filters.status) return "All Status";
    return formatStatus(filters.status);
  };

  return (
    <div className="rounded-xl  bg-card overflow-hidden">
      <div className="flex flex-col gap-4 px-5 py-4 border-b">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search01Icon
              className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder="Search payroll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Calendar01Icon className="size-5" />
                  {getSelectedPeriodLabel()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuCheckboxItem
                  checked={!filters.payroll_period_id}
                  onCheckedChange={() => handlePeriodFilterChange("all")}
                >
                  All Dates
                </DropdownMenuCheckboxItem>
                {payrollPeriods.map((period) => (
                  <DropdownMenuCheckboxItem
                    key={period.id}
                    checked={filters.payroll_period_id === period.id}
                    onCheckedChange={() => handlePeriodFilterChange(period.id)}
                  >
                    {period.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {getSelectedStatusLabel()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuCheckboxItem
                  checked={!filters.status}
                  onCheckedChange={() => handleStatusFilterChange("all")}
                >
                  All Status
                </DropdownMenuCheckboxItem>
                {PAYROLL_RUN_STATUSES.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={filters.status === status}
                    onCheckedChange={() => handleStatusFilterChange(status)}
                  >
                    {formatStatus(status)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export Selected</DropdownMenuItem>
                <DropdownMenuItem>Bulk Actions</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" className="gap-2">
              <FileImportIcon className="size-5" />
              Import
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-md border border-border overflow-hidden">
              <Button
                variant={viewMode === "period" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-none gap-1.5 border-0",
                  viewMode === "period" && "bg-muted"
                )}
                onClick={() => setViewMode("period")}
              >
                <ViewListIcon className="size-4" />
                By Period
              </Button>
              <div className="w-px h-6 bg-border" />
              <Button
                variant={viewMode === "employee" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-none gap-1.5 border-0",
                  viewMode === "employee" && "bg-muted"
                )}
                onClick={() => setViewMode("employee")}
              >
                <PeopleIcon className="size-4" />
                By Employee
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {viewMode === "period" ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.size === filteredRuns.length && filteredRuns.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="min-w-[200px] text-muted-foreground font-medium">
                  Payroll Period
                </TableHead>
                <TableHead className="min-w-[150px] text-muted-foreground font-medium">
                  Period Dates
                </TableHead>
                <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                  Pay Date
                </TableHead>
                <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                  Employees
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
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                    Loading payroll runs...
                  </TableCell>
                </TableRow>
              ) : filteredRuns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                    {searchQuery ? "No payroll runs match your search." : "No payroll runs found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRuns.map((payrollRun: PayrollRun) => (
                  <TableRow 
                    key={payrollRun.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(payrollRun)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRows.has(payrollRun.id)}
                        onCheckedChange={(checked) =>
                          handleSelectRow(payrollRun.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{payrollRun.payroll_period?.name || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">{payrollRun.payroll_run_code}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {payrollRun.payroll_period?.start_date || "-"} to {payrollRun.payroll_period?.end_date || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payrollRun.payroll_period?.pay_date || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {payrollRun.total_employees}
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(payrollRun.total_gross_pay)}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {formatCurrency(payrollRun.total_deductions)}
                    </TableCell>
                    <TableCell className="text-blue-600 font-semibold">
                      {formatCurrency(payrollRun.total_net_pay)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payrollRun.status}>
                        {statusLabels[payrollRun.status as PayrollRunStatus]}
                      </StatusBadge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontalIcon className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canView && (
                            <DropdownMenuItem onClick={() => handleRowClick(payrollRun)}>
                              View Details
                            </DropdownMenuItem>
                          )}
                          {payrollRun.status === "draft" && canProcess && (
                            <DropdownMenuItem
                              onClick={() => onProcess(payrollRun.id)}
                              disabled={isProcessing}
                            >
                              Process Payroll
                            </DropdownMenuItem>
                          )}
                          {payrollRun.status === "completed" && canApprove && (
                            <DropdownMenuItem
                              onClick={() => onApprove(payrollRun.id)}
                              disabled={isApproving}
                            >
                              Approve
                            </DropdownMenuItem>
                          )}
                          {(payrollRun.status === "draft" || payrollRun.status === "completed") && canProcess && (
                            <DropdownMenuItem
                              onClick={() => onReprocess(payrollRun.id)}
                              disabled={isReprocessing}
                            >
                              Reprocess (All Employees)
                            </DropdownMenuItem>
                          )}
                          {(payrollRun.status === "draft" || payrollRun.status === "cancelled") && canDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(payrollRun.id)}
                              disabled={isDeleting}
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.size === filteredEntries.length && filteredEntries.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRows(new Set(filteredEntries.map((e) => e.id)));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="min-w-[200px] text-muted-foreground font-medium">
                  Employee
                </TableHead>
                <TableHead className="min-w-[150px] text-muted-foreground font-medium">
                  Department
                </TableHead>
                <TableHead className="min-w-[120px] text-muted-foreground font-medium">
                  Basic Salary
                </TableHead>
                <TableHead className="min-w-[120px] text-muted-foreground font-medium">
                  Allowances
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
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingEntries ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                    Loading employee payroll data...
                  </TableCell>
                </TableRow>
              ) : filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                    {searchQuery ? "No employees match your search." : "No payroll entries found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry: PayrollEntry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/50">
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRows.has(entry.id)}
                        onCheckedChange={(checked) =>
                          handleSelectRow(entry.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{entry.employee?.full_name || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">{entry.employee?.employee_code}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.employee?.department?.name || "-"}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(entry.basic_salary)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(entry.allowance_taxable + entry.allowance_non_taxable)}
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {formatCurrency(entry.total_earnings)}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {formatCurrency(entry.total_deductions)}
                    </TableCell>
                    <TableCell className="text-blue-600 font-semibold">
                      {formatCurrency(entry.net_pay)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={entry.status}>
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontalIcon className="size-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Payslip</DropdownMenuItem>
                          <DropdownMenuItem>Download PDF</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t">
        <div className="flex items-center gap-6">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handlePageChange((viewMode === "period" ? currentPage : entriesCurrentPage) - 1)}
            disabled={(viewMode === "period" ? currentPage : entriesCurrentPage) === 1}
          >
            <ArrowLeft01Icon className="size-5" />
          </Button>

          <div className="flex items-center gap-1">
            {(() => {
              const activeTotalPages = viewMode === "period" ? totalPages : entriesTotalPages;
              const activeCurrentPage = viewMode === "period" ? currentPage : entriesCurrentPage;
              
              const getPageNumbers = (): (number | string)[] => {
                const maxVisible = 7;
                const pages: (number | string)[] = [];

                if (activeTotalPages <= maxVisible) {
                  return Array.from({ length: activeTotalPages }, (_, i) => i + 1);
                }

                pages.push(1);

                if (activeCurrentPage <= 4) {
                  for (let i = 2; i <= 5; i++) {
                    pages.push(i);
                  }
                  pages.push("...");
                  pages.push(activeTotalPages);
                } else if (activeCurrentPage >= activeTotalPages - 3) {
                  pages.push("...");
                  for (let i = activeTotalPages - 4; i <= activeTotalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  pages.push("...");
                  for (let i = activeCurrentPage - 1; i <= activeCurrentPage + 1; i++) {
                    pages.push(i);
                  }
                  pages.push("...");
                  pages.push(activeTotalPages);
                }

                return pages;
              };

              return getPageNumbers().map((pageNum, index) => {
                if (pageNum === "...") {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  );
                }
                return (
                  <Button
                    key={pageNum}
                    variant={activeCurrentPage === pageNum ? "secondary" : "ghost"}
                    size="icon-sm"
                    onClick={() => handlePageChange(pageNum as number)}
                    className={cn(activeCurrentPage === pageNum && "bg-muted")}
                  >
                    {pageNum}
                  </Button>
                );
              });
            })()}
          </div>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handlePageChange((viewMode === "period" ? currentPage : entriesCurrentPage) + 1)}
            disabled={(viewMode === "period" ? currentPage : entriesCurrentPage) === (viewMode === "period" ? totalPages : entriesTotalPages)}
          >
            <ArrowRight01Icon className="size-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            Showing {((viewMode === "period" ? currentPage : entriesCurrentPage) - 1) * (filters.per_page || 10) + 1} to{" "}
            {Math.min(
              (viewMode === "period" ? currentPage : entriesCurrentPage) * (filters.per_page || 10),
              viewMode === "period" ? (payrollRunsData?.total || 0) : entriesTotal
            )}{" "}
            of {viewMode === "period" ? (payrollRunsData?.total || 0) : entriesTotal} entries
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 h-8 px-2.5 rounded-md border border-border bg-background hover:bg-muted shadow-xs text-sm font-medium">
              Show {filters.per_page || 10}
              <ArrowRight01Icon
                className="size-5 rotate-90"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() => handlePageSizeChange(size)}
                  className={cn(filters.per_page === size && "bg-muted")}
                >
                  Show {size}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <PayrollRunDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        payrollRun={selectedPayrollRun}
      />
    </div>
  );
}

