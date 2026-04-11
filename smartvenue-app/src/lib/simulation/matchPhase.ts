// ─── Match Phase Simulation Engine ───
// Simulates realistic event lifecycle that dynamically affects all venue data.

import type { MatchPhase, StadiumZone, QueueStation, GateData } from '@/types';

export interface PhaseConfig {
  phase: MatchPhase;
  name: string;
  duration: number;         // seconds in simulation (accelerated)
  crowdMultiplier: number;  // base crowd density multiplier
  queueMultiplier: number;  // queue length multiplier
  gateLoad: number;         // gate congestion factor
  description: string;
}

/**
 * Match phase definitions with their behavioral parameters.
 */
export const PHASE_CONFIGS: PhaseConfig[] = [
  {
    phase: 'pre-match',
    name: 'Pre-Match Entry',
    duration: 60,   // 60 seconds simulation
    crowdMultiplier: 0.5,
    queueMultiplier: 0.4,
    gateLoad: 0.8,
    description: 'Gates open, attendees entering. Crowd building steadily.',
  },
  {
    phase: 'live',
    name: 'Match Live — First Half',
    duration: 90,
    crowdMultiplier: 0.65,
    queueMultiplier: 0.3,
    gateLoad: 0.2,
    description: 'Match in progress. Most attendees seated. Low queue activity.',
  },
  {
    phase: 'halftime',
    name: 'Halftime Break',
    duration: 45,
    crowdMultiplier: 0.85,
    queueMultiplier: 1.8,
    gateLoad: 0.15,
    description: 'Break period. Food/restroom queues spike dramatically.',
  },
  {
    phase: 'second-half',
    name: 'Match Live — Second Half',
    duration: 90,
    crowdMultiplier: 0.6,
    queueMultiplier: 0.25,
    gateLoad: 0.1,
    description: 'Second half underway. Crowd engaged. Queues normalizing.',
  },
  {
    phase: 'exit',
    name: 'Post-Match Exit',
    duration: 60,
    crowdMultiplier: 0.9,
    queueMultiplier: 0.6,
    gateLoad: 1.0,
    description: 'Match ended. Mass exit in progress. All gates under load.',
  },
];

/**
 * Get phase config for a given phase.
 */
export function getPhaseConfig(phase: MatchPhase): PhaseConfig {
  return PHASE_CONFIGS.find(p => p.phase === phase) || PHASE_CONFIGS[0];
}

/**
 * Determine which phase should be active based on elapsed simulation time.
 */
export function getCurrentPhase(elapsedSeconds: number): { phase: MatchPhase; progress: number; config: PhaseConfig } {
  let accumulated = 0;

  for (const config of PHASE_CONFIGS) {
    if (elapsedSeconds < accumulated + config.duration) {
      const progress = (elapsedSeconds - accumulated) / config.duration;
      return { phase: config.phase, progress: Math.min(1, progress), config };
    }
    accumulated += config.duration;
  }

  // Loop back to pre-match after all phases complete
  const totalDuration = PHASE_CONFIGS.reduce((s, p) => s + p.duration, 0);
  return getCurrentPhase(elapsedSeconds % totalDuration);
}

/**
 * Apply phase modifiers to zone crowd percentages.
 */
export function applyPhaseToZones(zones: StadiumZone[], config: PhaseConfig): StadiumZone[] {
  return zones.map(zone => {
    // Different zone types respond differently to phases
    const isFoodCourt = zone.section.startsWith('E') || zone.section.startsWith('W');
    const isConcourse = zone.section.endsWith('C');
    const isEntrance = zone.section === 'ME';
    const isVIP = zone.section === 'VIP';

    let modifier = config.crowdMultiplier;

    // Phase-specific zone adjustments
    if (config.phase === 'halftime') {
      if (isFoodCourt) modifier = 1.5;       // Food courts spike
      if (isConcourse) modifier = 1.3;        // Concourses busy
    } else if (config.phase === 'exit') {
      if (isEntrance) modifier = 1.6;          // Exit zones spike
      if (isConcourse) modifier = 1.4;
    } else if (config.phase === 'pre-match') {
      if (isEntrance) modifier = 1.2;          // Entry areas busy
    } else if (config.phase === 'live' || config.phase === 'second-half') {
      if (isFoodCourt) modifier = 0.4;          // Food courts empty during play
      if (isVIP) modifier = 0.5;
    }

    // Apply modifier with randomness
    const jitter = (Math.random() - 0.5) * 8;
    const newPct = Math.max(10, Math.min(95,
      Math.round(zone.crowdPercentage * modifier + jitter)
    ));

    const status: StadiumZone['status'] =
      newPct < 40 ? 'low' :
      newPct < 65 ? 'moderate' :
      newPct < 85 ? 'high' : 'critical';

    const newCount = Math.round(zone.capacity * (newPct / 100));

    return { ...zone, crowdPercentage: newPct, status, currentCount: newCount };
  });
}

/**
 * Apply phase modifiers to queue stations.
 */
export function applyPhaseToQueues(stations: QueueStation[], config: PhaseConfig): QueueStation[] {
  return stations.map(station => {
    let modifier = config.queueMultiplier;

    // Phase-specific queue adjustments
    if (config.phase === 'halftime') {
      if (station.type === 'food') modifier = 2.5;
      if (station.type === 'restroom') modifier = 2.0;
      if (station.type === 'merchandise') modifier = 1.5;
    } else if (config.phase === 'exit') {
      if (station.type === 'parking') modifier = 3.0;
      if (station.type === 'food') modifier = 0.3;
    } else if (config.phase === 'live' || config.phase === 'second-half') {
      if (station.type === 'food') modifier = 0.4;
      if (station.type === 'restroom') modifier = 0.5;
    }

    const jitter = (Math.random() - 0.5) * 4;
    const newWait = Math.max(0, Math.round(station.waitTime * modifier + jitter));
    const newQueue = Math.max(0, Math.round(station.queueLength * modifier + jitter * 2));

    const status: QueueStation['status'] =
      station.status === 'closed' ? 'closed' :
      newWait > 10 ? 'busy' : 'open';

    return { ...station, waitTime: newWait, queueLength: newQueue, status };
  });
}

/**
 * Apply phase modifiers to gate data.
 */
export function applyPhaseToGates(gates: GateData[], config: PhaseConfig): GateData[] {
  return gates.map(gate => {
    if (gate.status === 'closed') return gate;

    const jitter = Math.round((Math.random() - 0.5) * 4);
    const newWait = Math.max(1, Math.round(gate.waitTime * config.gateLoad + jitter));

    const crowd: GateData['crowd'] =
      newWait <= 5 ? 'low' :
      newWait <= 12 ? 'moderate' : 'high';

    return { ...gate, waitTime: newWait, crowd };
  });
}
