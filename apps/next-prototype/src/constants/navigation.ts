import type { NavItem } from "@/types/navigation";

export const navigationItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Simulations", href: "/simulations", icon: "simulations" },
  { label: "Products", href: "/products", icon: "products", disabled: true },
  { label: "Customers", href: "/customers", icon: "customers", disabled: true },
  { label: "Reports", href: "/reports", icon: "reports" },
  { label: "Insights", href: "/insights", icon: "insights", disabled: true },
  { label: "Settings", href: "/settings", icon: "settings", disabled: true },
];
