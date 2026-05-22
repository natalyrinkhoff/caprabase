// src/app/(admin)/dashboard/medical/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase';
import { ShieldAlert, CheckCircle, Plus, Clipboard, RefreshCw } from 'lucide-react';

interface Animal {
  id: string;
  name: string;
}

interface MedicalRecord {
  id: string;
  animal_id: string;
  treatment_date: string;
  medication_name: string;
  dosage: string;
  withdrawal_days_milk: number;
  notes: string | null;
  animals: {
    name: string;
  } | null;
}

export default function MedicalPage() {
  const supabase = createClient();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [treatmentDate, setTreatmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [withdrawalDaysMilk, setWithdrawalDaysMilk] = useState('0');
  const [notes, setNotes] = useState('');

  async function fetchMedicalData() {
    setLoading(true);

    // 1. Fetch all animals for options dropdown
    const { data: animalsData } = await supabase
      .from('animals')
      .select('id, name')
      .order('name');

    if (animalsData) {
      setAnimals(animalsData);
      if (animalsData.length > 0 && !selectedAnimalId) {
        setSelectedAnimalId(animalsData[0].id);
      }
    }

    // 2. Fetch medical records
    const { data: recordsData } = await supabase
      .from('medical_records')
      .select(`
        id,
        animal_id,
        treatment_date,
        medication_name,
        dosage,
        withdrawal_days_milk,
        notes,
        animals ( name )
      `)
      .order('treatment_date', { ascending: false })
      .limit(50);

    if (recordsData) {
      setRecords(recordsData as unknown as MedicalRecord[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchMedicalData();
  }, []);

  async function handleAddRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAnimalId || !medicationName || !dosage) return;

    const { error } = await supabase.from('medical_records').insert([{
      animal_id: selectedAnimalId,
      treatment_date: treatmentDate,
      medication_name: medicationName,
      dosage,
      withdrawal_days_milk: parseInt(withdrawalDaysMilk, 10) || 0,
      notes: notes || null
    }]);

    if (!error) {
      setMedicationName('');
      setDosage('');
      setWithdrawalDaysMilk('0');
      setNotes('');
      fetchMedicalData();
    }
  }

  // Helper calculation to check if treatment is currently inside withdrawal threshold
  const isUnderWithdrawal = (treatmentDateStr: string, withdrawalDays: number) => {
    if (withdrawalDays <= 0) return false;
    
    const treatDate = new Date(treatmentDateStr + 'T00:00:00');
    const clearanceDate = new Date(treatDate);
    clearanceDate.setDate(clearanceDate.getDate() + withdrawalDays);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    return today <= clearanceDate;
  };

  const getWithdrawalStatus = (treatmentDateStr: string, withdrawalDays: number) => {
    if (withdrawalDays <= 0) return { active: false, label: 'Clear' };
    
    const treatDate = new Date(treatmentDateStr + 'T00:00:00');
    const clearanceDate = new Date(treatDate);
    clearanceDate.setDate(clearanceDate.getDate() + withdrawalDays);
    
    const today = new Date();
    today.setHours(0,0,0,0);

    if (today > clearanceDate) {
      return { active: false, label: 'Expired' };
    }

    const diffTime = clearanceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { active: true, label: `${diffDays} Day${diffDays > 1 ? 's' : ''} Left` };
  };

  const activeAlertsCount = records.filter(r => isUnderWithdrawal(r.treatment_date, r.withdrawal_days_milk)).length;

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">Medical & Withdrawal Tracker</h1>
          <p className="text-stone-500">Track livestock medical dosages and maintain compliance safeguards on milk safety holds.</p>
        </div>
        <button 
          onClick={fetchMedicalData}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Refresh Status
        </button>
      </div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={`rounded-xl border p-5 shadow-sm transition-colors ${activeAlertsCount > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-stone-200'}`}>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider">
            <ShieldAlert className={`h-4 w-4 ${activeAlertsCount > 0 ? 'text-amber-600 animate-pulse' : 'text-stone-400'}`} /> Active Milk Holds
          </div>
          <p className={`text-2xl font-bold mt-2 ${activeAlertsCount > 0 ? 'text-amber-800' : 'text-stone-900'}`}>
            {activeAlertsCount} <span className="text-xs font-normal text-stone-500">Does flagged under active drop restrictions</span>
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-medium uppercase tracking-wider">
            <Clipboard className="h-4 w-4 text-emerald-700" /> Total Historical Treatments
          </div>
          <p className="text-2xl font-bold text-stone-900 mt-2">{records.length} <span className="text-xs font-normal text-stone-500">Events Managed</span></p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN: TREATMENT CAPTURE INTAKE */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAddRecord} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-4 sticky top-6">
            <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-700" /> Log Health Treatment
            </h3>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Select Animal</label>
              <select
                value={selectedAnimalId}
                onChange={e => setSelectedAnimalId(e.target.value)}
                required
                className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-emerald-500"
              >
                {animals.length === 0 ? (
                  <option value="">No animals detected</option>
                ) : (
                  animals.map(animal => (
                    <option key={animal.id} value={animal.id}>{animal.name}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Date Administered</label>
              <input 
                type="date" 
                required 
                value={treatmentDate} 
                onChange={e => setTreatmentDate(e.target.value)} 
                className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500" 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Medication / Vaccine Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g., Penicillin, Biomycin" 
                value={medicationName} 
                onChange={e => setMedicationName(e.target.value)} 
                className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500" 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Dosage & Administration Method</label>
              <input 
                type="text" 
                required
                placeholder="e.g., 5ml, SQ (Subcutaneous)" 
                value={dosage} 
                onChange={e => setDosage(e.target.value)} 
                className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500" 
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Milk Withdrawal Period (Days)</label>
              <input 
                type="number" 
                min="0"
                required
                placeholder="0 if milk safe" 
                value={withdrawalDaysMilk} 
                onChange={e => setWithdrawalDaysMilk(e.target.value)} 
                className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500" 
              />
              <p className="text-[11px] text-stone-400 mt-1">Locks milk safety compliance if value is greater than 0.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Diagnosis / Treatment Scope</label>
              <textarea 
                placeholder="Reason for administration, structural reactions..." 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                rows={2}
                className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 resize-none" 
              />
            </div>

            <button 
              type="submit" 
              disabled={animals.length === 0}
              className="w-full rounded-lg bg-emerald-800 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-900 transition-colors disabled:opacity-50"
            >
              Log Medical Event
            </button>
          </form>
        </div>

        {/* RIGHT TWO COLUMNS: HEALTH SYSTEM HISTORICAL LEDGER */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-stone-900 px-1">Herd Medication History & Safekeeping Log</h3>
          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-xs font-semibold uppercase tracking-wider text-stone-500">
                  <th className="px-4 py-3">Admin Date</th>
                  <th className="px-4 py-3">Animal</th>
                  <th className="px-4 py-3">Medication</th>
                  <th className="px-4 py-3">Dosage</th>
                  <th className="px-4 py-3">Milk Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-stone-400">Querying medication histories...</td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-stone-400">No medical treatments logged.</td>
                  </tr>
                ) : (
                  records.map((record) => {
                    const status = getWithdrawalStatus(record.treatment_date, record.withdrawal_days_milk);
                    return (
                      <tr key={record.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-stone-600">{record.treatment_date}</td>
                        <td className="px-4 py-3 font-medium text-stone-900">{record.animals?.name || 'Unknown Animal'}</td>
                        <td className="px-4 py-3 text-stone-700">{record.medication_name}</td>
                        <td className="px-4 py-3 text-stone-600 font-mono text-xs">{record.dosage}</td>
                        <td className="px-4 py-3">
                          {status.active ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 border border-amber-100">
                              <ShieldAlert className="h-3 w-3 text-amber-600" /> {status.label}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-stone-50 px-2 py-0.5 text-xs font-medium text-stone-600">
                              <CheckCircle className="h-3 w-3 text-stone-400" /> Clear
                            </span>
                          )}
                        </td>
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