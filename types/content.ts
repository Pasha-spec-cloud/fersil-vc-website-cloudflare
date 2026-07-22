import { z } from 'zod';

import { companySchema, newsItemSchema, teamMemberSchema, contentBundleSchema } from '@/schemas/content';

export type Company = z.infer<typeof companySchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type NewsItem = z.infer<typeof newsItemSchema>;
export type ContentBundle = z.infer<typeof contentBundleSchema>;
