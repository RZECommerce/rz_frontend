
import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import { useHasPermission } from "@/hooks/use-permissions";
import type { Employee } from "@/types/employee";
import type { UserManagementRole } from "@/types/role";

interface EmployeeUserRoleProps {
  employee: Employee;
}

export function EmployeeUserRole({ employee }: EmployeeUserRoleProps) {
  const queryClient = useQueryClient();
  const canUpdateUsers = useHasPermission("users.update");
  const canViewUsers = useHasPermission("users.view");
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("");

  const { data: userData } = useQuery({
    queryKey: ["user", employee.user_id],
    queryFn: () => userService.getById(employee.user_id!),
    enabled: !!employee.user_id,
  });
  // Use userService.getRoles() for user management (proxy API - requires users.view)
  const { data: rolesData } = useQuery({
    queryKey: ["userRoles"],
    queryFn: async () => {
      const response = await userService.getRoles();
      const rawRoles = (response.data || []) as Array<{
        id: string | number;
        name: string;
        slug: string;
        description?: string;
        is_active?: boolean;
      }>;

      const normalizeName = (name: string) =>
        name ? name.charAt(0).toUpperCase() + name.slice(1) : name;

      return rawRoles.map((role) => ({
        id: String(role.id),
        name: normalizeName(role.name),
        slug: role.slug,
        description: role.description,
        is_active: role.is_active,
      })) as UserManagementRole[];
    },
    enabled: canViewUsers,
  });

  const user = userData?.data;
  const roles: UserManagementRole[] = rolesData || [];

  React.useEffect(() => {
    if (user?.role_id) {
      setSelectedRoleId(user.role_id);
    }
  }, [user]);

  const updateRole = useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      userService.assignRoles(userId, { role_ids: roleIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", employee.user_id] });
      queryClient.invalidateQueries({ queryKey: ["employee", employee.id] });
      toast.success("User roles updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update user roles", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const handleRoleUpdate = () => {
    if (employee.user_id && selectedRoleId) {
      // Assign roles using the new API (supports multiple roles)
      updateRole.mutate({ userId: employee.user_id, roleIds: [selectedRoleId] });
    }
  };

  if (!employee.user_id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Account</CardTitle>
          <CardDescription>This employee does not have a user account linked</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            To assign a role, the employee must first have a user account. Create a user account
            for this employee first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">User Account & Role</CardTitle>
        <CardDescription>Manage the user account and role assignment for this employee</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">User Account</p>
            <p className="font-medium">{user?.email || "Loading..."}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Current Role</p>
            {user?.role ? (
              <Badge variant="secondary" className="mt-1">
                {user.role.name}
              </Badge>
            ) : (
              <span className="text-muted-foreground text-sm">No role assigned</span>
            )}
          </div>
        </div>

        {canUpdateUsers && (
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="role">Assign Role</Label>
            <div className="flex gap-2">
              <Select value={selectedRoleId} onValueChange={(value) => setSelectedRoleId(value || "")}>
                <SelectTrigger id="role" className="flex-1">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                      {role.description && ` - ${role.description}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleRoleUpdate}
                disabled={updateRole.isPending || !selectedRoleId || selectedRoleId === user?.role_id}
              >
                {updateRole.isPending ? "Updating..." : "Update Role"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

