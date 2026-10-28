import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  CheckCircle2,
  Database,
  ExternalLink,
  FileSpreadsheet,
  FlaskConical,
  LockKeyhole,
  Sparkles,
  Upload,
} from 'lucide-react';

const maxUploadMb = 25;
const databaseName = 'cloudbiogeo-csv-storage';
const storeName = 'csv-files';

interface StoredCsv {
  id: string;
  name: string;
  size: number;
  rows: number;
  savedAt: number;
  file: Blob;
}

interface NumericColumnSummary {
  name: string;
  count: number;
  min: number;
  max: number;
  mean: number;
}

interface CsvAnalysis {
  rowCount: number;
  columnCount: number;
  missingCells: number;
  malformedRows: number;
  duplicateHeaders: string[];
  numericColumns: NumericColumnSummary[];
}

const parseCsv = (contents: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  const finishRow = () => {
    row.push(field);
    if (row.some((cell) => cell.trim() !== '')) rows.push(row);
    row = [];
    field = '';
  };

  for (let index = 0; index < contents.length; index += 1) {
    const character = contents[index];
    if (quoted) {
      if (character === '"' && contents[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      finishRow();
      if (character === '\r' && contents[index + 1] === '\n') index += 1;
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  if (field.length > 0 || row.length > 0) finishRow();

  if (rows.length < 2) throw new Error('This CSV needs a header row and at least one data row.');
  return rows;
};

const analyzeCsv = (contents: string): CsvAnalysis => {
  const records = parseCsv(contents.replace(/^\uFEFF/, ''));
  const headers = records[0].map((header) => header.trim());
  const normalizedHeaders = headers.map((header) => header.toLocaleLowerCase());
  const duplicateHeaders = headers.filter(
    (header, index) => header !== '' && normalizedHeaders.indexOf(header.toLocaleLowerCase()) !== index,
  );
  const dataRows = records.slice(1);
  const missingCells = dataRows.reduce(
    (total, row) => total + headers.reduce(
      (missing, _header, index) => missing + (row[index]?.trim() ? 0 : 1),
      0,
    ),
    0,
  );
  const malformedRows = dataRows.filter((row) => row.length !== headers.length).length;
  const numericColumns: NumericColumnSummary[] = [];

  headers.forEach((name, columnIndex) => {
    const values = dataRows
      .map((row) => row[columnIndex]?.trim() ?? '')
      .filter((value) => value !== '');
    if (values.length === 0) return;

    const numbers = values.map(Number);
    if (!numbers.every(Number.isFinite)) return;

    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    numbers.forEach((value) => {
      min = Math.min(min, value);
      max = Math.max(max, value);
      sum += value;
    });
    numericColumns.push({
      name: name || `Column ${columnIndex + 1}`,
      count: numbers.length,
      min,
      max,
      mean: sum / numbers.length,
    });
  });

  return {
    rowCount: dataRows.length,
    columnCount: headers.length,
    missingCells,
    malformedRows,
    duplicateHeaders: [...new Set(duplicateHeaders)],
    numericColumns,
  };
};

const openCsvDatabase = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = indexedDB.open(databaseName, 1);
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains(storeName)) {
      request.result.createObjectStore(storeName, { keyPath: 'id' });
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error('Could not open browser file storage.'));
  request.onblocked = () => reject(new Error('Close other app tabs to finish opening browser storage.'));
});

const listStoredCsvs = async (): Promise<StoredCsv[]> => {
  const database = await openCsvDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const request = transaction.objectStore(storeName).getAll() as IDBRequest<StoredCsv[]>;
    let files: StoredCsv[] = [];
    request.onsuccess = () => {
      files = request.result.sort((a, b) => b.savedAt - a.savedAt);
    };
    request.onerror = () => reject(request.error ?? new Error('Could not load saved CSV files.'));
    transaction.oncomplete = () => {
      database.close();
      resolve(files);
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Could not load saved CSV files.'));
    };
  });
};

const saveCsvToBrowser = async (csv: StoredCsv): Promise<void> => {
  const database = await openCsvDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).put(csv);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Could not save this CSV in browser storage.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error('Saving this CSV was cancelled.'));
    };
  });
};

