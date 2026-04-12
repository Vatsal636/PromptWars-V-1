// GET /api/ai/routes
// Returns AI-optimized route recommendations.

import { NextResponse } from 'next/server';
import { tick } from '@/lib/simulation/liveDataSimulator';
import { generateRouteVariants, recommendRoutes } from '@/lib/ai/routeEngine';
import { routeRequestSchema } from '@/lib/validation/schemas';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationRaw = searchParams.get('destination') || 'My Seat';

    // Validate request
    const validated = routeRequestSchema.safeParse({ destination: destinationRaw });
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid destination parameter', details: validated.error.format() },
        { status: 400 }
      );
    }
    const destination = validated.data.destination;

    const state = tick();

    // Build zone density map from live data
    const zoneDensities: Record<string, number> = {};
    state.zones.forEach(z => { zoneDensities[z.id] = z.crowdPercentage; });

    // Generate fresh route variants for this destination
    const routeInputs = generateRouteVariants(destination, zoneDensities);
    const recommendations = recommendRoutes(routeInputs);

    const fastest = recommendations.find(r => r.type === 'fastest');
    const leastCrowded = recommendations.find(r => r.type === 'least-crowded');
    const safest = recommendations.find(r => r.type === 'safest');
    const recommended = recommendations.find(r => r.recommended);

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        phase: state.phase,
        destination,
        recommended,
        routes: {
          fastest,
          leastCrowded,
          safest,
        },
        all: recommendations,
        avgDensity: state.stats.crowdDensity,
      }
    });
  } catch (error) {
    console.error('[API Routes] Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
