
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useHasPermission } from "@/hooks/use-permissions";
import { StatusBadge } from "@/lib/utils/status-badge";
import { payrollRunService } from "@/services/payroll.service";
import type { PayrollRun } from "@/types/payroll";
import {
    ArrowBack as ArrowLeft01Icon,
    CheckCircle as CheckmarkCircle01Icon,
    FileDownload as FileExportIcon,
    PlayArrow as PlayIcon,
    Menu as SidebarLeft01Icon,
} from "@mui/icons-material";

interface PayrollRunDetailHeaderProps {
  payrollRun: PayrollRun;
  onBack: () => void;
  onProcess: () => void;
  onApprove: () => void;
  isProcessing: boolean;
  isApproving: boolean;
}

export function PayrollRunDetailHeader({
  payrollRun,
  onBack,
  onProcess,
  onApprove,
  isProcessing,
  isApproving,
}: PayrollRunDetailHeaderProps) {
  const canProcess = useHasPermission("payroll.process");
  const canApprove = useHasPermission("payroll.approve");
  const canExport = useHasPermission("payroll.export");
  
  // Status badge is now handled by StatusBadge component

  return (
    <header className="w-full flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-4 border-b bg-background">
      <div className="flex items-center gap-3 flex-1">
        <SidebarTrigger className="lg:hidden">
          <SidebarLeft01Icon className="size-5" />
        </SidebarTrigger>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft01Icon className="size-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-medium text-base">{payrollRun.payroll_run_code}</h1>
          <p className="text-sm text-muted-foreground">
            {payrollRun.payroll_period?.name || "No period"}
          </p>
        </div>
        <StatusBadge status={payrollRun.status}>
          {payrollRun.status.toUpperCase()}
        </StatusBadge>
      </div>

      <div className="flex items-center gap-2">
        {payrollRun.status === "draft" && canProcess && (
          <Button
            variant="default"
            size="sm"
            onClick={onProcess}
            disabled={isProcessing}
            className="gap-2"
          >
            <PlayIcon className="size-5" />
            {isProcessing ? "Processing..." : "Process Payroll"}
          </Button>
        )}
        {payrollRun.status === "processing" && canApprove && (
          <Button
            variant="default"
            size="sm"
            onClick={onApprove}
            disabled={isApproving}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckmarkCircle01Icon className="size-5" />
            {isApproving ? "Approving..." : "Approve"}
          </Button>
        )}
        {(payrollRun.status === "approved" || payrollRun.status === "paid") && canExport && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={async () => {
              try {
                const blob = await payrollRunService.export(payrollRun.id);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `payroll-run-${payrollRun.payroll_run_code}-${new Date().toISOString().split("T")[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              } catch (error) {
                console.error("Error exporting payroll run:", error);
                alert("Failed to export payroll run");
              }
            }}
          >
            <FileExportIcon className="size-5" />
            Export CSV
          </Button>
        )}
      </div>
    </header>
  );
}

