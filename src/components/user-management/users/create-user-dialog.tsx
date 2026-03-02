import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateUserDto } from "@/services/user.service";
import type { UserManagementRole } from "@/types/role";

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirmation: z.string(),
  role_ids: z.array(z.string()).optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords do not match",
  path: ["password_confirmation"],
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: UserManagementRole[];
  onSubmit: (data: CreateUserDto) => void;
  isSubmitting: boolean;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  roles,
  onSubmit,
  isSubmitting,
}: CreateUserDialogProps) {
  const getRoleLabel = (role: UserManagementRole) => {
    const name = role.name ? String(role.name) : "";
    const slug = role.slug ? String(role.slug) : "";
    const id = role.id != null ? String(role.id) : "";

    // If name looks like a proper word (has any letter), use it.
    const hasLetter = /[a-zA-Z]/.test(name);
    const base = hasLetter && name ? name : slug || id;

    if (!base) return "";

    return base.charAt(0).toUpperCase() + base.slice(1);
  };

  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role_ids: [],
    },
  });

  const password = watch("password");

  useEffect(() => {
    setValue("role_ids", selectedRoleIds);
  }, [selectedRoleIds, setValue]);

  const handleFormSubmit = (data: CreateUserFormData) => {
    onSubmit({
      name: data.name,
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation,
      role_ids: selectedRoleIds.length > 0 ? selectedRoleIds.map(id => Number(id)) : undefined,
    });
  };

  const handleClose = () => {
    reset();
    setSelectedRoleIds([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Create a new user account and assign roles
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirm Password *</Label>
              <Input
                id="password_confirmation"
                type="password"
                autoComplete="new-password"
                {...register("password_confirmation")}
                placeholder="••••••••"
              />
              {errors.password_confirmation && (
                <p className="text-sm text-destructive">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roles">Roles</Label>
              <Select
                value={selectedRoleIds[0] || ""}
                onValueChange={(value) => {
                  if (value) {
                    setSelectedRoleIds([value]);
                  } else {
                    setSelectedRoleIds([]);
                  }
                }}
              >
                <SelectTrigger id="roles" className="w-full">
                  {selectedRoleIds[0] ? (
                    <span
                      data-slot="select-value"
                      className="flex flex-1 text-left"
                    >
                      {getRoleLabel(
                        roles.find(
                          (role) => String(role.id) === selectedRoleIds[0]
                        ) || {
                          id: selectedRoleIds[0],
                          name: selectedRoleIds[0],
                          slug: selectedRoleIds[0],
                        }
                      )}
                    </span>
                  ) : (
                    <span
                      data-slot="select-value"
                      className="flex flex-1 text-left text-muted-foreground"
                    >
                      Select a role (optional)
                    </span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No role</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {getRoleLabel(role)}
                      {role.description && ` - ${role.description}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                You can assign multiple roles after creating the user
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
