// src/app/(admin)/dashboard/page.tsx
import React from 'react';

export default function DashboardOverview() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
          Farmstead Control Center
        </h1>
        <p className="text-stone-500">
          Real-time lineage data tracking, milk yields, and dynamic storefront subscription diagnostics.
        </p>
      </div>

      {/* Metric Placeholder Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Active Herd Size</p>
          <p className="mt-2 text-3xl font-bold text-stone-900">0 Does / Bucks</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Daily Milk Weight</p>
          <p className="mt-2 text-3xl font-bold text-stone-900">0.00 lbs</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Active Herdshares</p>
          <p className="mt-2 text-3xl font-bold text-stone-900">$0.00 MRR</p>
        </div>
      </div>
    </div>
  );
}