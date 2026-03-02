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
import { Checkbox } from "@/components/ui/checkbox";
import type { UpdateUserDto } from "@/services/user.service";
import type { User } from "@/types/auth";
import type { UserManagementRole } from "@/types/role";

const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  password_confirmation: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== "") {
    return data.password === data.password_confirmation;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["password_confirmation"],
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  roles: UserManagementRole[];
  onSubmit: (data: UpdateUserDto) => void;
  isSubmitting: boolean;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
  roles,
  onSubmit,
  isSubmitting,
}: EditUserDialogProps) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(
    user.roles || []
  );
  const [changePassword, setChangePassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: "",
        password_confirmation: "",
      });
      setSelectedRoleIds(user.roles || []);
      setChangePassword(false);
    }
  }, [user, reset]);

  const handleFormSubmit = (data: UpdateUserFormData) => {
    const updateData: UpdateUserDto = {
      name: data.name,
      email: data.email,
      role_ids: selectedRoleIds.length > 0 ? selectedRoleIds.map(id => Number(id)) : undefined,
    };

    // Only include password if user wants to change it
    if (changePassword && data.password) {
      updateData.password = data.password;
      updateData.password_confirmation = data.password_confirmation;
    }

    onSubmit(updateData);
  };

  const handleClose = () => {
    reset();
    setChangePassword(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and roles
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
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
              <Label htmlFor="email">Email</Label>
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="changePassword"
                  checked={changePassword}
                  onCheckedChange={(checked) => setChangePassword(checked as boolean)}
                />
                <Label htmlFor="changePassword" className="cursor-pointer">
                  Change Password
                </Label>
              </div>

              {changePassword && (
                <>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    {...register("password")}
                    placeholder="New password"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}

                  <Input
                    id="password_confirmation"
                    type="password"
                    autoComplete="new-password"
                    {...register("password_confirmation")}
                    placeholder="Confirm new password"
                  />
                  {errors.password_confirmation && (
                    <p className="text-sm text-destructive">
                      {errors.password_confirmation.message}
                    </p>
                  )}
                </>
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
                <SelectTrigger id="roles">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No role</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                      {role.description && ` - ${role.description}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current roles: {user.roles?.join(", ") || "None"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
