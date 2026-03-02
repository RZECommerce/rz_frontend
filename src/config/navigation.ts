/**
 * Navigation configuration
 */

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
  external?: boolean;
}

export const mainNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Settings",
    href: "/settings",
  },
];

export const sidebarNav: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Employees",
    href: "/employees",
  },
  {
    title: "Settings",
    href: "/settings",
  },
];

