import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth/route-guards";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollPeriodService } from "@/services/payroll.service";
import { PayrollPeriodsHeader } from "@/components/hris/payroll/payroll-periods-header";
import { PayrollPeriodsTable } from "@/components/hris/payroll/payroll-periods-table";
import { CreatePayrollPeriodForm } from "@/components/hris/payroll/create-payroll-period-form";
import { EditPayrollPeriodForm } from "@/components/hris/payroll/edit-payroll-period-form";
import type { CreatePayrollPeriodDto } from "@/types/payroll";
import type { UpdatePayrollPeriodDto } from "@/types/payroll";
import { toast } from "sonner";

export const Route = createFileRoute("/hris/payroll/periods")({
  beforeLoad: requireAuth(),
  component: PayrollPeriodsPage,
});

function PayrollPeriodsPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);

  const createPeriod = useMutation({
    mutationFn: payrollPeriodService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrollPeriods"] });
      toast.success("Payroll period created successfully");
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to create payroll period", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const updatePeriod = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePayrollPeriodDto }) =>
      payrollPeriodService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrollPeriods"] });
      toast.success("Payroll period updated successfully");
      setEditingPeriodId(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update payroll period", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const deletePeriod = useMutation({
    mutationFn: payrollPeriodService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrollPeriods"] });
      toast.success("Payroll period deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete payroll period", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const handleAddClick = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingPeriodId(id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this payroll period?")) {
      deletePeriod.mutate(id);
    }
  };

  const handleCreateSubmit = (data: CreatePayrollPeriodDto) => {
    createPeriod.mutate(data);
  };

  const handleUpdateSubmit = (data: UpdatePayrollPeriodDto) => {
    if (editingPeriodId) {
      updatePeriod.mutate({ id: editingPeriodId, data });
    }
  };

  return (
    <DashboardLayout>
      <PayrollPeriodsHeader onAddClick={handleAddClick} />
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
      >
        <PayrollPeriodsTable
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={deletePeriod.isPending}
        />
      </main>

      <CreatePayrollPeriodForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSubmit}
        isSubmitting={createPeriod.isPending}
      />

      {editingPeriodId && (
        <EditPayrollPeriodForm
          periodId={editingPeriodId}
          open={!!editingPeriodId}
          onOpenChange={(open) => !open && setEditingPeriodId(null)}
          onSubmit={handleUpdateSubmit}
          isSubmitting={updatePeriod.isPending}
        />
      )}
    </DashboardLayout>
  );
}

