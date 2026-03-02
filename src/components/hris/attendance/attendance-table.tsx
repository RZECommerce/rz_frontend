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
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/lib/utils/status-badge";
import { attendanceService } from "@/services/attendance.service";
import type { Attendance, AttendanceFilters } from "@/types/attendance";
import {
  CalendarToday as Calendar01Icon,
  Delete as Delete01Icon,
  FilterList as FilterIcon,
  Edit as PencilEdit01Icon,
  Search as Search01Icon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

interface AttendanceTableProps {
  filters: AttendanceFilters;
  onFiltersChange: (filters: AttendanceFilters) => void;
  onEdit: (attendance: Attendance) => void;
  onDelete: (id: string) => void;
}

export function AttendanceTable({
  filters,
  onFiltersChange,
  onEdit,
  onDelete,
}: AttendanceTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["attendances", filters],
    queryFn: () => attendanceService.getAll(filters),
  });

  const attendances = React.useMemo(
    () => (attendanceData?.data || []) as Attendance[],
    [attendanceData],
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleStatusFilter = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status ? (status as AttendanceFilters["status"]) : undefined,
    });
  };

  const handleDateFilter = (field: "date_from" | "date_to", value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value || undefined,
    });
  };

  const hasActiveFilters =
    filters.status || filters.date_from || filters.date_to || filters.search;

  return (
    <div className="rounded-xl  bg-card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3  py-4 border-b">
        <div className="flex items-center gap-2">
          <Calendar01Icon className="size-5 text-muted-foreground" />
          <span className="font-medium text-muted-foreground">
            Attendance list
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search01Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input
              placeholder="Search Anything..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
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
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuGroup>
                <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                  Date Range
                </p>
                <div className="px-2 py-1.5 space-y-2">
                  <Input
                    type="date"
                    placeholder="From Date"
                    onChange={(e) =>
                      handleDateFilter("date_from", e.target.value)
                    }
                    className="h-8 text-xs"
                  />
                  <Input
                    type="date"
                    placeholder="To Date"
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
                  Status
                </p>
                {[
                  "all",
                  "present",
                  "absent",
                  "late",
                  "half_day",
                  "on_leave",
                ].map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={
                      filters.status === status ||
                      (status === "all" && !filters.status)
                    }
                    onCheckedChange={() =>
                      handleStatusFilter(status === "all" ? "" : status)
                    }
                  >
                    {status === "all"
                      ? "All Statuses"
                      : status
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
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
              <TableHead className="min-w-[150px] text-muted-foreground font-medium">
                Employee
              </TableHead>
              <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                Date
              </TableHead>
              <TableHead className="min-w-[120px] text-muted-foreground font-medium">
                Time In
              </TableHead>
              <TableHead className="min-w-[120px] text-muted-foreground font-medium">
                Time Out
              </TableHead>
              <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                Total Hours
              </TableHead>
              <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                Overtime
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
            ) : attendances.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No attendance records found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              attendances.map((attendance: Attendance) => (
                <TableRow key={attendance.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {attendance.employee?.full_name || "N/A"}
                      </span>
                      {attendance.employee?.department && (
                        <span className="text-xs text-muted-foreground">
                          {attendance.employee.department.name}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(attendance.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {attendance.time_in
                      ? new Date(attendance.time_in).toLocaleTimeString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {attendance.time_out
                      ? new Date(attendance.time_out).toLocaleTimeString()
                      : "-"}
                  </TableCell>
                  <TableCell>{attendance.total_hours.toFixed(2)} hrs</TableCell>
                  <TableCell>
                    {attendance.overtime_hours > 0
                      ? `${attendance.overtime_hours.toFixed(2)} hrs`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={attendance.status}>
                      {attendance.status.replace("_", " ").toUpperCase()}
                      {attendance.late_minutes &&
                        attendance.late_minutes > 0 && (
                          <span className="ml-1">
                            ({attendance.late_minutes}m)
                          </span>
                        )}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(attendance)}
                      >
                        <PencilEdit01Icon className="size-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(attendance.id)}
                      >
                        <Delete01Icon className="size-5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {attendanceData && attendanceData.total > attendanceData.per_page && (
        <div className="flex items-center justify-between px-5 py-4 border-t">
          <span className="text-xs text-muted-foreground">
            Showing {attendances.length} of {attendanceData.total} records
          </span>
        </div>
      )}
    </div>
  );
}
