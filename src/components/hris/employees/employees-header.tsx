import { FullPageHeader } from "@/components/layout/full-page-header";
import { useHasPermission } from "@/hooks/use-permissions";

interface EmployeesHeaderProps {
  onAddClick: () => void;
}

export function EmployeesHeader({ onAddClick }: EmployeesHeaderProps) {
  const canCreate = useHasPermission("employees.create");
  return (
    <FullPageHeader
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
  );
}
