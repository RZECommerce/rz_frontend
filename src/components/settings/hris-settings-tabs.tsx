import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PayrollSettings } from "./payroll-settings";
import { LeaveSettings } from "./leave-settings";
import { AttendanceSettings } from "./attendance-settings";
import type { SettingsByCategory } from "@/types/settings";

interface HrisSettingsTabsProps {
  settings: SettingsByCategory;
  onUpdate: (category: string, settings: Array<{ id?: string; key: string; value: string | number | boolean | null }>) => void;
  isUpdating: boolean;
}

export function HrisSettingsTabs({ settings, onUpdate, isUpdating }: HrisSettingsTabsProps) {
  return (
    <Tabs defaultValue="payroll" className="w-full">
      <TabsList className="grid min-h-11 w-full grid-cols-3 items-stretch rounded-xl border border-border bg-muted/30 p-1.5">
        <TabsTrigger value="payroll" className="flex h-full min-h-8 items-center">
          Payroll
        </TabsTrigger>
        <TabsTrigger value="leave" className="flex h-full min-h-8 items-center">
          Leave Policies
        </TabsTrigger>
        <TabsTrigger value="attendance" className="flex h-full min-h-8 items-center">
          Attendance
        </TabsTrigger>
      </TabsList>

      <TabsContent value="payroll" className="mt-0">
        <PayrollSettings
          settings={settings.payroll || {}}
          onUpdate={(updatedSettings) => onUpdate("payroll", updatedSettings)}
          isUpdating={isUpdating}
        />
      </TabsContent>

      <TabsContent value="leave" className="mt-0">
        <LeaveSettings
          settings={settings.leave || {}}
          onUpdate={(updatedSettings) => onUpdate("leave", updatedSettings)}
          isUpdating={isUpdating}
        />
      </TabsContent>

      <TabsContent value="attendance" className="mt-0">
        <AttendanceSettings
          settings={settings.attendance || {}}
          onUpdate={(updatedSettings) => onUpdate("attendance", updatedSettings)}
          isUpdating={isUpdating}
        />
      </TabsContent>
    </Tabs>
  );
}
