// ─── Route Intelligence Engine ───
// Recommends optimal stadium routes using weighted scoring on time, crowd density, and safety.

import type { RouteRecommendation } from '@/types';

const TIME_WEIGHT   = 0.5;
const CROWD_WEIGHT  = 0.4;
const SAFETY_WEIGHT = 0.1;

export interface RouteInput {
  id: string;
  label: string;
  timeMinutes: number;       // Route time in minutes
  crowdDensity: number;      // 0-100 crowd density along the route
  safetyRisk: number;        // 0-10 safety risk factor
  steps: string[];
}

/**
 * Score a route (lower = better).
 */
function scoreRoute(route: RouteInput): number {
  return (
    route.timeMinutes * TIME_WEIGHT +
    (route.crowdDensity / 10) * CROWD_WEIGHT +   // Normalize to 0-10 scale
    route.safetyRisk * SAFETY_WEIGHT
  );
}

/**
 * Recommend routes with rankings for fastest, least-crowded, and safest.
 */
export function recommendRoutes(routes: RouteInput[]): RouteRecommendation[] {
  if (routes.length === 0) return [];

  const scored = routes.map(route => ({
    input: route,
    score: scoreRoute(route),
  }));

  // Find best in each category
  const fastest      = [...scored].sort((a, b) => a.input.timeMinutes - b.input.timeMinutes)[0];
  const leastCrowded = [...scored].sort((a, b) => a.input.crowdDensity - b.input.crowdDensity)[0];
  const safest       = [...scored].sort((a, b) => a.input.safetyRisk - b.input.safetyRisk)[0];

  // Overall best
  scored.sort((a, b) => a.score - b.score);
  const bestOverall = scored[0];

  return scored.map(({ input, score }) => {
    let type: 'fastest' | 'least-crowded' | 'safest';
    let recommended = false;

    if (input.id === fastest.input.id) {
      type = 'fastest';
    } else if (input.id === leastCrowded.input.id) {
      type = 'least-crowded';
    } else {
      type = 'safest';
    }

    if (input.id === bestOverall.input.id) {
      recommended = true;
    }

    const crowdLabel = input.crowdDensity < 40 ? 'low' : input.crowdDensity < 70 ? 'moderate' : 'high';
    let reasoning: string;

    if (recommended) {
      reasoning = `Best overall route — ${input.timeMinutes} min, ${crowdLabel} crowd density, balanced for speed and comfort`;
    } else if (type === 'fastest') {
      reasoning = `Fastest path at ${input.timeMinutes} min but with ${crowdLabel} crowd along the route`;
    } else if (type === 'least-crowded') {
      reasoning = `Least crowded path with only ${input.crowdDensity}% density — ideal for a comfortable walk`;
    } else {
      reasoning = `Safest route with minimal risk — takes ${input.timeMinutes} min`;
    }

    return {
      routeId: input.id,
      label: input.label,
      type,
      score: Math.round(score * 100) / 100,
      time: input.timeMinutes,
      crowdDensity: input.crowdDensity,
      safetyRisk: input.safetyRisk,
      recommended,
      reasoning,
      steps: input.steps,
    };
  });
}

/**
 * Generate enhanced route variants for a given destination using current zone data.
 */
export function generateRouteVariants(
  destinationName: string,
  zoneDensities: Record<string, number>
): RouteInput[] {
  const baseDensity = Object.values(zoneDensities).length > 0
    ? Object.values(zoneDensities).reduce((a, b) => a + b, 0) / Object.values(zoneDensities).length
    : 50;

  return [
    {
      id: 'fast',
      label: 'Fastest Route',
      timeMinutes: 3,
      crowdDensity: Math.min(95, baseDensity + 15),
      safetyRisk: 2,
      steps: [
        'Exit current section',
        `Head directly toward ${destinationName}`,
        'Use main concourse (busier but shorter)',
        `Arrive at ${destinationName}`,
      ],
    },
    {
      id: 'quiet',
      label: 'Least Crowded',
      timeMinutes: 5,
      crowdDensity: Math.max(10, baseDensity - 25),
      safetyRisk: 1,
      steps: [
        'Exit current section via side aisle',
        'Take outer concourse ring',
        'Follow green path markers (low traffic)',
        `Arrive at ${destinationName}`,
      ],
    },
    {
      id: 'safe',
      label: 'Safest Route',
      timeMinutes: 6,
      crowdDensity: Math.max(15, baseDensity - 15),
      safetyRisk: 0,
      steps: [
        'Exit via nearest emergency corridor',
        'Use well-lit accessible pathway',
        'Follow staff-monitored route',
        `Arrive at ${destinationName}`,
      ],
    },
  ];
}
