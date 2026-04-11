interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'green' | 'amber' | 'red' | 'blue';
}

export default function PageHeader({ title, subtitle, badge, badgeColor = 'green' }: PageHeaderProps) {
  const badgeColors: Record<string, string> = {
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    red: 'bg-red-500/15 text-red-400 border-red-500/25',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{title}</h1>
        {badge && (
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${badgeColors[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-sm text-gray-400 mt-1.5 max-w-2xl">{subtitle}</p>
      )}
    </div>
  );
}