const deleteCsvFromBrowser = async (id: string): Promise<void> => {
  const database = await openCsvDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).delete(id);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Could not delete the saved CSV.'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error('Deleting this CSV was cancelled.'));
    };
  });
};

const csvTemplate = [
  'patient_id,ESR1,ERBB2,MKI67,TP53,BRCA1',
  'SAMPLE-001,8.2,2.1,4.6,1.3,5.8',
  'SAMPLE-002,3.4,7.8,6.2,8.1,2.7',
].join('\n');

export const PatientDiagnosis: React.FC = () => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [patientCount, setPatientCount] = useState(0);
  const [fileName, setFileName] = useState('No CSV saved');
  const [selectedCsvId, setSelectedCsvId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CsvAnalysis | null>(null);
  const [storedCsvs, setStoredCsvs] = useState<StoredCsv[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [predictionReady, setPredictionReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void listStoredCsvs()
      .then((files) => {
        setStoredCsvs(files);
        const latest = files[0];
        setSelectedCsvId(latest?.id ?? null);
        setPatientCount(latest?.rows ?? 0);
        setFileName(latest?.name ?? 'No CSV saved');
        if (latest) {
          void latest.file.text()
            .then((contents) => setAnalysis(analyzeCsv(contents)))
            .catch((error: unknown) => {
              setNotice(`Could not evaluate saved CSV: ${error instanceof Error ? error.message : 'unknown error'}`);
            });
        }
      })
      .catch((error: unknown) => {
        setNotice(`Could not load browser storage: ${error instanceof Error ? error.message : 'unknown error'}`);
      })
      .finally(() => setIsLoadingFiles(false));
  }, []);

  const handleFile = async (file?: File) => {
    if (!file || isSaving) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setNotice('Choose a .csv file.');
      return;
    }
    if (file.size === 0 || file.size > maxUploadMb * 1024 * 1024) {
      setNotice(`Choose a non-empty CSV file no larger than ${maxUploadMb} MB.`);
      return;
    }

    setIsSaving(true);
    try {
      const contents = await file.text();
      const csvAnalysis = analyzeCsv(contents);

      const csv: StoredCsv = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        rows: csvAnalysis.rowCount,
        savedAt: Date.now(),
        file: file.slice(0, file.size, 'text/csv'),
      };
      await saveCsvToBrowser(csv);
      setStoredCsvs((saved) => [csv, ...saved]);
      setPatientCount(csv.rows);
      setFileName(csv.name);
      setSelectedCsvId(csv.id);
      setAnalysis(csvAnalysis);
      setPredictionReady(false);
      setNotice(`${file.name} saved and evaluated in this browser. This summary is descriptive only, not a medical assessment.`);
    } catch (error) {
      setNotice(`Could not save this CSV: ${error instanceof Error ? error.message : 'unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const evaluateStoredCsv = async (csv: StoredCsv) => {
    try {
      const csvAnalysis = analyzeCsv(await csv.file.text());
      setAnalysis(csvAnalysis);
      setPatientCount(csvAnalysis.rowCount);
      setFileName(csv.name);
      setSelectedCsvId(csv.id);
      setPredictionReady(false);
      setNotice(`${csv.name} evaluated locally. This summary is descriptive only.`);
    } catch (error) {
      setNotice(`Could not evaluate this CSV: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  };

  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([csvTemplate], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cloudbiogeo-patient-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadStoredCsv = (csv: StoredCsv) => {
    const url = URL.createObjectURL(csv.file);
    const link = document.createElement('a');
    link.href = url;
    link.download = csv.name;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const removeStoredCsv = async (csv: StoredCsv) => {
    try {
      await deleteCsvFromBrowser(csv.id);
      const remaining = storedCsvs.filter((item) => item.id !== csv.id);
      setStoredCsvs(remaining);
      if (selectedCsvId === csv.id) {
        const next = remaining[0];
        setSelectedCsvId(next?.id ?? null);
        setPatientCount(next?.rows ?? 0);
        setFileName(next?.name ?? 'No CSV saved');
        setAnalysis(null);
        if (next) void evaluateStoredCsv(next);
        setPredictionReady(false);
      }
      setNotice(`${csv.name} deleted from this browser.`);
    } catch (error) {
      setNotice(`Could not delete this CSV: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  };

  const runDemoPrediction = () => {
    setIsPredicting(true);
    setPredictionReady(false);
    window.setTimeout(() => {
      setIsPredicting(false);
      setPredictionReady(true);
    }, 700);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>CSV workspace · Browser storage</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Save a Demo CSV on This Device
            </h1>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-400 sm:text-sm">
              Files are saved in this browser only, not uploaded to a server. They stay on this device
              until deleted or browser data is cleared. Use synthetic/demo CSVs only; do not save real
              patient information here.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-700"
            >
              <ArrowDownToLine className="h-3.5 w-3.5 text-cyan-400" />
              Download CSV Template
            </button>
            <button
              onClick={() => setNotice('EHR integration is not configured in this local demo.')}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-800 bg-cyan-950/50 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-900/50"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Go to Doctor EHR
            </button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-800 pt-4 font-mono text-[10px] text-slate-400">
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-amber-400" />
            <span>Storage: <strong className="font-medium text-slate-200">This browser only</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <span>Inference: <strong className="font-medium text-slate-200">Simulated demo</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-3.5 w-3.5 text-amber-400" />
            <span>Not protected by app sign-in</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <ArrowUpFromLine className="h-4 w-4 text-cyan-400" />
              Save CSV in This Browser
            </h2>
            <span className="whitespace-nowrap font-mono text-[10px] text-slate-400">
              {patientCount} {patientCount === 1 ? 'row' : 'rows'} saved
            </span>
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              void handleFile(event.dataTransfer.files[0]);
            }}
            className={`flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed px-5 py-6 text-center transition sm:min-h-60 ${
              isDragging
                ? 'border-emerald-400 bg-emerald-950/30'
                : 'border-emerald-500/50 bg-slate-950/60 hover:border-emerald-400/80'
            }`}
          >
            <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <FileSpreadsheet className="h-7 w-7" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400" />
            </div>
            <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
              Browser storage · CSV only
            </div>
            <h3 className="text-sm font-semibold text-white">
              Click to browse or drop a CSV file here
            </h3>
            <p className="mt-1 max-w-md text-[11px] leading-relaxed text-slate-400">
              Saved on this device only. Maximum file size: {maxUploadMb} MB.
              Use synthetic/demo data only.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => fileInput.current?.click()}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                {isSaving ? 'Saving…' : 'Choose CSV File'}
              </button>
              <span className="font-mono text-[9px] text-slate-500">Format: .csv (UTF-8)</span>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept=".csv,text/csv"
              disabled={isSaving}
              className="sr-only"
              onChange={(event) => {
                void handleFile(event.currentTarget.files?.[0]);
                event.currentTarget.value = '';
              }}
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 text-xs">
              <div className="text-slate-300">Currently saved</div>
              <div className="mt-1 truncate font-mono text-[10px] text-slate-500">{fileName}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-[10px] text-slate-300">
                {patientCount} demo rows
              </span>
              <span className="rounded-lg border border-emerald-900 bg-emerald-950/40 px-3 py-2 font-mono text-[10px] text-emerald-300">
                {isLoadingFiles ? 'Loading…' : `${storedCsvs.length} saved files`}
              </span>
            </div>
          </div>
          {storedCsvs.length > 0 && (
            <div className="mt-4 border-t border-slate-800 pt-4">
              <h3 className="mb-2 text-xs font-semibold text-slate-300">Saved on this device</h3>
              <ul className="space-y-2">
                {storedCsvs.map((csv) => (
                  <li key={csv.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-950/70 px-3 py-2 text-xs">
                    <span className="min-w-0 truncate text-slate-300">
                      {csv.name} <span className="text-slate-500">· {csv.rows} rows</span>
                    </span>
                    <span className="flex shrink-0 gap-3">
                      <button onClick={() => void evaluateStoredCsv(csv)} className="text-emerald-400 hover:text-emerald-300">
                        Evaluate
                      </button>
                      <button onClick={() => downloadStoredCsv(csv)} className="text-cyan-400 hover:text-cyan-300">
                        Download
                      </button>
                      <button onClick={() => void removeStoredCsv(csv)} className="text-rose-400 hover:text-rose-300">
                        Delete
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-cyan-400">
            <FlaskConical className="h-4 w-4" />
            Demo inference engine
          </div>
          <h2 className="mt-2 text-sm font-bold text-white">Run a simulated cohort preview</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            A short UI-only simulation demonstrates the workflow. It does not analyze uploaded
            markers or produce a medically validated result.
          </p>

          {predictionReady && (
            <div role="status" className="mt-4 rounded-lg border border-cyan-900 bg-cyan-950/40 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <CheckCircle2 className="h-4 w-4" />
                Demo completed
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
                Synthetic cohort preview is ready. No subtype or treatment recommendation was generated.
              </p>
            </div>
          )}

          <div className="mt-auto pt-6">
            <button
              onClick={runDemoPrediction}
              disabled={isPredicting || patientCount === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-wait disabled:opacity-60"
            >
              <Sparkles className={`h-4 w-4 ${isPredicting ? 'animate-pulse' : ''}`} />
              {isPredicting ? 'Running demo…' : 'Preview Demo Workflow'}
            </button>
            <p className="mt-2 text-center text-[10px] leading-relaxed text-slate-500">
              For interface demonstration only. Not for diagnosis or treatment decisions.
            </p>
          </div>
        </section>
      </div>

      {analysis && (
        <section className="rounded-2xl border border-cyan-900/70 bg-slate-900 p-5">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">CSV Dataset Summary</h2>
            <span className="ml-auto truncate font-mono text-[10px] text-slate-500">{fileName}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Data rows', analysis.rowCount],
              ['Columns', analysis.columnCount],
              ['Missing cells', analysis.missingCells],
              ['Inconsistent rows', analysis.malformedRows],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <div className="font-mono text-[10px] text-slate-500">{label}</div>
                <div className="mt-1 text-lg font-semibold text-slate-100">{value}</div>
              </div>
            ))}
          </div>

          {(analysis.malformedRows > 0 || analysis.duplicateHeaders.length > 0) && (
            <div role="status" className="mt-4 rounded-lg border border-amber-800 bg-amber-950/30 p-3 text-xs text-amber-200">
              {analysis.malformedRows > 0 && (
                <p>{analysis.malformedRows} data row(s) have a different number of fields than the header.</p>
              )}
              {analysis.duplicateHeaders.length > 0 && (
                <p>Duplicate column headers: {analysis.duplicateHeaders.join(', ')}</p>
              )}
            </div>
          )}

          {analysis.numericColumns.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <h3 className="mb-2 text-xs font-semibold text-slate-300">Numeric column statistics</h3>
              <table className="w-full min-w-[32rem] text-left text-xs">
                <thead className="font-mono text-[10px] uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Column</th>
                    <th className="px-3 py-2">Values</th>
                    <th className="px-3 py-2">Min</th>
                    <th className="px-3 py-2">Mean</th>
                    <th className="px-3 py-2">Max</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.numericColumns.map((column) => (
                    <tr key={column.name} className="border-t border-slate-800 text-slate-300">
                      <td className="px-3 py-2 font-mono">{column.name}</td>
                      <td className="px-3 py-2">{column.count}</td>
                      <td className="px-3 py-2">{Number(column.min.toPrecision(6))}</td>
                      <td className="px-3 py-2">{Number(column.mean.toPrecision(6))}</td>
                      <td className="px-3 py-2">{Number(column.max.toPrecision(6))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-400">No fully numeric columns found for statistics.</p>
          )}
          <p className="mt-4 text-[10px] leading-relaxed text-amber-300">
            Descriptive dataset summary only. This does not evaluate disease, diagnose, or recommend treatment.
            Browser storage is not secure clinical storage; do not use real patient information.
          </p>
        </section>
      )}

      {notice && (
        <div role="status" className="flex items-start justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs text-slate-300">
          <span>{notice}</span>
          <button
            onClick={() => setNotice(null)}
            aria-label="Dismiss message"
            className="shrink-0 text-slate-400 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
