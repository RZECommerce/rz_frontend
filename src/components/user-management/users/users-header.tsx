import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useHasPermission } from "@/hooks/use-permissions";
import type { UserManagementRole } from "@/types/role";
import {
    Add as Add01Icon,
    Menu as SidebarLeft01Icon,
    Group as UserIcon,
} from "@mui/icons-material";

interface UsersHeaderProps {
  search: string;
  roleFilter: string;
  roles: UserManagementRole[];
  onSearchChange: (search: string) => void;
  onRoleFilterChange: (roleId: string) => void;
  onCreateClick: () => void;
}

export function UsersHeader({
  search,
  roleFilter,
  roles,
  onSearchChange,
  onRoleFilterChange,
  onCreateClick,
}: UsersHeaderProps) {
  const canCreateUsers = useHasPermission("users.create");

  return (
    <header className="w-full flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-4 border-b bg-background">
      <div className="flex items-center gap-3 flex-1">
        <SidebarTrigger className="lg:hidden">
          <SidebarLeft01Icon className="size-5" />
        </SidebarTrigger>
        <UserIcon className="size-5" />
        <h1 className="flex-1 font-medium text-base">User Management</h1>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-64"
        />
        <Select value={roleFilter} onValueChange={(value) => onRoleFilterChange(value || "")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Roles</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {canCreateUsers && (
          <Button
            variant="default"
            size="sm"
            className="hidden sm:flex gap-2"
            onClick={onCreateClick}
          >
            <Add01Icon className="size-5" />
            New User
          </Button>
        )}
      </div>
    </header>
  );
}

