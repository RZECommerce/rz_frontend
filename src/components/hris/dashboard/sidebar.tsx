import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useRbacStore } from "@/stores/rbac";
import { Link, useRouterState } from "@tanstack/react-router";
import * as React from "react";

import { PesoIcon } from "@/components/shared/peso-icon";
import {
  AccountBalance as AccountBalanceIcon,
  Event as CalendarIcon,
  Dashboard as DashboardIcon,
  Description as FileTextIcon,
  Folder as FolderIcon,
  Gavel as GavelIcon,
  People as PeopleIcon,
  AdminPanelSettings as RolesIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Group as UsersIcon,
} from "@mui/icons-material";

// HRIS menu items - will be grouped under HRIS section
const hrisMenuItems: Array<{
  icon: any; // MUI Icon component
  label: string;
  href: string;
  permission: string | null;
  badge?: string | number;
  children?: Array<{
    label: string;
    href: string;
    permission: string | null;
  }>;
}> = [
  {
    icon: DashboardIcon,
    label: "Dashboard",
    href: "/hris/dashboard",
    permission: null,
  },
  {
    icon: PeopleIcon,
    label: "Employees",
    href: "/hris/employees",
    permission: "employees.view",
  },
  {
    icon: PeopleIcon,
    label: "Core HR",
    href: "/hris/core-hr",
    permission: "core-hr.view",
  },
  {
    icon: FileTextIcon,
    label: "Recruitment",
    href: "/hris/recruitment",
    permission: null,
  },
  {
    icon: FolderIcon,
    label: "Training",
    href: "/hris/training",
    permission: null,
  },
  {
    icon: CalendarIcon,
    label: "Events & Meetings",
    href: "/hris/events-meetings",
    permission: null,
  },
  {
    icon: CalendarIcon,
    label: "Attendance",
    href: "/hris/attendance",
    permission: "attendance.view",
  },
  {
    icon: CalendarIcon,
    label: "Leaves",
    href: "/hris/leaves",
    permission: "leaves.view",
  },
  {
    icon: PesoIcon,
    label: "Payroll",
    href: "/hris/payroll",
    permission: "payroll.view",
  },
  {
    icon: TrendingUpIcon,
    label: "Performance",
    href: "/hris/performance",
    permission: "core-hr.view",
  },
  {
    icon: AccountBalanceIcon,
    label: "Compensation",
    href: "/hris/compensation",
    permission: "payroll.view",
  },
  {
    icon: GavelIcon,
    label: "Disciplinary",
    href: "/hris/disciplinary",
    permission: "core-hr.view",
  },
  {
    icon: FileTextIcon,
    label: "Reports",
    href: "/hris/reports",
    permission: "reports.view",
  },
  {
    icon: FolderIcon,
    label: "Timesheets",
    href: "/hris/timesheets",
    permission: null,
  },
  {
    icon: FolderIcon,
    label: "Overtime Logs",
    href: "/hris/overtime-logs",
    permission: null,
  },
  {
    icon: SettingsIcon,
    label: "HRIS Settings",
    href: "/hris/settings",
    permission: "settings.view",
  },
];

// User Management menu items - will be grouped under User Management section
const userManagementMenuItems: Array<{
  icon: any; // MUI Icon component
  label: string;
  href: string;
  permission: string | null;
  badge?: string | number;
}> = [
  {
    icon: RolesIcon,
    label: "Roles",
    href: "/user-management/roles",
    permission: "roles.view",
  },
  {
    icon: UsersIcon,
    label: "Users",
    href: "/user-management/users",
    permission: "roles.manage",
  },
];

