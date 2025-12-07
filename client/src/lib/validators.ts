import { z } from 'zod';

// Campaign creation schema for frontend
export const campaignFormSchema = z.object({
  title: z.string()
    .min(5, 'Название должно быть не менее 5 символов')
    .max(200, 'Название не должно превышать 200 символов'),
  description: z.string()
    .min(10, 'Описание должно быть не менее 10 символов')
    .max(200, 'Описание не должно превышать 200 символов'),
  fullDescription: z.string()
    .min(20, 'История кампании должна быть не менее 20 символов')
    .max(2000, 'История кампании не должна превышать 2000 символов')
    .optional(),
  category: z.string()
    .min(1, 'Выберите категорию'),
  customCategory: z.string()
    .min(2, 'Название категории должно быть не менее 2 символов')
    .optional(),
  goal: z.string()
    .min(1, 'Укажите целевую сумму')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Сумма должна быть больше 0')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 1;
    }, 'Минимальная сумма: 1 ₽'),
  currency: z.string().default('RUB'),
  partnerId: z.string()
    .min(1, 'Выберите фонд-партнёр'),
  deadline: z.string().optional(),
  image: z.string().nullable().optional(),
}).refine((data) => {
  // If category is "other", customCategory must be provided
  if (data.category === 'other') {
    return data.customCategory && data.customCategory.length >= 2;
  }
  return true;
}, {
  message: 'Укажите название категории',
  path: ['customCategory'],
});

export type CampaignFormData = z.infer<typeof campaignFormSchema>;

// Comment schema for frontend
export const commentFormSchema = z.object({
  content: z.string()
    .min(1, 'Комментарий не может быть пустым')
    .max(500, 'Комментарий не должен превышать 500 символов'),
});

export type CommentFormData = z.infer<typeof commentFormSchema>;

// Partner application schema for frontend
export const partnerApplicationSchema = z.object({
  orgName: z.string()
    .min(2, 'Название организации должно быть не менее 2 символов')
    .max(200, 'Название организации не должно превышать 200 символов'),
  country: z.string()
    .min(1, 'Выберите страну'),
  website: z.string()
    .url('Введите корректный URL сайта')
    .min(1, 'Укажите сайт организации'),
  email: z.string()
    .email('Введите корректный email адрес')
    .min(1, 'Укажите email'),
  description: z.string()
    .max(1000, 'Описание не должно превышать 1000 символов')
    .optional(),
  categories: z.array(z.string())
    .min(1, 'Выберите хотя бы одну категорию'),
  telegram: z.string()
    .min(1, 'Укажите ник в Telegram')
    .max(100, 'Ник не должен превышать 100 символов'),
});

export type PartnerApplicationFormData = z.infer<typeof partnerApplicationSchema>;

