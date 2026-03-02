import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/types/auth";
import type { UserManagementRole } from "@/types/role";

interface AssignRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  roles: UserManagementRole[];
  onAssign: (roleIds: string[]) => void;
  isSubmitting: boolean;
}

export function AssignRoleDialog({
  open,
  onOpenChange,
  user,
  roles,
  onAssign,
  isSubmitting,
}: AssignRoleDialogProps) {
  // Map user role names to role IDs
  const getUserRoleIds = React.useCallback(() => {
    if (!user.roles || user.roles.length === 0) {
      return [];
    }
    // Find role IDs by matching role names or slugs
    return roles
      .filter((role) => user.roles?.includes(role.name) || user.roles?.includes(role.slug))
      .map((role) => role.id);
  }, [user.roles, roles]);

  const [selectedRoleIds, setSelectedRoleIds] = React.useState<string[]>(() =>
    getUserRoleIds()
  );

  React.useEffect(() => {
    setSelectedRoleIds(getUserRoleIds());
  }, [getUserRoleIds]);

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = () => {
    onAssign(selectedRoleIds);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Roles to User</DialogTitle>
          <DialogDescription>
            Assign or update roles for {user.name} ({user.email})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Roles</Label>
            <div className="max-h-[200px] overflow-y-auto rounded-md border p-4">
              <div className="space-y-2">
                {roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No roles available</p>
                ) : (
                  roles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.id}`}
                        checked={selectedRoleIds.includes(role.id)}
                        onCheckedChange={() => toggleRole(role.id)}
                      />
                      <label
                        htmlFor={`role-${role.id}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {role.name}
                        {role.description && (
                          <span className="text-muted-foreground ml-1">
                            - {role.description}
                          </span>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
            {selectedRoleIds.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedRoleIds.map((roleId) => {
                  const role = roles.find((r) => r.id === roleId);
                  return role ? (
                    <Badge key={roleId} variant="secondary">
                      {role.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Roles"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

