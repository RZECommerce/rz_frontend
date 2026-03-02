import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useHasPermission } from "@/hooks/use-permissions";
import type { User } from "@/types/auth";
import {
    Delete as Delete01Icon,
    Edit as Edit01Icon,
    Settings as Settings01Icon,
    Person as UserIcon,
} from "@mui/icons-material";
import { Link } from "@tanstack/react-router";

interface UsersTableUser extends User {
  has_employee?: boolean;
  employee?: {
    id: string;
    employee_code: string;
    full_name: string;
    status: string;
  } | null;
}

interface UsersTableProps {
  users: UsersTableUser[];
  onAssignRole: (user: User) => void;
  onCreateEmployee?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  isUpdating: boolean;
}

function getUserRoleLabels(user: User): string[] {
  const roles: any = (user as any).roles;

  if (Array.isArray(roles)) {
    // roles can be array of strings or role objects
    return roles.map((r: any) => (typeof r === "string" ? r : r.name));
  }

  if ((user as any).role && (user as any).role.name) {
    return [(user as any).role.name as string];
  }

  return [];
}

export function UsersTable({
  users,
  onAssignRole,
  onCreateEmployee,
  onEdit,
  onDelete,
  isUpdating,
}: UsersTableProps) {
  const canUpdateUsers = useHasPermission("users.update");
  const canDeleteUsers = useHasPermission("users.delete");
  const canAssignRoles = useHasPermission("users.update"); // Assign roles requires users.update
  const canCreateEmployees = useHasPermission("employees.create");
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage user accounts and their roles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee #</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {user.has_employee && user.employee
                        ? user.employee.employee_code
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {user.has_employee && user.employee ? (
                        <div className="flex flex-col gap-0.5">
                          <Link
                            to="/hris/employees/$id"
                            params={{ id: user.employee.id }}
                            className="flex items-center gap-2 text-primary hover:underline"
                          >
                            <span className="text-sm text-muted-foreground">
                              {user.employee.full_name}
                            </span>
                          </Link>
                        </div>
                      ) : onCreateEmployee && canCreateEmployees ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCreateEmployee(user)}
                          disabled={isUpdating}
                          className="gap-2"
                        >
                          <UserIcon className="size-5" />
                          Create Employee
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {user.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {(() => {
                        const roleLabels = getUserRoleLabels(user);

                        if (roleLabels.length === 0) {
                          return (
                            <span className="text-muted-foreground text-sm">
                              No role
                            </span>
                          );
                        }

                        return (
                          <div className="flex flex-wrap gap-1">
                            {roleLabels.map((label, index) => (
                              <Badge key={index} variant="secondary">
                                {label}
                              </Badge>
                            ))}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {user.has_employee && user.employee ? (
                        <Badge
                          variant={
                            user.employee.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {user.employee.status.charAt(0).toUpperCase() +
                            user.employee.status.slice(1)}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onEdit && canUpdateUsers && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(user)}
                            disabled={isUpdating}
                            title="Edit user"
                          >
                            <Edit01Icon className="size-5" />
                          </Button>
                        )}
                        {canAssignRoles && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAssignRole(user)}
                            disabled={isUpdating}
                            title="Assign roles"
                          >
                            <Settings01Icon className="size-5" />
                          </Button>
                        )}
                        {onDelete && canDeleteUsers && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(user)}
                            disabled={isUpdating}
                            title="Delete user"
                          >
                            <Delete01Icon className="size-5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
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

