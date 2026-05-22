// src/app/(admin)/dashboard/registry/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase';
import { Plus, Search, Dna } from 'lucide-react';

interface Animal {
  id: string;
  name: string;
  sex: 'M' | 'F';
  breed_code: string;
  registration_num: string;
  tattoo_left: string;
  tattoo_right: string;
  birth_date: string;
  sire_id: string | null;
  dam_id: string | null;
  lactation_status: 'dry' | 'milking' | 'kid';
}

export default function RegistryPage() {
  const supabase = createClient();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  // Form State for Adding an Animal
  const [name, setName] = useState('');
  const [sex, setSex] = useState<'M' | 'F'>('F');
  const [breedCode, setBreedCode] = useState('ND');
  const [regNum, setRegNum] = useState('');
  const [tatLeft, setTatLeft] = useState('');
  const [tatRight, setTatRight] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sireId, setSireId] = useState('');
  const [damId, setDamId] = useState('');

  // Fetch Animals from Supabase
  async function fetchAnimals() {
    setLoading(true);
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAnimals(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAnimals();
  }, []);

  // Submit New Record Entry to Database
  async function handleAddAnimal(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;

    const targetFarmId = "00000000-0000-0000-0000-000000000000"; 

    const { error } = await supabase.from('animals').insert([{
      name,
      sex,
      breed_code: breedCode,
      registration_num: regNum || null,
      tattoo_left: tatLeft || null,
      tattoo_right: tatRight || null,
      birth_date: birthDate || null,
      sire_id: sireId || null,
      dam_id: damId || null,
      farm_id: targetFarmId 
    }]);

    if (!error) {
      setName('');
      setRegNum('');
      setTatLeft('');
      setTatRight('');
      setBirthDate('');
      setSireId('');
      setDamId('');
      fetchAnimals();
    }
  }

  const getAnimalNameById = (id: string | null) => {
    if (!id) return 'Unknown';
    const match = animals.find(a => a.id === id);
    return match ? match.name : 'Unknown';
  };

  const filteredAnimals = animals.filter(animal =>
    animal.name.toLowerCase().includes(search.toLowerCase()) ||
    (animal.registration_num && animal.registration_num.includes(search))
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">Herd Registry</h1>
        <p className="text-stone-500">Manage ADGA-compliant identification tattoos and interactive self-referencing family bloodlines.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT TWO COLUMNS: SEARCH & GRID MATRIX */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by animal name or registration number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-10 pr-4 text-sm text-stone-900 placeholder-stone-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-xs font-semibold uppercase tracking-wider text-stone-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Sex</th>
                  <th className="px-4 py-3">Breed</th>
                  <th className="px-4 py-3">Tattoos (L/R)</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-stone-400">Querying herd books...</td>
                  </tr>
                ) : filteredAnimals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-stone-400">No livestock records verified in active directory.</td>
                  </tr>
                ) : (
                  filteredAnimals.map((animal) => (
                    <tr key={animal.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-stone-900">{animal.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${animal.sex === 'M' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                          {animal.sex === 'M' ? 'Buck' : 'Doe'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-600 font-mono text-xs">{animal.breed_code}</td>
                      <td className="px-4 py-3 text-stone-600 font-mono text-xs">
                        {animal.tattoo_left || '-' } / {animal.tattoo_right || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedAnimal(animal)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline"
                        >
                          <Dna className="h-3 w-3" /> Trace Pedigree
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: QUICK INTAKE REGISTRATION CARD */}
        <div className="space-y-6">
          <form onSubmit={handleAddAnimal} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-700" /> Animal Intake Registration
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Animal Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500" placeholder="e.g., Bella" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Sex</label>
                <select value={sex} onChange={e => setSex(e.target.value as 'M' | 'F')} className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm bg-white focus:outline-none">
                  <option value="F">Doe (Female)</option>
                  <option value="M">Buck (Male)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Breed Code</label>
                <input type="text" value={breedCode} onChange={e => setBreedCode(e.target.value)} className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none" placeholder="e.g., ND" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">ADGA Reg #</label>
                <input type="text" value={regNum} onChange={e => setRegNum(e.target.value)} className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none" placeholder="Optional" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Tattoo Left</label>
                <input type="text" value={tatLeft} onChange={e => setTatLeft(e.target.value)} className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none" placeholder="Herd ID" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1">Tattoo Right</label>
                <input type="text" value={tatRight} onChange={e => setTatRight(e.target.value)} className="w-full rounded-md border border-stone-200 px-3 py-1.5 text-sm focus:outline-none" placeholder="Year Letter" />
              </div>
            </div>

            <button type="submit" className="w-full rounded-lg bg-emerald-800 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-900 transition-colors">
              Save to Registry Ledger
            </button>
          </form>

          {/* DYNAMIC LINEAGE VIEW CARD (TRACED PEDIGREE SHELL) */}
          {selectedAnimal && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                <Dna className="h-4 w-4 text-emerald-800" /> Lineage Tracker: {selectedAnimal.name}
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-white rounded border border-stone-200">
                  <span className="font-medium text-stone-500 block uppercase tracking-wider text-[10px]">Sire (Father)</span>
                  <p className="text-sm font-semibold text-stone-800 mt-0.5">{getAnimalNameById(selectedAnimal.sire_id)}</p>
                </div>
                <div className="p-2.5 bg-white rounded border border-stone-200">
                  <span className="font-medium text-stone-500 block uppercase tracking-wider text-[10px]">Dam (Mother)</span>
                  <p className="text-sm font-semibold text-stone-800 mt-0.5">{getAnimalNameById(selectedAnimal.dam_id)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}