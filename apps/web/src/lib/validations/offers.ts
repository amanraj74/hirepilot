import { z } from 'zod';

export const sendOfferSchema = z.object({
  applicationId: z.string().min(1),
  salaryAmount: z.coerce.number().int().positive(),
  salaryCurrency: z.string().length(3).toUpperCase().default('USD'),
  joiningDate: z.coerce.date({ invalid_type_error: 'Pick a joining date' }),
  expiresAt: z.coerce.date().optional(),
  location: z.string().max(120).optional().or(z.literal('')),
  benefits: z.array(z.string().min(1).max(200)).max(10).default([]),
  bodyMarkdown: z.string().max(5_000).optional().or(z.literal('')),
});

export type SendOfferInput = z.infer<typeof sendOfferSchema>;
