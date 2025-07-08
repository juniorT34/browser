'use server';
import  prisma  from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { signIn } from 'next-auth/react'; // For client-side signIn
import { AuthError } from 'next-auth';

const SignupFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signup(_state: unknown, formData: FormData) {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { errors: { email: ['Email already registered.'] } };
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      // role defaults to USER
    },
  });
  return { success: true };
}

const SigninFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signin(_state: unknown, formData: FormData) {
  const validatedFields = SigninFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // signIn returns a Promise with an object containing error, ok, status
    const result = await signIn('credentials', {
      redirect: false,
      email: validatedFields.data.email,
      password: validatedFields.data.password,
    });
    if (result?.error) {
      return { errors: { email: ['Invalid email or password.'] } };
    }
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { errors: { email: ['Invalid email or password.'] } };
        default:
          return { errors: { email: ['Something went wrong.'] } };
      }
    }
    throw error;
  }
} 