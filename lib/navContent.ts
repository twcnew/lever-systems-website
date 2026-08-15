export type NavLinkItem = {
  type: "link";
  label: string;
  href: string;
};

export type NavGroupItem = {
  type: "group";
  label: string;
  items: Array<{
    label: string;
    href?: string;
    disabled?: boolean;
    badge?: string;
  }>;
};

export type NavItem = NavLinkItem | NavGroupItem;

export const NAV_ITEMS: NavItem[] = [
  { type: "link", label: "Problem", href: "/#problem" },
  { type: "link", label: "Solution", href: "/#solution" },
  { type: "link", label: "Proof", href: "/#proof" },
  { type: "link", label: "FAQ", href: "/#faq" },
  { type: "link", label: "Customers", href: "/use-cases" },
  { type: "link", label: "Blog", href: "/blog" },
];

export const NAV_CTA = {
  label: "Book a Call",
  href: "/#contact",
};
