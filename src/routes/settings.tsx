import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SettingsPageTabs } from "@/components/settings/settings-page-tabs";
import { requireAuth } from "@/lib/auth/route-guards";
import { cn } from "@/lib/utils";
import { settingsService } from "@/services/settings.service";
import type { SettingsByCategory } from "@/types/settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  beforeLoad: requireAuth(),
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsService.getAll(),
  });

  const updateSettings = useMutation({
    mutationFn: async ({
      category,
      settings,
    }: {
      category: string;
      settings: Array<{
        id?: string;
        key: string;
        value: string | number | boolean | null;
      }>;
    }) => {
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

  const handleUpdate = (
    category: string,
    settings: Array<{
      id?: string;
      key: string;
      value: string | number | boolean | null;
    }>,
  ) => {
    updateSettings.mutate({ category, settings });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <main
          className={cn(
            "w-full flex-1 overflow-auto",
            "p-4 sm:p-6 space-y-6 sm:space-y-8",
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
          "p-4 sm:p-6 space-y-6 sm:space-y-8",
        )}
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Configure company and system settings. For HRIS settings (Payroll,
              Leave Policies, Attendance), visit{" "}
              <a href="/hris/settings" className="text-primary hover:underline">
                HRIS Settings
              </a>
              .
            </p>
          </div>
          <SettingsPageTabs
            settings={settings}
            onUpdate={handleUpdate}
            isUpdating={updateSettings.isPending}
          />
        </div>
      </main>
    </DashboardLayout>
  );
}
