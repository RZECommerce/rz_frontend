import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import type { User } from "@/types/auth";
import type { CreateUserDto, UpdateUserDto } from "@/services/user.service";
import { UsersHeader } from "@/components/user-management/users/users-header";
import { UsersTable } from "@/components/user-management/users/users-table";
import { CreateUserDialog } from "@/components/user-management/users/create-user-dialog";
import { EditUserDialog } from "@/components/user-management/users/edit-user-dialog";
import { AssignRoleDialog } from "@/components/user-management/users/assign-role-dialog";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { requireAuth } from "@/lib/auth/route-guards";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useHasPermission } from "@/hooks/use-permissions";
import type { UserManagementRole } from "@/types/role";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/user-management/users")({
  beforeLoad: requireAuth(),
  component: UsersPage,
});

function UsersPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [assigningRoleUser, setAssigningRoleUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [creatingEmployeeForUser, setCreatingEmployeeForUser] = useState<User | null>(null);

  const canCreateEmployees = useHasPermission("employees.create");

  const canViewUsers = useHasPermission("users.view");
  const canCreateUsers = useHasPermission("users.create");
  const canUpdateUsers = useHasPermission("users.update");
  const canDeleteUsers = useHasPermission("users.delete");

  // Fetch users with employee status
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", "with-employee-status", search, roleFilter],
    queryFn: async () => {
      const response = await userService.getUsersWithEmployeeStatus({
        search: search || undefined,
        role_id: roleFilter || undefined,
      });
      // Response structure: { success: true, data: { users: User[], pagination: {...} } }
      return response.data;
    },
    enabled: canViewUsers,
  });

  // Fetch roles for user management
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
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

      // Normalize roles: ensure string IDs and capitalize the first letter of the name
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

  const users = usersData?.users || [];
  const roles: UserManagementRole[] = rolesData || [];

  // Filter users client-side if needed (for better UX)
  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    if (roleFilter) {
      filtered = filtered.filter((user) => {
        const role = roles.find((r) => r.id === roleFilter);
        if (!role) {
          return false;
        }

        const userRoles: any = (user as any).roles;

        if (Array.isArray(userRoles)) {
          // roles can be array of strings or role objects
          return userRoles.some((r: any) => {
            if (typeof r === "string") {
              return (
                r === role.name || r === role.slug || r === role.id
              );
            }

            return (
              r.id === role.id ||
              r.slug === role.slug ||
              r.name === role.name
            );
          });
        }

        // Fallback: if user has a single role object
        const singleRole: any = (user as any).role;
        if (singleRole) {
          return (
            singleRole.id === role.id ||
            singleRole.slug === role.slug ||
            singleRole.name === role.name
          );
        }

        return false;
      });
    }

    return filtered;
  }, [users, search, roleFilter, roles]);

  const createUser = useMutation({
    mutationFn: (data: CreateUserDto) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Failed to create user", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("User updated successfully");
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to update user", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
      setDeletingUser(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to delete user", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const assignRoles = useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      userService.assignRoles(userId, { role_ids: roleIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Roles assigned successfully");
      setAssigningRoleUser(null);
    },
    onError: (error: Error) => {
      toast.error("Failed to assign roles", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const handleAssignRole = (user: User) => {
    setAssigningRoleUser(user);
  };

  const handleDelete = (user: User) => {
    setDeletingUser(user);
  };

  const handleCreateEmployee = (user: User) => {
    if (canCreateEmployees) {
      // Navigate to employee creation page
      navigate({
        to: "/hris/employees",
        search: { createForUser: String(user.id) },
      });
    } else {
      toast.error("You don't have permission to create employees");
    }
  };

  const confirmDelete = () => {
    if (deletingUser) {
      deleteUser.mutate(String(deletingUser.id));
    }
  };

  if (!canViewUsers) {
    return (
      <DashboardLayout>
        <UsersHeader
          search={search}
          roleFilter={roleFilter}
          roles={roles}
          onSearchChange={setSearch}
          onRoleFilterChange={setRoleFilter}
          onCreateClick={() => {}}
        />
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">You don't have permission to view users</div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoadingUsers || isLoadingRoles) {
    return (
      <DashboardLayout>
        <UsersHeader
          search={search}
          roleFilter={roleFilter}
          roles={roles}
          onSearchChange={setSearch}
          onRoleFilterChange={setRoleFilter}
          onCreateClick={() => {}}
        />
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Loading users...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <UsersHeader
        search={search}
        roleFilter={roleFilter}
        roles={roles}
        onSearchChange={setSearch}
        onRoleFilterChange={setRoleFilter}
        onCreateClick={() => setIsCreateDialogOpen(true)}
      />
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
      >
        <UsersTable
          users={filteredUsers}
          onAssignRole={handleAssignRole}
          onCreateEmployee={canCreateUsers ? handleCreateEmployee : undefined}
          onEdit={canUpdateUsers ? (user: User) => setEditingUser(user) : undefined}
          onDelete={canDeleteUsers ? handleDelete : undefined}
          isUpdating={assignRoles.isPending || updateUser.isPending || deleteUser.isPending}
        />

        {roles.length > 0 && (
          <>
            {canCreateUsers && (
              <CreateUserDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                roles={roles}
                onSubmit={(data: CreateUserDto) => createUser.mutate(data)}
                isSubmitting={createUser.isPending}
              />
            )}

            {editingUser && canUpdateUsers && (
              <EditUserDialog
                open={!!editingUser}
                onOpenChange={(open: boolean) => !open && setEditingUser(null)}
                user={editingUser}
                roles={roles}
                onSubmit={(data: UpdateUserDto) => updateUser.mutate({ id: String(editingUser.id), data })}
                isSubmitting={updateUser.isPending}
              />
            )}

            {assigningRoleUser && canUpdateUsers && (
              <AssignRoleDialog
                open={!!assigningRoleUser}
                onOpenChange={(open: boolean) => !open && setAssigningRoleUser(null)}
                user={assigningRoleUser}
                roles={roles}
                onAssign={(roleIds: string[]) =>
                  assignRoles.mutate({
                    userId: String(assigningRoleUser.id),
                    roleIds,
                  })
                }
                isSubmitting={assignRoles.isPending}
              />
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        {canDeleteUsers && (
          <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete User</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the user "{deletingUser?.name}"? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeletingUser(null)}
                  disabled={deleteUser.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  disabled={deleteUser.isPending}
                >
                  {deleteUser.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </DashboardLayout>
  );
}
