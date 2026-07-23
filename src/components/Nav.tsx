'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [
  { href: '/', label: '新建报价', emoji: '✏️' },
  { href: '/history', label: '历史记录', emoji: '📋' },
  { href: '/settings', label: '系统设置', emoji: '⚙️' },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-rose-100 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-14 sm:h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" onClick={() => setOpen(false)}>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <span className="text-white text-base sm:text-lg leading-none">📦</span>
          </div>
          <div className="leading-tight">
            <span className="font-bold text-slate-800 text-sm sm:text-[15px]">纸箱报价</span>
            <span className="font-bold text-rose-500 text-sm sm:text-[15px]"> Pro</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                pathname === l.href
                  ? 'bg-rose-50 text-rose-600 shadow-sm shadow-rose-100'
                  : 'text-slate-500 hover:text-rose-500 hover:bg-rose-50/60'
              }`}
            >
              <span>{l.emoji}</span>
              <span>{l.label}</span>
            </Link>
          ))}
        </div>

        {/* Mobile icon links */}
        <div className="flex sm:hidden items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`flex flex-col items-center px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                pathname === l.href
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-slate-400 hover:text-rose-500'
              }`}
            >
              <span className="text-lg leading-none">{l.emoji}</span>
              <span className="text-[10px] mt-0.5">{l.label.slice(0, 2)}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
