// GET /api/ai/routes
// Returns AI-optimized route recommendations.

import { NextResponse } from 'next/server';
import { tick } from '@/lib/simulation/liveDataSimulator';
import { generateRouteVariants, recommendRoutes } from '@/lib/ai/routeEngine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get('destination') || 'My Seat';

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
  });
}
