import { DashboardContent } from "@/components/hris/dashboard/content";
import { DashboardHeader } from "@/components/hris/dashboard/header";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { requireAuth } from "@/lib/auth/route-guards";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/hris/dashboard")({
  beforeLoad: requireAuth(),
  component: HrisDashboardPage,
});

function HrisDashboardPage() {
  return (
    <DashboardLayout>
      <DashboardHeader />
      <DashboardContent />
    </DashboardLayout>
  );
}
