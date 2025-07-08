import { signup } from "@/app/actions/auth";
import { Logo } from "@/components/shared/Logo";
import { SignupForm } from "@/components/shared/SignupForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-xl p-8 flex flex-col items-center border border-zinc-200 dark:border-zinc-800">
        <Logo size={64} />
        <h1 className="text-3xl font-extrabold text-orange-600 dark:text-orange-400 mt-4 mb-2 text-center">Create Your OUSEC Account</h1>
        <p className="mb-6 text-gray-500 dark:text-gray-300 text-center">Sign up for secure, disposable browser & desktop sessions</p>
        <SignupForm action={signup} />
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">Sign In</Link>
        </p>
      </div>
    </main>
  );
} 