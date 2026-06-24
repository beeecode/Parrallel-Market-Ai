export type NavIcon =
  | "dashboard"
  | "simulations"
  | "products"
  | "customers"
  | "reports"
  | "insights"
  | "settings";

export type NavItem = {
  label: string;
  href: string;
  icon: NavIcon;
  disabled?: boolean;
};
