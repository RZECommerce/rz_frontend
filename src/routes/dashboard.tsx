import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { requireAuth } from "@/lib/auth/route-guards";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: requireAuth(),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <DashboardLayout>
      <main
        className={cn(
          "w-full flex-1 overflow-auto bg-background",
          "p-2 space-y-2 h-full",
        )}
        style={{ scrollbarGutter: "stable" }}
      >
        {/* Dashboard content to be added later */}
      </main>
    </DashboardLayout>
  );
}
