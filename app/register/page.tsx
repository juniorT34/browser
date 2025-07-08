"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(signup, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        action={formAction}
        className="w-full max-w-sm p-8 bg-white rounded shadow-md space-y-6"
        autoComplete="off"
      >
        <h1 className="text-2xl font-bold text-center">Register</h1>
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            required
            disabled={pending}
          />
          {state?.errors?.name && (
            <p className="text-red-600 text-sm mt-1">{state.errors.name[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            required
            disabled={pending}
          />
          {state?.errors?.email && (
            <p className="text-red-600 text-sm mt-1">{state.errors.email[0]}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            required
            disabled={pending}
          />
          {state?.errors?.password && (
            <p className="text-red-600 text-sm mt-1">{state.errors.password[0]}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={pending}
        >
          {pending ? "Registering..." : "Register"}
        </button>
      </form>
    </main>
  );
} 