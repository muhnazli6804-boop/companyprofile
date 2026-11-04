import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_NAME: z.string().default('Yayasan Padindi'),
  VITE_API_BASE_URL: z.string().default('http://localhost:8000/api/v1'),
  /**
   * VITE_USE_MOCK="true"  → pakai data contoh dari features/public/mocks/ (default pengembangan)
   * VITE_USE_MOCK="false" → panggil API sungguhan
   */
  VITE_USE_MOCK: z.string().default('true'),
});

export const env = envSchema.parse({
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_USE_MOCK: import.meta.env.VITE_USE_MOCK,
});
