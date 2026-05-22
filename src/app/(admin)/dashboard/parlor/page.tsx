// src/app/(admin)/dashboard/parlor/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase';
import { Plus, Milk, Percent, Calendar, RefreshCw } from 'lucide-react';

interface Animal {
  id: string;
  name: string;
  lactation_status: 'dry' | 'milking' | 'kid';
}

interface MilkLog {
  id: string;
  animal_id: string;
  log_date: string;
  am_yield_lbs: number;
  pm_yield_lbs: number;
  butterfat_pct: number | null;
  notes: string | null;
  animals: {
    name: string;
  } | null;
}

export default function ParlorPage() {
  const supabase = createClient();
  const [milkingDoes, setMilkingDoes] = useState<Animal[]>([]);
  const [logs, setLogs] = useState<MilkLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [amYield, setAmYield] = useState('');
  const [pmYield, setPmYield] = useState('');
  const [butterfat, setButterfat] = useState('');
  const [notes, setNotes] = useState('');

  async function fetchParlorData() {
    setLoading(true);
    
    // 1. Fetch active milking does for the selection dropdown
    const { data: animalsData } = await supabase
      .from('animals')
      .select('id, name, lactation_status')
      .eq('sex', 'F')
      .eq('lactation_status', 'milking')
      .order('name');

    if (animalsData) {
      setMilkingDoes(animalsData);
      if (animalsData.length > 0 && !selectedAnimalId) {
        setSelectedAnimalId(animalsData[0].id);
      }
    }

    // 2. Fetch recent milk logs including joined animal names
    const { data: logsData } = await supabase
      .from('milk_logs')
      .select(`
        id,
        animal_id,
        log_date,
        am_yield_lbs,
        pm_yield_lbs,
        butterfat_pct,
        notes,
        animals ( name )
      `)
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    if (logsData) {
      setLogs(logsData as unknown as MilkLog[]);
    }
    
    setLoading(false);
  }

  useEffect(() => {
    fetchParlorData();
  }, []);

  async function handleAddLog(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAnimalId || (!amYield && !pmYield)) return;

    const am = parseFloat(amYield) || 0;
    const pm = parseFloat(pmYield) || 0;
    const bf = butterfat ? parseFloat(butterfat) : null;

    const { error } = await supabase.from('milk_logs').insert([{
      animal_id: selectedAnimalId,
      log_date: logDate,
      am_yield_lbs: am,
      pm_yield_lbs: pm,
      butterfat_pct: bf,
      notes: notes || null
    }]);

    if (!error) {
      setAmYield('');
      setPmYield('');
      setButterfat('');
      setNotes('');
      fetchParlorData();
    }
  }

  // Aggregate Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(l => l.log_date === todayStr);
  const totalTodayYield = todayLogs.reduce((acc, curr) => acc + curr.am_yield_lbs + curr.pm_yield_lbs, 0);
  const avgYield = todayLogs.length > 0 ? (totalTodayYield / todayLogs.length).toFixed(2) : '0.00';

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">Milking Parlor</h1>
          <p className="text-stone-500">Log daily milk yields, track butterfat percentages, and monitor dairy production trends.</p>
        </div>
        <button 
          onClick={fetchParlorData}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Refresh Data
        </button>
      </div>

      {/* QUICK STATUS METRIC CARDS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium uppercase tracking-wider">
            <Milk className="h-4 w-4 text-emerald-700" /> Today's Pool Vol
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">{totalTodayYield.toFixed(2)} <span className="text-xs font-normal text-stone-500">lbs</span></p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium uppercase tracking-wider">
            <Percent className="h-4 w-4 text-emerald-700" /> Avg Daily Yield / Doe
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">{avgYield} <span className="text-xs font-normal text-stone-500">lbs</span></p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium uppercase tracking-wider">
            <Calendar className="h-4 w-4 text-emerald-700" /> Active Milking Herd
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">{milkingDoes.length} <span className="text-xs font-normal text-stone-500">Does</span></p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN: LOGGING INTAKE FORM */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAddLog} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-4 sticky top-6">
            <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-700" /> Record Parlor Session
            </h3>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Select Doe (Milking Status)</label>
              <select
                value={selectedAnimalId}
                onChange={e => setSelectedAnimalId(e.target.value)}
                required
                className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-emerald-500"
              >
                {milkingDoes.length === 0 ? (
                  <option value="">No milking does configured</option>
                ) : (
                  milkingDoes.map(doe => (
                    <option key={doe.id} value={doe.id}>{doe.name}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Log Date</label>
              <input 
                type="date" 
                required 
                value={logDate} 
                onChange={e => setLogDate(e.target.value)} 
                className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">AM Yield (lbs)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  value={amYield} 
                  onChange={e => setAmYield(e.target.value)} 
                  className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">PM Yield (lbs)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  value={pmYield} 
                  onChange={e => setPmYield(e.target.value)} 
                  className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Butterfat Component (%)</label>
              <input 
                type="number" 
                step="0.1" 
                placeholder="Optional (e.g., 4.2)" 
                value={butterfat} 
                onChange={e => setButterfat(e.target.value)} 
                className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500" 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Session Notes / Observations</label>
              <textarea 
                placeholder="Mastitis screening, behavior notes..." 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                rows={2}
                className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 resize-none" 
              />
            </div>

            <button 
              type="submit" 
              disabled={milkingDoes.length === 0}
              className="w-full rounded-lg bg-emerald-800 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-900 transition-colors disabled:opacity-50 disabled:hover:bg-emerald-800"
            >
              Commit Volume to Ledger
            </button>
          </form>
        </div>

        {/* RIGHT TWO COLUMNS: HISTORICAL LEDGER TABLE */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-stone-900 px-1">Recent Production Sessions</h3>
          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-xs font-semibold uppercase tracking-wider text-stone-500">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Doe</th>
                  <th className="px-4 py-3">AM Yield</th>
                  <th className="px-4 py-3">PM Yield</th>
                  <th className="px-4 py-3">Total Volume</th>
                  <th className="px-4 py-3">Butterfat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-stone-400">Loading milk logs...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-stone-400">No production logs committed to database.</td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const dailyTotal = log.am_yield_lbs + log.pm_yield_lbs;
                    return (
                      <tr key={log.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-stone-600">{log.log_date}</td>
                        <td className="px-4 py-3 font-medium text-stone-900">{log.animals?.name || 'Deleted Record'}</td>
                        <td className="px-4 py-3 text-stone-600 font-mono text-xs">{log.am_yield_lbs.toFixed(2)} lbs</td>
                        <td className="px-4 py-3 text-stone-600 font-mono text-xs">{log.pm_yield_lbs.toFixed(2)} lbs</td>
                        <td className="px-4 py-3 font-semibold text-emerald-800 font-mono text-xs">{dailyTotal.toFixed(2)} lbs</td>
                        <td className="px-4 py-3 text-stone-600 font-mono text-xs">{log.butterfat_pct ? `${log.butterfat_pct}%` : '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}