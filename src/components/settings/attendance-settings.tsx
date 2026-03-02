
import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SettingsGroup } from "@/types/settings";

interface AttendanceSettingsProps {
  settings: SettingsGroup;
  onUpdate: (settings: Array<{ id?: string; key: string; value: string | number | boolean | null }>) => void;
  isUpdating: boolean;
}

export function AttendanceSettings({ settings, onUpdate, isUpdating }: AttendanceSettingsProps) {
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
    timing: "Attendance Timing",
  };

  const getInputType = (setting: typeof allSettings[0]) => {
    if (setting.type === "number") {
      return "number";
    }
    if (setting.key === "attendance_expected_time_in") {
      return "time";
    }
    return "text";
  };

  const getInputStep = (setting: typeof allSettings[0]) => {
    if (setting.type === "number") {
      return "1";
    }
    return undefined;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {Object.entries(groupedSettings).map(([group, groupSettings]) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle>{groupLabels[group] || group.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</CardTitle>
            <CardDescription>
              Configure attendance timing thresholds and expected work hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupSettings.map((setting) => (
              <div key={setting.key} className="space-y-2">
                <Label htmlFor={setting.key}>
                  {setting.description || setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </Label>
                <div className="space-y-1">
                  <Input
                    id={setting.key}
                    type={getInputType(setting)}
                    step={getInputStep(setting)}
                    min={setting.type === "number" ? 0 : undefined}
                    {...register(setting.key, {
                      required: setting.type === "number" ? "This field is required" : false,
                      min: setting.type === "number" ? { value: 0, message: "Must be 0 or greater" } : undefined,
                    })}
                    placeholder={setting.description}
                  />
                  {setting.key === "attendance_expected_time_in" && (
                    <p className="text-xs text-muted-foreground">
                      Use 24-hour format (e.g., 09:00 for 9:00 AM, 13:30 for 1:30 PM)
                    </p>
                  )}
                  {setting.key === "attendance_early_bird_minutes" && (
                    <p className="text-xs text-muted-foreground">
                      Employees arriving this many minutes or more before expected time will be marked as early
                    </p>
                  )}
                  {setting.key === "attendance_late_tolerance_minutes" && (
                    <p className="text-xs text-muted-foreground">
                      Employees arriving within this many minutes after expected time will still be considered on time
                    </p>
                  )}
                </div>
                {errors[setting.key] && (
                  <p className="text-sm text-destructive">
                    {errors[setting.key]?.message as string}
                  </p>
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
  );
}

