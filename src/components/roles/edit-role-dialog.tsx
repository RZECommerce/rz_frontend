import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { roleService } from "@/services/role.service";
import type { PermissionsByGroup, Role } from "@/types/role";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

/**
 * Get permission IDs from a role, handling both array and JSON structure formats
 */
function getPermissionIdsFromRole(role: Role): string[] {
  const perms: any = (role as any).permissions;
  if (!perms) return [];

  // Case 1: permissions is an array (either of slugs or Permission objects)
  if (Array.isArray(perms)) {
    return perms.map((p: any) => (typeof p === "string" ? p : p.id));
  }

  // Case 2: permissions is a JSON / nested structure
  if (typeof perms === "object") {
    const ids: string[] = [];
    for (const key in perms as Record<string, unknown>) {
      const value = (perms as Record<string, unknown>)[key];

      // Direct array of permission slugs
      if (Array.isArray(value)) {
        for (const slug of value) {
          if (typeof slug === "string") {
            ids.push(slug);
          }
        }
        continue;
      }

      // Nested object: { category: { module: ["module.action", ...] } }
      if (value && typeof value === "object") {
        for (const subKey in value as Record<string, unknown>) {
          const subValue = (value as Record<string, unknown>)[subKey];
          if (Array.isArray(subValue)) {
            for (const slug of subValue) {
              if (typeof slug === "string") {
                ids.push(slug);
              }
            }
          }
        }
      }
    }
    return ids;
  }

  return [];
}

const updateRoleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens")
    .optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
  permission_ids: z.array(z.string()).optional(),
});

type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;

interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
  permissions: PermissionsByGroup;
}

export function EditRoleDialog({
  open,
  onOpenChange,
  role,
  permissions,
}: EditRoleDialogProps) {
  const queryClient = useQueryClient();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    getPermissionIdsFromRole(role)
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateRoleFormData>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      name: role.name,
      slug: role.slug,
      description: role.description || "",
      is_active: role.is_active,
      permission_ids: getPermissionIdsFromRole(role),
    },
  });

  const isActive = watch("is_active");

  useEffect(() => {
    if (role) {
      const ids = getPermissionIdsFromRole(role);
      reset({
        name: role.name,
        slug: role.slug,
        description: role.description || "",
        is_active: role.is_active,
        permission_ids: ids,
      });
      setSelectedPermissions(ids);
    }
  }, [role, reset]);

  const updateRole = useMutation({
    mutationFn: (data: UpdateRoleFormData) => roleService.update(role.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role updated successfully");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to update role", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const onSubmit = (data: UpdateRoleFormData) => {
    updateRole.mutate({
      ...data,
      permission_ids: selectedPermissions,
    });
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
    setValue("permission_ids", selectedPermissions);
  };

  const permissionGroups = Object.keys(permissions);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>
            Update role details and permissions
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="max-h-[60vh] overflow-y-auto pr-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g., HR Manager"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  {...register("slug")}
                  placeholder="e.g., hr-manager"
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">
                    {errors.slug.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Lowercase alphanumeric with hyphens only
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Role description..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) =>
                    setValue("is_active", checked as boolean)
                  }
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Active
                </label>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Permissions</Label>
                {permissionGroups.map((group) => (
                  <div key={group} className="space-y-2">
                    <h4 className="font-medium text-sm capitalize">{group}</h4>
                    <div className="space-y-2 pl-4">
                      {permissions[group].map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`perm-${permission.id}`}
                            checked={selectedPermissions.includes(
                              permission.id
                            )}
                            onCheckedChange={() =>
                              togglePermission(permission.id)
                            }
                          />
                          <label
                            htmlFor={`perm-${permission.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {permission.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateRole.isPending}>
              {updateRole.isPending ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
