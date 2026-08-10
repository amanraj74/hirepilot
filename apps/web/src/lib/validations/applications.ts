import { z } from 'zod';
import { STAGE_ORDER } from '@/server/services/applications.service';

export const moveStageSchema = z.object({
  stage: z.enum(STAGE_ORDER),
});

export type MoveStageInput = z.infer<typeof moveStageSchema>;
