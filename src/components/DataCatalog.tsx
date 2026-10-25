import React, { useEffect, useState } from 'react';
import { AlertTriangle, CalendarDays, Database, Dna, HardDrive, MapPin, Plus, Satellite, Trash2 } from 'lucide-react';
import { ProjectDomain } from '../types';

interface CatalogRecord {
  id: string;
  title: string;
  category: string;
  source: string;
  coverage: string;
  acquisitionDate: string;
  storageRef: string;
  createdAt: string;
}

interface RecordForm {
  title: string;
  category: string;
  source: string;
  coverage: string;
  acquisitionDate: string;
  storageRef: string;
}

const EMPTY_FORM: RecordForm = {
  title: '',
  category: '',
  source: '',
  coverage: '',
  acquisitionDate: '',
  storageRef: ''
};

const demoRecords: Record<ProjectDomain, CatalogRecord[]> = {
  biology: [
    {
      id: 'demo-genomics-1',
      title: 'Demo breast cancer expression cohort',
      category: 'Breast cancer',
      source: 'RNA-seq expression matrix',
      coverage: '240 synthetic samples',
      acquisitionDate: '',
      storageRef: 'demo://genomics/breast-expression',
      createdAt: '2026-01-15T12:00:00.000Z'
    }
  ],
  geoscience: [
    {
      id: 'demo-satellite-1',
      title: 'Demo forest observation',
      category: 'Sentinel-2 L2A',
      source: 'Sentinel-2 MSI',
      coverage: 'Amazon test region',
      acquisitionDate: '2024-06-15',
      storageRef: 'demo://remote-sensing/forest-observation',
      createdAt: '2026-01-15T12:00:00.000Z'
    }
  ]
};

const storageKey = (domain: ProjectDomain) => `cloudbiogeo-demo-catalog-v1:${domain}`;

const isCatalogRecord = (value: unknown): value is CatalogRecord => {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return ['id', 'title', 'category', 'source', 'coverage', 'acquisitionDate', 'storageRef', 'createdAt']
    .every((key) => typeof record[key] === 'string');
};

