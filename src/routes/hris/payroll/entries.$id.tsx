import { PayslipView } from "@/components/hris/payroll/payslip-view";
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth/route-guards";
import { payrollEntryService } from "@/services/payroll.service";
import { ArrowBack as ArrowLeft01Icon, FileDownload as FileExportIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/hris/payroll/entries/$id")({
  beforeLoad: requireAuth(),
  component: PayslipPage,
});

function PayslipPage() {
  const { id: entryId } = Route.useParams();
  const navigate = useNavigate();

  const { data: payrollEntry, isLoading } = useQuery({
    queryKey: ["payrollEntry", entryId],
    queryFn: () => payrollEntryService.getById(entryId),
  });

  const handleDownloadPayslip = async () => {
    try {
      const blob = await payrollEntryService.downloadPayslip(entryId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payslip-${payrollEntry?.payroll_entry_code || entryId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading payslip:", error);
      alert("Failed to download payslip");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!payrollEntry) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center">
        <p className="text-muted-foreground">Payslip not found</p>
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/hris/payroll", search: { tab: "runs" } })}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 border-b bg-background">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/hris/payroll", search: { tab: "runs" } })}
        >
          <ArrowLeft01Icon className="size-5" />
        </Button>
        <h1 className="flex-1 font-medium text-base">Payslip</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadPayslip}
          className="gap-2"
        >
          <FileExportIcon className="size-5" />
          Download PDF
        </Button>
      </header>
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <PayslipView payrollEntry={payrollEntry} />
      </main>
    </div>
  );
}
