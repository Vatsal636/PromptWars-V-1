'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AIInsightBanner from '@/components/ui/AIInsightBanner';
import VenueMap from '@/components/maps/VenueMap';
import { useVenueDataContext } from '@/lib/hooks/useLiveVenueData';
import { useAIPolling } from '@/lib/hooks/useAIPolling';
import { getCrowdColor, getCrowdBg, getCrowdDot } from '@/lib/utils';
import { trackAlertView } from '@/lib/firebase/analytics';
import type { CongestionPrediction } from '@/types';

interface PredictionData {
  phase: string;
  phaseName: string;
  summary: {
    avgCurrentDensity: number;
    avgPredictedDensity: number;
    overallTrend: 'rising' | 'falling' | 'stable';
    criticalCount: number;
    risingCount: number;
  };
  zones: CongestionPrediction[];
  criticalWarnings: CongestionPrediction[];
}

export default function CrowdMonitorPage() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'low' | 'moderate' | 'high' | 'critical'>('all');

  // Shared venue data
  const venue = useVenueDataContext();

  // Additional predictions endpoint for detailed summary
  const { data: predData } = useAIPolling<PredictionData>({
    url: '/api/ai/predictions',
    interval: 3000,
  });

  const zones = venue.zones;
  const predictions = predData?.zones || venue.predictions;
  const summary = predData?.summary;
  const criticalWarnings = predData?.criticalWarnings || [];

  const filteredZones = filter === 'all' ? zones : zones.filter(z => z.status === filter);
  const avgCrowd = zones.length > 0 ? Math.round(zones.reduce((s, z) => s + z.crowdPercentage, 0) / zones.length) : 0;
  const hotspots = zones.filter(z => z.status === 'high' || z.status === 'critical').length;

  const getPrediction = (zoneId: string) => predictions.find(p => p.zoneId === zoneId);
  const selectedPred = selectedZone ? getPrediction(selectedZone) : null;
  const selectedZoneData = selectedZone ? zones.find(z => z.id === selectedZone) : null;

  const trendIcon = (trend: string) => trend === 'rising' || trend === 'critical' ? '↑' : trend === 'falling' ? '↓' : '→';
  const trendColor = (trend: string) => trend === 'rising' || trend === 'critical' ? 'text-red-400' : trend === 'falling' ? 'text-emerald-400' : 'text-gray-400';

  return (
    <div className="space-y-6">
      <PageHeader title="Crowd Monitor" subtitle="AI-powered crowd density heatmap with predictive congestion analysis" badge="Live" badgeColor="green" />

      <AIInsightBanner phase={venue.phase} phaseName={venue.phaseName} phaseProgress={venue.phaseProgress} lastUpdate={venue.lastUpdate} />

      {/* AI Prediction Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <GlassCard padding="md">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Current Avg</p>
          <p className={`text-2xl font-extrabold ${avgCrowd > 70 ? 'text-amber-400' : 'text-emerald-400'}`}>{summary?.avgCurrentDensity ?? avgCrowd}%</p>
        </GlassCard>
        <GlassCard padding="md">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Predicted</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-extrabold ${(summary?.avgPredictedDensity || 0) > 70 ? 'text-red-400' : 'text-indigo-400'}`}>{summary?.avgPredictedDensity ?? '—'}%</p>
            {summary && <span className={`text-sm font-bold ${trendColor(summary.overallTrend)}`}>{trendIcon(summary.overallTrend)}</span>}
          </div>
        </GlassCard>
        <GlassCard padding="md">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Hotspots</p>
          <p className={`text-2xl font-extrabold ${hotspots > 2 ? 'text-red-400' : 'text-amber-400'}`}>{hotspots}</p>
        </GlassCard>
        <GlassCard padding="md">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Rising Zones</p>
          <p className={`text-2xl font-extrabold ${(summary?.risingCount || 0) > 3 ? 'text-red-400' : 'text-amber-400'}`}>{summary?.risingCount ?? 0}</p>
        </GlassCard>
      </div>

      {/* Critical AI Warnings */}
      {criticalWarnings.length > 0 && (
        <GlassCard padding="md" className="border-red-500/20 bg-red-500/[0.03]">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚠️</span>
            <h3 className="text-sm font-bold text-red-400">AI Congestion Warnings</h3>
            <span className="text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full uppercase">{criticalWarnings.length} zones</span>
          </div>
          <div className="space-y-2">
            {criticalWarnings.map(w => {
              trackAlertView(w.zoneId, w.warningLevel);
              return (
                <div key={w.zoneId} className="flex items-center gap-3 text-[12px]">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
                  <span className="text-gray-300">{w.recommendation}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'low', 'moderate', 'high', 'critical'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all border ${filter === f ? 'bg-white/10 border-white/20 text-white' : 'bg-white/[0.02] border-white/[0.06] text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'}`}>
            {f === 'all' ? `All (${zones.length})` : `${f} (${zones.filter(z => z.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Google Maps Crowd Heatmap */}
      <GlassCard padding="md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">🗺️ Crowd Heatmap</h3>
            <span className="text-[9px] font-bold bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full uppercase border border-blue-500/20">Google Maps</span>
          </div>
        </div>
        <VenueMap
          zones={zones}
          alerts={venue.alerts}
          showPOIs={['gates', 'seating']}
          showHotspots={true}
          height="300px"
        />
      </GlassCard>

      {/* Zone List with AI Predictions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredZones.map((zone) => {
          const pred = getPrediction(zone.id);
          return (
            <GlassCard key={zone.id} padding="md" className={`cursor-pointer ${selectedZone === zone.id ? 'ring-1 ring-indigo-500/40' : ''}`}>
              <button onClick={() => setSelectedZone(zone.id)} className="w-full text-left">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${getCrowdDot(zone.status)} ${zone.status === 'critical' ? 'animate-pulse' : ''}`} />
                    <h4 className="text-sm font-bold text-white">{zone.name}</h4>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize border ${getCrowdBg(zone.status)}`}>{zone.status}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden mb-2">
                  <div className={`h-full rounded-full transition-all duration-1000 ${zone.status === 'low' ? 'bg-emerald-500' : zone.status === 'moderate' ? 'bg-amber-500' : zone.status === 'high' ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${zone.crowdPercentage}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>{zone.crowdPercentage}% capacity</span>
                  <span>{zone.currentCount.toLocaleString()} / {zone.capacity.toLocaleString()}</span>
                </div>
                {pred && (
                  <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">AI Forecast</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold ${trendColor(pred.trend)}`}>{trendIcon(pred.trend)} {pred.predictedDensity}%</span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded capitalize ${
                        pred.warningLevel === 'critical' ? 'bg-red-500/20 text-red-400' :
                        pred.warningLevel === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                        pred.warningLevel === 'watch' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>{pred.warningLevel}</span>
                    </div>
                  </div>
                )}
              </button>
            </GlassCard>
          );
        })}
      </div>

      {/* Selected Zone Detail with AI */}
      {selectedZoneData && (
        <GlassCard padding="lg" className="border-indigo-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">{selectedZoneData.name} — AI Analysis</h3>
            <button onClick={() => setSelectedZone(null)} className="text-gray-500 hover:text-white text-sm">✕ Close</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div><p className="text-[11px] text-gray-500 mb-1 uppercase tracking-wider font-semibold">Current</p><p className={`text-xl font-extrabold ${getCrowdColor(selectedZoneData.status)}`}>{selectedZoneData.crowdPercentage}%</p></div>
            <div><p className="text-[11px] text-gray-500 mb-1 uppercase tracking-wider font-semibold">Predicted</p><p className={`text-xl font-extrabold ${selectedPred && selectedPred.predictedDensity > 80 ? 'text-red-400' : 'text-indigo-400'}`}>{selectedPred?.predictedDensity ?? '—'}%</p></div>
            <div><p className="text-[11px] text-gray-500 mb-1 uppercase tracking-wider font-semibold">Trend</p><p className={`text-xl font-extrabold capitalize ${trendColor(selectedPred?.trend || 'stable')}`}>{selectedPred?.trend || 'stable'}</p></div>
            <div><p className="text-[11px] text-gray-500 mb-1 uppercase tracking-wider font-semibold">Count</p><p className="text-xl font-extrabold text-white">{selectedZoneData.currentCount.toLocaleString()}</p></div>
            <div><p className="text-[11px] text-gray-500 mb-1 uppercase tracking-wider font-semibold">Capacity</p><p className="text-xl font-extrabold text-white">{selectedZoneData.capacity.toLocaleString()}</p></div>
          </div>
          {selectedPred && (
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-start gap-2">
                <span className="text-lg">🧠</span>
                <p className="text-[12px] text-gray-400 leading-relaxed">{selectedPred.recommendation}</p>
              </div>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
