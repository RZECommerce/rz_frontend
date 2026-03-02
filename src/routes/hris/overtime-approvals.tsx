import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { OvertimeApprovalHeader } from "@/components/hris/overtime-approvals/overtime-approval-header";
import { OvertimeApprovalStats } from "@/components/hris/overtime-approvals/overtime-approval-stats";
import { OvertimeApprovalTable } from "@/components/hris/overtime-approvals/overtime-approval-table";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { cn } from "@/lib/utils";
import { requireAuth } from "@/lib/auth/route-guards";
import type { OvertimeRequestFilters } from "@/types/overtime-request";

export const Route = createFileRoute("/hris/overtime-approvals")({
  beforeLoad: requireAuth(),
  component: OvertimeApprovalsPage,
});

function OvertimeApprovalsPage() {
  const [filters, setFilters] = useState<OvertimeRequestFilters>({
    per_page: 50,
    page: 1,
  });

  const handleExport = async () => {
    // TODO: Implement export functionality for overtime requests
    console.log("Exporting overtime requests...");
  };

  return (
    <DashboardLayout>
      <OvertimeApprovalHeader onExport={handleExport} />
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
      >
        <OvertimeApprovalStats filters={filters} />
        <OvertimeApprovalTable filters={filters} onFiltersChange={setFilters} />
      </main>
    </DashboardLayout>
  );
}
