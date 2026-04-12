'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AIInsightBanner from '@/components/ui/AIInsightBanner';
import { useVenueDataContext } from '@/lib/hooks/useLiveVenueData';
import { trackQueueJoin } from '@/lib/firebase/analytics';
import type { QueueStation, QueueToken } from '@/types';

export default function QueuePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'food' | 'restroom' | 'merchandise' | 'parking'>('all');
  const [tokens, setTokens] = useState<QueueToken[]>([]);
  const [joinAnimation, setJoinAnimation] = useState<string | null>(null);

  // Shared venue data from context (no duplicate fetch)
  const venue = useVenueDataContext();

  // Poll persistent queue tokens constantly to sync with global countdown
  useEffect(() => {
    const syncFromStorage = () => {
      const saved = localStorage.getItem('smartvenue_queue_tokens');
      if (saved) {
        setTokens(JSON.parse(saved));
      }
    };
    
    // Initial load
    syncFromStorage();

    // Poll every 1s so the UI strictly reflects the GlobalQueueEngine logic
    const interval = setInterval(syncFromStorage, 1000);
    return () => clearInterval(interval);
  }, []);

  const stations = venue.queues;
  const aiRecs = venue.queueRecommendations;
  const filtered = activeTab === 'all' ? stations : stations.filter(s => s.type === activeTab);

  const getAIRec = (stationId: string) => aiRecs.find(r => r.stationId === stationId);

  const joinQueue = (station: QueueStation) => {
    const rec = getAIRec(station.id);
    const timeToWait = rec?.predictedWait ?? station.waitTime;
    const isInstant = timeToWait <= 0;

    const token: QueueToken = {
      id: `tkn-${Date.now()}`,
      stationId: station.id,
      stationName: station.name,
      tokenNumber: `A-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
      estimatedTime: isInstant ? 0 : timeToWait,
      status: isInstant ? 'ready' : 'waiting',
      position: isInstant ? 0 : Math.floor(Math.random() * 10) + 1,
      joinedAt: Date.now(),
    };
    
    setTokens(prev => {
      const next = [token, ...prev];
      localStorage.setItem('smartvenue_queue_tokens', JSON.stringify(next));
      return next;
    });

    setJoinAnimation(station.id);
    trackQueueJoin(station.id, station.name, station.waitTime);
    setTimeout(() => setJoinAnimation(null), 1500);
  };

  const cancelToken = (tokenId: string) => {
    setTokens(prev => {
      const next = prev.filter(t => t.id !== tokenId);
      localStorage.setItem('smartvenue_queue_tokens', JSON.stringify(next));
      return next;
    });
  };

  const bestRec = aiRecs.find(r => r.recommended);

  return (
    <div className="space-y-6">
      <PageHeader title="Queue Management" subtitle="AI-optimized virtual queues with predictive wait times and smart recommendations" badge="Active" badgeColor="green" />

      <AIInsightBanner phase={venue.phase} phaseName={venue.phaseName} phaseProgress={venue.phaseProgress} lastUpdate={venue.lastUpdate} />

      {/* AI Queue Recommendation */}
      {bestRec && (
        <GlassCard padding="md" className="border-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-lg flex-shrink-0">🧠</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-white">AI Recommendation</h3>
                <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full uppercase border border-indigo-500/25">Smart Queue</span>
              </div>
              <p className="text-[12px] text-gray-400 leading-relaxed">{bestRec.reasoning}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm font-bold text-emerald-400">{bestRec.icon} {bestRec.stationName}</span>
                <span className="text-[11px] text-gray-500">Current: {bestRec.currentWait}m</span>
                <span className="text-[11px] text-indigo-400">Predicted: {bestRec.predictedWait}m</span>
                <span className={`text-[10px] font-semibold capitalize ${bestRec.trend === 'decreasing' ? 'text-emerald-400' : bestRec.trend === 'increasing' ? 'text-red-400' : 'text-gray-400'}`}>{bestRec.trend}</span>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Active Tokens */}
      {tokens.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white mb-3">Your Active Tokens</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tokens.map((token) => (
              <GlassCard key={token.id} padding="md" className={`border-indigo-500/20 relative overflow-hidden ${token.status === 'ready' ? 'ring-1 ring-emerald-500/50 bg-emerald-500/5' : ''}`}>
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${token.status === 'ready' ? 'from-emerald-500 to-teal-500' : 'from-indigo-500 to-violet-500'}`} />
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-white">{token.stationName}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Token #{token.tokenNumber}</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border capitalize ${token.status === 'ready' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'}`}>
                    {token.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{token.status === 'ready' ? 'Action' : 'Position'}</p>
                    <p className={`text-lg font-extrabold ${token.status === 'ready' ? 'text-emerald-400' : 'text-white'}`}>
                      {token.status === 'ready' ? 'Proceed' : `#${token.position}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">AI Est. Wait</p>
                    <p className={`text-lg font-extrabold ${token.status === 'ready' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {token.estimatedTime} min
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => cancelToken(token.id)} 
                  className={`w-full py-2 text-[12px] font-semibold rounded-lg border transition-all ${token.status === 'ready' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30' : 'border-red-500/20 text-red-400 hover:bg-red-500/10'}`}
                >
                  {token.status === 'ready' ? 'Done' : 'Cancel Token'}
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'food', 'restroom', 'merchandise', 'parking'] as const).map((tab) => {
          const icons = { all: '📋', food: '🍔', restroom: '🚻', merchandise: '👕', parking: '🅿️' };
          const count = tab === 'all' ? stations.length : stations.filter(s => s.type === tab).length;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all border ${activeTab === tab ? 'bg-white/10 border-white/20 text-white' : 'bg-white/[0.02] border-white/[0.06] text-gray-500 hover:text-gray-300'}`}>
              <span>{icons[tab]}</span> {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Queue Cards with AI data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((station) => {
          const hasToken = tokens.some(t => t.stationId === station.id);
          const isJoining = joinAnimation === station.id;
          const rec = getAIRec(station.id);
          return (
            <GlassCard key={station.id} padding="md" className={`${isJoining ? 'ring-1 ring-emerald-500/40' : ''} ${rec?.recommended ? 'ring-1 ring-indigo-500/25' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{station.icon}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white">{station.name}</h4>
                      {rec?.recommended && <span className="text-[8px] font-bold bg-indigo-500/20 text-indigo-400 px-1 py-0.5 rounded-full">AI PICK</span>}
                    </div>
                    <p className="text-[11px] text-gray-500 capitalize">{station.type}</p>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border capitalize ${station.status === 'open' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : station.status === 'busy' ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' : 'bg-red-500/15 text-red-400 border-red-500/25'}`}>{station.status}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                  <p className="text-[9px] text-gray-500 uppercase mb-0.5">Wait</p>
                  <p className={`text-lg font-extrabold ${station.waitTime <= 5 ? 'text-emerald-400' : station.waitTime <= 12 ? 'text-amber-400' : 'text-red-400'}`}>{station.waitTime}<span className="text-xs text-gray-500">m</span></p>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                  <p className="text-[9px] text-gray-500 uppercase mb-0.5">Predicted</p>
                  <p className={`text-lg font-extrabold text-indigo-400`}>{rec?.predictedWait ?? '—'}<span className="text-xs text-gray-500">m</span></p>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-center">
                  <p className="text-[9px] text-gray-500 uppercase mb-0.5">Queue</p>
                  <p className="text-lg font-extrabold text-white">{station.queueLength}</p>
                </div>
              </div>

              {/* AI Trend indicator */}
              {rec && (
                <div className="flex items-center gap-2 mb-3 text-[11px]">
                  <span className={`font-semibold capitalize ${rec.trend === 'decreasing' ? 'text-emerald-400' : rec.trend === 'increasing' ? 'text-red-400' : 'text-gray-400'}`}>
                    {rec.trend === 'decreasing' ? '↓' : rec.trend === 'increasing' ? '↑' : '→'} {rec.trend}
                  </span>
                </div>
              )}

              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-4">
                <div className={`h-full rounded-full transition-all duration-700 ${station.waitTime <= 5 ? 'bg-emerald-500' : station.waitTime <= 12 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (station.waitTime / 25) * 100)}%` }} />
              </div>

              {station.status !== 'closed' && (
                <div className="flex gap-2">
                  <button onClick={() => !hasToken && joinQueue(station)} disabled={hasToken} className={`flex-1 py-2.5 text-[12px] font-semibold rounded-lg transition-all ${hasToken ? 'bg-white/[0.04] text-gray-600 cursor-not-allowed border border-white/[0.04]' : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02]'}`}>
                    {hasToken ? 'Token Active' : 'Join Virtual Queue'}
                  </button>
                  {station.type === 'food' && (
                    <button className="px-3 py-2.5 text-[12px] font-semibold rounded-lg border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all">Pre-Order</button>
                  )}
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
