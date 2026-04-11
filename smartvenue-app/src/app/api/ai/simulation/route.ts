// GET /api/ai/simulation
// Returns the complete simulation state — used by admin and as a master endpoint.

import { NextResponse } from 'next/server';
import { tick } from '@/lib/simulation/liveDataSimulator';

export const dynamic = 'force-dynamic';

export async function GET() {
  const state = tick();

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    simulation: {
      phase: state.phase,
      phaseName: state.phaseName,
      phaseProgress: state.phaseProgress,
      elapsedMinutes: state.elapsedMinutes,
    },
    stats: state.stats,
    zones: state.zones,
    queues: state.queues,
    gates: state.gates,
    ai: {
      gateRecommendations: state.gateRecommendations,
      queueRecommendations: state.queueRecommendations,
      routeRecommendations: state.routeRecommendations,
      predictions: state.predictions,
      alerts: state.alerts,
    },
  });
}
