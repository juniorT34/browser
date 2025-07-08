'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError('Invalid email or password.');
    } else if (result?.ok) {
      window.location.href = '/dashboard';
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1 text-left">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-orange-200 dark:bg-zinc-800 dark:border-zinc-700"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1 text-left">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-orange-200 dark:bg-zinc-800 dark:border-zinc-700"
          required
        />
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
      <Button
        type="submit"
        className="w-full bg-orange-600 text-white hover:bg-orange-700"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
} 