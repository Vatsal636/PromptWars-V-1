'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import StatCard from '@/components/ui/StatCard';
import AIInsightBanner from '@/components/ui/AIInsightBanner';
import VenueMap from '@/components/maps/VenueMap';
import { useVenueDataContext } from '@/lib/hooks/useLiveVenueData';
import { getSeverityColor, getStatusColor, formatNumber, getCrowdBg, getCrowdDot } from '@/lib/utils';
import { incidents } from '@/data/mock-data';
import type { CongestionPrediction, GateRecommendation, QueueRecommendation, AIAlert } from '@/types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-insights' | 'incidents' | 'queues' | 'live-map'>('overview');

  // Use shared venue context instead of separate polling
  const venue = useVenueDataContext();
  const { stats, zones, queues, predictions, gateRecommendations: gateRecs, queueRecommendations: queueRecs, alerts: aiAlerts } = venue;

  const risingZones = predictions.filter((p: CongestionPrediction) => p.trend === 'rising' || p.trend === 'critical');
  const criticalPredictions = predictions.filter((p: CongestionPrediction) => p.warningLevel === 'critical' || p.warningLevel === 'warning');

  return (
    <div className="space-y-6">
      <PageHeader title="Operations Dashboard" subtitle="AI-powered venue management — real-time monitoring, predictions, and incident management" badge="Staff Access" badgeColor="blue" />

      <AIInsightBanner phase={venue.phase} phaseName={venue.phaseName} phaseProgress={venue.phaseProgress} lastUpdate={venue.lastUpdate} />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon="👥" label="Total Attendees" value={stats ? formatNumber(stats.totalAttendees) : '—'} trend="up" trendValue="live" accentColor="indigo" />
        <StatCard icon="🔥" label="Crowd Hotspots" value={stats?.crowdHotspots ?? 0} trend={stats && stats.crowdHotspots > 3 ? 'up' : 'neutral'} trendValue={`${risingZones.length} rising`} accentColor="red" />
        <StatCard icon="⏱" label="Avg Queue Time" value={stats?.avgQueueTime ?? 0} suffix="min" trend="down" trendValue="AI opt." accentColor="amber" />
        <StatCard icon="⚠️" label="AI Alerts" value={aiAlerts.length} trend={aiAlerts.length > 3 ? 'up' : 'neutral'} trendValue={`${aiAlerts.filter((a: AIAlert) => a.actionRequired).length} action`} accentColor="red" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <GlassCard padding="md">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Gates Open</p>
          <p className="text-2xl font-extrabold text-white">{stats?.openGates ?? 6}<span className="text-sm text-gray-500">/8</span></p>
        </GlassCard>
        <GlassCard padding="md">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Satisfaction</p>
          <p className="text-2xl font-extrabold text-emerald-400">{stats ? Math.round(stats.satisfaction) : 87}%</p>
        </GlassCard>
        <GlassCard padding="md">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Revenue</p>
          <p className="text-2xl font-extrabold text-white">₹{stats ? formatNumber(stats.revenue) : '2.5M'}</p>
        </GlassCard>
        <GlassCard padding="md">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Crowd Density</p>
          <p className={`text-2xl font-extrabold ${stats && stats.crowdDensity > 70 ? 'text-amber-400' : 'text-emerald-400'}`}>{stats?.crowdDensity ?? 64}%</p>
        </GlassCard>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-white/[0.06] pb-0 overflow-x-auto">
        {(['overview', 'live-map', 'ai-insights', 'incidents', 'queues'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-[13px] font-semibold capitalize transition-all border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-indigo-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            {tab === 'ai-insights' ? '🧠 AI Insights' : tab === 'live-map' ? '🗺️ Live Map' : tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard padding="md">
            <h3 className="text-sm font-bold text-white mb-4">Live Crowd Map</h3>
            <div className="grid grid-cols-3 gap-2">
              {zones.slice(0, 9).map((zone) => {
                const pred = predictions.find((p: CongestionPrediction) => p.zoneId === zone.id);
                return (
                  <div key={zone.id} className={`p-3 rounded-xl border text-center transition-all hover:scale-[1.03] cursor-default ${getCrowdBg(zone.status)}`}>
                    <p className="text-xl font-extrabold">{zone.crowdPercentage}%</p>
                    <p className="text-[10px] mt-1 text-gray-300 font-medium truncate">{zone.name}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${getCrowdDot(zone.status)} ${zone.status === 'critical' ? 'animate-pulse' : ''}`} />
                      <span className="text-[9px] capitalize text-gray-400">{zone.status}</span>
                    </div>
                    {pred && (pred.trend === 'rising' || pred.trend === 'critical') && (
                      <span className="text-[8px] font-bold text-red-400">↑ {pred.predictedDensity}%</span>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard padding="md">
            <h3 className="text-sm font-bold text-white mb-4">Queue Analytics</h3>
            <div className="space-y-3">
              {queues.slice(0, 8).map((station) => {
                const rec = queueRecs.find((r: QueueRecommendation) => r.stationId === station.id);
                return (
                  <div key={station.id} className="flex items-center gap-3">
                    <span className="text-lg w-6 flex-shrink-0">{station.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-semibold text-gray-300 truncate">{station.name}</span>
                          {rec?.recommended && <span className="text-[8px] font-bold bg-indigo-500/20 text-indigo-400 px-1 py-0.5 rounded-full">AI</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[12px] font-bold ${station.waitTime <= 5 ? 'text-emerald-400' : station.waitTime <= 12 ? 'text-amber-400' : 'text-red-400'}`}>{station.waitTime}m</span>
                          {rec && <span className="text-[10px] text-indigo-400">→{rec.predictedWait}m</span>}
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${station.waitTime <= 5 ? 'bg-emerald-500' : station.waitTime <= 12 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (station.waitTime / 25) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Live Map Tab — Google Maps Integration */}
      {activeTab === 'live-map' && (
        <div className="space-y-4">
          <GlassCard padding="md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">🗺️ Live Venue Map</h3>
                <span className="text-[9px] font-bold bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full uppercase border border-blue-500/20">Google Maps</span>
                <span className="text-[9px] font-bold bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded-full uppercase border border-green-500/20">Live</span>
              </div>
              <span className="text-[10px] text-gray-500">Narendra Modi Stadium</span>
            </div>
            <VenueMap
              zones={zones}
              alerts={aiAlerts}
              gates={venue.gates}
              showPOIs={['gates', 'food', 'restrooms', 'medical', 'seating', 'exits']}
              showHotspots={true}
              showAlertZones={true}
              height="450px"
            />
          </GlassCard>

          {/* Map Legend and Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <GlassCard padding="md">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Crowd Hotspots</p>
              <p className="text-2xl font-extrabold text-orange-400">{zones.filter(z => z.status === 'high' || z.status === 'critical').length}</p>
              <p className="text-[10px] text-gray-500">zones above 65%</p>
            </GlassCard>
            <GlassCard padding="md">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Active Alerts</p>
              <p className="text-2xl font-extrabold text-red-400">{aiAlerts.filter((a: AIAlert) => a.severity === 'emergency' || a.severity === 'warning').length}</p>
              <p className="text-[10px] text-gray-500">warning+emergency</p>
            </GlassCard>
            <GlassCard padding="md">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Emergency Incidents</p>
              <p className="text-2xl font-extrabold text-amber-400">{incidents.filter(i => i.status === 'active').length}</p>
              <p className="text-[10px] text-gray-500">active incidents</p>
            </GlassCard>
            <GlassCard padding="md">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Recommended Routes</p>
              <p className="text-2xl font-extrabold text-indigo-400">{venue.routeRecommendations.length}</p>
              <p className="text-[10px] text-gray-500">AI-optimized</p>
            </GlassCard>
          </div>

          {/* Active Alerts on Map */}
          {aiAlerts.length > 0 && (
            <GlassCard padding="md">
              <h3 className="text-sm font-bold text-white mb-3">📍 Alert Zones on Map</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {aiAlerts.slice(0, 6).map((alert: AIAlert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${alert.severity === 'emergency' ? 'border-l-red-500 bg-red-500/[0.03]' : alert.severity === 'warning' ? 'border-l-amber-500 bg-amber-500/[0.03]' : 'border-l-blue-500 bg-blue-500/[0.03]'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${alert.severity === 'emergency' ? 'bg-red-500/20 text-red-400' : alert.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>{alert.severity}</span>
                      <span className="text-[11px] font-semibold text-white truncate">{alert.title}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">📍 {alert.zone}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'ai-insights' && (
        <div className="space-y-6">
          {/* Gate AI Rankings */}
          <GlassCard padding="md">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-bold text-white">Gate AI Rankings</h3>
              <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full uppercase">Weighted Scoring</span>
            </div>
            <div className="space-y-2">
              {gateRecs.map((gate: GateRecommendation, i: number) => (
                <div key={gate.gateId} className={`flex items-center justify-between p-3 rounded-lg border ${gate.recommended ? 'bg-emerald-500/[0.05] border-emerald-500/20' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-emerald-500 text-white' : 'bg-white/[0.08] text-gray-400'}`}>{i + 1}</span>
                    <div>
                      <span className="text-sm font-bold text-white">{gate.gateName}</span>
                      {gate.recommended && <span className="text-[9px] font-bold text-emerald-400 ml-2">★ BEST</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[12px]">
                    <span className="text-gray-400">Wait: <span className="font-bold text-white">{gate.waitTime}m</span></span>
                    <span className="text-gray-400">Score: <span className="font-bold text-indigo-400">{gate.score}</span></span>
                    <span className={`font-bold ${gate.timeSaved > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{gate.timeSaved > 0 ? `+${gate.timeSaved}m saved` : `${gate.timeSaved}m slower`}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Congestion Predictions */}
          <GlassCard padding="md">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-bold text-white">Congestion Predictions</h3>
              <span className="text-[9px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full uppercase">{criticalPredictions.length} Warnings</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {predictions.slice(0, 8).map((pred: CongestionPrediction) => (
                <div key={pred.zoneId} className={`p-3 rounded-lg border ${pred.warningLevel === 'critical' ? 'bg-red-500/[0.05] border-red-500/15' : pred.warningLevel === 'warning' ? 'bg-amber-500/[0.05] border-amber-500/15' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-bold text-white">{pred.zoneName}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${pred.warningLevel === 'critical' ? 'bg-red-500/20 text-red-400' : pred.warningLevel === 'warning' ? 'bg-amber-500/20 text-amber-400' : pred.warningLevel === 'watch' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{pred.warningLevel}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-gray-400">Now: {pred.currentDensity}%</span>
                    <span className={`font-bold ${pred.trend === 'rising' || pred.trend === 'critical' ? 'text-red-400' : pred.trend === 'falling' ? 'text-emerald-400' : 'text-gray-400'}`}>
                      {pred.trend === 'rising' || pred.trend === 'critical' ? '↑' : pred.trend === 'falling' ? '↓' : '→'} {pred.predictedDensity}%
                    </span>
                    <span className="text-gray-600">Δ{pred.trendDelta > 0 ? '+' : ''}{pred.trendDelta}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* AI Alerts */}
          {aiAlerts.length > 0 && (
            <GlassCard padding="md">
              <h3 className="text-sm font-bold text-white mb-4">AI Alerts ({aiAlerts.length})</h3>
              <div className="space-y-2">
                {aiAlerts.map((alert: AIAlert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${alert.severity === 'emergency' ? 'border-l-red-500 bg-red-500/[0.03]' : alert.severity === 'warning' ? 'border-l-amber-500 bg-amber-500/[0.03]' : 'border-l-blue-500 bg-blue-500/[0.03]'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white">{alert.title}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${alert.severity === 'emergency' ? 'bg-red-500/20 text-red-400' : alert.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>{alert.severity}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mb-1">{alert.description}</p>
                    {alert.actionRequired && <p className="text-[11px] text-indigo-400">💡 {alert.suggestedAction}</p>}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* Incidents Tab */}
      {activeTab === 'incidents' && (
        <div className="space-y-3">
          {incidents.map((incident) => (
            <GlassCard key={incident.id} padding="md">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${incident.type === 'crowd' ? 'bg-orange-500/15' : incident.type === 'medical' ? 'bg-red-500/15' : incident.type === 'security' ? 'bg-amber-500/15' : 'bg-blue-500/15'}`}>
                  {incident.type === 'crowd' ? '👥' : incident.type === 'medical' ? '🏥' : incident.type === 'security' ? '🛡️' : '🔧'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="text-sm font-bold text-white">{incident.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getSeverityColor(incident.severity)}`}>{incident.severity}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${getStatusColor(incident.status)}`}>{incident.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    <span>📍 {incident.location}</span><span>·</span><span>🕐 {incident.reportedAt}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {incident.status !== 'resolved' && <button className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 hover:bg-indigo-500/25 transition-all">Respond</button>}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Queues Tab */}
      {activeTab === 'queues' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {queues.map((station) => {
            const rec = queueRecs.find((r: QueueRecommendation) => r.stationId === station.id);
            return (
              <GlassCard key={station.id} padding="md" className={rec?.recommended ? 'ring-1 ring-indigo-500/25' : ''}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{station.icon}</span>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white">{station.name}</h4>
                      {rec?.recommended && <span className="text-[8px] font-bold bg-indigo-500/20 text-indigo-400 px-1 py-0.5 rounded-full">AI</span>}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${station.status === 'open' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : station.status === 'busy' ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' : 'bg-red-500/15 text-red-400 border-red-500/25'}`}>{station.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                    <p className="text-[10px] text-gray-500 uppercase">Wait</p>
                    <p className={`text-lg font-extrabold ${station.waitTime <= 5 ? 'text-emerald-400' : station.waitTime <= 12 ? 'text-amber-400' : 'text-red-400'}`}>{station.waitTime}m</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                    <p className="text-[10px] text-gray-500 uppercase">AI Est.</p>
                    <p className="text-lg font-extrabold text-indigo-400">{rec?.predictedWait ?? '—'}m</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                    <p className="text-[10px] text-gray-500 uppercase">Queue</p>
                    <p className="text-lg font-extrabold text-white">{station.queueLength}</p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
