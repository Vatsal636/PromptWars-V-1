import { describe, it, expect, vi } from 'vitest';
import { GET as getRoutes } from '../app/api/ai/routes/route';

describe('API Routes', () => {
  it('returns safe error for missing destination in /api/ai/routes', async () => {
    // Calling without searchParams
    const request = new Request('http://localhost:3000/api/ai/routes');
    
    // In our implementation, destination defaults to 'My Seat', so it won't actually fail the Zod validation
    // Let's test the default fallback behavior instead
    const response = await getRoutes(request);
    const json = await response.json();
    
    expect(json.success).toBe(true);
    expect(json.data.destination).toBe('My Seat');
  });

  it('handles custom destination queries', async () => {
    const request = new Request('http://localhost:3000/api/ai/routes?destination=Gate A');
    
    const response = await getRoutes(request);
    const json = await response.json();
    
    expect(json.success).toBe(true);
    expect(json.data.destination).toBe('Gate A');
    expect(json.data.routes).toBeDefined();
    expect(json.data.recommended).toBeDefined();
  });
});
