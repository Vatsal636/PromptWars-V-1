import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function GlassCard({ children, className, hover = true, padding = 'md' }: GlassCardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm',
        hover && 'transition-all duration-300 hover:bg-white/[0.04] hover:border-white/[0.1] hover:shadow-lg hover:shadow-black/20',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
