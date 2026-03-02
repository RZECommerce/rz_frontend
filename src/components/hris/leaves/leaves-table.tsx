import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { employeeService } from "@/services/employee.service";
import {
  leaveRequestService,
  leaveTypeService,
} from "@/services/leave.service";
import type { Department } from "@/types/employee";
import type {
  LeaveRequest,
  LeaveRequestFilters,
  LeaveRequestStatus,
} from "@/types/leave";
import {
  ChevronLeft as ArrowLeft01Icon,
  ChevronRight as ArrowRight01Icon,
  CalendarToday as Calendar01Icon,
  CheckCircle as CheckmarkCircle01Icon,
  Cancel as CircleIcon,
  Delete as Delete01Icon,
  Visibility as EyeIcon,
  FilterList as FilterIcon,
  Search as Search01Icon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { ApproveLeaveModal } from "./approve-leave-modal";
import { DeleteLeaveModal } from "./delete-leave-modal";
import { RejectLeaveModal } from "./reject-leave-modal";
import { ViewLeaveModal } from "./view-leave-modal";

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const LEAVE_STATUSES: LeaveRequestStatus[] = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
];

// Status colors are now handled by StatusBadge component

interface LeavesTableProps {
  filters: LeaveRequestFilters;
  onFiltersChange: (filters: LeaveRequestFilters) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string, remarks?: string) => void;
  onReject: (id: string, rejectionReason: string, remarks?: string) => void;
  isDeleting?: boolean;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export function LeavesTable({
  filters,
  onFiltersChange,
  onDelete,
  onApprove,
  onReject,
  isDeleting = false,
  isApproving = false,
  isRejecting = false,
}: LeavesTableProps) {
  const canView = useHasPermission("leaves.view");
  const canApprove = useHasPermission("leaves.approve");
  const canReject = useHasPermission("leaves.reject");
  const canDelete = useHasPermission("leaves.create"); // Using leaves.create for delete permission

  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(
    new Set(),
  );
  const [approveDialog, setApproveDialog] = React.useState<{
    id: string;
    employeeName?: string;
    open: boolean;
  } | null>(null);
  const [rejectDialog, setRejectDialog] = React.useState<{
    id: string;
    employeeName?: string;
    open: boolean;
  } | null>(null);
  const [deleteDialog, setDeleteDialog] = React.useState<{
    id: string;
    employeeName?: string;
    open: boolean;
  } | null>(null);
  const [viewDialog, setViewDialog] = React.useState<{
    leaveRequest: LeaveRequest | null;
    open: boolean;
  }>({
    leaveRequest: null,
    open: false,
  });

  const {
    data: leaveRequestsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["leaveRequests", filters],
    queryFn: () => leaveRequestService.getAll(filters),
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });

  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => employeeService.getAll({ per_page: 9999 }),
  });

  const { data: leaveTypesData } = useQuery({
    queryKey: ["leaveTypes"],
    queryFn: () => leaveTypeService.getAll(true),
  });

  const employees = React.useMemo(() => {
    const data = employeesData?.data;
    return Array.isArray(data) ? data : [];
  }, [employeesData]);

  const leaveTypes = React.useMemo(() => {
    // Laravel resource collections return { data: [...] }
    if (
      leaveTypesData &&
      typeof leaveTypesData === "object" &&
      "data" in leaveTypesData
    ) {
      const data = (leaveTypesData as { data: unknown[] }).data;
      return Array.isArray(data) ? data : [];
    }
    // Fallback to direct array if already unwrapped
    return Array.isArray(leaveTypesData) ? leaveTypesData : [];
  }, [leaveTypesData]) as Array<{ id: string; name: string }>;

  const leaveRequests = React.useMemo(() => {
    if (!leaveRequestsData?.data) return [];
    const data = leaveRequestsData.data;
    return Array.isArray(data) ? data : [];
  }, [leaveRequestsData]);

  // Extract unique departments from employees
  const departments = React.useMemo(() => {
    const deptMap = new Map<string, Department>();
    employees.forEach((emp: { department?: Department | null }) => {
      if (emp.department && !deptMap.has(emp.department.id)) {
        deptMap.set(emp.department.id, emp.department);
      }
    });
    const deptArray = Array.from(deptMap.values());
    return Array.isArray(deptArray) ? deptArray : [];
  }, [employees]);

  const totalPages = leaveRequestsData?.last_page || 1;
  const currentPage = leaveRequestsData?.current_page || 1;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value, page: 1 });
  };

  const handleStatusFilterChange = (status: LeaveRequestStatus | "all") => {
    onFiltersChange({
      ...filters,
      status: status === "all" ? undefined : status,
      page: 1,
    });
  };

  const handleEmployeeFilterChange = (employeeId: string | "all") => {
    onFiltersChange({
      ...filters,
      employee_id: employeeId === "all" ? undefined : employeeId,
      page: 1,
    });
  };

  const handleLeaveTypeFilterChange = (leaveTypeId: string | "all") => {
    onFiltersChange({
      ...filters,
      leave_type_id: leaveTypeId === "all" ? undefined : leaveTypeId,
      page: 1,
    });
  };

  const handleDateFilter = (field: "date_from" | "date_to", value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined,
      page: 1,
    });
  };

  // Filter employees by selected department (for display in dropdown)
  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState<
    string | null
  >(null);

  const handleDepartmentFilterChange = (departmentId: string | "all") => {
    if (departmentId === "all") {
      setSelectedDepartmentId(null);
    } else {
      setSelectedDepartmentId(departmentId);
    }
  };

  const filteredEmployeesForDropdown = React.useMemo(() => {
    if (!selectedDepartmentId) return employees;
    return employees.filter(
      (emp: { department?: Department | null }) =>
        emp.department?.id === selectedDepartmentId,
    );
  }, [employees, selectedDepartmentId]);

  const handlePageChange = (page: number) => {
    onFiltersChange({ ...filters, page });
  };

  const handlePageSizeChange = (size: number) => {
    onFiltersChange({ ...filters, per_page: size, page: 1 });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === leaveRequests.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(leaveRequests.map((lr: LeaveRequest) => lr.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSet = new Set(selectedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedRows(newSet);
  };

  const formatStatus = (status: LeaveRequestStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleApproveClick = (leaveRequest: LeaveRequest) => {
    setApproveDialog({
      id: leaveRequest.id,
      employeeName: leaveRequest.employee?.full_name,
      open: true,
    });
  };

  const handleRejectClick = (leaveRequest: LeaveRequest) => {
    setRejectDialog({
      id: leaveRequest.id,
      employeeName: leaveRequest.employee?.full_name,
      open: true,
    });
  };

  const handleDeleteClick = (leaveRequest: LeaveRequest) => {
    setDeleteDialog({
      id: leaveRequest.id,
      employeeName: leaveRequest.employee?.full_name,
      open: true,
    });
  };

  const handleViewClick = (leaveRequest: LeaveRequest) => {
    setViewDialog({
      leaveRequest,
      open: true,
    });
  };

  const handleApproveSubmit = (remarks?: string) => {
    if (approveDialog) {
      onApprove(approveDialog.id, remarks);
      setApproveDialog(null);
    }
  };

  const handleRejectSubmit = (rejectionReason: string, remarks?: string) => {
    if (rejectDialog) {
      onReject(rejectDialog.id, rejectionReason, remarks);
      setRejectDialog(null);
    }
  };

  const handleDeleteSubmit = () => {
    if (deleteDialog) {
      onDelete(deleteDialog.id);
      setDeleteDialog(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedRows.size === 0) return;
    if (
      confirm(
        `Are you sure you want to delete ${selectedRows.size} leave request(s)?`,
      )
    ) {
      selectedRows.forEach((id) => {
        onDelete(id);
      });
      setSelectedRows(new Set());
    }
  };

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.employee_id ||
    filters.leave_type_id ||
    filters.date_from ||
    filters.date_to;

  return (
    <div className="rounded-xl  bg-card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3  py-4 ">
        <div className="flex items-center gap-2">
          <Calendar01Icon className="size-5 text-muted-foreground" />
          <span className="font-medium text-muted-foreground">
            Leave Requests
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedRows.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              <Delete01Icon className="size-5" />
              Delete Selected ({selectedRows.size})
            </Button>
          )}
          <div className="relative flex-1 sm:flex-none">
            <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input
              placeholder="Search employee..."
              value={filters.search || ""}
              onChange={handleSearchChange}
              className="pl-9 w-full sm:w-[220px] h-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md border text-sm font-medium",
                "border-border hover:bg-background bg-muted shadow-xs",
              )}
            >
              <FilterIcon className="size-5" />
              Filter
              {hasActiveFilters && (
                <span className="size-2 rounded-full bg-primary" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[240px] max-h-[80vh] overflow-y-auto"
            >
              <DropdownMenuGroup>
                <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                  Date Range
                </p>
                <div className="px-2 py-1.5 space-y-2">
                  <Input
                    type="date"
                    placeholder="From Date"
                    value={filters.date_from || ""}
                    onChange={(e) =>
                      handleDateFilter("date_from", e.target.value)
                    }
                    className="h-8 text-xs"
                  />
                  <Input
                    type="date"
                    placeholder="To Date"
                    value={filters.date_to || ""}
                    onChange={(e) =>
                      handleDateFilter("date_to", e.target.value)
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                  Department
                </p>
                <DropdownMenuCheckboxItem
                  checked={!filters.employee_id}
                  onCheckedChange={() => handleDepartmentFilterChange("all")}
                >
                  All Departments
                </DropdownMenuCheckboxItem>
                {departments.map((dept) => (
                  <DropdownMenuCheckboxItem
                    key={dept.id}
                    checked={selectedDepartmentId === dept.id}
                    onCheckedChange={() =>
                      handleDepartmentFilterChange(dept.id)
                    }
                  >
                    {dept.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                  Employee
                </p>
                <DropdownMenuCheckboxItem
                  checked={!filters.employee_id}
                  onCheckedChange={() => handleEmployeeFilterChange("all")}
                >
                  All Employees
                </DropdownMenuCheckboxItem>
                {filteredEmployeesForDropdown.map(
                  (employee: { id: string; full_name: string }) => (
                    <DropdownMenuCheckboxItem
                      key={employee.id}
                      checked={filters.employee_id === employee.id}
                      onCheckedChange={() =>
                        handleEmployeeFilterChange(employee.id)
                      }
                    >
                      {employee.full_name}
                    </DropdownMenuCheckboxItem>
                  ),
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                  Leave Type
                </p>
                <DropdownMenuCheckboxItem
                  checked={!filters.leave_type_id}
                  onCheckedChange={() => handleLeaveTypeFilterChange("all")}
                >
                  All Types
                </DropdownMenuCheckboxItem>
                {leaveTypes.map((leaveType: { id: string; name: string }) => (
                  <DropdownMenuCheckboxItem
                    key={leaveType.id}
                    checked={filters.leave_type_id === leaveType.id}
                    onCheckedChange={() =>
                      handleLeaveTypeFilterChange(leaveType.id)
                    }
                  >
                    {leaveType.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                  Status
                </p>
                <DropdownMenuCheckboxItem
                  checked={!filters.status}
                  onCheckedChange={() => handleStatusFilterChange("all")}
                >
                  All Statuses
                </DropdownMenuCheckboxItem>
                {LEAVE_STATUSES.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={filters.status === status}
                    onCheckedChange={() => handleStatusFilterChange(status)}
                  >
                    {formatStatus(status)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
              {hasActiveFilters && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      onFiltersChange({
                        per_page: filters.per_page,
                        page: 1,
                      })
                    }
                    className="text-destructive"
                  >
                    Clear all filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedRows.size === leaveRequests.length &&
                    leaveRequests.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                Code
              </TableHead>
              <TableHead className="min-w-[150px] text-muted-foreground font-medium">
                Employee
              </TableHead>
              <TableHead className="min-w-[120px] text-muted-foreground font-medium">
                Leave Type
              </TableHead>
              <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                Start Date
              </TableHead>
              <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                End Date
              </TableHead>
              <TableHead className="min-w-[80px] text-muted-foreground font-medium">
                Days
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
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading leave requests...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-destructive"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span>Error loading leave requests.</span>
                    <span className="text-xs text-muted-foreground">
                      {error instanceof Error
                        ? error.message
                        : "Please try again."}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : leaveRequests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-muted-foreground"
                >
                  No leave requests found.
                </TableCell>
              </TableRow>
            ) : (
              leaveRequests.map((leaveRequest: LeaveRequest) => (
                <TableRow key={leaveRequest.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(leaveRequest.id)}
                      onCheckedChange={() => toggleSelectRow(leaveRequest.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
                    {leaveRequest.leave_request_code}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-5">
                        <AvatarFallback className="text-[10px] font-semibold">
                          {leaveRequest.employee?.full_name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("") || "N/A"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {leaveRequest.employee?.full_name || "N/A"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {leaveRequest.leave_type?.name || "N/A"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(leaveRequest.start_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(leaveRequest.end_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">
                    {leaveRequest.total_days}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={leaveRequest.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewClick(leaveRequest)}
                          title="View Details"
                        >
                          <EyeIcon className="size-5" />
                        </Button>
                      )}
                      {leaveRequest.status === "pending" && (
                        <>
                          {canApprove && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApproveClick(leaveRequest)}
                              className="text-green-600 hover:text-green-700"
                              title="Approve"
                            >
                              <CheckmarkCircle01Icon className="size-5" />
                            </Button>
                          )}
                          {canReject && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRejectClick(leaveRequest)}
                              className="text-red-600 hover:text-red-700"
                              title="Reject"
                            >
                              <CircleIcon className="size-5" />
                            </Button>
                          )}
                        </>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(leaveRequest)}
                          title="Delete"
                        >
                          <Delete01Icon className="size-5 text-destructive" />
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
            {(() => {
              const getPageNumbers = (): (number | string)[] => {
                const maxVisible = 7;
                const pages: (number | string)[] = [];

                if (totalPages <= maxVisible) {
                  return Array.from({ length: totalPages }, (_, i) => i + 1);
                }

                // Always show first page
                pages.push(1);

                if (currentPage <= 4) {
                  // Near the beginning
                  for (let i = 2; i <= 5; i++) {
                    pages.push(i);
                  }
                  pages.push("...");
                  pages.push(totalPages);
                } else if (currentPage >= totalPages - 3) {
                  // Near the end
                  pages.push("...");
                  for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // In the middle
                  pages.push("...");
                  for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                  }
                  pages.push("...");
                  pages.push(totalPages);
                }

                return pages;
              };

              return getPageNumbers().map((pageNum, index) => {
                if (pageNum === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-muted-foreground"
                    >
                      ...
                    </span>
                  );
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "secondary" : "ghost"}
                    size="icon-sm"
                    onClick={() => handlePageChange(pageNum as number)}
                    className={cn(currentPage === pageNum && "bg-muted")}
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
              leaveRequestsData?.total || 0,
            )}{" "}
            of {leaveRequestsData?.total || 0} entries
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 h-8 px-2.5 rounded-md border border-border bg-background hover:bg-muted shadow-xs text-sm font-medium">
              Show {filters.per_page || 10}
              <ArrowRight01Icon className="size-5 rotate-90" />
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

      {/* Modals */}
      {approveDialog && (
        <ApproveLeaveModal
          open={approveDialog.open}
          onOpenChange={(open) => setApproveDialog(open ? approveDialog : null)}
          onApprove={handleApproveSubmit}
          employeeName={approveDialog.employeeName}
          isSubmitting={isApproving}
        />
      )}

      {rejectDialog && (
        <RejectLeaveModal
          open={rejectDialog.open}
          onOpenChange={(open) => setRejectDialog(open ? rejectDialog : null)}
          onReject={handleRejectSubmit}
          employeeName={rejectDialog.employeeName}
          isSubmitting={isRejecting}
        />
      )}

      {deleteDialog && (
        <DeleteLeaveModal
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog(open ? deleteDialog : null)}
          onDelete={handleDeleteSubmit}
          employeeName={deleteDialog.employeeName}
          isSubmitting={isDeleting}
        />
      )}

      <ViewLeaveModal
        open={viewDialog.open}
        onOpenChange={(open) => setViewDialog({ leaveRequest: null, open })}
        leaveRequest={viewDialog.leaveRequest}
      />
    </div>
  );
}
