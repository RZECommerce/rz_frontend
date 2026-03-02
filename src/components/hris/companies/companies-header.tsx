import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useHasPermission } from "@/hooks/use-permissions";
import {
    Add as Add01Icon,
    Business as Building01Icon,
    Menu as SidebarLeft01Icon
} from "@mui/icons-material";

interface CompaniesHeaderProps {
  onAddClick: () => void;
}

export function CompaniesHeader({ onAddClick }: CompaniesHeaderProps) {
  const canCreate = useHasPermission("companies.create");
  
  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 bg-background">
      <SidebarTrigger className="lg:hidden">
        <SidebarLeft01Icon className="size-5" />
      </SidebarTrigger>

      <Building01Icon className="size-5" />
      <h1 className="flex-1 font-medium text-base">Companies</h1>

      {canCreate && (
        <Button variant="default" size="sm" className="gap-2" onClick={onAddClick}>
          <Add01Icon className="size-5" />
          New Company
        </Button>
      )}
    </header>
  );
}
