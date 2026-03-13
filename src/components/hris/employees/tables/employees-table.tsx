import { Button } from "@/components/ui/button";
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
import { StatusBadge, formatStatus } from "@/lib/utils/status-badge";
import { employeeService } from "@/services/employee.service";
import type { Employee } from "@/types/employee";
import {
  Delete as Delete01Icon,
  Visibility as EyeIcon,
  FilterList as FilterIcon,
  Search as Search01Icon,
  Group as UserGroupIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import * as React from "react";

interface EmployeesTableProps {
  search: string;
  statusFilter: string;
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status: string) => void;
  onViewOrEdit?: (employee: Employee, mode: "view" | "edit") => void;
  onDelete?: (id: string) => void;
}

// Status colors are now handled by StatusBadge component

export function EmployeesTable({
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onViewOrEdit,
  onDelete,
}: EmployeesTableProps) {
  const canDelete = useHasPermission("employees.delete");
  const canView = useHasPermission("employees.view");

  const { data: employeesData, isLoading } = useQuery({
    queryKey: ["employees", { search, status: statusFilter }],
    queryFn: () =>
      employeeService.getAll({
        search: search || undefined,
        status: statusFilter as any,
        per_page: 50,
      }),
  });

  const employees = React.useMemo(
    () => (Array.isArray(employeesData?.data) ? employeesData.data : []),
    [employeesData],
  );

  const hasActiveFilters = statusFilter !== "";

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card px-2 shadow-xs">
      <div className="flex flex-col justify-between gap-3 border-b py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 px-2">
          <UserGroupIcon className="size-5 text-primary" />
          <span className="font-semibold text-foreground">
            Employee list
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input
              placeholder="Search Anything..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-full sm:w-[220px] h-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md border text-sm font-medium",
                hasActiveFilters
                  ? "border-primary bg-primary/5 text-foreground hover:bg-primary/10"
                  : "border-border bg-muted shadow-xs hover:bg-background",
              )}
            >
              <FilterIcon className="size-5" />
              Filter
              {hasActiveFilters && (
                <span className="size-2 rounded-full bg-primary" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuGroup>
                <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                  Status
                </p>
                {[
                  "all",
                  "active",
                  "on_leave",
                  "probation",
                  "inactive",
                  "terminated",
                ].map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={
                      statusFilter === status ||
                      (status === "all" && statusFilter === "")
                    }
                    onCheckedChange={() =>
                      onStatusFilterChange(status === "all" ? "" : status)
                    }
                  >
                    {status === "all" ? "All Statuses" : formatStatus(status)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
              {hasActiveFilters && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onStatusFilterChange("")}
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
            <TableRow className="bg-primary/5 hover:bg-primary/5">
              <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                Employee Code
              </TableHead>
              <TableHead className="min-w-[150px] text-muted-foreground font-medium">
                Name
              </TableHead>
              <TableHead className="hidden md:table-cell min-w-[200px] text-muted-foreground font-medium">
                Email Address
              </TableHead>
              <TableHead className="hidden lg:table-cell min-w-[100px] text-muted-foreground font-medium">
                Department
              </TableHead>
              <TableHead className="hidden lg:table-cell min-w-[140px] text-muted-foreground font-medium">
                Position
              </TableHead>
              <TableHead className="hidden sm:table-cell min-w-[120px] text-muted-foreground font-medium">
                Hire Date
              </TableHead>
              <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                Status
              </TableHead>
              <TableHead className="min-w-[100px] text-right text-muted-foreground font-medium">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No employees found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee: Employee) => {
                // Status badge is now handled by StatusBadge component
                return (
                  <TableRow
                    key={employee.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={(e) => {
                      // Don't trigger row click if clicking on action buttons or links
                      const target = e.target as HTMLElement;
                      if (
                        target.closest("button") ||
                        target.closest("a") ||
                        target.closest('[role="button"]')
                      ) {
                        return;
                      }
                      if (onViewOrEdit && canView) {
                        onViewOrEdit(employee, "view");
                      }
                    }}
                  >
                    <TableCell className="font-medium text-muted-foreground">
                      {employee.employee_code}
                    </TableCell>
                    <TableCell>
                      <Link
                        to="/hris/employees/$id"
                        params={{ id: employee.id }}
                        className="font-medium text-foreground transition-colors hover:text-foreground/80 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {employee.full_name}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {employee.email}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="rounded-md bg-primary/5 px-2 py-0.5 text-xs font-medium text-foreground ring-1 ring-inset ring-primary/15">
                        {employee.department?.name || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="rounded-md bg-primary/5 px-2 py-0.5 text-xs font-medium text-foreground ring-1 ring-inset ring-primary/15">
                        {employee.position?.name || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {new Date(employee.hire_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={employee.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onViewOrEdit && canView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewOrEdit(employee, "view");
                            }}
                            title="View employee details"
                          >
                            <EyeIcon className="size-5 text-primary" />
                          </Button>
                        )}
                        {onDelete && canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(employee.id);
                            }}
                            title="Delete employee"
                          >
                            <Delete01Icon className="size-5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {employeesData && employeesData.total > employeesData.per_page && (
        <div className="flex items-center justify-between border-t px-5 py-4">
          <span className="text-xs text-muted-foreground">
            Showing {employees.length} of {employeesData.total} employees
          </span>
        </div>
      )}
    </div>
  );
}
