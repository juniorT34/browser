import Link from "next/link";
import { Monitor, FileText, User } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

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
    href: "#",
    icon: <FileText size={20} />,
    active: () => false, // Keep disabled unless user log viewing is implemented
    disabled: true,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: <User size={20} />,
    active: (pathname: string) => pathname === "/dashboard/profile",
    disabled: false,
  },
];

export default function SideNav() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";

  return (
    <nav className="h-full bg-white/20 dark:bg-black/30 backdrop-blur-xl shadow-2xl rounded-r-2xl flex flex-col gap-6 p-6 text-orange-600 min-w-[200px]">
      <Link
        href="/services"
        className="flex items-center gap-3 mb-8 group"
      >
        <Logo size={40} />
        <span className="sr-only">Go to Services</span>
      </Link>
      <ul className="flex flex-col gap-2">
        {navItems.map((item) => (
          <li key={item.label}>
            {item.disabled ? (
              <span className="flex items-center gap-2 font-semibold text-gray-400 cursor-not-allowed opacity-60">
                {item.icon}
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center gap-2 font-semibold px-3 py-2 rounded-lg transition-all duration-150
                  ${item.active(pathname)
                    ? "bg-orange-600/20 text-orange-700 shadow-inner"
                    : "hover:bg-orange-600/10 hover:text-orange-700"}
                `}
              >
                {item.icon}
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
} 