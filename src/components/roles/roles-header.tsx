import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useHasPermission } from "@/hooks/use-permissions";
import {
    Add as Add01Icon,
    AdminPanelSettings as Settings01Icon,
    Menu as SidebarLeft01Icon,
} from "@mui/icons-material";

interface RolesHeaderProps {
  onAddClick: () => void;
}

export function RolesHeader({ onAddClick }: RolesHeaderProps) {
  const canManageRoles = useHasPermission("roles.manage");

  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 border-b bg-background">
      <SidebarTrigger className="lg:hidden">
        <SidebarLeft01Icon className="size-5" />
      </SidebarTrigger>

      <Settings01Icon className="size-5" />
      <h1 className="flex-1 font-medium text-base">Roles & Permissions</h1>

      {canManageRoles && (
        <Button
          variant="default"
          size="sm"
          className="hidden sm:flex gap-2"
          onClick={onAddClick}
        >
          <Add01Icon className="size-5" />
          New Role
        </Button>
      )}
    </header>
  );
}

