import { z } from 'zod';

// TODO: see Struktur-Folder-Padindi.md section 4
const envSchema = z.object({
  VITE_APP_NAME: z.string().default('Yayasan Padindi'),
  VITE_API_BASE_URL: z.string().default('http://localhost:8000/api/v1'),
});

export const env = envSchema.parse({
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
});
