
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanySettings } from "./company-settings";
import { SystemSettings } from "./system-settings";
import type { SettingsByCategory } from "@/types/settings";

interface SettingsPageTabsProps {
  settings: SettingsByCategory;
  onUpdate: (category: string, settings: Array<{ id?: string; key: string; value: string | number | boolean | null }>) => void;
  isUpdating: boolean;
}

export function SettingsPageTabs({ settings, onUpdate, isUpdating }: SettingsPageTabsProps) {
  return (
    <Tabs defaultValue="company" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="company">Company</TabsTrigger>
        <TabsTrigger value="system">System</TabsTrigger>
      </TabsList>

      <TabsContent value="company" className="mt-6">
        <CompanySettings
          settings={settings.company || {}}
          onUpdate={(updatedSettings) => onUpdate("company", updatedSettings)}
          isUpdating={isUpdating}
        />
      </TabsContent>

      <TabsContent value="system" className="mt-6">
        <SystemSettings
          settings={settings.system || {}}
          onUpdate={(updatedSettings) => onUpdate("system", updatedSettings)}
          isUpdating={isUpdating}
        />
      </TabsContent>
    </Tabs>
  );
}

