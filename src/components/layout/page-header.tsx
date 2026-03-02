import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    useDashboardStore,
    type LayoutDensity,
} from "@/stores/dashboard-store";
import {
    KeyboardArrowDown as ArrowDown01Icon,
    Refresh as RefreshIcon,
    ViewSidebar as SidebarLeft01Icon,
    Check as Tick01Icon,
} from "@mui/icons-material";

const densityLabels: Record<LayoutDensity, string> = {
  default: "Default",
  compact: "Compact",
  comfortable: "Comfortable",
};

export interface PageHeaderProps {
  showUserAvatars?: boolean;
  showNotifications?: boolean;
  showThemeToggle?: boolean;
  showExport?: boolean;
  showNew?: boolean;
  showEditLayout?: boolean;
  exportLabel?: string;
  newLabel?: string;
  onExport?: () => void;
  onNew?: () => void;
  newMenuItems?: Array<{ label: string; onClick: () => void }>;
}

export function PageHeader({
  showUserAvatars = true,
  showNotifications = true,
  showThemeToggle = true,
  showExport = true,
  showNew = true,
  showEditLayout = false,
  exportLabel = "Export",
  newLabel = "New",
  onExport,
  onNew,
  newMenuItems = [],
}: PageHeaderProps) {
  const showAlertBanner = useDashboardStore((state) => state.showAlertBanner);
  const showStatsCards = useDashboardStore((state) => state.showStatsCards);
  const showChart = useDashboardStore((state) => state.showChart);
  const showTable = useDashboardStore((state) => state.showTable);
  const layoutDensity = useDashboardStore((state) => state.layoutDensity);
  const setShowAlertBanner = useDashboardStore(
    (state) => state.setShowAlertBanner
  );
  const setShowStatsCards = useDashboardStore(
    (state) => state.setShowStatsCards
  );
  const setShowChart = useDashboardStore((state) => state.setShowChart);
  const setShowTable = useDashboardStore((state) => state.setShowTable);
  const setLayoutDensity = useDashboardStore((state) => state.setLayoutDensity);
  const resetLayout = useDashboardStore((state) => state.resetLayout);

  return (
    <div className="flex items-center gap-3 flex-shrink-0">
      {showUserAvatars && (
        <>
          <div className="flex items-center -space-x-2">
            <Avatar className="size-5 ring-2 ring-background">
              <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=user1" />
              <AvatarFallback>U1</AvatarFallback>
            </Avatar>
            <Avatar className="size-5 ring-2 ring-background">
              <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=user2" />
              <AvatarFallback>U2</AvatarFallback>
            </Avatar>
            <Avatar className="size-5 ring-2 ring-background">
              <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=user3" />
              <AvatarFallback>U3</AvatarFallback>
            </Avatar>
          </div>
          <div className="hidden sm:block h-6 w-px bg-border" />
        </>
      )}

      {showNotifications && <NotificationDropdown />}

      {showThemeToggle && <ThemeToggle />}

      {showExport && (
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex gap-2"
          onClick={onExport}
        >
          {exportLabel}
        </Button>
      )}

      {showNew && newMenuItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="hidden sm:flex gap-2"
            >
              {newLabel}
              <ArrowDown01Icon className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom">
            {newMenuItems.map((item, index) => (
              <DropdownMenuItem key={index} onClick={item.onClick}>
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {showEditLayout && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex gap-2"
            >
              <SidebarLeft01Icon className="size-5" />
              Edit Layout
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                Layout Density
              </p>
              {(Object.keys(densityLabels) as LayoutDensity[]).map((key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setLayoutDensity(key)}
                >
                  {densityLabels[key]}
                  {layoutDensity === key && (
                      <Tick01Icon
                        className="size-5 ml-auto"
                      />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
                Show / Hide Sections
              </p>
              <DropdownMenuCheckboxItem
                checked={showAlertBanner}
                onCheckedChange={setShowAlertBanner}
              >
                Alert Banner
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showStatsCards}
                onCheckedChange={setShowStatsCards}
              >
                Statistics Cards
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showChart}
                onCheckedChange={setShowChart}
              >
                Financial Flow Chart
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showTable}
                onCheckedChange={setShowTable}
              >
                Employees Table
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={resetLayout}>
              <RefreshIcon className="size-5 mr-2" />
              Reset to Default
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