// Non-HRIS menu items - displayed separately
const nonHrisMenuItems: Array<{
  icon: any; // LucideIcon from lucide-react
  label: string;
  href: string;
  permission: string | null;
  badge?: string | number;
}> = [];

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const router = useRouterState();
  const pathname = router.location.pathname;
  const sidebarContentRef = React.useRef<HTMLDivElement>(null);
  const SCROLL_POSITION_KEY = "sidebar_scroll_position";
  const { toggleSidebar, state } = useSidebar();

  // RBAC helpers
  const hasPermission = useRbacStore((state) => state.hasPermission);
  const permissionsFlat = useRbacStore((state) => state.permissionsFlat);

  // Does the user have ANY HRIS-related permission?
  const hasAnyHrisPermission = React.useMemo(() => {
    const hrisPrefixes = [
      "employees.",
      "attendance.",
      "leaves.",
      "payroll.",
      "reports.",
      "holidays.",
      "reimbursements.",
      "timesheets.",
      "overtime-logs.",
    ];

    return permissionsFlat.some((perm) =>
      hrisPrefixes.some((prefix) => perm.startsWith(prefix)),
    );
  }, [permissionsFlat]);

  // Filter HRIS menu items based on permissions
  const filteredHrisMenuItems = React.useMemo(() => {
    return hrisMenuItems.filter((item) => {
      // Items without explicit permission should only be shown
      // if the user has at least ONE HRIS-related permission
      if (!item.permission) {
        return hasAnyHrisPermission;
      }

      return hasPermission(item.permission);
    });
  }, [hasAnyHrisPermission, hasPermission]);

  // Filter User Management menu items based on permissions
  const filteredUserManagementMenuItems = React.useMemo(() => {
    return userManagementMenuItems.filter((item) => {
      if (!item.permission) return false;
      return hasPermission(item.permission);
    });
  }, [hasPermission]);

  // Filter non-HRIS menu items based on permissions
  const filteredNonHrisMenuItems = React.useMemo(() => {
    return nonHrisMenuItems.filter((item) => {
      if (!item.permission) return false;
      return hasPermission(item.permission);
    });
  }, [hasPermission]);

  // Helper function to determine if a menu item is active
  // Only the most specific (longest) matching path should be active
  const getActiveHref = React.useMemo(() => {
    // Collect all menu items from all sections
    const allMenuItems = [
      ...filteredHrisMenuItems,
      ...filteredUserManagementMenuItems,
      ...filteredNonHrisMenuItems,
    ];

    // Find the most specific match (longest path that matches)
    let activeHref: string | null = null;
    let maxLength = 0;

    for (const item of allMenuItems) {
      if (pathname === item.href) {
        // Exact match always wins
        return item.href;
      } else if (
        pathname.startsWith(item.href + "/") &&
        item.href.length > maxLength
      ) {
        // More specific match (longer path)
        activeHref = item.href;
        maxLength = item.href.length;
      }
    }

    return activeHref;
  }, [
    pathname,
    filteredHrisMenuItems,
    filteredUserManagementMenuItems,
    filteredNonHrisMenuItems,
  ]);

  // Preserve sidebar scroll position across navigations
  React.useEffect(() => {
    const sidebarContent = sidebarContentRef.current;
    if (!sidebarContent) return;

    // Restore scroll position from sessionStorage after a brief delay to ensure content is rendered
    const savedScrollPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
    if (savedScrollPosition) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (sidebarContentRef.current) {
          sidebarContentRef.current.scrollTop = parseInt(
            savedScrollPosition,
            10,
          );
        }
      });
    }

    // Save scroll position on scroll
    const handleScroll = () => {
      if (sidebarContentRef.current) {
        sessionStorage.setItem(
          SCROLL_POSITION_KEY,
          sidebarContentRef.current.scrollTop.toString(),
        );
      }
    };

    sidebarContent.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      sidebarContent.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Helper to check if a href is active
  const isItemActive = (href: string) => {
    if (pathname === href) return true;
    if (pathname.startsWith(href + "/")) return true;
    return false;
  };

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      className="lg:border-r-0 flex flex-col bg-sidebar border-r border-sidebar-border"
      {...props}
    >
      <SidebarHeader className="px-3 pt-4">
        {/* Expanded state - Logo + Text */}
        <div className="group-data-[collapsible=icon]:hidden flex items-center justify-center gap-3">
          <svg
            width="36"
            height="36"
            viewBox="0 0 75 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0 text-sidebar-foreground"
          >
            <path
              d="M32.239 35.8926H55.7134C49.7108 34.7816 50.4254 30.1598 51.533 27.9877L74.3643 6.10352e-05H35.4546L42.3147 7.90496L47.0311 2.24335C47.8886 1.28194 50.4611 -0.854523 53.784 0.961462C56.766 2.59118 56.1422 6.1958 55.0703 7.90496L32.239 35.8926Z"
              fill="currentColor"
            />
            <path
              d="M25.5041 36H38.0418L25.5041 19.7244L33.7554 9.05367C36.0058 5.71232 32.148 0.107483 29.7905 0.107483H18.4315C24.261 1.14222 23.8967 5.92789 22.2893 7.86803L0 36H18.0029L14.2523 33.9521L18.8602 27.7005L25.5041 36Z"
              fill="currentColor"
            />
          </svg>
          <span
            className="text-sidebar-foreground text-sm font-semibold leading-[1.22em] whitespace-nowrap"
            style={{ fontFamily: "Instrument Sans, sans-serif" }}
          >
            RZ ECOMMERCE
          </span>
        </div>

        {/* Collapsed state - Logo only (clickable) */}
        <button
          onClick={toggleSidebar}
          className="group-data-[collapsible=icon]:flex hidden items-center justify-center w-full p-3 rounded-md hover:bg-sidebar-accent transition-colors"
          aria-label="Expand sidebar"
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 75 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0 text-sidebar-foreground"
          >
            <path
              d="M32.239 35.8926H55.7134C49.7108 34.7816 50.4254 30.1598 51.533 27.9877L74.3643 6.10352e-05H35.4546L42.3147 7.90496L47.0311 2.24335C47.8886 1.28194 50.4611 -0.854523 53.784 0.961462C56.766 2.59118 56.1422 6.1958 55.0703 7.90496L32.239 35.8926Z"
              fill="currentColor"
            />
            <path
              d="M25.5041 36H38.0418L25.5041 19.7244L33.7554 9.05367C36.0058 5.71232 32.148 0.107483 29.7905 0.107483H18.4315C24.261 1.14222 23.8967 5.92789 22.2893 7.86803L0 36H18.0029L14.2523 33.9521L18.8602 27.7005L25.5041 36Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </SidebarHeader>

      <SidebarContent
        ref={sidebarContentRef}
        className="flex-1 overflow-y-auto px-0"
      >
        <div className="w-[230px] mx-auto flex flex-col gap-6 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:items-center">
          {/* HRIS Section */}
          {filteredHrisMenuItems.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="group-data-[collapsible=icon]:hidden px-[10px] py-[10px]">
                <span
                  className="text-sidebar-foreground/60 text-xs font-semibold leading-[1.5em] uppercase"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  HRIS
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {filteredHrisMenuItems.map((item) => {
                  const isActive = isItemActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "w-[230px] px-4 py-[10px] flex items-center gap-[10px] rounded-lg transition-colors",
                        "group-data-[collapsible=icon]:!w-10 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!p-2",
                        isActive
                          ? "bg-[#8A38F5] text-white dark:bg-[#8A38F5] dark:text-white"
                          : "bg-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                      title={state === "collapsed" ? item.label : undefined}
                    >
                      <item.icon
                        className={cn(
                          "w-5 h-5 flex-shrink-0",
                          isActive
                            ? "text-white"
                            : "text-sidebar-foreground/70",
                        )}
                      />
                      <span
                        className="group-data-[collapsible=icon]:hidden text-base font-medium leading-[1.22em]"
                        style={{ fontFamily: "Instrument Sans, sans-serif" }}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Others Section */}
          {(filteredUserManagementMenuItems.length > 0 ||
            filteredNonHrisMenuItems.length > 0) && (
            <div className="flex flex-col gap-2">
              <div className="group-data-[collapsible=icon]:hidden px-[10px] py-[10px]">
                <span
                  className="text-sidebar-foreground/60 text-xs font-semibold leading-[1.5em] uppercase"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  others
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {filteredUserManagementMenuItems.map((item) => {
                  const isActive = isItemActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "w-[230px] px-4 py-[10px] flex items-center gap-[10px] rounded-lg transition-colors",
                        "group-data-[collapsible=icon]:!w-10 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!p-2",
                        isActive
                          ? "bg-[#8A38F5] text-white dark:bg-[#8A38F5] dark:text-white"
                          : "bg-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                      title={state === "collapsed" ? item.label : undefined}
                    >
                      <item.icon
                        className={cn(
                          "w-5 h-5 flex-shrink-0",
                          isActive
                            ? "text-white"
                            : "text-sidebar-foreground/70",
                        )}
                      />
                      <span
                        className="group-data-[collapsible=icon]:hidden text-base font-medium leading-[1.22em]"
                        style={{ fontFamily: "Instrument Sans, sans-serif" }}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
                {filteredNonHrisMenuItems.map((item) => {
                  const isActive = isItemActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "w-[230px] px-4 py-[10px] flex items-center gap-[10px] rounded-lg transition-colors",
                        "group-data-[collapsible=icon]:!w-10 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!p-2",
                        isActive
                          ? "bg-[#8A38F5] text-white dark:bg-[#8A38F5] dark:text-white"
                          : "bg-transparent text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                      title={state === "collapsed" ? item.label : undefined}
                    >
                      <item.icon
                        className={cn(
                          "w-5 h-5 flex-shrink-0",
                          isActive
                            ? "text-white"
                            : "text-sidebar-foreground/70",
                        )}
                      />
                      <span
                        className="group-data-[collapsible=icon]:hidden text-base font-medium leading-[1.22em]"
                        style={{ fontFamily: "Instrument Sans, sans-serif" }}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SidebarContent>

      {/* Help Center Footer */}
      <SidebarFooter className="group-data-[collapsible=icon]:hidden px-4 pb-4 pt-5 border-t border-sidebar-border">
        <div className="w-[230px] mx-auto flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <h3
              className="text-sidebar-foreground text-base font-semibold leading-[1.22em]"
              style={{ fontFamily: "Instrument Sans, sans-serif" }}
            >
              Help Center
            </h3>
            <p
              className="text-sidebar-foreground/70 text-sm font-normal leading-[1.22em]"
              style={{ fontFamily: "Instrument Sans, sans-serif" }}
            >
              Please contact us for more questions.
            </p>
          </div>
          <Button
            className="w-full bg-[#8A38F5] text-white hover:bg-[#7A28E5] dark:bg-[#8A38F5] dark:text-white dark:hover:bg-[#7A28E5] rounded-lg py-[10px] px-3 font-bold text-sm leading-[1.22em]"
            style={{ fontFamily: "Instrument Sans, sans-serif" }}
          >
            Contact Admin
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
