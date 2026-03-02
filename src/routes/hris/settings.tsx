import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth/route-guards";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import { HrisSettingsTabs } from "@/components/settings/hris-settings-tabs";
import { toast } from "sonner";
import type { SettingsByCategory } from "@/types/settings";

export const Route = createFileRoute("/hris/settings")({
  beforeLoad: requireAuth(),
  component: HrisSettingsPage,
});

function HrisSettingsPage() {
  const queryClient = useQueryClient();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsService.getAll(),
  });

  const updateSettings = useMutation({
    mutationFn: async ({ category, settings }: { category: string; settings: Array<{ id?: string; key: string; value: string | number | boolean | null }> }) => {
      return settingsService.update({ settings });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update settings", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const handleUpdate = (category: string, settings: Array<{ id?: string; key: string; value: string | number | boolean | null }>) => {
    updateSettings.mutate({ category, settings });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <main
          className={cn(
            "w-full flex-1 overflow-auto",
            "p-4 sm:p-6 space-y-6 sm:space-y-8"
          )}
          style={{ scrollbarGutter: "stable" }}
        >
          <div className="flex flex-col h-full w-full items-center justify-center">
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  const settings: SettingsByCategory = settingsData?.data || {};

  return (
    <DashboardLayout>
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">HRIS Settings</h1>
            <p className="text-muted-foreground">
              Configure HRIS-related settings including payroll, leave policies, and attendance.
            </p>
          </div>
          <HrisSettingsTabs
            settings={settings}
            onUpdate={handleUpdate}
            isUpdating={updateSettings.isPending}
          />
        </div>
      </main>
    </DashboardLayout>
  );
}
