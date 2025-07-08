'use client';
import { useActionState } from 'react';
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";

type SignupFormState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  success?: boolean;
};

export function SignupForm({ action }: { action: (state: SignupFormState | undefined, formData: FormData) => Promise<SignupFormState | undefined> }) {
  const [state, formAction] = useActionState<SignupFormState | undefined, FormData>(action, { errors: {} });

  useEffect(() => {
    if (state?.success) {
      const timeout = setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [state]);

  return (
    <form action={formAction} className="w-full space-y-4" method="post">
      {state?.success && (
        <div className="w-full text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2 text-sm text-left mb-2">
          Registration successful! Redirecting to login...
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1 text-left">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-orange-200 dark:bg-zinc-800 dark:border-zinc-700"
          required
        />
        {state?.errors?.name && (
          <p className="text-red-500 text-xs mt-1">{state.errors.name.join(' ')}</p>
        )}
      </div>
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
        {state?.errors?.email && (
          <p className="text-red-500 text-xs mt-1">{state.errors.email.join(' ')}</p>
        )}
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1 text-left">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-orange-200 dark:bg-zinc-800 dark:border-zinc-700"
          required
        />
        {state?.errors?.password && (
          <p className="text-red-500 text-xs mt-1">{state.errors.password.join(' ')}</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full bg-orange-600 text-white hover:bg-orange-700"
        disabled={state?.success}
      >
        Register
      </Button>
    </form>
  );
} 