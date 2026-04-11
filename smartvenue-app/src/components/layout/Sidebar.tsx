'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/',               label: 'Dashboard',    icon: '◆' },
  { href: '/crowd-monitor',  label: 'Crowd',        icon: '◎' },
  { href: '/queue',          label: 'Queue',         icon: '☰' },
  { href: '/navigation',     label: 'Navigate',      icon: '◈' },
  { href: '/notifications',  label: 'Alerts',        icon: '⚡' },
  { href: '/sos',            label: 'SOS',           icon: '✦' },
  { href: '/admin',          label: 'Admin',         icon: '⬡' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[220px] bg-gray-950/80 backdrop-blur-xl border-r border-white/[0.06] z-50">
        {/* Brand */}
        <div className="p-6 pb-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              SV
            </div>
            <div>
              <span className="text-[15px] font-bold tracking-tight text-white">SmartVenue</span>
              <span className="block text-[10px] text-gray-500 font-medium tracking-wider uppercase">Live Platform</span>
            </div>
          </Link>
        </div>

        {/* Live Event Badge */}
        <div className="mx-4 mb-4 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Live Event</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 leading-tight">IPL 2026 Final</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span className={`text-base ${isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                  {item.icon}
                </span>
                {item.label}
                {item.label === 'SOS' && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
                {item.label === 'Alerts' && (
                  <span className="ml-auto text-[10px] font-bold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full">3</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <div>
              <p className="text-[12px] font-medium text-gray-300">Attendee</p>
              <p className="text-[10px] text-gray-500">East Stand · G14</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-950/90 backdrop-blur-xl border-t border-white/[0.06] z-50 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                  isActive ? 'text-indigo-400' : 'text-gray-500'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/sos"
            className="flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-medium text-red-400"
          >
            <span className="text-lg relative">
              ✦
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </span>
            SOS
          </Link>
        </div>
      </nav>
    </>
  );
}
