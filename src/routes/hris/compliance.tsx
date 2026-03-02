import { HrPoliciesTable } from "@/components/hris/compliance/hr-policies-table";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { requireAuth } from "@/lib/auth/route-guards";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/hris/compliance")({
  beforeLoad: requireAuth(),
  component: CompliancePage,
});

function CompliancePage() {
  return (
    <DashboardLayout>
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
      >
        <div>
          <h1 className="text-2xl font-bold">Compliance</h1>
          <p className="text-muted-foreground">
            Manage HR policies, compliance tracking, and regulatory requirements
          </p>
        </div>

        <HrPoliciesTable />
      </main>
    </DashboardLayout>
  );
}
