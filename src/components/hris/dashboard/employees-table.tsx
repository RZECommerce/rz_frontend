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
import { cn } from "@/lib/utils";
import { StatusBadge, formatStatus } from "@/lib/utils/status-badge";
import { employeeService } from "@/services/employee.service";
import { useDashboardStore } from "@/stores/dashboard-store";
import {
  ChevronLeft as ArrowLeftIcon,
  ChevronRight as ArrowRightIcon,
  FilterList as FilterIcon,
  FileUpload as ImportIcon,
  Search as SearchIcon,
  Group as UserGroupIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";

const PAGE_SIZE_OPTIONS = [8, 15, 25, 50];

// Status colors are now handled by StatusBadge component

export function EmployeesTable() {
  const searchQuery = useDashboardStore((state) => state.searchQuery);
  const departmentFilter = useDashboardStore((state) => state.departmentFilter);
  const statusFilter = useDashboardStore((state) => state.statusFilter);
  const setSearchQuery = useDashboardStore((state) => state.setSearchQuery);
  const setDepartmentFilter = useDashboardStore(
    (state) => state.setDepartmentFilter,
  );
  const setStatusFilter = useDashboardStore((state) => state.setStatusFilter);
  const clearFilters = useDashboardStore((state) => state.clearFilters);

  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(8);
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(
    new Set(),
  );

  const { data: employeesData, isLoading } = useQuery({
    queryKey: ["employees", "dashboard"],
    queryFn: () => employeeService.getAll({ per_page: 1000 }),
  });

  const employees = React.useMemo(
    () => (Array.isArray(employeesData?.data) ? employeesData.data : []),
    [employeesData],
  );

  const departments = React.useMemo(() => {
    const deptSet = new Set<string>();
    employees.forEach((emp) => {
      if (emp.department?.name) {
        deptSet.add(emp.department.name);
      }
    });
    const deptArray = Array.from(deptSet).sort();
    return Array.isArray(deptArray) ? deptArray : [];
  }, [employees]);

  const hasActiveFilters = departmentFilter !== "all" || statusFilter !== "all";

  const filteredEmployees = React.useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employee_code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment =
        departmentFilter === "all" || emp.department?.name === departmentFilter;

      const matchesStatus =
        statusFilter === "all" || emp.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, searchQuery, departmentFilter, statusFilter]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize);

  const paginatedEmployees = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(startIndex, startIndex + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, departmentFilter, statusFilter, pageSize]);

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedEmployees.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedEmployees.map((e) => e.id)));
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

  return (
    <div className="w-full border rounded-md bg-card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b">
        <div className="flex items-center gap-2">
          <UserGroupIcon className="size-5 text-muted-foreground" />
          <span className="font-medium text-muted-foreground">
            Employee list
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <Input
              placeholder="Search Anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                  Department
                </p>
                <DropdownMenuCheckboxItem
                  checked={departmentFilter === "all"}
                  onCheckedChange={() => setDepartmentFilter("all")}
                >
                  All Departments
                </DropdownMenuCheckboxItem>
                {departments.map((dept) => (
                  <DropdownMenuCheckboxItem
                    key={dept}
                    checked={departmentFilter === dept}
                    onCheckedChange={() => setDepartmentFilter(dept)}
                  >
                    {dept}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
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
                    checked={statusFilter === status}
                    onCheckedChange={() => setStatusFilter(status)}
                  >
                    {status === "all" ? "All Statuses" : formatStatus(status)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuGroup>
              {hasActiveFilters && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={clearFilters}
                    className="text-destructive"
                  >
                    Clear all filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden sm:block w-px h-6 bg-border" />

          <Button variant="outline" className="gap-2">
            <ImportIcon className="size-5" />
            Import
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] pl-4">
                <Checkbox
                  checked={
                    selectedRows.size === paginatedEmployees.length &&
                    paginatedEmployees.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                User ID
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
                Job Title
              </TableHead>
              <TableHead className="hidden sm:table-cell min-w-[120px] text-muted-foreground font-medium">
                Joined Date
              </TableHead>
              <TableHead className="min-w-[100px] text-muted-foreground font-medium">
                Status
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
                  Loading employees...
                </TableCell>
              </TableRow>
            ) : paginatedEmployees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No employees found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmployees.map((employee) => {
                // Status badge is now handled by StatusBadge component
                return (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(employee.id)}
                        onCheckedChange={() => toggleSelectRow(employee.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-muted-foreground">
                      {employee.employee_code}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-5">
                          <AvatarFallback className="text-[10px] font-semibold">
                            {employee.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {employee.full_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {employee.email}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                        {employee.department?.name || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-xs font-medium text-secondary-foreground">
                        {employee.position?.name || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {new Date(employee.hire_date).toLocaleDateString(
                        "en-US",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={employee.status} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t">
        <div className="flex items-center gap-6">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ArrowLeftIcon className="size-5" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              if (i === 3 && totalPages > 5 && currentPage < totalPages - 2) {
                return (
                  <span key="ellipsis" className="px-3 py-1 text-sm">
                    ...
                  </span>
                );
              }

              if (i === 4 && totalPages > 5) {
                pageNum = totalPages;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => setCurrentPage(pageNum)}
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
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ArrowRightIcon className="size-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredEmployees.length)} of{" "}
            {filteredEmployees.length} entries
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 h-8 px-2.5 rounded-md border border-border bg-background hover:bg-muted shadow-xs text-sm font-medium">
              Show {pageSize}
              <ArrowRightIcon className="size-5 rotate-90" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() => setPageSize(size)}
                  className={cn(pageSize === size && "bg-muted")}
                >
                  Show {size}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
