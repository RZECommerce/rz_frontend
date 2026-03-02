import { payrollRunService } from "@/services/payroll.service";
import type { PayrollRunFilters } from "@/types/payroll";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PayrollRunsTable } from "./payroll-runs-table";

export function PayrollRunsTab() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PayrollRunFilters>({
    per_page: 8,
  });

  const processPayrollRun = useMutation({
    mutationFn: payrollRunService.process,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrollRuns"] });
      queryClient.invalidateQueries({ queryKey: ["payrollEntries"] });
    },
    onError: (error: unknown) => {
      console.error("Error processing payroll run:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to process payroll run: ${message}`);
    },
  });

  const approvePayrollRun = useMutation({
    mutationFn: payrollRunService.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrollRuns"] });
    },
    onError: (error: unknown) => {
      console.error("Error approving payroll run:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to approve payroll run: ${message}`);
    },
  });

  const deletePayrollRun = useMutation({
    mutationFn: payrollRunService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrollRuns"] });
    },
    onError: (error: unknown) => {
      console.error("Error deleting payroll run:", error);
      alert("Failed to delete payroll run");
    },
  });

  const reprocessPayrollRun = useMutation({
    mutationFn: payrollRunService.reprocess,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrollRuns"] });
      queryClient.invalidateQueries({ queryKey: ["payrollEntries"] });
      alert("Payroll run reprocessed successfully with all active employees!");
    },
    onError: (error: unknown) => {
      console.error("Error reprocessing payroll run:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to reprocess payroll run: ${message}`);
    },
  });

  const handleProcess = (id: string) => {
    if (
      confirm(
        "Are you sure you want to process this payroll run? This will calculate payroll for all employees.",
      )
    ) {
      processPayrollRun.mutate(id);
    }
  };

  const handleApprove = (id: string) => {
    if (confirm("Are you sure you want to approve this payroll run?")) {
      approvePayrollRun.mutate(id);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this payroll run?")) {
      deletePayrollRun.mutate(id);
    }
  };

  const handleReprocess = (id: string) => {
    if (
      confirm(
        "Are you sure you want to reprocess this payroll run? This will delete existing entries and recalculate payroll for ALL active employees.",
      )
    ) {
      reprocessPayrollRun.mutate(id);
    }
  };

  return (
    <PayrollRunsTable
      filters={filters}
      onFiltersChange={setFilters}
      onProcess={handleProcess}
      onApprove={handleApprove}
      onDelete={handleDelete}
      onReprocess={handleReprocess}
      isProcessing={processPayrollRun.isPending}
      isApproving={approvePayrollRun.isPending}
      isDeleting={deletePayrollRun.isPending}
      isReprocessing={reprocessPayrollRun.isPending}
    />
  );
}
