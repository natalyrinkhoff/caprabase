// src/app/(admin)/dashboard/layout.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Dna, 
  Milk, 
  HeartPulse, 
  LayoutDashboard, 
  Store, 
  CreditCard, 
  Settings 
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Herd Registry', href: '/dashboard/registry', icon: Dna },
  { name: 'Milking Parlor', href: '/dashboard/parlor', icon: Milk },
  { name: 'Herd Health', href: '/dashboard/medical', icon: HeartPulse },
  { name: 'Store', href: '/dashboard/store', icon: Store },
  { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
  { name: 'Farm Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-stone-200 bg-white p-6 hidden md:block">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="h-6 w-6 rounded bg-emerald-800" />
          <span className="font-semibold text-stone-900 tracking-tight">CapraBase</span>
        </div>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900 font-semibold'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? 'text-emerald-800' : 'text-stone-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
