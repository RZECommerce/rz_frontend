import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth/route-guards";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { salaryComponentService } from "@/services/payroll.service";
import { SalaryComponentsHeader } from "@/components/hris/payroll/salary-components-header";
import { SalaryComponentsTable } from "@/components/hris/payroll/salary-components-table";
import { CreateSalaryComponentForm } from "@/components/hris/payroll/create-salary-component-form";
import { EditSalaryComponentForm } from "@/components/hris/payroll/edit-salary-component-form";
import type { CreateSalaryComponentFormData } from "@/components/hris/payroll/create-salary-component-form";
import type { UpdateSalaryComponentFormData } from "@/components/hris/payroll/edit-salary-component-form";
import { toast } from "sonner";

export const Route = createFileRoute("/hris/payroll/salary-components")({
  beforeLoad: requireAuth(),
  component: SalaryComponentsPage,
});

function SalaryComponentsPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null);

  const createComponent = useMutation({
    mutationFn: salaryComponentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaryComponents"] });
      toast.success("Salary component created successfully");
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to create salary component", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const updateComponent = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSalaryComponentFormData }) =>
      salaryComponentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaryComponents"] });
      toast.success("Salary component updated successfully");
      setEditingComponentId(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update salary component", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const deleteComponent = useMutation({
    mutationFn: salaryComponentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaryComponents"] });
      toast.success("Salary component deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete salary component", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const handleAddClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingComponentId(id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this salary component?")) {
      deleteComponent.mutate(id);
    }
  };

  const handleCreateSubmit = (data: CreateSalaryComponentFormData) => {
    createComponent.mutate(data);
  };

  const handleUpdateSubmit = (data: UpdateSalaryComponentFormData) => {
    if (editingComponentId) {
      updateComponent.mutate({ id: editingComponentId, data });
    }
  };

  return (
    <DashboardLayout>
      <SalaryComponentsHeader onAddClick={handleAddClick} />
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
      >
        <SalaryComponentsTable
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={deleteComponent.isPending}
        />
      </main>

      <CreateSalaryComponentForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSubmit}
        isSubmitting={createComponent.isPending}
      />

      {editingComponentId && (
        <EditSalaryComponentForm
          componentId={editingComponentId}
          open={!!editingComponentId}
          onOpenChange={(open) => !open && setEditingComponentId(null)}
          onSubmit={handleUpdateSubmit}
          isSubmitting={updateComponent.isPending}
        />
      )}
    </DashboardLayout>
  );
}

