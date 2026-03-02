import { PayrollEntriesTable } from "@/components/hris/payroll/payroll-entries-table";
import { PayrollRunDetailHeader } from "@/components/hris/payroll/payroll-run-detail-header";
import { PayrollRunSummary } from "@/components/hris/payroll/payroll-run-summary";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth/route-guards";
import { cn } from "@/lib/utils";
import { payrollRunService } from "@/services/payroll.service";
import { ArrowBack as ArrowLeft01Icon } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/hris/payroll/runs/$id")({
  beforeLoad: requireAuth(),
  component: PayrollRunDetailPage,
});

function PayrollRunDetailPage() {
  const { id: runId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: payrollRun, isLoading: isLoadingRun } = useQuery({
    queryKey: ["payrollRun", runId],
    queryFn: () => payrollRunService.getById(runId),
  });

  const processPayrollRun = useMutation({
    mutationFn: payrollRunService.process,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payrollRun", runId] });
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
      queryClient.invalidateQueries({ queryKey: ["payrollRun", runId] });
      queryClient.invalidateQueries({ queryKey: ["payrollRuns"] });
    },
    onError: (error: unknown) => {
      console.error("Error approving payroll run:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to approve payroll run: ${message}`);
    },
  });

  const handleProcess = () => {
    if (
      confirm(
        "Are you sure you want to process this payroll run? This will calculate payroll for all employees."
      )
    ) {
      processPayrollRun.mutate(runId);
    }
  };

  const handleApprove = () => {
    if (confirm("Are you sure you want to approve this payroll run?")) {
      approvePayrollRun.mutate(runId);
    }
  };

  if (isLoadingRun) {
    return (
      <DashboardLayout>
        <div className="flex items-center gap-4 px-4 sm:px-6 py-4 border-b bg-background">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/hris/payroll", search: { tab: "runs" } })}
          >
            <ArrowLeft01Icon className="size-5" />
          </Button>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </div>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="space-y-6">
            <div className="h-32 bg-muted animate-pulse rounded-xl" />
            <div className="h-96 bg-muted animate-pulse rounded-xl" />
          </div>
        </main>
      </DashboardLayout>
    );
  }

  if (!payrollRun) {
    return (
      <DashboardLayout>
        <div className="flex flex-col h-full w-full items-center justify-center">
          <p className="text-muted-foreground">Payroll run not found</p>
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/hris/payroll", search: { tab: "runs" } })}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PayrollRunDetailHeader
        payrollRun={payrollRun}
        onBack={() => navigate({ to: "/hris/payroll", search: { tab: "runs" } })}
        onProcess={handleProcess}
        onApprove={handleApprove}
        isProcessing={processPayrollRun.isPending}
        isApproving={approvePayrollRun.isPending}
      />
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
      >
        <PayrollRunSummary payrollRun={payrollRun} />
        <PayrollEntriesTable payrollRunId={runId} />
      </main>
    </DashboardLayout>
  );
}
