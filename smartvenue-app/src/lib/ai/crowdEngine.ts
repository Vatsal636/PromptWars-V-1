// ─── Crowd Recommendation Engine ───
// Recommends the best gate using weighted scoring on wait time + distance.

import type { GateData, GateRecommendation } from '@/types';

const WAIT_WEIGHT = 0.7;
const DIST_WEIGHT = 0.3;

/**
 * Compute a composite score for a single gate.
 * Lower score = better recommendation.
 */
function scoreGate(gate: GateData): number {
  // Normalize distance to 0-20 range (max distance ≈ 400m → 20 units)
  const normalizedDist = gate.distance / 20;
  return gate.waitTime * WAIT_WEIGHT + normalizedDist * DIST_WEIGHT;
}

/**
 * Recommend the best gate from available gates.
 * Returns a sorted array of GateRecommendation (best first).
 */
export function recommendGates(gates: GateData[]): GateRecommendation[] {
  const openGates = gates.filter(g => g.status === 'open');
  if (openGates.length === 0) return [];

  const scored = openGates.map(gate => ({
    gate,
    score: scoreGate(gate),
  }));

  scored.sort((a, b) => a.score - b.score);

  const bestScore = scored[0].score;
  const bestWait = scored[0].gate.waitTime;
  const worstWait = Math.max(...scored.map(s => s.gate.waitTime));

  return scored.map(({ gate, score }, index) => {
    const timeSaved = gate.waitTime - bestWait;
    const isRecommended = index === 0;

    let reasoning: string;
    if (isRecommended) {
      reasoning = `${gate.name} recommended — ${worstWait - gate.waitTime} min faster than the busiest gate`;
    } else if (score - bestScore < 2) {
      reasoning = `${gate.name} is a good alternative — only ${timeSaved} min more than the best option`;
    } else {
      reasoning = `${gate.name} has heavy congestion — ${timeSaved} min longer wait than recommended`;
    }

    return {
      gateId: gate.id,
      gateName: gate.name,
      score: Math.round(score * 100) / 100,
      waitTime: gate.waitTime,
      crowdLevel: gate.crowd,
      recommended: isRecommended,
      reasoning,
      timeSaved: isRecommended ? worstWait - gate.waitTime : -timeSaved,
    };
  });
}

/**
 * Get the single best gate recommendation.
 */
export function getBestGate(gates: GateData[]): GateRecommendation | null {
  const recs = recommendGates(gates);
  return recs.length > 0 ? recs[0] : null;
}
