import { PageHeader } from "@/components/layout/page-header";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useHasPermission } from "@/hooks/use-permissions";
import {
  Group as GroupIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";

interface EmployeesHeaderProps {
  onAddClick: () => void;
}

export function EmployeesHeader({ onAddClick }: EmployeesHeaderProps) {
  const canCreate = useHasPermission("employees.create");

  return (
    <header className="flex w-full items-center gap-3 bg-background px-4 py-4 font-sans sm:px-6">
      <SidebarTrigger className="lg:hidden">
        <MenuIcon className="size-5" />
      </SidebarTrigger>

      <div className="flex" />
      <GroupIcon className="size-5 text-primary" />
      <h1 className="flex-1 text-base font-semibold text-foreground">Employees</h1>
      <PageHeader
        showUserAvatars={false}
        showNotifications={false}
        showThemeToggle={false}
        showExport={true}
        exportLabel="Export"
        showNew={canCreate}
        newMenuItems={[
          { label: "New Employee", onClick: onAddClick },
          { label: "Bulk Import", onClick: () => {} },
        ]}
      />
    </header>
  );
}
