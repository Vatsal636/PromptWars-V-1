'use client';

import Link from 'next/link';
import GlassCard from '@/components/ui/GlassCard';
import StatCard from '@/components/ui/StatCard';
import AIInsightBanner from '@/components/ui/AIInsightBanner';
import { useVenueDataContext } from '@/lib/hooks/useLiveVenueData';
import { trackGateSelection } from '@/lib/firebase/analytics';
import { currentEvent, userTicket } from '@/data/mock-data';

const quickActions = [
  { href: '/crowd-monitor',  label: 'Live Crowd',     icon: '◎', desc: 'Real-time heatmap',   color: 'from-indigo-500 to-violet-600' },
  { href: '/queue',           label: 'Queue Status',   icon: '☰', desc: 'Virtual queue system', color: 'from-amber-500 to-orange-600' },
  { href: '/navigation',      label: 'Navigate',       icon: '◈', desc: 'Indoor routing',      color: 'from-cyan-500 to-blue-600' },
  { href: '/notifications',   label: 'Notifications',  icon: '⚡', desc: 'AI-powered alerts',   color: 'from-emerald-500 to-teal-600' },
  { href: '/sos',             label: 'Emergency SOS',  icon: '✦', desc: 'Instant help',        color: 'from-red-500 to-rose-600' },
];

export default function HomePage() {
  // Shared venue data from context (no duplicate fetch)
  const venue = useVenueDataContext();

  const bestGate = venue.gateRecommendations.find(g => g.recommended);
  const allGates = venue.gateRecommendations;
  const stats = venue.stats;

  return (
    <div className="space-y-6">

      {/* ─── AI Engine Status ─── */}
      <AIInsightBanner
        phase={venue.phase}
        phaseName={venue.phaseName}
        phaseProgress={venue.phaseProgress}
        lastUpdate={venue.lastUpdate}
      />

      {/* ─── Hero Section ─── */}
      <GlassCard className="relative overflow-hidden" padding="lg">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Live Now</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-1">{currentEvent.title}</h1>
              <p className="text-gray-400 text-sm">{currentEvent.venue}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="text-indigo-400">📅</span> {currentEvent.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-indigo-400">🕢</span> {currentEvent.time}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/25">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-semibold text-emerald-400">Match In Progress</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ─── AI Gate Recommendation ─── */}
      {bestGate && (
        <GlassCard padding="md" className="border-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-lg flex-shrink-0">
              🧠
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-white">AI Recommendation</h3>
                <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full uppercase border border-indigo-500/25">Smart Gate</span>
              </div>
              <p className="text-[12px] text-gray-400 leading-relaxed">{bestGate.reasoning}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm font-bold text-emerald-400">{bestGate.gateName}</span>
                <span className="text-[11px] text-gray-500">Wait: {bestGate.waitTime} min</span>
                <span className="text-[11px] text-emerald-400">Saves {bestGate.timeSaved} min</span>
                <span className="text-[10px] text-gray-600">Score: {bestGate.score}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* ─── Ticket Card ─── */}
      <GlassCard padding="none" className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-48 bg-gradient-to-br from-indigo-500/15 to-violet-600/10 flex items-center justify-center p-6 md:border-r border-b md:border-b-0 border-white/[0.06]">
            <div className="w-32 h-32 rounded-xl bg-white/90 flex items-center justify-center relative">
              <div className="grid grid-cols-5 gap-[3px]">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-[2px] ${
                      [0,1,2,4,5,6,8,10,14,16,18,20,22,24].includes(i) ? 'bg-gray-900' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[8px] font-bold text-indigo-600 bg-white px-1 rounded">SV</span>
              </div>
            </div>
          </div>
          <div className="flex-1 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Digital Ticket</h3>
              <span className="text-[11px] font-mono text-gray-500">{userTicket.id}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div><p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Section</p><p className="text-sm font-bold text-white">{userTicket.section}</p></div>
              <div><p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Row / Seat</p><p className="text-sm font-bold text-white">{userTicket.row}{userTicket.seat}</p></div>
              <div><p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1">AI Gate Pick</p><p className="text-sm font-bold text-emerald-400">{bestGate?.gateName || userTicket.gate}</p></div>
              <div><p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Wait Time</p><p className="text-sm font-bold text-emerald-400">{bestGate?.waitTime ?? userTicket.gateWaitTime} min</p></div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-emerald-400">✓</span>
                <span className="text-gray-400">
                  AI recommends <span className="font-semibold text-emerald-400">{bestGate?.gateName || userTicket.gate}</span> — {bestGate?.timeSaved || 14} min saved vs busiest
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ─── Quick Actions ─── */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="group">
              <GlassCard className="text-center h-full" padding="md">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mx-auto mb-3 text-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-0.5">{action.label}</h3>
                <p className="text-[11px] text-gray-500">{action.desc}</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Live Stats (AI-Powered) ─── */}
      <div>
        <h2 className="text-lg font-bold text-white mb-3">Live Stats</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon="👥" label="Crowd Density" value={stats?.crowdDensity ?? 64} suffix="%" trend={stats && stats.crowdDensity > 70 ? 'up' : 'down'} trendValue={`${stats?.crowdDensity ?? 64}%`} accentColor="indigo" />
          <StatCard icon="⏱" label="Avg Wait Time" value={stats?.avgWaitTime ?? 9} suffix="min" trend="down" trendValue={`${stats?.avgWaitTime ?? 9}m`} accentColor="amber" />
          <StatCard icon="🚪" label="Open Gates" value={stats?.openGates ?? 6} suffix="/8" trend="neutral" trendValue="live" accentColor="emerald" />
          <StatCard icon="👤" label="Attendees" value={stats?.totalAttendees ? Math.round(stats.totalAttendees / 1000) : 48} suffix="K" trend="up" trendValue="live" accentColor="indigo" />
        </div>
      </div>

      {/* ─── AI Gate Rankings ─── */}
      <GlassCard padding="md">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-bold text-white">Gate Rankings</h3>
          <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full uppercase">AI Scored</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {allGates.length > 0 ? allGates.map((gate) => (
            <div
              key={gate.gateId}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                gate.recommended
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/25'
                  : gate.crowdLevel === 'low'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : gate.crowdLevel === 'moderate'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              <span className="font-semibold">{gate.gateName}</span>
              <span className="text-xs">{gate.waitTime}m</span>
              <span className="text-[9px] text-gray-500">({gate.score})</span>
              {gate.recommended && (
                <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full uppercase">Best</span>
              )}
            </div>
          )) : (
            // Fallback static gates
            [
              { name: 'Gate A', wait: 18, color: 'red' },
              { name: 'Gate B', wait: 12, color: 'amber' },
              { name: 'Gate C', wait: 4,  color: 'emerald' },
              { name: 'Gate D', wait: 0,  color: 'gray', closed: true },
              { name: 'Gate E', wait: 9,  color: 'amber' },
              { name: 'Gate F', wait: 15, color: 'red' },
            ].map((gate) => (
              <div key={gate.name} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                'closed' in gate && gate.closed ? 'bg-gray-500/5 border-gray-500/15 text-gray-600' :
                gate.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                gate.color === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                <span className="font-semibold">{gate.name}</span>
                <span className="text-xs">{'closed' in gate && gate.closed ? 'Closed' : `${gate.wait}m`}</span>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
