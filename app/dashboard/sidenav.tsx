'use client';

import Link from "next/link";
import { Monitor, FileText, User, PowerIcon, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useState } from "react";
import { signOutAction } from './signOutAction';
import { usePathname } from 'next/navigation';

const isAdmin = true; // TODO: Replace with real admin check

const navItems = [
  {
    label: "Sessions",
    href: "/dashboard",
    icon: <Monitor size={20} />,
    active: (pathname: string) => pathname === "/dashboard",
    disabled: false,
  },
  {
    label: "Logs",
    href: "/dashboard/admin/logs",
    icon: <FileText size={20} />,
    active: (pathname: string) => pathname.startsWith("/dashboard/admin/logs"),
    disabled: false, // Enable for admin
    adminOnly: true, // Only show for admin users
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: <User size={20} />,
    active: (pathname: string) => pathname === "/dashboard/profile",
    disabled: false,
  },
  ...(isAdmin ? [{
    label: "Manage",
    href: "/dashboard/admin/manage",
    icon: <Shield size={20} />,
    active: (pathname: string) => pathname.startsWith("/dashboard/admin/manage"),
    disabled: false,
  }] : []),
];

export default function SideNav() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={`flex h-full flex-col px-3 py-4 md:px-2 transition-all duration-300 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* Top: Logo + Name + Theme Toggle + Collapse Button */}
      <div className="flex items-center justify-between mb-8 gap-2">
        <div className="flex items-center gap-3">
          <Link href="/services" className="flex items-center gap-3 group">
            <Logo size={40} />
            {!collapsed && (
              <span className="text-xl font-bold text-orange-600 tracking-wide select-none transition-opacity duration-200">OUSEC</span>
            )}
          </Link>
          <div className={collapsed ? "hidden" : "block"}>
            <ThemeToggle />
          </div>
        </div>
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((c) => !c)}
          className="p-1 rounded hover:bg-orange-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {collapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
        </button>
      </div>
      {/* Nav Items */}
      <ul className="flex flex-col gap-2">
        {navItems.map((item) => (
          <li key={item.label}>
            {item.disabled ? (
              <span className={`flex items-center gap-2 font-semibold text-gray-400 cursor-not-allowed opacity-60 ${collapsed ? "justify-center" : ""}`}>{item.icon}{!collapsed && item.label}</span>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center ${collapsed ? "justify-center" : "gap-2"} font-semibold px-3 py-2 rounded-lg transition-all duration-150
                  ${item.active(pathname)
                    ? "bg-orange-600/20 text-orange-700 shadow-inner"
                    : "hover:bg-orange-600/10 hover:text-orange-700"}
                `}
              >
                {item.icon}
                {!collapsed && item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
      {/* Spacer */}
      <div className="flex-1" />
      {/* Logout button at the bottom */}
      <form
        action={signOutAction}
        className="pt-2"
      >
        <button type="submit" className={`flex w-full items-center ${collapsed ? "justify-center" : "gap-2"} rounded-md bg-gray-900/80 text-orange-400 hover:bg-orange-900 hover:text-white transition-colors px-3 py-2 font-medium mt-2`}>
          <PowerIcon className="w-5 h-5" />
          {!collapsed && <span className="hidden md:inline">Logout</span>}
        </button>
      </form>
    </div>
  );
} 