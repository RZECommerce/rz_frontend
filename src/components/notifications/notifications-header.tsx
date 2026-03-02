
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Notifications as Notification01Icon, Menu as SidebarLeft01Icon } from "@mui/icons-material";

export function NotificationsHeader() {
  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 border-b bg-background">
      <SidebarTrigger className="lg:hidden">
        <SidebarLeft01Icon className="size-5" />
      </SidebarTrigger>

      <Notification01Icon className="size-5" />
      <h1 className="flex-1 font-medium text-base">Notifications</h1>
    </header>
  );
}

