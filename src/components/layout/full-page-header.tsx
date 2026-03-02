import {
  PageHeader,
  type PageHeaderProps,
} from "@/components/layout/page-header";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Dashboard as DashboardIcon, Menu as MenuIcon } from "@mui/icons-material";

export function FullPageHeader(props: PageHeaderProps) {
  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4  bg-background">
      <SidebarTrigger className="lg:hidden">
        <MenuIcon className="size-5" />
      </SidebarTrigger>

      <div className="flex " />
      <DashboardIcon className="size-5" />
      <h1 className="flex-1 font-medium text-base">Employees</h1>
      <PageHeader {...props} />
    </header>
  );
}
