import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "@/services/role.service";
import type { Role } from "@/types/role";
import { RolesHeader } from "@/components/roles/roles-header";
import { RolesTable } from "@/components/roles/roles-table";
import { CreateRoleDialog } from "@/components/roles/create-role-dialog";
import { EditRoleDialog } from "@/components/roles/edit-role-dialog";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { requireAuth } from "@/lib/auth/route-guards";
import { getPermissionsFromRoles } from "@/lib/permissions-from-roles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/user-management/roles")({
  beforeLoad: requireAuth(),
  component: RolesPage,
});

function RolesPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  // Fetch roles
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await roleService.getAll();
      return response.data;
    },
  });

  const roles = rolesData || [];

  // Extract permissions from roles
  const permissions = useMemo(() => {
    if (roles.length > 0) {
      return getPermissionsFromRoles(roles);
    }
    return {};
  }, [roles]);

  const deleteRole = useMutation({
    mutationFn: (id: string) => roleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role deleted successfully");
      setDeletingRole(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to delete role", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const handleDelete = (role: Role) => {
    setDeletingRole(role);
  };

  const confirmDelete = () => {
    if (deletingRole) {
      deleteRole.mutate(deletingRole.id);
    }
  };

  if (isLoadingRoles) {
    return (
      <DashboardLayout>
        <RolesHeader onAddClick={() => {}} />
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Loading roles...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <RolesHeader onAddClick={() => setIsCreateDialogOpen(true)} />
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
      >
        <RolesTable
          roles={roles}
          onEdit={(role) => setEditingRole(role)}
          onDelete={handleDelete}
          isDeleting={deleteRole.isPending}
        />

        {Object.keys(permissions).length > 0 && (
          <>
            <CreateRoleDialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              permissions={permissions}
            />

            {editingRole && (
              <EditRoleDialog
                open={!!editingRole}
                onOpenChange={(open) => !open && setEditingRole(null)}
                role={editingRole}
                permissions={permissions}
              />
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deletingRole} onOpenChange={(open) => !open && setDeletingRole(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Role</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the role "{deletingRole?.name}"? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeletingRole(null)}
                  disabled={deleteRole.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={deleteRole.isPending}
                >
                  {deleteRole.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </main>
    </DashboardLayout>
  );
}
