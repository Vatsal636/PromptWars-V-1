'use client';

import { useEffect, useState } from 'react';
import type { QueueToken } from '@/types';
import { useRouter } from 'next/navigation';

let globalAudioCtx: AudioContext | any = null;

if (typeof window !== 'undefined') {
  const initAudio = () => {
    if (!globalAudioCtx) {
      globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume();
    }
    document.removeEventListener('click', initAudio);
    document.removeEventListener('keydown', initAudio);
    document.removeEventListener('touchstart', initAudio);
  };
  document.addEventListener('click', initAudio);
  document.addEventListener('keydown', initAudio);
  document.addEventListener('touchstart', initAudio);
}

const playNotificationSound = () => {
  try {
    if (!globalAudioCtx) return;
    if (globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume();
    }
    
    const osc1 = globalAudioCtx.createOscillator();
    const gain1 = globalAudioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(globalAudioCtx.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, globalAudioCtx.currentTime); 
    gain1.gain.setValueAtTime(0.5, globalAudioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, globalAudioCtx.currentTime + 0.1);
    osc1.start(globalAudioCtx.currentTime);
    osc1.stop(globalAudioCtx.currentTime + 0.1);

    const osc2 = globalAudioCtx.createOscillator();
    const gain2 = globalAudioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(globalAudioCtx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, globalAudioCtx.currentTime + 0.1); 
    gain2.gain.setValueAtTime(0, globalAudioCtx.currentTime + 0.1);
    gain2.gain.linearRampToValueAtTime(0.5, globalAudioCtx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, globalAudioCtx.currentTime + 0.3);
    osc2.start(globalAudioCtx.currentTime + 0.1);
    osc2.stop(globalAudioCtx.currentTime + 0.3);
  } catch (e) {
    console.log('Audio playback blocked');
  }
};

export default function GlobalQueueEngine() {
  const [activeToast, setActiveToast] = useState<{ id: string, name: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('smartvenue_queue_tokens');
      if (!saved) return;
      
      const tokens: QueueToken[] = JSON.parse(saved);
      if (tokens.length === 0) return;

      let changed = false;
      const next = tokens.map(t => {
        if (t.estimatedTime > 0) {
          changed = true;
          return { 
            ...t, 
            estimatedTime: t.estimatedTime - 1, 
            position: Math.max(1, t.position - 1) 
          };
        } else if (t.estimatedTime <= 0 && t.status !== 'ready') {
          changed = true;
          playNotificationSound();
          setActiveToast({ id: t.id, name: t.stationName });
          
          return { 
            ...t, 
            estimatedTime: 0, 
            position: 0, 
            status: 'ready' 
          };
        }
        return t;
      });

      if (changed) {
        localStorage.setItem('smartvenue_queue_tokens', JSON.stringify(next));
      }
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  if (!activeToast) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-5 fade-in duration-300">
      <div className="bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl rounded-xl p-4 shadow-2xl flex items-start gap-3 w-80">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-xl shrink-0">
          ✅
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-400 mb-1">Queue Ready!</h4>
          <p className="text-xs text-gray-300 mb-3">It is your turn at <strong className="text-white">{activeToast.name}</strong>. Please proceed to the counter.</p>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setActiveToast(null);
                router.push('/queue');
              }}
              className="px-3 py-1.5 bg-emerald-500 text-white text-[11px] font-bold rounded-md hover:bg-emerald-600 transition-colors cursor-pointer"
            >
              View Ticket
            </button>
            <button 
              onClick={() => setActiveToast(null)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-400 text-[11px] font-bold rounded-md hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
