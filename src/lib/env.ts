import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  AUTH_SECRET: z.string().min(1),
  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_ACCESS_KEY_ID: z.string().optional(),
  STORAGE_SECRET_ACCESS_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
