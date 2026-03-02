
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
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
import { StatusBadge } from "@/lib/utils/status-badge";
import { employeeService } from "@/services/employee.service";
import { overtimeService } from "@/services/overtime.service";
import type { OvertimeLog, OvertimeLogFilters } from "@/types/overtime";
import {
    CalendarMonth as Calendar01Icon,
    FilterList as FilterIcon,
    Search as Search01Icon,
    Person as UserIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

interface OvertimeTableProps {
  filters: OvertimeLogFilters;
  onFiltersChange: (filters: OvertimeLogFilters) => void;
}

// Status colors are now handled by StatusBadge component

export function OvertimeTable({
  filters,
  onFiltersChange,
}: OvertimeTableProps) {
  const [searchTerm, setSearchTerm] = React.useState(filters.search || "");

  const { data: overtimeData, isLoading } = useQuery({
    queryKey: ["overtime", filters],
    queryFn: () => overtimeService.getAll(filters),
  });

  const { data: employeesData } = useQuery({
    queryKey: ["employees", "list"],
    queryFn: () => employeeService.getAll({ per_page: 1000 }),
  });

  const employees = Array.isArray(employeesData?.data) ? employeesData.data : [];
  const logs = overtimeData?.data || [];

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({ ...filters, search: value || undefined, page: 1 });
  };

  const handleStatusFilter = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status ? (status as OvertimeLogFilters["status"]) : undefined,
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

  const handleEmployeeFilter = (employeeId: string | undefined) => {
    onFiltersChange({
      ...filters,
      employee_id: employeeId,
      page: 1,
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const hasActiveFilters =
    filters.status || filters.date_from || filters.date_to || filters.employee_id || filters.search;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search01Icon
            className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground"
          />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FilterIcon className="size-5" />
                Status
                {filters.status && (
                  <Badge variant="secondary" className="ml-1">
                    {filters.status}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusFilter("")}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filters.status === "pending"}
                onCheckedChange={() => handleStatusFilter("pending")}
              >
                Pending
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.status === "approved"}
                onCheckedChange={() => handleStatusFilter("approved")}
              >
                Approved
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.status === "rejected"}
                onCheckedChange={() => handleStatusFilter("rejected")}
              >
                Rejected
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <UserIcon className="size-5" />
                Employee
                {filters.employee_id && (
                  <Badge variant="secondary" className="ml-1">
                    Selected
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 max-h-[300px] overflow-y-auto">
              <DropdownMenuItem onClick={() => handleEmployeeFilter(undefined)}>
                All Employees
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {employees.map((employee) => (
                <DropdownMenuItem
                  key={employee.id}
                  onClick={() => handleEmployeeFilter(employee.id)}
                >
                  <UserIcon className="size-5 mr-2" />
                  {employee.full_name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar01Icon className="size-5" />
                Date
                {(filters.date_from || filters.date_to) && (
                  <Badge variant="secondary" className="ml-1">
                    Filtered
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-3">
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    From Date
                  </label>
                  <Input
                    type="date"
                    value={filters.date_from || ""}
                    onChange={(e) => handleDateFilter("date_from", e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    To Date
                  </label>
                  <Input
                    type="date"
                    value={filters.date_to || ""}
                    onChange={(e) => handleDateFilter("date_to", e.target.value)}
                    className="w-full"
                  />
                </div>
                {(filters.date_from || filters.date_to) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        date_from: undefined,
                        date_to: undefined,
                      })
                    }
                  >
                    Clear Date Filter
                  </Button>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onFiltersChange({
                  per_page: 50,
                  page: 1,
                })
              }
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="min-w-[200px]">Employee</TableHead>
                <TableHead className="min-w-[120px]">Date</TableHead>
                <TableHead className="min-w-[100px]">Time In</TableHead>
                <TableHead className="min-w-[100px]">Time Out</TableHead>
                <TableHead className="min-w-[100px] text-right">Total Hours</TableHead>
                <TableHead className="min-w-[100px] text-right">Regular Hours</TableHead>
                <TableHead className="min-w-[120px] text-right">Overtime Hours</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No overtime logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: OvertimeLog) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {log.employee?.full_name || "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {log.employee?.employee_code || "-"}
                        </span>
                        {log.employee?.department && (
                          <span className="text-xs text-muted-foreground">
                            {log.employee.department.name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(log.date)}</TableCell>
                    <TableCell>{formatTime(log.time_in)}</TableCell>
                    <TableCell>{formatTime(log.time_out)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {log.total_hours.toFixed(1)}h
                    </TableCell>
                    <TableCell className="text-right">
                      {log.regular_hours.toFixed(1)}h
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium text-orange-600 dark:text-orange-400">
                        {log.overtime_hours.toFixed(1)}h
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={log.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {overtimeData && overtimeData.total > (filters.per_page || 50) && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {((filters.page || 1) - 1) * (filters.per_page || 50) + 1} to{" "}
            {Math.min((filters.page || 1) * (filters.per_page || 50), overtimeData.total)} of{" "}
            {overtimeData.total} entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={(filters.page || 1) <= 1}
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  page: (filters.page || 1) - 1,
                })
              }
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={(filters.page || 1) >= overtimeData.last_page}
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  page: (filters.page || 1) + 1,
                })
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

