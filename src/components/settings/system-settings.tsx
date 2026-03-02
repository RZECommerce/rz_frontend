
import * as React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SettingsGroup } from "@/types/settings";

interface SystemSettingsProps {
  settings: SettingsGroup;
  onUpdate: (settings: Array<{ id?: string; key: string; value: string | number | boolean | null }>) => void;
  isUpdating: boolean;
}

const TIMEZONES = [
  "Asia/Manila",
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Asia/Tokyo",
  "Asia/Singapore",
];

const CURRENCIES = ["PHP", "USD", "EUR", "GBP", "JPY", "SGD"];

const DATE_FORMATS = [
  { value: "Y-m-d", label: "YYYY-MM-DD" },
  { value: "m/d/Y", label: "MM/DD/YYYY" },
  { value: "d/m/Y", label: "DD/MM/YYYY" },
  { value: "M d, Y", label: "Jan 01, 2024" },
];

const TIME_FORMATS = [
  { value: "H:i", label: "24-hour (14:30)" },
  { value: "h:i A", label: "12-hour (2:30 PM)" },
];

export function SystemSettings({ settings, onUpdate, isUpdating }: SystemSettingsProps) {
  const generalSettings = settings.general || [];

  const defaultValues = React.useMemo(() => {
    const values: Record<string, string> = {};
    generalSettings.forEach((setting) => {
      values[setting.key] = String(setting.value ?? "");
    });
    return values;
  }, [generalSettings]);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues,
  });

  const onSubmit = (data: Record<string, string>) => {
    const updatedSettings = generalSettings.map((setting) => ({
      id: setting.id,
      key: setting.key,
      value: data[setting.key] || "",
    }));
    onUpdate(updatedSettings);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
          <CardDescription>
            Configure system-wide settings including timezone, currency, and date formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {generalSettings.map((setting) => (
            <div key={setting.key} className="space-y-2">
              <Label htmlFor={setting.key}>
                {setting.description || setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </Label>
              {setting.key === "timezone" ? (
                <Select
                  value={watch(setting.key)}
                  onValueChange={(value) => setValue(setting.key, value || "")}
                >
                  <SelectTrigger id={setting.key}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : setting.key === "currency" ? (
                <Select
                  value={watch(setting.key)}
                  onValueChange={(value) => setValue(setting.key, value || "")}
                >
                  <SelectTrigger id={setting.key}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : setting.key === "date_format" ? (
                <Select
                  value={watch(setting.key)}
                  onValueChange={(value) => setValue(setting.key, value || "")}
                >
                  <SelectTrigger id={setting.key}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_FORMATS.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : setting.key === "time_format" ? (
                <Select
                  value={watch(setting.key)}
                  onValueChange={(value) => setValue(setting.key, value || "")}
                >
                  <SelectTrigger id={setting.key}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_FORMATS.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={setting.key}
                  {...register(setting.key)}
                  placeholder={setting.description}
                />
              )}
              {errors[setting.key] && (
                <p className="text-sm text-destructive">
                  {errors[setting.key]?.message as string}
                </p>
              )}
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

