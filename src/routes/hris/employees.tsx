import { CreateEmployeeForm } from "@/components/hris/employees/forms/create-employee-form";
import { ViewEmployeeModal } from "@/components/hris/employees/details/view-employee-modal";
import { EmployeesHeader } from "@/components/hris/employees/employees-header";
import { EmployeesStats } from "@/components/hris/employees/employees-stats";
import { EmployeesTable } from "@/components/hris/employees/tables/employees-table";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { requireAuth } from "@/lib/auth/route-guards";
import { cn } from "@/lib/utils";
import { employeeService } from "@/services/employee.service";
import type {
  CreateEmployeeDto,
  Employee,
  UpdateEmployeeDto,
} from "@/types/employee";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/hris/employees")({
  beforeLoad: requireAuth(),
  component: EmployeesPage,
});

function EmployeesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // Allow optional/loose search params so we can read createForUser when present
  const searchParams = useSearch({ strict: false }) as Record<string, unknown>;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewingEmployeeId, setViewingEmployeeId] = useState<string | null>(null);
  const [preSelectedUserId, setPreSelectedUserId] = useState<string | null>(null);

  // Handle pre-selected user from query parameter
  useEffect(() => {
    const createForUser = (searchParams as any)?.createForUser;
    if (createForUser) {
      setPreSelectedUserId(String(createForUser));
      setIsCreateDialogOpen(true);
    }
  }, [searchParams]);

  const createEmployee = useMutation({
    mutationFn: (data: CreateEmployeeDto) => employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee created successfully.");
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to create employee.", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });


  const deleteEmployee = useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee deleted successfully.");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete employee.", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });

  const handleAddClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleViewOrEdit = (employee: Employee, mode: "view" | "edit") => {
    if (mode === "edit") {
      // Navigate to employee detail page for editing
      navigate({ to: "/hris/employees/$id", params: { id: employee.id } });
    } else {
      setViewingEmployeeId(employee.id);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      deleteEmployee.mutate(id);
    }
  };

  return (
    <DashboardLayout>
      <EmployeesHeader onAddClick={handleAddClick} />
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
      >
        <EmployeesStats />
        <EmployeesTable
          search={search}
          statusFilter={statusFilter}
          onSearchChange={setSearch}
          onStatusFilterChange={setStatusFilter}
          onViewOrEdit={handleViewOrEdit}
          onDelete={handleDelete}
        />
      </main>

      <CreateEmployeeForm
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setPreSelectedUserId(null);
          }
        }}
        onSubmit={createEmployee.mutate}
        isSubmitting={createEmployee.isPending}
        preSelectedUserId={preSelectedUserId}
      />

      <ViewEmployeeModal
        open={!!viewingEmployeeId}
        onOpenChange={(open) => {
          if (!open) {
            setViewingEmployeeId(null);
          }
        }}
        employeeId={viewingEmployeeId}
      />
    </DashboardLayout>
  );
}
