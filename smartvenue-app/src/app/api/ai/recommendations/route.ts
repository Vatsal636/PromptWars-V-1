// GET /api/ai/recommendations
// Returns gate and queue recommendations from the AI crowd engine.

import { NextResponse } from 'next/server';
import { tick } from '@/lib/simulation/liveDataSimulator';

export const dynamic = 'force-dynamic';

export async function GET() {
  const state = tick();

  const bestGate = state.gateRecommendations.find(g => g.recommended) || state.gateRecommendations[0];

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    phase: state.phase,
    phaseName: state.phaseName,
    phaseProgress: state.phaseProgress,
    gates: {
      recommended: bestGate,
      all: state.gateRecommendations,
    },
    queues: {
      recommendations: state.queueRecommendations,
      bestFood: state.queueRecommendations.find(q => q.recommended),
    },
    stats: {
      crowdDensity: state.stats.crowdDensity,
      avgWaitTime: state.stats.avgWaitTime,
      openGates: state.stats.openGates,
      totalAttendees: state.stats.totalAttendees,
    },
  });
}