export const DataCatalog: React.FC<{ domain: ProjectDomain }> = ({ domain }) => {
  const [records, setRecords] = useState<CatalogRecord[]>([]);
  const [form, setForm] = useState<RecordForm>(EMPTY_FORM);
  const [storageError, setStorageError] = useState<string | null>(null);

  const isBiology = domain === 'biology';

  useEffect(() => {
    const key = storageKey(domain);
    setStorageError(null);
    setForm(EMPTY_FORM);

    try {
      const savedRecords = window.localStorage.getItem(key);
      if (savedRecords === null) {
        const initialRecords = demoRecords[domain];
        window.localStorage.setItem(key, JSON.stringify(initialRecords));
        setRecords(initialRecords);
        return;
      }

      const parsed: unknown = JSON.parse(savedRecords);
      if (!Array.isArray(parsed) || !parsed.every(isCatalogRecord)) {
        throw new Error('Saved catalog data has an unexpected format.');
      }
      setRecords(parsed);
    } catch (error) {
      setRecords([]);
      setStorageError(
        error instanceof Error
          ? `Could not load this browser's saved catalog: ${error.message}`
          : 'Could not load this browser’s saved catalog.'
      );
    }
  }, [domain]);

  const persistRecords = (nextRecords: CatalogRecord[]): boolean => {
    try {
      window.localStorage.setItem(storageKey(domain), JSON.stringify(nextRecords));
      setRecords(nextRecords);
      setStorageError(null);
      return true;
    } catch (error) {
      setStorageError(
        error instanceof Error
          ? `Could not save the catalog in this browser: ${error.message}`
          : 'Could not save the catalog in this browser.'
      );
      return false;
    }
  };

  const handleAddRecord = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const record: CatalogRecord = {
      ...form,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString()
    };
    if (persistRecords([record, ...records])) {
      setForm(EMPTY_FORM);
    }
  };

  const handleDeleteRecord = (id: string) => {
    persistRecords(records.filter((record) => record.id !== id));
  };

  const handleClearCatalog = () => {
    persistRecords([]);
  };

  const updateForm = (field: keyof RecordForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white">Demo catalog — browser storage only</h2>
            <p className="text-xs leading-relaxed text-slate-300">
              This prototype saves dataset metadata in this browser’s local storage. It does not upload or store raw
              files in AWS, and it is not secure clinical storage. Use synthetic data only; never enter patient names,
              IDs, or other real health information.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 xl:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            {isBiology ? <Dna className="h-4 w-4 text-cyan-400" /> : <Satellite className="h-4 w-4 text-cyan-400" />}
            <h3 className="text-sm font-semibold text-white">
              Add {isBiology ? 'genomics dataset' : 'satellite dataset'}
            </h3>
          </div>

          <form onSubmit={handleAddRecord} className="space-y-3">
            <label className="block text-xs text-slate-300">
              Dataset title
              <input
                required
                maxLength={120}
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                placeholder={isBiology ? 'Synthetic expression study' : 'Forest observation scene'}
              />
            </label>
            <label className="block text-xs text-slate-300">
              {isBiology ? 'Cancer type / cohort label' : 'Collection / product'}
              <input
                required
                maxLength={100}
                value={form.category}
                onChange={(event) => updateForm('category', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                placeholder={isBiology ? 'Synthetic breast cancer cohort' : 'Sentinel-2 L2A'}
              />
            </label>
            <label className="block text-xs text-slate-300">
              {isBiology ? 'Assay / data type' : 'Sensor / platform'}
              <input
                required
                maxLength={100}
                value={form.source}
                onChange={(event) => updateForm('source', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                placeholder={isBiology ? 'RNA-seq counts (synthetic)' : 'Sentinel-2 MSI'}
              />
            </label>
            <label className="block text-xs text-slate-300">
              {isBiology ? 'Cohort size (no sample identifiers)' : 'Area of interest'}
              <input
                required
                maxLength={100}
                value={form.coverage}
                onChange={(event) => updateForm('coverage', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                placeholder={isBiology ? 'e.g. 240 synthetic samples' : 'e.g. Amazon test region'}
              />
            </label>
            {!isBiology && (
              <label className="block text-xs text-slate-300">
                Acquisition date
                <input
                  type="date"
                  required
                  value={form.acquisitionDate}
                  onChange={(event) => updateForm('acquisitionDate', event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                />
              </label>
            )}
            <label className="block text-xs text-slate-300">
              Storage reference (optional; metadata only)
              <input
                maxLength={200}
                value={form.storageRef}
                onChange={(event) => updateForm('storageRef', event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                placeholder="e.g. demo://dataset/path"
              />
            </label>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-3 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
            >
              <Plus className="h-4 w-4" />
              Save demo metadata
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Database className="h-4 w-4 text-cyan-400" />
                <span>LOCAL DEMO CATALOG</span>
              </div>
              <h3 className="mt-1 text-sm font-semibold text-white">
                {isBiology ? 'Cancer genomics datasets' : 'Remote sensing scenes'}
                <span className="ml-2 font-mono text-xs text-cyan-400">{records.length}</span>
              </h3>
            </div>
            {records.length > 0 && (
              <button
                type="button"
                onClick={handleClearCatalog}
                className="text-xs text-rose-400 transition-colors hover:text-rose-300"
              >
                Clear catalog
              </button>
            )}
          </div>

          {storageError && (
            <div role="alert" className="mb-4 rounded-lg border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-200">
              {storageError}
            </div>
          )}

          {records.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-700 px-4 py-10 text-center text-xs text-slate-400">
              No dataset metadata saved for this domain yet.
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <article key={record.id} className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="break-words text-sm font-semibold text-white">{record.title}</h4>
                      <p className="mt-1 text-xs text-cyan-300">{record.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteRecord(record.id)}
                      aria-label={`Delete ${record.title}`}
                      className="rounded p-1 text-slate-500 transition-colors hover:bg-rose-950 hover:text-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-400 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Database className="h-3.5 w-3.5 shrink-0" />
                      <span>{record.source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isBiology ? <Dna className="h-3.5 w-3.5 shrink-0" /> : <MapPin className="h-3.5 w-3.5 shrink-0" />}
                      <span>{record.coverage}</span>
                    </div>
                    {!isBiology && record.acquisitionDate && (
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                        <span>{record.acquisitionDate}</span>
                      </div>
                    )}
                    {record.storageRef && (
                      <div className="flex min-w-0 items-center gap-2">
                        <HardDrive className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate font-mono">{record.storageRef}</span>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
