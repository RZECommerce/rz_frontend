import { requireAuth } from "@/lib/auth/route-guards";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deductionService } from "@/services/payroll.service";
import { DeductionsHeader } from "@/components/hris/payroll/deductions-header";
import { DeductionsTable } from "@/components/hris/payroll/deductions-table";
import { CreateDeductionForm } from "@/components/hris/payroll/create-deduction-form";
import { EditDeductionForm } from "@/components/hris/payroll/edit-deduction-form";
import type { CreateDeductionFormData } from "@/components/hris/payroll/create-deduction-form";
import type { UpdateDeductionFormData } from "@/components/hris/payroll/edit-deduction-form";
import { toast } from "sonner";

export const Route = createFileRoute("/hris/payroll/deductions")({
  beforeLoad: requireAuth(),
  component: DeductionsPage,
});

function DeductionsPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDeductionId, setEditingDeductionId] = useState<string | null>(null);

  const createDeduction = useMutation({
    mutationFn: deductionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deductions"] });
      toast.success("Deduction created successfully");
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to create deduction", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const updateDeduction = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeductionFormData }) =>
      deductionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deductions"] });
      toast.success("Deduction updated successfully");
      setEditingDeductionId(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update deduction", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const deleteDeduction = useMutation({
    mutationFn: deductionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deductions"] });
      toast.success("Deduction deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete deduction", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const handleAddClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingDeductionId(id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this deduction?")) {
      deleteDeduction.mutate(id);
    }
  };

  const handleCreateSubmit = (data: CreateDeductionFormData) => {
    createDeduction.mutate(data);
  };

  const handleUpdateSubmit = (data: UpdateDeductionFormData) => {
    if (editingDeductionId) {
      updateDeduction.mutate({ id: editingDeductionId, data });
    }
  };

  return (
    <DashboardLayout>
      <DeductionsHeader onAddClick={handleAddClick} />
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
      >
        <DeductionsTable
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={deleteDeduction.isPending}
        />
      </main>

      <CreateDeductionForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSubmit}
        isSubmitting={createDeduction.isPending}
      />

      {editingDeductionId && (
        <EditDeductionForm
          deductionId={editingDeductionId}
          open={!!editingDeductionId}
          onOpenChange={(open) => !open && setEditingDeductionId(null)}
          onSubmit={handleUpdateSubmit}
          isSubmitting={updateDeduction.isPending}
        />
      )}
    </DashboardLayout>
  );
}
