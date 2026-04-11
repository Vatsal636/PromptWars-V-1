'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import GlassCard from '@/components/ui/GlassCard';

export default function SOSPage() {
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sosType, setSosType] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const triggerSOS = (type: string) => {
    setSosType(type);
    setShowConfirm(true);
  };

  const confirmSOS = () => {
    setSosTriggered(true);
    setShowConfirm(false);
  };

  const cancelSOS = () => {
    setSosTriggered(false);
    setSosType(null);
    setShowConfirm(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency SOS"
        subtitle="Instant access to emergency services, medical aid, and evacuation routes"
        badge="Active"
        badgeColor="red"
      />

      {/* SOS Triggered State */}
      {sosTriggered && (
        <GlassCard padding="lg" className="border-red-500/30 bg-red-500/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-3xl">🆘</span>
            </div>
            <h3 className="text-xl font-extrabold text-red-400 mb-2">SOS Alert Sent</h3>
            <p className="text-sm text-gray-400 mb-1">
              <span className="font-semibold text-white capitalize">{sosType}</span> assistance request has been dispatched.
            </p>
            <p className="text-sm text-gray-500 mb-4">Help is on the way. Stay calm and stay in your current location.</p>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
              <div className="p-3 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">ETA</p>
                <p className="text-lg font-extrabold text-amber-400">2 min</p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Staff</p>
                <p className="text-lg font-extrabold text-emerald-400">Dispatched</p>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Location</p>
                <p className="text-lg font-extrabold text-white">Shared</p>
              </div>
            </div>

            <button
              onClick={cancelSOS}
              className="px-6 py-2.5 text-sm font-semibold rounded-lg border border-red-500/25 text-red-400 hover:bg-red-500/15 transition-all"
            >
              Cancel SOS
            </button>
          </div>
        </GlassCard>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <GlassCard padding="lg" className="border-amber-500/25">
          <div className="text-center">
            <span className="text-4xl block mb-3">⚠️</span>
            <h3 className="text-lg font-extrabold text-white mb-2">Confirm Emergency Alert</h3>
            <p className="text-sm text-gray-400 mb-4">
              Are you sure you want to send a <span className="font-semibold text-amber-400 capitalize">{sosType}</span> emergency alert?
              This will immediately dispatch help to your location.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={confirmSOS}
                className="px-6 py-2.5 text-sm font-bold rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/25"
              >
                Yes, Send SOS
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2.5 text-sm font-semibold rounded-lg border border-white/[0.1] text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Main SOS Button */}
      {!sosTriggered && !showConfirm && (
        <div className="flex justify-center py-4">
          <button
            onClick={() => triggerSOS('general')}
            className="relative group"
          >
            {/* Ripple rings */}
            <div className="absolute inset-0 w-44 h-44 rounded-full border-2 border-red-500/20 animate-ping" />
            <div className="absolute inset-[10%] w-[80%] h-[80%] rounded-full border border-red-500/15 animate-pulse" style={{ animationDelay: '0.5s' }} />
            {/* Button */}
            <div className="w-44 h-44 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-2xl shadow-red-500/30 group-hover:shadow-red-500/50 group-hover:scale-105 transition-all duration-300 relative">
              <div className="text-center">
                <span className="text-5xl block mb-1">🆘</span>
                <span className="text-sm font-extrabold text-white uppercase tracking-wider">SOS</span>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Emergency Services */}
      <h3 className="text-sm font-bold text-white">Emergency Services</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { type: 'medical', icon: '🏥', title: 'Medical Emergency', desc: 'First aid, ambulance, medical team', contacts: ['Medical Bay: Ext 100', 'Ambulance: Available'], color: 'red' },
          { type: 'security', icon: '🛡️', title: 'Security Issue', desc: 'Report threats, suspicious activity', contacts: ['Security: Ext 200', 'Police: Available'], color: 'amber' },
          { type: 'fire', icon: '🔥', title: 'Fire / Hazard', desc: 'Fire emergency, gas leak, structural', contacts: ['Fire Station: Ext 300', 'Evacuation: Active'], color: 'orange' },
        ].map((service) => (
          <GlassCard key={service.type} padding="md">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">{service.icon}</span>
              <div>
                <h4 className="text-sm font-bold text-white">{service.title}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">{service.desc}</p>
              </div>
            </div>
            <div className="space-y-1.5 mb-4">
              {service.contacts.map((contact, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                  {contact}
                </div>
              ))}
            </div>
            <button
              onClick={() => triggerSOS(service.type)}
              disabled={sosTriggered}
              className={`w-full py-2.5 text-[12px] font-semibold rounded-lg transition-all ${
                sosTriggered
                  ? 'bg-gray-500/10 text-gray-600 cursor-not-allowed border border-white/[0.04]'
                  : `bg-${service.color}-500/15 text-${service.color === 'red' ? 'red' : service.color === 'amber' ? 'amber' : 'orange'}-400 border border-${service.color}-500/25 hover:bg-${service.color}-500/25`
              }`}
            >
              {sosTriggered ? 'SOS Active' : `Request ${service.title.split(' ')[0]} Help`}
            </button>
          </GlassCard>
        ))}
      </div>

      {/* Evacuation Routes */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">Evacuation Routes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { gate: 'South Gate (Gate C)', distance: '120m', time: '3 min', crowd: 'Low', recommended: true },
            { gate: 'North Gate (Gate A)', distance: '250m', time: '6 min', crowd: 'Moderate', recommended: false },
            { gate: 'West Emergency Exit', distance: '90m', time: '2 min', crowd: 'Low', recommended: false },
            { gate: 'East Emergency Exit', distance: '180m', time: '4 min', crowd: 'High', recommended: false },
          ].map((route) => (
            <GlassCard key={route.gate} padding="md" className={route.recommended ? 'border-emerald-500/20' : ''}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚪</span>
                  <h4 className="text-sm font-bold text-white">{route.gate}</h4>
                </div>
                {route.recommended && (
                  <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase border border-emerald-500/25">
                    Recommended
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-[11px] text-gray-500">
                <span>{route.distance}</span>
                <span>·</span>
                <span>{route.time}</span>
                <span>·</span>
                <span className={
                  route.crowd === 'Low' ? 'text-emerald-400' :
                  route.crowd === 'Moderate' ? 'text-amber-400' :
                  'text-red-400'
                }>
                  {route.crowd} crowd
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
