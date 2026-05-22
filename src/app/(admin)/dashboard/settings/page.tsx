// src/app/(admin)/dashboard/settings/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase';
import { Save, Building, Sliders, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function FarmSettingsPage() {
  const supabase = createClient();
  
  // App UI State
  const [syncing, setSyncing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Baseline Fallback Values - Mounted Instantly
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [farmName, setFarmName] = useState('My Capra Farm');
  const [ownerName, setOwnerName] = useState('Farm Manager');
  const [contactEmail, setContactEmail] = useState('manager@farm.com');
  const [milkUnit, setMilkUnit] = useState<'lbs' | 'kg'>('lbs');
  const [withdrawalBuffer, setWithdrawalBuffer] = useState('2');
  const [adgaPrefix, setAdgaPrefix] = useState('');

  // Lazy-load database data *after* the UI is fully painted on screen
  useEffect(() => {
    async function loadDatabaseConfig() {
      try {
        const { data, error } = await supabase
          .from('farm_settings')
          .select('*')
          .maybeSingle();

        if (error) {
          console.warn('Supabase offline or table missing - running on local defaults:', error.message);
          return;
        }

        if (data) {
          setSettingsId(data.id);
          setFarmName(data.farm_name || '');
          setOwnerName(data.owner_name || '');
          setContactEmail(data.contact_email || '');
          setMilkUnit((data.milk_measurement_unit as 'lbs' | 'kg') || 'lbs');
          setWithdrawalBuffer(String(data.withdrawal_buffer_days ?? 0));
          setAdgaPrefix(data.adga_herd_prefix || '');
        }
      } catch (catchErr) {
        console.warn('System caught client exception - layout isolated safely.');
      }
    }

    loadDatabaseConfig();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSyncing(true);
    setSaveStatus({ type: null, message: '' });

    const payload = {
      farm_name: farmName,
      owner_name: ownerName,
      contact_email: contactEmail,
      milk_measurement_unit: milkUnit,
      withdrawal_buffer_days: parseInt(withdrawalBuffer, 10) || 0,
      adga_herd_prefix: adgaPrefix || null,
    };

    try {
      let queryError = null;

      if (settingsId) {
        const { error } = await supabase
          .from('farm_settings')
          .update(payload)
          .eq('id', settingsId);
        queryError = error;
      } else {
        const { data, error } = await supabase
          .from('farm_settings')
          .insert([payload])
          .select()
          .maybeSingle();
        
        queryError = error;
        if (data?.id) setSettingsId(data.id);
      }

      if (queryError) {
        setSaveStatus({ 
          type: 'error', 
          message: `Database rejected sync: ${queryError.message}. Local changes will remain active until you refresh.` 
        });
      } else {
        setSaveStatus({ type: 'success', message: 'Operational thresholds synchronized successfully.' });
        setTimeout(() => setSaveStatus({ type: null, message: '' }), 4000);
      }
    } catch (err: any) {
      setSaveStatus({ 
        type: 'error', 
        message: `Network failure: ${err?.message || 'Could not communicate with server.'}` 
      });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* HEADER ROW */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">Farm Settings</h1>
        <p className="text-stone-500 text-sm">Configure global tracking constraints, registration prefixes, and milk safety buffer rules.</p>
      </div>

      {/* FLOATING BANNER NOTIFICATIONS */}
      {saveStatus.type === 'success' && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> {saveStatus.message}
        </div>
      )}
      
      {saveStatus.type === 'error' && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" /> 
          <span>{saveStatus.message}</span>
        </div>
      )}

      {/* MAIN CONFIGURATION INTERFACE */}
      <form onSubmit={handleSave} className="grid gap-8 md:grid-cols-3">
        
        {/* IDENTIFICATION BLOCK */}
        <div className="md:col-span-1 space-y-1">
          <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
            <Building className="h-4 w-4 text-emerald-800" />
            <h3>Farm Profile Identity</h3>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            Specify public record values and identifiers matching your official pedigree registries.
          </p>
        </div>

        <div className="md:col-span-2 rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Registered Farm/Herd Name</label>
              <input 
                type="text"
                required
                value={farmName}
                onChange={e => setFarmName(e.target.value)}
                className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 bg-white text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">ADGA Registered Herd Prefix</label>
              <input 
                type="text"
                placeholder="None Assigned"
                value={adgaPrefix}
                onChange={e => setAdgaPrefix(e.target.value)}
                className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm uppercase focus:outline-none focus:border-emerald-500 bg-white text-stone-900"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Owner of Record</label>
              <input 
                type="text"
                required
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 bg-white text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Contact Email Address</label>
              <input 
                type="email"
                required
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 bg-white text-stone-900"
              />
            </div>
          </div>
        </div>

        <div className="w-full border-t border-stone-200 md:col-span-3 my-1" />

        {/* METRICS & SAFEGUARDS BLOCK */}
        <div className="md:col-span-1 space-y-1">
          <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
            <Sliders className="h-4 w-4 text-emerald-800" />
            <h3>Compliance & Metrics</h3>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            Define structural system targets used across active milk weighing data and veterinary logs.
          </p>
        </div>

        <div className="md:col-span-2 rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-2">Global Weight Unit (Milk Yields)</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="milkUnitSetting" 
                  value="lbs"
                  checked={milkUnit === 'lbs'}
                  onChange={() => setMilkUnit('lbs')}
                  className="h-4 w-4 text-emerald-800 focus:ring-emerald-500 border-stone-300"
                />
                Pounds (lbs)
              </label>
              <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="milkUnitSetting" 
                  value="kg"
                  checked={milkUnit === 'kg'}
                  onChange={() => setMilkUnit('kg')}
                  className="h-4 w-4 text-emerald-800 focus:ring-emerald-500 border-stone-300"
                />
                Kilograms (kg)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              Safety Withdrawal Buffer Padding (Days)
            </label>
            <div className="max-w-xs">
              <input 
                type="number" 
                min="0"
                max="30"
                required
                value={withdrawalBuffer}
                onChange={e => setWithdrawalBuffer(e.target.value)}
                className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 bg-white text-stone-900"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5 leading-normal">
              Automated safety margin. Automatically appends these extra days to baseline veterinary wait times configured in Herd Health.
            </p>
          </div>
        </div>

        {/* FORM CONTROLS FOOTER */}
        <div className="md:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-900 shadow-sm transition-colors disabled:opacity-60"
          >
            {syncing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Synchronizing...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Configuration
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}