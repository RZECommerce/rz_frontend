
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useHasPermission } from "@/hooks/use-permissions";
import type { Role } from "@/types/role";
import { Delete as Delete01Icon, Edit as PencilEdit01Icon } from "@mui/icons-material";

/**
 * Get permission count from a role, handling both array and JSON structure formats
 */
function getPermissionCount(role: Role): number {
  const perms: any = (role as any).permissions;
  if (!perms) return 0;

  // Case 1: permissions is an array
  if (Array.isArray(perms)) {
    return perms.length;
  }

  // Case 2: permissions is a JSON / nested structure
  if (typeof perms === "object") {
    let count = 0;
    for (const key in perms as Record<string, unknown>) {
      const value = (perms as Record<string, unknown>)[key];

      // Direct array of permission slugs
      if (Array.isArray(value)) {
        count += value.length;
        continue;
      }

      // Nested object: { category: { module: ["module.action", ...] } }
      if (value && typeof value === "object") {
        for (const subKey in value as Record<string, unknown>) {
          const subValue = (value as Record<string, unknown>)[subKey];
          if (Array.isArray(subValue)) {
            count += subValue.length;
          }
        }
      }
    }
    return count;
  }

  return 0;
}

interface RolesTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  isDeleting: boolean;
}

export function RolesTable({ roles, onEdit, onDelete, isDeleting }: RolesTableProps) {
  const canManageRoles = useHasPermission("roles.manage");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles</CardTitle>
        <CardDescription>Manage user roles and their assigned permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                {canManageRoles && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManageRoles ? 6 : 5} className="text-center text-muted-foreground py-8">
                    No roles found
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{role.slug}</code>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.description || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getPermissionCount(role)} permissions
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.is_active ? "default" : "secondary"}>
                        {role.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    {canManageRoles && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(role)}
                            title="Edit role"
                          >
                            <PencilEdit01Icon className="size-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(role)}
                            disabled={isDeleting}
                            title="Delete role"
                          >
                            <Delete01Icon className="size-5" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

