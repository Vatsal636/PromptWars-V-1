'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AIInsightBanner from '@/components/ui/AIInsightBanner';
import VenueMap from '@/components/maps/VenueMap';
import { useVenueDataContext } from '@/lib/hooks/useLiveVenueData';
import { useAIPolling } from '@/lib/hooks/useAIPolling';
import { getCrowdBg } from '@/lib/utils';
import { trackRouteRequest, trackNavigationStart } from '@/lib/firebase/analytics';
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

export default function NavigationPage() {
  const [selectedDest, setSelectedDest] = useState<NavDestination | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteRecommendation | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Restore active navigation state immediately on mount
  useEffect(() => {
    const savedDest = sessionStorage.getItem('smartvenue_nav_dest');
    const savedRoute = sessionStorage.getItem('smartvenue_nav_route');
    const savedIsNavigating = sessionStorage.getItem('smartvenue_nav_active');

    if (savedDest) setSelectedDest(JSON.parse(savedDest));
    if (savedRoute) setSelectedRoute(JSON.parse(savedRoute));
    if (savedIsNavigating === 'true') setIsNavigating(true);
  }, []);

  const persistState = (dest: NavDestination | null, route: RouteRecommendation | null, isNav: boolean) => {
    if (dest) sessionStorage.setItem('smartvenue_nav_dest', JSON.stringify(dest));
    else sessionStorage.removeItem('smartvenue_nav_dest');

    if (route) sessionStorage.setItem('smartvenue_nav_route', JSON.stringify(route));
    else sessionStorage.removeItem('smartvenue_nav_route');

    sessionStorage.setItem('smartvenue_nav_active', isNav.toString());
  };

  const handleSelectDest = (dest: NavDestination | null) => {
    setSelectedDest(dest);
    persistState(dest, selectedRoute, isNavigating);
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setSelectedRoute(null);
    setSelectedDest(null);
    persistState(null, null, false);
  };

  // Shared venue data from context (no duplicate fetch)
  const venue = useVenueDataContext();

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
    persistState(selectedDest, route, true);
    trackNavigationStart(destName, route.label, route.time);
  };



  const selectDestination = (dest: NavDestination) => {
    setSelectedDest(dest);
    setIsNavigating(false);
    setSelectedRoute(null);
    trackRouteRequest(dest.name, dest.type);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Indoor Navigation" subtitle="AI-optimized routing with Google Maps — fastest, least crowded, and safest paths" badge="GPS Active" badgeColor="blue" />

      <AIInsightBanner phase={venue.phase} phaseName={venue.phaseName} phaseProgress={venue.phaseProgress} lastUpdate={venue.lastUpdate} />

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

      {/* Google Maps Venue Map */}
      <GlassCard padding="md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">🗺️ Stadium Map</h3>
            <span className="text-[9px] font-bold bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full uppercase border border-blue-500/20">Google Maps</span>
          </div>
          {routeData && <span className="text-[10px] text-gray-500">Avg density: {routeData.avgDensity}%</span>}
        </div>
        <VenueMap
          zones={venue.zones}
          alerts={venue.alerts}
          gates={venue.gates}
          showPOIs={['gates', 'food', 'restrooms', 'medical', 'exits']}
          showHotspots={true}
          selectedDestination={selectedDest?.name || null}
          height="350px"
        />
      </GlassCard>

      {/* Route Stats Summary */}
      {recommended && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Recommended', value: recommended.label, sub: `${recommended.time} min`, color: 'text-indigo-400' },
            { label: 'Density', value: `${recommended.crowdDensity}%`, sub: recommended.crowdDensity < 40 ? 'Low' : recommended.crowdDensity < 70 ? 'Moderate' : 'High', color: recommended.crowdDensity < 40 ? 'text-emerald-400' : recommended.crowdDensity < 70 ? 'text-amber-400' : 'text-red-400' },
            { label: 'Safety Risk', value: `${recommended.safetyRisk}/10`, sub: recommended.safetyRisk <= 2 ? 'Very Safe' : recommended.safetyRisk <= 5 ? 'Moderate' : 'Caution', color: recommended.safetyRisk <= 2 ? 'text-emerald-400' : 'text-amber-400' },
            { label: 'AI Score', value: recommended.score.toFixed(1), sub: 'Composite', color: 'text-violet-400' },
          ].map(stat => (
            <GlassCard key={stat.label} padding="md">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-lg font-extrabold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-gray-500">{stat.sub}</p>
            </GlassCard>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Destinations */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3">Choose Destination</h3>
          <div className="space-y-2">
            {navDestinations.map((dest) => (
              <button key={dest.id} onClick={() => selectDestination(dest)} className="w-full text-left transition-all">
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
