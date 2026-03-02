import { DashboardContent } from "@/components/hris/dashboard/content";
import { DashboardHeader } from "@/components/hris/dashboard/header";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { requireAuth } from "@/lib/auth/route-guards";
import { cn } from "@/lib/utils";
import { useRbacStore } from "@/stores/rbac";
import { createFileRoute, Navigate, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/$module")({
  beforeLoad: requireAuth(),
  component: ModuleDashboardPage,
});

function ModuleDashboardPage() {
  const { module } = useParams({ from: "/dashboard/$module" });
  const { hasPermission, getAllModules } = useRbacStore();
  const modules = getAllModules();

  // Check if user has permission for this module
  const hasModulePermission =
    modules.includes(module) ||
    hasPermission(`${module}.view`) ||
    hasPermission(`${module}.dashboard`);

  // If no permission, redirect to global dashboard
  if (!hasModulePermission && module !== "hris") {
    return <Navigate to="/dashboard" />;
  }

  // HRIS dashboard (special case - shows HRIS content)
  if (module === "hris") {
    return (
      <DashboardLayout>
        <DashboardHeader />
        <DashboardContent />
      </DashboardLayout>
    );
  }

  // Module-specific dashboard
  return (
    <DashboardLayout>
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
      >
        <div className="space-y-4">
          <h1 className="text-2xl font-bold capitalize">{module} Dashboard</h1>
          <p className="text-muted-foreground">
            {/* Module-specific dashboard content will be added here */}
            Dashboard content for {module} module.
          </p>
        </div>
      </main>
    </DashboardLayout>
  );
}
