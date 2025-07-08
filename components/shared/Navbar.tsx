"use client";
import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";

export function Navbar() {
  const { data: session } = useSession();
  

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-md fixed top-0 z-50">
      <Link href="/" className="flex items-center gap-3 cursor-pointer group" aria-label="Go to home">
        <Logo size={40} />
        <span className="font-bold text-2xl text-orange-600 dark:text-orange-400  cursor-pointer">OUSEC</span>
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/" className="font-medium hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">Home</Link>
        <Link href="/services" className="font-medium hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">Services</Link>
        {session && (
          <Link href="/dashboard" className="font-medium hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">Dashboard</Link>
        )}
        {session ? (
          <Button
            type="button"
            variant="outline"
            className="border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400 hover:bg-orange-600 hover:text-white dark:hover:bg-orange-400 dark:hover:text-zinc-900 transition-colors cursor-pointer"
            onClick={() => signOut({ callbackUrl: "/services" })}
          >
            Logout
          </Button>
        ) : (
          <Link href="/login" className="cursor-pointer">
            <Button variant="outline" className="border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400 hover:bg-orange-600 hover:text-white dark:hover:bg-orange-400 dark:hover:text-zinc-900 transition-colors cursor-pointer">Login</Button>
          </Link>
        )}
        <span className="cursor-pointer"><ThemeToggle /></span>
      </div>
    </nav>
  );
} 