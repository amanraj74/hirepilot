// Zod validation schemas for auth forms.
// Same schemas used on client (form validation) and server (server action validation).

import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z
    .string()
    .email('Enter a valid email address')
    .max(254)
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['CANDIDATE', 'RECRUITER']),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email('Enter a valid email address')
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
