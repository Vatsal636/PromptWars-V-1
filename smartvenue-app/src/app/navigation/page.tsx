'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AIInsightBanner from '@/components/ui/AIInsightBanner';
import { useAIPolling } from '@/lib/hooks/useAIPolling';
import { getCrowdBg, getCrowdColor } from '@/lib/utils';
import { navDestinations } from '@/data/mock-data';
import type { NavDestination, RouteRecommendation } from '@/types';

interface RouteData {
  phase: string;
  destination: string;
  recommended: RouteRecommendation;
  routes: {
    fastest: RouteRecommendation;
    leastCrowded: RouteRecommendation;
    safest: RouteRecommendation;
  };
  all: RouteRecommendation[];
  avgDensity: number;
}

interface SimData {
  simulation: { phase: string; phaseName: string; phaseProgress: number };
}

export default function NavigationPage() {
  const [selectedDest, setSelectedDest] = useState<NavDestination | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteRecommendation | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const { data: simData, lastUpdate } = useAIPolling<SimData>({
    url: '/api/ai/simulation',
    interval: 3000,
  });

  const destName = selectedDest?.name || 'My Seat';
  const { data: routeData } = useAIPolling<RouteData>({
    url: `/api/ai/routes?destination=${encodeURIComponent(destName)}`,
    interval: 3000,
    enabled: !!selectedDest,
  });

  const aiRoutes = routeData?.all || [];
  const recommended = routeData?.recommended;

  const startNavigation = (route: RouteRecommendation) => {
    setSelectedRoute(route);
    setIsNavigating(true);
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setSelectedRoute(null);
    setSelectedDest(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Indoor Navigation" subtitle="AI-optimized routing inside the stadium — fastest, least crowded, and safest paths" badge="GPS Active" badgeColor="blue" />

      {simData && <AIInsightBanner phase={simData.simulation.phase} phaseName={simData.simulation.phaseName} phaseProgress={simData.simulation.phaseProgress} lastUpdate={lastUpdate} />}

      {/* Active Navigation Banner */}
      {isNavigating && selectedRoute && selectedDest && (
        <GlassCard padding="md" className="border-indigo-500/25 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 animate-pulse" />
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-lg animate-pulse">◈</div>
              <div>
                <p className="text-sm font-bold text-white">Navigating to {selectedDest.name}</p>
                <p className="text-[11px] text-gray-400">{selectedRoute.label} — {selectedRoute.time} min · Score: {selectedRoute.score}</p>
              </div>
            </div>
            <button onClick={stopNavigation} className="px-4 py-2 text-[12px] font-semibold rounded-lg bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-all">Stop Navigation</button>
          </div>
          <div className="mt-4 space-y-2">
            {selectedRoute.steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-indigo-500 text-white' : 'bg-white/[0.06] text-gray-500'}`}>{i + 1}</div>
                  {i < selectedRoute.steps.length - 1 && <div className="w-px h-4 bg-white/10 my-0.5" />}
                </div>
                <span className="text-[12px] text-gray-300">{step}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Map */}
      <GlassCard padding="md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Stadium Map</h3>
          {routeData && <span className="text-[10px] text-gray-500">Avg density: {routeData.avgDensity}%</span>}
        </div>
        <div className="relative aspect-[16/8] rounded-xl bg-gradient-to-br from-gray-900/60 to-gray-800/30 border border-white/[0.04] overflow-hidden">
          <div className="absolute inset-[8%] rounded-[45%] border-2 border-white/10">
            <div className="absolute inset-[15%] rounded-[45%] border border-white/[0.06]" />
            <div className="absolute inset-[30%] rounded-[30%] bg-emerald-500/8 border border-emerald-500/20 flex items-center justify-center">
              <span className="text-xs text-emerald-500/50 font-semibold">Playing Field</span>
            </div>
          </div>

          <div className="absolute top-[38%] right-[20%] flex flex-col items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow-lg shadow-indigo-500/40 animate-pulse" />
            <span className="text-[9px] font-bold text-indigo-400 bg-gray-900/80 px-1.5 py-0.5 rounded">You</span>
          </div>

          {[
            { label: '🍕', top: '25%', left: '75%', name: 'Pizza Bay' },
            { label: '🚻', top: '55%', left: '20%', name: 'Restroom' },
            { label: '🚪', top: '80%', left: '50%', name: 'Exit Gate C' },
            { label: '🏥', top: '15%', left: '35%', name: 'Medical' },
            { label: '👕', top: '65%', left: '80%', name: 'Merch Store' },
          ].map((poi) => (
            <div key={poi.name} className="absolute flex flex-col items-center gap-0.5 cursor-pointer hover:scale-110 transition-transform" style={{ top: poi.top, left: poi.left }}>
              <span className="text-lg">{poi.label}</span>
              <span className="text-[8px] font-semibold text-gray-400 bg-gray-900/80 px-1 py-0.5 rounded whitespace-nowrap">{poi.name}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Destinations */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3">Choose Destination</h3>
          <div className="space-y-2">
            {navDestinations.map((dest) => (
              <button key={dest.id} onClick={() => { setSelectedDest(dest); setIsNavigating(false); setSelectedRoute(null); }} className="w-full text-left transition-all">
                <GlassCard padding="md" className={selectedDest?.id === dest.id ? 'ring-1 ring-indigo-500/40 bg-indigo-500/5' : ''}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{dest.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white">{dest.name}</h4>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[11px] text-gray-500">{dest.distance}</span>
                        <span className="text-[11px] text-gray-500">·</span>
                        <span className="text-[11px] text-gray-500">{dest.walkTime}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border capitalize ${getCrowdBg(dest.crowdLevel as 'low' | 'moderate' | 'high')}`}>{dest.crowdLevel}</span>
                      </div>
                    </div>
                    <span className="text-gray-600 text-sm">→</span>
                  </div>
                </GlassCard>
              </button>
            ))}
          </div>
        </div>

        {/* AI Routes */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3">
            {selectedDest ? `AI Routes to ${selectedDest.name}` : 'Select a destination to view routes'}
          </h3>
          {selectedDest && aiRoutes.length > 0 ? (
            <div className="space-y-3">
              {aiRoutes.map((route) => (
                <GlassCard key={route.routeId} padding="md" className={`${selectedRoute?.routeId === route.routeId ? 'ring-1 ring-indigo-500/40' : ''} ${route.recommended ? 'border-indigo-500/15' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{route.label}</h4>
                        {route.recommended && <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full uppercase border border-indigo-500/25">AI Pick</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[11px] capitalize ${route.crowdDensity < 40 ? 'text-emerald-400' : route.crowdDensity < 70 ? 'text-amber-400' : 'text-red-400'}`}>
                          {route.crowdDensity}% density
                        </span>
                        <span className="text-[10px] text-gray-600">Score: {route.score}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-white">{route.time} min</p>
                      <p className="text-[11px] text-gray-500">Risk: {route.safetyRisk}/10</p>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] mb-3">
                    <p className="text-[11px] text-gray-400">🧠 {route.reasoning}</p>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    {route.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-gray-400">
                        <span className="w-4 h-4 rounded-full bg-white/[0.06] flex items-center justify-center text-[9px] font-bold text-gray-500 flex-shrink-0">{i + 1}</span>
                        {step}
                      </div>
                    ))}
                  </div>

                  <button onClick={() => startNavigation(route)} className={`w-full py-2.5 text-[12px] font-semibold rounded-lg transition-all ${selectedRoute?.routeId === route.routeId ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-500/25'}`}>
                    {selectedRoute?.routeId === route.routeId ? '✓ Navigating' : 'Start Navigation'}
                  </button>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard padding="lg" className="flex items-center justify-center min-h-[200px]">
              <div className="text-center">
                <span className="text-4xl mb-3 block">◈</span>
                <p className="text-sm text-gray-500">{selectedDest ? 'Loading AI routes...' : 'Select a destination from the list'}</p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
