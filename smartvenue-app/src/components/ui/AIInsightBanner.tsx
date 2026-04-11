'use client';

interface AIInsightBannerProps {
  phase: string;
  phaseName: string;
  phaseProgress: number;
  lastUpdate: Date | null;
}

export default function AIInsightBanner({ phase, phaseName, phaseProgress, lastUpdate }: AIInsightBannerProps) {
  const phaseIcons: Record<string, string> = {
    'pre-match': '🚪',
    'live': '⚽',
    'halftime': '☕',
    'second-half': '⚽',
    'exit': '🚶',
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500/[0.07] to-violet-500/[0.04] border border-indigo-500/15">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">AI Engine</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <span className="text-sm text-gray-300">
          {phaseIcons[phase] || '◎'} {phaseName}
        </span>
        <div className="w-20 h-1.5 rounded-full bg-white/[0.06] overflow-hidden hidden sm:block">
          <div
            className="h-full rounded-full bg-indigo-500/60 transition-all duration-1000"
            style={{ width: `${phaseProgress}%` }}
          />
        </div>
      </div>
      {lastUpdate && (
        <span className="text-[10px] text-gray-600">
          Updated {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
