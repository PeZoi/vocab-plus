import { z } from 'zod';

export const questTypeSchema = z.enum(['review_cards', 'learn_new', 'earn_xp', 'accuracy']);
export type QuestType = z.infer<typeof questTypeSchema>;

export const questTemplateSchema = z.object({
  id: z.string(),
  quest_type: questTypeSchema,
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  target: z.number().int().positive('Mục tiêu phải lớn hơn 0'),
  reward_xp: z.number().int().nonnegative('Điểm thưởng không được âm'),
  is_active: z.boolean(),
  description: z.string().optional(),
});
export type QuestTemplate = z.infer<typeof questTemplateSchema>;

export const dailyQuestSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  date: z.string(),
  quest_type: questTypeSchema,
  title: z.string().optional(),
  target: z.number().int(),
  progress: z.number().int(),
  is_completed: z.boolean(),
  reward_xp: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type DailyQuest = z.infer<typeof dailyQuestSchema>;

export const dailyQuestsResponseSchema = z.object({
  quests: z.array(dailyQuestSchema),
  completedCount: z.number().int(),
  totalCount: z.number().int(),
  allCompleted: z.boolean(),
});
export type DailyQuestsResponse = z.infer<typeof dailyQuestsResponseSchema>;
