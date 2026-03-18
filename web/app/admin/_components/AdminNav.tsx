"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Megaphone, UtensilsCrossed } from "lucide-react";

const navItems = [
  {
    href: "/admin",
    label: "ダッシュボード",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/news",
    label: "お知らせ管理",
    icon: Megaphone,
    exact: false,
  },
  {
    href: "/admin/menus",
    label: "メニュー管理",
    icon: UtensilsCrossed,
    exact: false,
  },
];

interface Props {
  /** サイドバー用（縦並び）か、モバイルタブ用（横並び）か */
  orientation?: "vertical" | "horizontal";
}

export default function AdminNav({ orientation = "vertical" }: Props) {
  const pathname = usePathname();

  if (orientation === "horizontal") {
    return (
      <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-slate-100 text-slate-900 font-medium"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Icon size={13} strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav>
      <p className="text-[10px] tracking-[0.35em] text-slate-400 px-3 mb-3 uppercase">
        Menu
      </p>
      <ul className="space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon
                  size={16}
                  strokeWidth={1.8}
                  className={isActive ? "text-slate-700" : "text-slate-400"}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
