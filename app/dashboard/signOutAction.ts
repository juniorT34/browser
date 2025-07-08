'use server';

import { redirect } from 'next/navigation';

export async function signOutAction() {
  // Placeholder: just redirect to home for now
  redirect('/');
} 