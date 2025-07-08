"use client";

import { LoginForm } from "@/components/shared/LoginForm";
import Link from "next/link";
import dynamic from "next/dynamic";

const LoginRedirector = dynamic(() => import("./LoginRedirector"), { ssr: false });

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <LoginRedirector />
      <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-orange-600 dark:text-orange-400 text-center">Login</h1>
        <LoginForm />
        <div className="mt-4 text-center">
          <Link href="/register" className="text-orange-600 hover:underline">Don&apos;t have an account? Register</Link>
        </div>
      </div>
    </main>
  );
} 