
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
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
import { timesheetService } from "@/services/timesheet.service";
import {
    FilterList as FilterIcon,
    Search as Search01Icon,
    Person as UserIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

interface TimesheetTableProps {
  weekStart: string;
  weekEnd: string;
  employeeId?: string;
  onEmployeeChange?: (employeeId: string | undefined) => void;
}

// Status colors are now handled by StatusBadge component

export function TimesheetTable({
  weekStart,
  weekEnd,
  employeeId,
  onEmployeeChange,
}: TimesheetTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const { data: timesheets, isLoading } = useQuery({
    queryKey: ["timesheets", "weekly", weekStart, weekEnd, employeeId],
    queryFn: () =>
      timesheetService.getWeekly(weekStart, weekEnd, {
        employee_id: employeeId,
      }),
  });

  const { data: employeesData } = useQuery({
    queryKey: ["employees", "list"],
    queryFn: () => employeeService.getAll({ per_page: 1000 }),
    enabled: !!onEmployeeChange,
  });

  const employees = Array.isArray(employeesData?.data) ? employeesData.data : [];

  const filteredTimesheets = React.useMemo(() => {
    if (!timesheets) return [];
    
    let filtered = timesheets;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.employee?.full_name?.toLowerCase().includes(search) ||
          t.employee?.employee_code?.toLowerCase().includes(search) ||
          t.employee?.email?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [timesheets, searchTerm]);

  const weekDays = React.useMemo(() => {
    if (!timesheets || timesheets.length === 0) return [];
    return timesheets[0]?.days.map((d) => ({
      date: d.date,
      day_name: d.day_name,
    })) || [];
  }, [timesheets]);

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
    });
  };

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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {onEmployeeChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FilterIcon className="size-5" />
                Filter
                {employeeId && (
                  <Badge variant="secondary" className="ml-1">
                    {employees.find((e) => e.id === employeeId)?.full_name || "Selected"}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => onEmployeeChange(undefined)}>
                All Employees
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {employees.map((employee) => (
                <DropdownMenuItem
                  key={employee.id}
                  onClick={() => onEmployeeChange(employee.id)}
                >
                  <UserIcon className="size-5 mr-2" />
                  {employee.full_name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">
                  Employee
                </TableHead>
                {weekDays.map((day) => (
                  <TableHead key={day.date} className="text-center min-w-[120px]">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        {day.day_name}
                      </span>
                      <span className="text-xs font-medium">
                        {formatDate(day.date)}
                      </span>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center min-w-[100px]">Total</TableHead>
                <TableHead className="text-center min-w-[100px]">OT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTimesheets.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={weekDays.length + 3}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No timesheet data found for this week
                  </TableCell>
                </TableRow>
              ) : (
                filteredTimesheets.map((timesheet) => (
                  <TableRow key={timesheet.employee_id}>
                    <TableCell className="sticky left-0 bg-background z-10">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {timesheet.employee?.full_name || "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {timesheet.employee?.employee_code || "-"}
                        </span>
                        {timesheet.employee?.department && (
                          <span className="text-xs text-muted-foreground">
                            {timesheet.employee.department.name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    {timesheet.days.map((day) => (
                      <TableCell key={day.date} className="text-center">
                        <div className="flex flex-col gap-1 items-center">
                          {day.attendance ? (
                            <>
                              <div className="text-xs">
                                {formatTime(day.attendance.time_in)} -{" "}
                                {formatTime(day.attendance.time_out)}
                              </div>
                              <div className="text-xs font-medium">
                                {day.hours.toFixed(1)}h
                              </div>
                              <StatusBadge status={day.status}>
                                {day.status.replace("_", " ")}
                              </StatusBadge>
                            </>
                          ) : (
                            <>
                              <div className="text-xs text-muted-foreground">
                                -
                              </div>
                              <StatusBadge status={day.status} />
                            </>
                          )}
                          {day.overtime_hours > 0 && (
                            <div className="text-xs text-orange-600 dark:text-orange-400">
                              +{day.overtime_hours.toFixed(1)}h OT
                            </div>
                          )}
                        </div>
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-medium">
                      {timesheet.total_hours.toFixed(1)}h
                    </TableCell>
                    <TableCell className="text-center">
                      {timesheet.overtime_hours > 0 ? (
                        <span className="text-orange-600 dark:text-orange-400 font-medium">
                          {timesheet.overtime_hours.toFixed(1)}h
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

