'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';
import AIInsightBanner from '@/components/ui/AIInsightBanner';
import { useAIPolling } from '@/lib/hooks/useAIPolling';
import { notifications as staticNotifications } from '@/data/mock-data';
import { getNotificationColor } from '@/lib/utils';
import type { AIAlert, Notification } from '@/types';

interface AlertData {
  phase: string;
  phaseName: string;
  totalAlerts: number;
  severityCounts: { emergency: number; critical: number; warning: number; info: number };
  actionRequired: number;
  alerts: AIAlert[];
}

interface SimData {
  simulation: { phase: string; phaseName: string; phaseProgress: number };
}

export default function NotificationsPage() {
  const [staticNotifs, setStaticNotifs] = useState(staticNotifications);
  const [filter, setFilter] = useState<'all' | 'ai-alerts' | 'unread' | 'info' | 'warning' | 'success' | 'emergency'>('all');

  const { data: alertData, lastUpdate } = useAIPolling<AlertData>({ url: '/api/ai/alerts', interval: 3000 });
  const { data: simData } = useAIPolling<SimData>({ url: '/api/ai/simulation', interval: 3000 });

  const markAllRead = () => setStaticNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setStaticNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const aiAlerts = alertData?.alerts || [];
  const unreadCount = staticNotifs.filter(n => !n.read).length;

  const filteredStatic: Notification[] =
    filter === 'all' || filter === 'ai-alerts' ? staticNotifs :
    filter === 'unread' ? staticNotifs.filter(n => !n.read) :
    staticNotifs.filter(n => n.type === filter);

  const showAI = filter === 'all' || filter === 'ai-alerts';

  const severityIcon = (s: string) => s === 'emergency' ? '🔴' : s === 'critical' ? '🟠' : s === 'warning' ? '🟡' : '🔵';
  const severityBorder = (s: string) => s === 'emergency' ? 'border-l-red-500' : s === 'critical' ? 'border-l-orange-500' : s === 'warning' ? 'border-l-amber-500' : 'border-l-blue-500';

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" subtitle="AI-generated alerts and real-time venue notifications" badge={`${aiAlerts.length + unreadCount} Active`} badgeColor={aiAlerts.length > 0 ? 'amber' : 'green'} />

      {simData && <AIInsightBanner phase={simData.simulation.phase} phaseName={simData.simulation.phaseName} phaseProgress={simData.simulation.phaseProgress} lastUpdate={lastUpdate} />}

      {/* AI Alert Summary */}
      {alertData && alertData.totalAlerts > 0 && (
        <GlassCard padding="md" className="border-indigo-500/15">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🧠</span>
            <h3 className="text-sm font-bold text-white">AI Alert Summary</h3>
            <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full uppercase">{alertData.totalAlerts} Active</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(alertData.severityCounts).map(([key, count]) => count > 0 && (
              <div key={key} className="flex items-center gap-1.5 text-[12px]">
                <span>{severityIcon(key)}</span>
                <span className="text-gray-300 capitalize">{key}: <span className="font-bold">{count}</span></span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-[12px]">
              <span>⚡</span>
              <span className="text-amber-400">Action Required: <span className="font-bold">{alertData.actionRequired}</span></span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          {(['all', 'ai-alerts', 'unread', 'info', 'warning', 'success', 'emergency'] as const).map((f) => {
            const icons = { all: '📋', 'ai-alerts': '🧠', unread: '🔵', info: 'ℹ️', warning: '⚠️', success: '✅', emergency: '🔴' };
            return (
              <button key={f} onClick={() => setFilter(f)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all border ${filter === f ? 'bg-white/10 border-white/20 text-white' : 'bg-white/[0.02] border-white/[0.06] text-gray-500 hover:text-gray-300'}`}>
                <span className="text-sm">{icons[f]}</span> {f === 'ai-alerts' ? 'AI Alerts' : f}
              </button>
            );
          })}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-[12px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Mark all read</button>
        )}
      </div>

      {/* AI Alerts Section */}
      {showAI && aiAlerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            🧠 AI-Generated Alerts
            <span className="text-[9px] font-bold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full uppercase">Live</span>
          </h3>
          {aiAlerts.map((alert) => (
            <GlassCard key={alert.id} padding="md" className={`border-l-4 ${severityBorder(alert.severity)} bg-white/[0.02]`}>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">{severityIcon(alert.severity)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                      alert.severity === 'emergency' ? 'bg-red-500/15 text-red-400' :
                      alert.severity === 'warning' ? 'bg-amber-500/15 text-amber-400' :
                      'bg-blue-500/15 text-blue-400'
                    }`}>{alert.severity}</span>
                    <span className="text-[10px] text-gray-600 capitalize">{alert.category}</span>
                  </div>
                  <p className="text-[12px] text-gray-400 leading-relaxed mb-2">{alert.description}</p>
                  {alert.actionRequired && (
                    <div className="p-2 rounded-lg bg-indigo-500/[0.05] border border-indigo-500/15">
                      <p className="text-[11px] text-indigo-400">💡 {alert.suggestedAction}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-600">
                    <span>📍 {alert.zone}</span>
                    <span>·</span>
                    <span>{alert.timestamp}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Static Notifications */}
      {filter !== 'ai-alerts' && (
        <div className="space-y-2">
          {filter === 'all' && <h3 className="text-sm font-bold text-white">Venue Notifications</h3>}
          {filteredStatic.length === 0 ? (
            <GlassCard padding="lg" className="text-center">
              <span className="text-4xl block mb-3">📭</span>
              <p className="text-sm text-gray-500">No notifications in this category</p>
            </GlassCard>
          ) : (
            filteredStatic.map((notif) => (
              <button key={notif.id} onClick={() => markRead(notif.id)} className="w-full text-left">
                <GlassCard padding="md" className={`border-l-4 ${getNotificationColor(notif.type)} ${!notif.read ? 'bg-white/[0.03]' : ''}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{notif.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className={`text-sm font-bold ${!notif.read ? 'text-white' : 'text-gray-300'}`}>{notif.title}</h4>
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                      </div>
                      <p className="text-[12px] text-gray-400 leading-relaxed">{notif.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-gray-600">{notif.timestamp}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${notif.type === 'emergency' ? 'bg-red-500/15 text-red-400' : notif.type === 'warning' ? 'bg-amber-500/15 text-amber-400' : notif.type === 'success' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'}`}>{notif.type}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
