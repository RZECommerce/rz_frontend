
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiBaseUrlForUrls } from "@/lib/api/client";
import { settingsService } from "@/services/settings.service";
import type { SettingsGroup } from "@/types/settings";
import { Cancel as Cancel01Icon, Upload as Upload01Icon } from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface CompanySettingsProps {
  settings: SettingsGroup;
  onUpdate: (settings: Array<{ id?: string; key: string; value: string | number | boolean | null }>) => void;
  isUpdating: boolean;
}

export function CompanySettings({ settings, onUpdate, isUpdating }: CompanySettingsProps) {
  const queryClient = useQueryClient();
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const generalSettings = React.useMemo(() => settings.general || [], [settings.general]);
  const logoSetting = React.useMemo(() => generalSettings.find((s) => s.key === "company_logo"), [generalSettings]);
  const logoUrl = React.useMemo(() => logoSetting?.value as string | undefined, [logoSetting]);

  React.useEffect(() => {
    if (logoUrl) {
      // If it's a full URL, use it directly; otherwise construct the storage URL
      if (logoUrl.startsWith("http")) {
        setLogoPreview(logoUrl);
      } else {
        // Assuming the backend returns the full URL, but if not, construct it
        // Use centralized API URL helper
        const apiBaseUrl = getApiBaseUrlForUrls();
        setLogoPreview(apiBaseUrl ? `${apiBaseUrl}/storage/${logoUrl}` : `/storage/${logoUrl}`);
      }
    } else {
      setLogoPreview(null);
    }
  }, [logoUrl]);

  const uploadLogo = useMutation({
    mutationFn: settingsService.uploadLogo,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setLogoPreview(data.url);
      toast.success("Logo uploaded successfully.");
    },
    onError: (error: Error) => {
      toast.error("Failed to upload logo.", {
        description: error.message || "An unknown error occurred.",
      });
    },
  });

  const defaultValues = React.useMemo(() => {
    const values: Record<string, string> = {};
    generalSettings
      .filter((s) => s.key !== "company_logo")
      .forEach((setting) => {
        values[setting.key] = String(setting.value ?? "");
      });
    return values;
  }, [generalSettings]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues,
  });

  const onSubmit = (data: Record<string, string>) => {
    const updatedSettings = generalSettings
      .filter((s) => s.key !== "company_logo")
      .map((setting) => ({
        id: setting.id,
        key: setting.key,
        value: data[setting.key] || "",
      }));
    onUpdate(updatedSettings);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file.");
        return;
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB.");
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload logo
      uploadLogo.mutate(file);
    }
  };

  const handleRemoveLogo = () => {
    if (confirm("Are you sure you want to remove the logo?")) {
      // Update setting to empty
      if (logoSetting) {
        onUpdate([{ id: logoSetting.id, key: "company_logo", value: "" }]);
      }
      setLogoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
          <CardDescription>
            Upload your company logo. Recommended size: 200x200px. Max file size: 2MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-20">
                <AvatarImage src={logoPreview || undefined} alt="Company Logo" />
                <AvatarFallback className="bg-linear-to-br from-purple-400 via-pink-500 to-red-500 text-white text-lg font-semibold">
                  {generalSettings.find((s) => s.key === "company_name")?.value?.toString().charAt(0).toUpperCase() || "C"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadLogo.isPending}
                  >
                    <Upload01Icon className="size-5 mr-2" />
                    {logoPreview ? "Change Logo" : "Upload Logo"}
                  </Button>
                  {logoPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveLogo}
                      disabled={uploadLogo.isPending}
                    >
                      <Cancel01Icon className="size-5 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or SVG. Max 2MB
                </p>
              </div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="hidden"
          />
          {uploadLogo.isPending && (
            <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
          )}
        </CardContent>
      </Card>

      {/* Company Information Card */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Manage your company details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generalSettings
              .filter((s) => s.key !== "company_logo")
              .map((setting) => (
                <div key={setting.key} className="space-y-2">
                  <Label htmlFor={setting.key}>
                    {setting.description || setting.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Label>
                  <Input
                    id={setting.key}
                    {...register(setting.key)}
                    placeholder={setting.description}
                  />
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
    </div>
  );
}
