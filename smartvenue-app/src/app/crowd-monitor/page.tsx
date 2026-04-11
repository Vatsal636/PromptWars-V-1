'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AIInsightBanner from '@/components/ui/AIInsightBanner';
import { useAIPolling } from '@/lib/hooks/useAIPolling';
import { getCrowdColor, getCrowdBg, getCrowdDot } from '@/lib/utils';
import type { StadiumZone, CongestionPrediction } from '@/types';

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

interface SimData {
  simulation: { phase: string; phaseName: string; phaseProgress: number };
  zones: StadiumZone[];
}

export default function CrowdMonitorPage() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'low' | 'moderate' | 'high' | 'critical'>('all');

  const { data: predData, lastUpdate } = useAIPolling<PredictionData>({
    url: '/api/ai/predictions',
    interval: 3000,
  });

  const { data: simData } = useAIPolling<SimData>({
    url: '/api/ai/simulation',
    interval: 3000,
  });

  const zones = simData?.zones || [];
  const predictions = predData?.zones || [];
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

      {predData && simData && (
        <AIInsightBanner phase={simData.simulation.phase} phaseName={simData.simulation.phaseName} phaseProgress={simData.simulation.phaseProgress} lastUpdate={lastUpdate} />
      )}

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
            {criticalWarnings.map(w => (
              <div key={w.zoneId} className="flex items-center gap-3 text-[12px]">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
                <span className="text-gray-300">{w.recommendation}</span>
              </div>
            ))}
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

      {/* Stadium Visual Map */}
      <GlassCard padding="lg">
        <h3 className="text-sm font-bold text-white mb-4">Stadium Layout</h3>
        <div className="relative aspect-[2/1] max-w-3xl mx-auto">
          <div className="absolute inset-[5%] rounded-[50%] border-2 border-white/10" />
          <div className="absolute inset-[15%] rounded-[50%] border border-white/[0.06]" />
          <div className="absolute inset-[30%] rounded-[40%] bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center">
            <span className="text-[11px] text-emerald-500/60 font-semibold uppercase tracking-wider">Field</span>
          </div>
          {[
            { id: 'z1', top: '8%', left: '40%' }, { id: 'z2', top: '82%', left: '40%' },
            { id: 'z3', top: '40%', left: '82%' }, { id: 'z4', top: '40%', left: '5%' },
            { id: 'z5', top: '25%', left: '78%' }, { id: 'z6', top: '25%', left: '10%' },
            { id: 'z7', top: '5%', left: '18%' }, { id: 'z8', top: '78%', left: '68%' },
          ].map(({ id, top, left }) => {
            const zone = zones.find(z => z.id === id);
            if (!zone) return null;
            const pred = getPrediction(id);
            return (
              <button key={id} onClick={() => setSelectedZone(id)} className="absolute flex flex-col items-center gap-1 transition-all duration-300 hover:scale-110 cursor-pointer group" style={{ top, left }}>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xs font-extrabold border transition-all ${getCrowdBg(zone.status)}`}>
                  {zone.crowdPercentage}%
                </div>
                <span className="text-[9px] sm:text-[10px] font-semibold text-gray-400 group-hover:text-white transition-colors whitespace-nowrap">{zone.name}</span>
                {pred && (pred.trend === 'rising' || pred.trend === 'critical') && (
                  <span className="text-[8px] font-bold text-red-400 animate-pulse">↑ rising</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          {[
            { label: 'Low (<40%)', color: 'bg-emerald-500' }, { label: 'Moderate (40-65%)', color: 'bg-amber-500' },
            { label: 'High (65-85%)', color: 'bg-orange-500' }, { label: 'Critical (>85%)', color: 'bg-red-500' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
              <span className="text-[11px] text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>
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
                {/* AI Prediction row */}
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
