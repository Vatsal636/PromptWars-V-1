import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  accentColor?: string;
}

export default function StatCard({ label, value, suffix, icon, trend, trendValue, accentColor = 'indigo' }: StatCardProps) {
  const accentClasses: Record<string, string> = {
    indigo: 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/20 shadow-indigo-500/10',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 shadow-emerald-500/10',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/20 shadow-amber-500/10',
    red: 'from-red-500/20 to-red-500/5 border-red-500/20 shadow-red-500/10',
    violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/20 shadow-violet-500/10',
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 shadow-cyan-500/10',
  };

  return (
    <div className={cn(
      'rounded-2xl border bg-gradient-to-br p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-default',
      accentClasses[accentColor] || accentClasses.indigo
    )}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {trend && trendValue && (
          <span className={cn(
            'text-[11px] font-semibold px-2 py-0.5 rounded-full',
            trend === 'up' && 'bg-emerald-500/20 text-emerald-400',
            trend === 'down' && 'bg-red-500/20 text-red-400',
            trend === 'neutral' && 'bg-gray-500/20 text-gray-400'
          )}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold tracking-tight text-white">{value}</span>
        {suffix && <span className="text-lg font-semibold text-gray-400">{suffix}</span>}
      </div>
      <p className="text-[13px] text-gray-400 mt-1 font-medium">{label}</p>
    </div>
  );
}
