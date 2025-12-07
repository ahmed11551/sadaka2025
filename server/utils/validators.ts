import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().default('ru'),
  city: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const campaignCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(200),
  fullDescription: z.string().optional(),
  category: z.string(),
  goal: z.number().positive('Goal must be positive'),
  currency: z.string().default('RUB'),
  type: z.enum(['fund', 'private']),
  partnerId: z.string().optional(),
  deadline: z.string().datetime().optional(),
  urgent: z.boolean().default(false),
  image: z.string().optional(),
});

export const donationCreateSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('RUB'),
  type: z.enum(['campaign', 'quick', 'subscription', 'mubarakway']),
  category: z.string().optional(),
  campaignId: z.string().uuid().optional(),
  partnerId: z.string().uuid().optional(),
  anonymous: z.boolean().default(false),
  comment: z.string().optional(),
  paymentMethod: z.string().optional(),
});

export const subscriptionCreateSchema = z.object({
  planType: z.enum(['muslim', 'pro', 'premium']),
  billingCycle: z.enum(['monthly', '6months', '12months', '3years']),
  amount: z.number().positive(),
  charityPercent: z.number().min(0).max(100),
  paymentMethod: z.string().optional(),
});

export const partnerCreateSchema = z.object({
  name: z.string().min(2),
  nameAr: z.string().optional(),
  slug: z.string().min(2),
  type: z.string(),
  description: z.string(),
  logo: z.string().optional(),
  country: z.string(),
  city: z.string().optional(),
  location: z.string(),
  website: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  categories: z.array(z.string()).default([]),
});

export const commentCreateSchema = z.object({
  content: z.string().min(1).max(500),
  campaignId: z.string().uuid(),
});
