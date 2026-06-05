import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CheckSquare,
  Flag,
  LayoutDashboard,
  NotebookPen,
  Search,
  Target,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const desktopNavItems: NavItem[] = [
  { href: "/today", label: "今日", icon: LayoutDashboard },
  { href: "/todos", label: "待办", icon: CheckSquare },
  { href: "/plans", label: "计划", icon: Target },
  { href: "/goals", label: "目标", icon: Flag },
  { href: "/diary", label: "日记", icon: BookOpen },
  { href: "/notes", label: "笔记", icon: NotebookPen },
];

export const searchNavItem: NavItem = {
  href: "/search",
  label: "搜索",
  icon: Search,
};

export const mobileTabItems: NavItem[] = [
  { href: "/today", label: "今日", icon: LayoutDashboard },
  { href: "/todos", label: "待办", icon: CheckSquare },
  { href: "/plans", label: "计划", icon: Target },
  { href: "/goals", label: "目标", icon: Flag },
];

export const mobileMoreItems: NavItem[] = [
  { href: "/diary", label: "日记", icon: BookOpen },
  { href: "/notes", label: "笔记", icon: NotebookPen },
];

export function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isMoreNavActive(pathname: string) {
  return mobileMoreItems.some((item) => isNavActive(pathname, item.href));
}
