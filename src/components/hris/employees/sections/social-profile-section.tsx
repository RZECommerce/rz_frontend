import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { employeeService } from "@/services/employee.service";
import type { UpdateEmployeeDto } from "@/types/employee";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const socialProfileSchema = z.object({
  facebook_profile: z.string().optional().nullable(),
  linkedin_profile: z.string().optional().nullable(),
  whatsapp_profile: z.string().optional().nullable(),
  skype_profile: z.string().optional().nullable(),
  twitter_profile: z.string().optional().nullable(),
});

type SocialProfileFormData = z.infer<typeof socialProfileSchema>;

interface SocialProfileSectionProps {
  employeeId: string;
  employee: {
    id: string;
    notes?: string;
  };
  isEditMode?: boolean;
}

export function SocialProfileSection({
  employeeId,
  employee,
  isEditMode = true,
}: SocialProfileSectionProps) {
  const queryClient = useQueryClient();

  // Parse social profiles from notes field (stored as JSON)
  const parseSocialProfiles = (notes?: string) => {
    if (!notes) return {};
    try {
      return JSON.parse(notes);
    } catch {
      return {};
    }
  };

  const socialProfiles = parseSocialProfiles(employee.notes);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SocialProfileFormData>({
    resolver: zodResolver(socialProfileSchema),
    defaultValues: {
      facebook_profile: socialProfiles.facebook_profile || "",
      linkedin_profile: socialProfiles.linkedin_profile || "",
      whatsapp_profile: socialProfiles.whatsapp_profile || "",
      skype_profile: socialProfiles.skype_profile || "",
      twitter_profile: socialProfiles.twitter_profile || "",
    },
  });

  const updateSocialProfile = useMutation({
    mutationFn: (data: UpdateEmployeeDto) =>
      employeeService.update(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      toast.success("Social profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update social profile", {
        description: error.message,
      });
    },
  });

  const onSubmit = (data: SocialProfileFormData) => {
    // Store social profiles in notes field as JSON
    const notes = JSON.stringify({
      ...socialProfiles,
      ...data,
    });

    updateSocialProfile.mutate({
      notes,
    } as UpdateEmployeeDto);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Social Profile</h3>
        <div className="mt-2 h-px bg-border" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facebook_profile">Facebook Profile</Label>
              <Input
                id="facebook_profile"
                {...register("facebook_profile")}
                placeholder="Facebook Profile"
                disabled={!isEditMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_profile">LinkedIn Profile</Label>
              <Input
                id="linkedin_profile"
                {...register("linkedin_profile")}
                placeholder="LinkedIn Profile"
                disabled={!isEditMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_profile">Whats App Profile</Label>
              <Input
                id="whatsapp_profile"
                {...register("whatsapp_profile")}
                placeholder="Whats App Profile"
                disabled={!isEditMode}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skype_profile">Skype Profile</Label>
              <Input
                id="skype_profile"
                {...register("skype_profile")}
                placeholder="Skype Profile"
                disabled={!isEditMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter_profile">Twitter Profile</Label>
              <Input
                id="twitter_profile"
                {...register("twitter_profile")}
                placeholder="Twitter Profile"
                disabled={!isEditMode}
              />
            </div>
          </div>
        </div>

        {isEditMode && (
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={updateSocialProfile.isPending}>
              {updateSocialProfile.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
