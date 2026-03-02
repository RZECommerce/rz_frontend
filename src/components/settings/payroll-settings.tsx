
import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BirTaxTableEditable } from "./bir-tax-table-editable";
import { HolidayRatesTable } from "./holiday-rates-table";
import { ComputationLegends } from "./computation-legends";
import type { SettingsGroup } from "@/types/settings";

interface PayrollSettingsProps {
  settings: SettingsGroup;
  onUpdate: (settings: Array<{ id?: string; key: string; value: string | number | boolean | null }>) => void;
  isUpdating: boolean;
}

export function PayrollSettings({ settings, onUpdate, isUpdating }: PayrollSettingsProps) {
  const allSettings = React.useMemo(() => {
    const flat: Array<{ id?: string; key: string; value: string | number | boolean | null; type: string; description?: string; group: string }> = [];
    Object.entries(settings).forEach(([group, groupSettings]) => {
      groupSettings.forEach((setting) => {
        flat.push({ ...setting, group });
      });
    });
    return flat;
  }, [settings]);

  const defaultValues = React.useMemo(() => {
    const values: Record<string, string> = {};
    allSettings.forEach((setting) => {
      values[setting.key] = String(setting.value ?? "");
    });
    return values;
  }, [allSettings]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues,
  });

  const onSubmit = (data: Record<string, string>) => {
    const updatedSettings = allSettings.map((setting) => {
      const value = data[setting.key];
      let parsedValue: string | number | boolean = value;

      if (setting.type === "number") {
        parsedValue = parseFloat(value) || 0;
      } else if (setting.type === "boolean") {
        parsedValue = value === "true" || value === "1";
      }

      return {
        id: setting.id,
        key: setting.key,
        value: parsedValue,
      };
    });
    onUpdate(updatedSettings);
  };

  const groupedSettings = React.useMemo(() => {
    const groups: Record<string, typeof allSettings> = {};
    allSettings.forEach((setting) => {
      if (!groups[setting.group]) {
        groups[setting.group] = [];
      }
      groups[setting.group].push(setting);
    });
    return groups;
  }, [allSettings]);

  const groupLabels: Record<string, string> = {
    payroll_period: "Payroll Period",
    working_hours: "Working Hours",
    pay_rates: "Pay Rates",
    dole_holiday_rates: "DOLE Holiday Rates",
    sss: "SSS Configuration",
    philhealth: "PhilHealth Configuration",
    pagibig: "Pag-IBIG Configuration",
    bir_tax: "BIR Tax Configuration",
    computation_legends: "Computation Legends",
  };

  return (
    <Tabs defaultValue="settings" className="space-y-6">
      <TabsList className="w-full">
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="tax-table">BIR Tax Table</TabsTrigger>
        <TabsTrigger value="holiday-rates">Holiday Rates</TabsTrigger>
        <TabsTrigger value="legends">Computation Legends</TabsTrigger>
      </TabsList>

      <TabsContent value="settings" className="space-y-6 mt-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {Object.entries(groupedSettings)
            .filter(([group]) => !["dole_holiday_rates", "bir_tax", "computation_legends"].includes(group))
            .map(([group, groupSettings]) => (
              <Card key={group}>
                <CardHeader>
                  <CardTitle>
                    {groupLabels[group] || group.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </CardTitle>
                  <CardDescription>Configure {groupLabels[group] || group} settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {groupSettings.map((setting) => (
                    <div key={setting.key} className="space-y-2">
                      <Label htmlFor={setting.key}>
                        {setting.description || setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Label>
                      <Input
                        id={setting.key}
                        type={setting.type === "number" ? "number" : "text"}
                        step={setting.type === "number" ? "0.01" : undefined}
                        {...register(setting.key)}
                        placeholder={setting.description}
                      />
                      {errors[setting.key] && (
                        <p className="text-sm text-destructive">{errors[setting.key]?.message as string}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

          <div className="flex justify-end">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="tax-table">
        <BirTaxTableEditable />
      </TabsContent>

      <TabsContent value="holiday-rates">
        <HolidayRatesTable />
      </TabsContent>

      <TabsContent value="legends">
        <ComputationLegends />
      </TabsContent>
    </Tabs>
  );
}

