
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { employeeService } from "@/services/employee.service";
import { Image as Image01Icon, CloudUpload as Upload01Icon } from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";

interface ProfilePictureSectionProps {
  employeeId: string;
  currentImageUrl?: string | null;
}

export function ProfilePictureSection({
  employeeId,
  currentImageUrl,
}: ProfilePictureSectionProps) {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Convert file to base64
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    onSuccess: async (base64String) => {
      try {
        // TODO: Update this when backend supports profile picture upload
        // For now, we'll use the face registration endpoint as a placeholder
        await employeeService.registerFace(employeeId, base64String);
        queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
        toast.success("Profile picture uploaded successfully.");
        setSelectedFile(null);
      } catch (error: any) {
        toast.error("Failed to upload profile picture.", {
          description: error.message || "An unknown error occurred.",
        });
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/gif", "image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a GIF, JPG, or PNG image.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }
    uploadMutation.mutate(selectedFile);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(currentImageUrl || null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Profile Picture</h3>
        <p className="text-sm text-muted-foreground">
          Upload a profile photo for this employee. Supported formats: GIF, JPG, PNG, JPEG (max 5MB).
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Image Preview */}
        <div className="flex-shrink-0">
          <div className="w-48 h-48 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex items-center justify-center overflow-hidden">
            {preview ? (
              <img
                src={preview}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Image01Icon className="size-5 mb-2" />
                <p className="text-sm">No image</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-picture" className="text-sm font-medium">
              Choose File
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="profile-picture"
                type="file"
                accept="image/gif,image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
                className="flex-1"
                disabled={uploadMutation.isPending}
              />
              <Button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
                className="gap-2"
              >
                  <Upload01Icon className="size-5" />
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Accepted formats: GIF, JPG, PNG, JPEG. Maximum file size: 5MB.
            </p>
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={uploadMutation.isPending}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
