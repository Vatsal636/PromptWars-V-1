// ─── useLiveVenueData Hook ───
// Shared hook providing live venue data from Firestore OR simulation API fallback.
// Single source of truth consumed by all pages.

'use client';

import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import type { StadiumZone, QueueStation, AIAlert, Incident, GateData, LiveStats, CongestionPrediction, GateRecommendation, QueueRecommendation, RouteRecommendation, MatchPhase } from '@/types';

export interface VenueData {
  // Simulation state
  phase: MatchPhase;
  phaseName: string;
  phaseProgress: number;
  elapsedMinutes: number;

  // Live data
  zones: StadiumZone[];
  queues: QueueStation[];
  gates: GateData[];
  stats: LiveStats;

  // AI outputs
  predictions: CongestionPrediction[];
  gateRecommendations: GateRecommendation[];
  queueRecommendations: QueueRecommendation[];
  routeRecommendations: RouteRecommendation[];
  alerts: AIAlert[];

  // Meta
  loading: boolean;
  lastUpdate: Date | null;
  error: string | null;
  firestoreConnected: boolean;
}

const defaultVenueData: VenueData = {
  phase: 'pre-match',
  phaseName: 'Initializing...',
  phaseProgress: 0,
  elapsedMinutes: 0,
  zones: [],
  queues: [],
  gates: [],
  stats: {
    crowdDensity: 0, avgWaitTime: 0, openGates: 0, activeAlerts: 0,
    totalAttendees: 0, satisfaction: 0, avgQueueTime: 0, crowdHotspots: 0,
    activeIncidents: 0, revenue: 0,
  },
  predictions: [],
  gateRecommendations: [],
  queueRecommendations: [],
  routeRecommendations: [],
  alerts: [],
  loading: true,
  lastUpdate: null,
  error: null,
  firestoreConnected: false,
};

// ─── Context for sharing across components ───
const VenueDataContext = createContext<VenueData>(defaultVenueData);

export function useVenueDataContext() {
  return useContext(VenueDataContext);
}

export { VenueDataContext };

/**
 * Primary hook that fetches from /api/ai/simulation and syncs to Firestore.
 * Falls back to API-only mode if Firestore is unavailable.
 */
export function useLiveVenueData(interval = 3000): VenueData {
  const [data, setData] = useState<VenueData>(defaultVenueData);
  const mountedRef = useRef(true);
  const firestoreSyncRef = useRef(false);

  // Attempt Firestore sync on the write side
  const syncToFirestore = useCallback(async (simData: Record<string, unknown>) => {
    if (firestoreSyncRef.current) return; // Only sync once per tick cycle

    try {
      // Dynamic import to avoid SSR issues
      const { seedCrowdZones, seedQueues, seedAlerts, updateVenueStats } = await import('@/lib/firebase/firestore');

      const zones = simData.zones as StadiumZone[];
      const queues = simData.queues as QueueStation[];
      const ai = simData.ai as Record<string, unknown>;
      const alerts = (ai?.alerts || []) as AIAlert[];
      const stats = simData.stats as Record<string, unknown>;

      // Fire-and-forget writes (non-blocking)
      Promise.all([
        seedCrowdZones(zones),
        seedQueues(queues),
        seedAlerts(alerts.slice(0, 10)),
        updateVenueStats(stats),
      ]).catch(() => {
        // Firestore unavailable — silent fallback
      });

      firestoreSyncRef.current = true;
      setTimeout(() => { firestoreSyncRef.current = false; }, interval);
    } catch {
      // Firebase not configured — continue with API-only mode
    }
  }, [interval]);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/simulation', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (!mountedRef.current) return;

      const sim = json.simulation || {};
      const ai = json.ai || {};

      setData({
        phase: sim.phase || 'pre-match',
        phaseName: sim.phaseName || 'Unknown',
        phaseProgress: sim.phaseProgress || 0,
        elapsedMinutes: sim.elapsedMinutes || 0,
        zones: json.zones || [],
        queues: json.queues || [],
        gates: json.gates || [],
        stats: json.stats || defaultVenueData.stats,
        predictions: ai.predictions || [],
        gateRecommendations: ai.gateRecommendations || [],
        queueRecommendations: ai.queueRecommendations || [],
        routeRecommendations: ai.routeRecommendations || [],
        alerts: ai.alerts || [],
        loading: false,
        lastUpdate: new Date(),
        error: null,
        firestoreConnected: false,
      });

      // Sync data to Firestore in background
      syncToFirestore(json);
    } catch (err) {
      if (mountedRef.current) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Fetch failed',
        }));
      }
    }
  }, [syncToFirestore]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    const timer = setInterval(fetchData, interval);
    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
  }, [fetchData, interval]);

  return data;
}
