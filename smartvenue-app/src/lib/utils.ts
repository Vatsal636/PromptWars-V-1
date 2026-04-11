// ─── Utility Functions ───

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getCrowdColor(level: 'low' | 'moderate' | 'high' | 'critical'): string {
  switch (level) {
    case 'low': return 'text-emerald-400';
    case 'moderate': return 'text-amber-400';
    case 'high': return 'text-orange-400';
    case 'critical': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

export function getCrowdBg(level: 'low' | 'moderate' | 'high' | 'critical'): string {
  switch (level) {
    case 'low': return 'bg-emerald-500/20 border-emerald-500/30';
    case 'moderate': return 'bg-amber-500/20 border-amber-500/30';
    case 'high': return 'bg-orange-500/20 border-orange-500/30';
    case 'critical': return 'bg-red-500/20 border-red-500/30';
    default: return 'bg-gray-500/20 border-gray-500/30';
  }
}

export function getCrowdDot(level: 'low' | 'moderate' | 'high' | 'critical'): string {
  switch (level) {
    case 'low': return 'bg-emerald-400';
    case 'moderate': return 'bg-amber-400';
    case 'high': return 'bg-orange-400';
    case 'critical': return 'bg-red-400';
    default: return 'bg-gray-400';
  }
}

export function getSeverityColor(severity: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (severity) {
    case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'responding': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'resolved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

export function getNotificationColor(type: 'info' | 'warning' | 'success' | 'emergency'): string {
  switch (type) {
    case 'info': return 'border-l-blue-500';
    case 'warning': return 'border-l-amber-500';
    case 'success': return 'border-l-emerald-500';
    case 'emergency': return 'border-l-red-500';
    default: return 'border-l-gray-500';
  }
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}
