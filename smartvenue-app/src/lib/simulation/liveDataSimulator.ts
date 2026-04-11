// ─── Live Data Simulator ───
// Central simulation engine that orchestrates all AI modules and produces a unified SimulationState.

import type { SimulationState, StadiumZone, QueueStation, GateData, LiveStats } from '@/types';
import { stadiumZones, queueStations, gateData } from '@/data/mock-data';
import { getCurrentPhase, applyPhaseToZones, applyPhaseToQueues, applyPhaseToGates } from './matchPhase';
import { recommendGates } from '@/lib/ai/crowdEngine';
import { recommendQueues } from '@/lib/ai/queueEngine';
import { predictCongestion } from '@/lib/ai/predictionEngine';
import { generateAlerts } from '@/lib/ai/alertEngine';
import { recommendRoutes, generateRouteVariants } from '@/lib/ai/routeEngine';

// Simulation clock start time
let simulationStartTime: number | null = null;

// In-memory state that persists between API calls
let currentZones: StadiumZone[] = [...stadiumZones];
let currentQueues: QueueStation[] = [...queueStations];
let currentGates: GateData[] = gateData.map(g => ({
  ...g,
  distance: getGateDistance(g.id),
}));

/**
 * Map gate IDs to distances (meters from user section).
 */
function getGateDistance(gateId: string): number {
  const distances: Record<string, number> = {
    g1: 310, g2: 200, g3: 120, g4: 280,
    g5: 180, g6: 250, g7: 150, g8: 320,
  };
  return distances[gateId] || 200;
}

/**
 * Get current simulation elapsed seconds (accelerated time).
 */
function getElapsedSeconds(): number {
  if (!simulationStartTime) {
    simulationStartTime = Date.now();
  }
  // 1 real second = 1 simulation second
  return Math.floor((Date.now() - simulationStartTime) / 1000);
}

/**
 * Apply incremental randomized drift to zones (small per-tick changes).
 */
function tickZones(zones: StadiumZone[]): StadiumZone[] {
  return zones.map(zone => {
    const delta = Math.floor(Math.random() * 5) - 2;
    const newPct = Math.max(10, Math.min(95, zone.crowdPercentage + delta));
    const status: StadiumZone['status'] =
      newPct < 40 ? 'low' : newPct < 65 ? 'moderate' : newPct < 85 ? 'high' : 'critical';
    const newCount = Math.round(zone.capacity * (newPct / 100));
    return { ...zone, crowdPercentage: newPct, status, currentCount: newCount };
  });
}

/**
 * Apply incremental drift to queues.
 */
function tickQueues(queues: QueueStation[]): QueueStation[] {
  return queues.map(station => {
    if (station.status === 'closed') return station;
    const waitDelta = Math.floor(Math.random() * 3) - 1;
    const queueDelta = Math.floor(Math.random() * 5) - 2;
    const newWait = Math.max(0, station.waitTime + waitDelta);
    const newQueue = Math.max(0, station.queueLength + queueDelta);
    const status: QueueStation['status'] = newWait > 10 ? 'busy' : 'open';
    return { ...station, waitTime: newWait, queueLength: newQueue, status };
  });
}

/**
 * Apply incremental drift to gates.
 */
function tickGates(gates: GateData[]): GateData[] {
  return gates.map(gate => {
    if (gate.status === 'closed') return gate;
    const delta = Math.floor(Math.random() * 3) - 1;
    const newWait = Math.max(1, gate.waitTime + delta);
    const crowd: GateData['crowd'] = newWait <= 5 ? 'low' : newWait <= 12 ? 'moderate' : 'high';
    return { ...gate, waitTime: newWait, crowd };
  });
}

/**
 * Compute aggregate live stats from current state.
 */
function computeStats(zones: StadiumZone[], queues: QueueStation[], gates: GateData[]): LiveStats {
  const avgDensity = Math.round(zones.reduce((s, z) => s + z.crowdPercentage, 0) / zones.length);
  const openQueues = queues.filter(q => q.status !== 'closed');
  const avgWait = openQueues.length > 0
    ? Math.round(openQueues.reduce((s, q) => s + q.waitTime, 0) / openQueues.length)
    : 0;
  const openGates = gates.filter(g => g.status === 'open').length;
  const totalAttendees = zones.reduce((s, z) => s + z.currentCount, 0);
  const hotspots = zones.filter(z => z.status === 'high' || z.status === 'critical').length;
  const congested = openQueues.filter(q => q.waitTime > 12).length;

  return {
    crowdDensity: avgDensity,
    avgWaitTime: avgWait,
    openGates,
    activeAlerts: hotspots + congested,
    totalAttendees,
    satisfaction: Math.max(60, Math.min(98, 95 - avgDensity * 0.3 - avgWait * 0.5)),
    avgQueueTime: avgWait,
    crowdHotspots: hotspots,
    activeIncidents: Math.max(0, hotspots - 1),
    revenue: 2450000 + Math.round(totalAttendees * 12.5),
  };
}

/**
 * Perform one simulation tick. Returns the complete simulation state.
 * This is the main function called by the API routes every ~3 seconds.
 */
export function tick(): SimulationState {
  const elapsed = getElapsedSeconds();
  const { phase, progress, config } = getCurrentPhase(elapsed);

  // Apply phase modifiers on phase transitions, otherwise just tick
  if (progress < 0.05) {
    // Phase just started — apply big phase-based shifts
    currentZones = applyPhaseToZones(currentZones, config);
    currentQueues = applyPhaseToQueues(currentQueues, config);
    currentGates = applyPhaseToGates(currentGates, config);
  } else {
    // Normal tick — small incremental changes
    currentZones = tickZones(currentZones);
    currentQueues = tickQueues(currentQueues);
    currentGates = tickGates(currentGates);
  }

  // Run AI engines on current state
  const predictions = predictCongestion(currentZones);
  const gateRecommendations = recommendGates(currentGates);
  const queueRecommendations = recommendQueues(currentQueues);
  const alerts = generateAlerts(currentZones, currentQueues, phase);
  const stats = computeStats(currentZones, currentQueues, currentGates);

  // Generate route recommendations
  const zoneDensities: Record<string, number> = {};
  currentZones.forEach(z => { zoneDensities[z.id] = z.crowdPercentage; });
  const routeInputs = generateRouteVariants('Destination', zoneDensities);
  const routeRecommendations = recommendRoutes(routeInputs);

  return {
    phase,
    phaseName: config.name,
    phaseProgress: Math.round(progress * 100),
    elapsedMinutes: Math.round(elapsed / 60),
    zones: currentZones,
    queues: currentQueues,
    gates: currentGates,
    alerts,
    stats,
    predictions,
    gateRecommendations,
    queueRecommendations,
    routeRecommendations,
  };
}

/**
 * Reset simulation to initial state.
 */
export function resetSimulation() {
  simulationStartTime = Date.now();
  currentZones = [...stadiumZones];
  currentQueues = [...queueStations];
  currentGates = gateData.map(g => ({ ...g, distance: getGateDistance(g.id) }));
}

/**
 * Get current state without ticking (read-only snapshot).
 */
export function getSnapshot(): SimulationState {
  return tick(); // Tick to ensure freshness
}
