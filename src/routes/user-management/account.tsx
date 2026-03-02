import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth/route-guards";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useRbacStore } from "@/stores/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/components/account/profile-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile.service";
import { toast } from "sonner";
import { useMemo } from "react";

export const Route = createFileRoute("/user-management/account")({
  beforeLoad: requireAuth(),
  component: AccountPage,
});

function AccountPage() {
  const { user } = useAuthStore();
  const { roles, permissions, permissionsFlat } = useRbacStore();
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      // Refresh user data
      useAuthStore.getState().fetchUser();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    },
  });

  const handleProfileSubmit = (data: { name: string; email: string }) => {
    updateProfile.mutate(data);
  };

  // Group permissions by module for display
  const groupedPermissions = useMemo(() => {
    if (!permissions || typeof permissions !== "object") {
      return {};
    }

    const grouped: Record<string, string[]> = {};
    
    for (const module in permissions) {
      const modulePerms = permissions[module];
      if (Array.isArray(modulePerms)) {
        // Flat structure: { "employees": ["employees.view"] }
        grouped[module] = modulePerms;
      } else if (typeof modulePerms === "object" && modulePerms !== null) {
        // Nested structure: { "hris": { "employees": ["employees.view"] } }
        const nestedPerms = modulePerms as Record<string, string[]>;
        for (const subModule in nestedPerms) {
          const key = `${module}.${subModule}`;
          if (Array.isArray(nestedPerms[subModule])) {
            grouped[key] = nestedPerms[subModule];
          }
        }
      }
    }
    
    return grouped;
  }, [permissions]);

  if (!user) {
    return (
      <DashboardLayout>
        <main className={cn("w-full flex-1 overflow-auto", "p-4 sm:p-6")}>
          <p className="text-muted-foreground">Loading user data...</p>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main
        className={cn(
          "w-full flex-1 overflow-auto",
          "p-4 sm:p-6 space-y-6 sm:space-y-8"
        )}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account information, roles, and permissions
            </p>
          </div>

          {/* Profile Information */}
          <ProfileForm
            user={user}
            onSubmit={handleProfileSubmit}
            isSubmitting={updateProfile.isPending}
          />

          {/* Roles & Permissions */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Roles */}
            <Card>
              <CardHeader>
                <CardTitle>Roles</CardTitle>
                <CardDescription>
                  Your assigned roles in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {roles && roles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <Badge key={role} variant="secondary" className="text-sm">
                        {role}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No roles assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Permissions Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Permissions Summary</CardTitle>
                <CardDescription>
                  Total permissions granted to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Permissions</span>
                    <span className="text-2xl font-bold">{permissionsFlat.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Modules</span>
                    <span className="text-lg font-semibold">
                      {Object.keys(groupedPermissions).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                All permissions granted to your account, organized by module
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(groupedPermissions).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([module, perms], index) => (
                    <div key={module}>
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold capitalize">
                          {module.replace(".", " → ")}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {perms.length} permission{perms.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {perms.map((perm) => (
                          <Badge
                            key={perm}
                            variant="outline"
                            className="text-xs font-mono"
                          >
                            {perm}
                          </Badge>
                        ))}
                      </div>
                      {index < Object.keys(groupedPermissions).length - 1 && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No permissions assigned</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </DashboardLayout>
  );
}

