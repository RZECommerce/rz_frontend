import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
    AccessTime as Clock01Icon,
    Menu as SidebarLeft01Icon,
} from "@mui/icons-material";

interface PageHeaderProps {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  showExport?: boolean;
  exportLabel?: string;
  onExport?: () => void;
  showNew?: boolean;
  newLabel?: string;
  onNew?: () => void;
  newMenuItems?: Array<{ label: string; onClick: () => void }>;
  rightContent?: React.ReactNode;
}

export function PageHeader({
  title,
  icon: Icon = Clock01Icon,
  showExport = false,
  exportLabel = "Export",
  onExport,
  showNew = false,
  newLabel = "New",
  onNew,
  newMenuItems = [],
  rightContent,
}: PageHeaderProps) {
  return (
    <header className="w-full flex items-center gap-3 px-4 sm:px-6 py-4 border-b bg-background">
      <SidebarTrigger className="lg:hidden">
        <SidebarLeft01Icon className="size-5" />
      </SidebarTrigger>

      {Icon && <Icon className="size-5" />}
      <h1 className="flex-1 font-medium text-base">{title}</h1>

      <span className="hidden sm:block text-sm text-muted-foreground">
        Last update 12 min ago
      </span>

      <div className="hidden sm:block h-6 w-px bg-border" />

      {showExport && onExport && (
        <Button variant="outline" size="sm" className="hidden sm:flex gap-2" onClick={onExport}>
          {exportLabel}
        </Button>
      )}

      {showNew && (onNew || newMenuItems.length > 0) && (
        <Button variant="default" size="sm" className="hidden sm:flex gap-2" onClick={onNew}>
          {newLabel}
        </Button>
      )}

      {rightContent}
    </header>
  );
}
