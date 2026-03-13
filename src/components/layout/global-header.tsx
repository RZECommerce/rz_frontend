import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { type BreadcrumbItem } from "@/components/ui/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { UserCard } from "@/components/user/user-card";
import { useHasPermission } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";
import {
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { PanelLeft, PanelRight } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import React from "react";

// Map routes to breadcrumb items
function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  // HRIS pages - all pages under HRIS section
  const hrisPages: Record<string, string> = {
    "/hris/dashboard": "Dashboard",
    "/hris/employees": "Employees",
    "/hris/attendance": "Attendance",
    "/hris/leaves": "Leaves",
    "/hris/holidays": "Holidays",
    "/hris/reports": "Reports & Analytics",
    "/hris/timesheets": "Timesheets",
    "/hris/overtime-logs": "Overtime Logs",
  };

  // User Management pages
  const userManagementPages: Record<string, string> = {
    "/user-management/users": "Users",
    "/user-management/roles": "Roles",
    "/user-management/account": "Account",
  };

  // Check exact match first
  if (hrisPages[pathname]) {
    return [
      { label: "HRIS", href: "/hris/dashboard" },
      { label: hrisPages[pathname] },
    ];
  }

  if (userManagementPages[pathname]) {
    return [
      { label: "User Management", href: "/user-management/users" },
      { label: userManagementPages[pathname] },
    ];
  }

  // Check for payroll sub-routes
  if (pathname.startsWith("/hris/payroll")) {
    const payrollSubRoutes: Record<string, string> = {
      "/hris/payroll/runs": "Payroll Runs",
      "/hris/payroll/periods": "Payroll Periods",
      "/hris/payroll/salary-components": "Salary Components",
      "/hris/payroll/deductions": "Deductions",
    };

    if (payrollSubRoutes[pathname]) {
      return [
        { label: "HRIS", href: "/hris/dashboard" },
        { label: "Payroll", href: "/hris/payroll" },
        { label: payrollSubRoutes[pathname] },
      ];
    }

    // Default payroll sub-route
    return [
      { label: "HRIS", href: "/hris/dashboard" },
      { label: "Payroll", href: "/hris/payroll" },
    ];
  }

  // Old user management routes (deprecated - using /user-management/* now)
  const oldUserManagementPages: Record<string, string> = {
    "/roles": "Roles",
    "/users": "Users",
  };

  if (oldUserManagementPages[pathname]) {
    return [
      { label: "User Management", href: "/dashboard" },
      { label: oldUserManagementPages[pathname] },
    ];
  }

  // Other pages
  const otherPages: Record<string, string> = {
    "/settings": "Settings",
    "/account": "Account Settings",
    "/notifications": "Notifications",
  };

  if (otherPages[pathname]) {
    return [{ label: otherPages[pathname] }];
  }

  // Default
  return [];
}

export function GlobalHeader() {
  const router = useRouterState();
  const pathname = router.location.pathname;
  const breadcrumbs = getBreadcrumbs(pathname);
  const canViewSettings = useHasPermission("settings.view");
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <header className="sticky top-0 z-10 flex w-full items-center justify-between gap-2 border-b border-border/40 bg-background px-3 py-2 font-sans shadow-none transition-all duration-200 sm:gap-3 sm:px-4">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden">
        <SidebarTrigger className="lg:hidden" />
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex p-1.5 rounded-md hover:bg-accent transition-colors flex-shrink-0"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelRight className="w-5 h-5 text-foreground" />
          ) : (
            <PanelLeft className="w-5 h-5 text-foreground" />
          )}
        </button>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5 sm:pb-0">
          {breadcrumbs.length === 0 ? (
            <span className="text-foreground font-medium truncate">Dashboard</span>
          ) : (
            breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              const isFirst = index === 0;

              return (
                <React.Fragment key={index}>
                  {!isFirst && (
                    <ChevronRightIcon className="size-3.5 sm:size-5 text-muted-foreground flex-shrink-0" />
                  )}
                  {item.href && !isLast ? (
                    <Link
                      to={item.href}
                      resetScroll={false}
                      className="text-muted-foreground hover:text-foreground transition-colors active"
                      data-status="active"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className="text-foreground font-medium"
                      aria-current={isLast ? "page" : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })
          )}
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <div className="flex items-center justify-center">
          <NotificationDropdown />
        </div>

        <div className="flex items-center justify-center">
          <ThemeToggle />
        </div>

        {canViewSettings && (
          <div className="hidden sm:flex items-center justify-center">
            <Link
              to="/settings"
              resetScroll={false}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-sm" }),
                "border-0 shadow-none flex items-center justify-center"
              )}
            >
              <SettingsIcon className="size-5" />
            </Link>
          </div>
        )}

        <div className="hidden sm:block h-6 w-px bg-border" />

        <UserCard />
      </div>
    </header>
  );
}
