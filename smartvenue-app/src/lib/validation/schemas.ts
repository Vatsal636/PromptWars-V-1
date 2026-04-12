import { z } from 'zod';

// ─── Environment Variables Schema ───
export const envSchema = z.object({
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1, 'Google Maps API Key is required'),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1, 'Firebase API Key is required'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase Project ID is required'),
});

// ─── API Request Schemas ───

export const routeRequestSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().min(1, 'Destination is required'),
  optimizeFor: z.enum(['time', 'crowd', 'distance']).optional(),
});

export const sosPayloadSchema = z.object({
  type: z.enum(['medical', 'security', 'fire', 'general']),
  location: z.string().min(1, 'Location is required'),
  timestamp: z.number().int().positive().optional(),
});

export const congestionPredictionSchema = z.object({
  zoneId: z.string().min(1, 'Zone ID is required'),
  timeframe: z.number().int().positive().optional(),
});
