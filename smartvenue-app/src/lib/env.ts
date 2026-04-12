import { envSchema } from './validation/schemas';

const envVars = {
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Validate environment variables on initialization
const result = envSchema.safeParse(envVars);

if (!result.success) {
  console.warn('⚠️ Invalid or missing environment variables:');
  console.warn(result.error.flatten().fieldErrors);
}

export const env = result.success ? result.data : envVars;
