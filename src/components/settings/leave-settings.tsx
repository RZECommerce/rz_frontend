
import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SettingsGroup } from "@/types/settings";

interface LeaveSettingsProps {
  settings: SettingsGroup;
  onUpdate: (settings: Array<{ id?: string; key: string; value: string | number | boolean | null }>) => void;
  isUpdating: boolean;
}

export function LeaveSettings({ settings, onUpdate, isUpdating }: LeaveSettingsProps) {
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
      if (setting.type === "boolean") {
        values[setting.key] = setting.value ? "true" : "false";
      } else {
        values[setting.key] = String(setting.value ?? "");
      }
    });
    return values;
  }, [allSettings]);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues,
  });

  const onSubmit = (data: Record<string, string>) => {
    const updatedSettings = allSettings.map((setting) => {
      const value = data[setting.key];
      let parsedValue: string | number | boolean = value;

      if (setting.type === "number") {
        parsedValue = parseInt(value, 10) || 0;
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
    accrual: "Leave Accrual",
    policies: "Leave Policies",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {Object.entries(groupedSettings).map(([group, groupSettings]) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle>{groupLabels[group] || group.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</CardTitle>
            <CardDescription>
              Configure {groupLabels[group] || group} settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupSettings.map((setting) => (
              <div key={setting.key} className="space-y-2">
                {setting.type === "boolean" ? (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={setting.key}
                      checked={watch(setting.key) === "true"}
                      onCheckedChange={(checked) => setValue(setting.key, checked ? "true" : "false")}
                    />
                    <Label htmlFor={setting.key} className="cursor-pointer">
                      {setting.description || setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Label>
                  </div>
                ) : setting.key === "leave_accrual_method" ? (
                  <div className="space-y-2">
                    <Label htmlFor={setting.key}>
                      {setting.description || setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Label>
                    <Select
                      value={watch(setting.key)}
                      onValueChange={(value) => setValue(setting.key, value || "")}
                    >
                      <SelectTrigger id={setting.key}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="upfront">Upfront</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor={setting.key}>
                      {setting.description || setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Label>
                    <Input
                      id={setting.key}
                      type={setting.type === "number" ? "number" : "text"}
                      {...register(setting.key)}
                      placeholder={setting.description}
                    />
                    {errors[setting.key] && (
                      <p className="text-sm text-destructive">
                        {errors[setting.key]?.message as string}
                      </p>
                    )}
                  </div>
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

