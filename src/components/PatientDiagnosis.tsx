import React, { useRef, useState } from 'react';
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  Database,
  ExternalLink,
  FileSpreadsheet,
  FlaskConical,
  LockKeyhole,
  Sparkles,
  Upload,
} from 'lucide-react';

const samplePatients = 10;
const csvTemplate = [
  'patient_id,ESR1,ERBB2,MKI67,TP53,BRCA1',
  'SAMPLE-001,8.2,2.1,4.6,1.3,5.8',
  'SAMPLE-002,3.4,7.8,6.2,8.1,2.7',
].join('\n');

export const PatientDiagnosis: React.FC = () => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [patientCount, setPatientCount] = useState(samplePatients);
  const [fileName, setFileName] = useState('Synthetic demo cohort');
  const [isDragging, setIsDragging] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionReady, setPredictionReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setNotice('Choose a .csv file. Your file is read in this browser only.');
      return;
    }

    try {
      const contents = await file.text();
      const rows = contents.split(/\r?\n/).filter((row) => row.trim().length > 0);
      if (rows.length < 2) {
        setNotice('This CSV needs a header row and at least one data row.');
        return;
      }

      setPatientCount(rows.length - 1);
      setFileName(file.name);
      setPredictionReady(false);
      setNotice(`${rows.length - 1} CSV rows staged in this browser. No file was uploaded.`);
    } catch (error) {
      setNotice(`Could not read this CSV: ${error instanceof Error ? error.message : 'unknown error'}`);
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
              <span>Patient clinical CSV workspace</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">Synthetic demo · Local browser only</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Upload Patient CSV Data &amp; Explore a Demo Prediction
            </h1>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-slate-400 sm:text-sm">
              Stage a synthetic cohort CSV and preview a simulated workflow using example gene markers
              (ESR1, ERBB2, MKI67, TP53, BRCA1). Files stay in your browser; this is not a clinical
              diagnostic tool and does not connect to AWS or an EHR.
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
            <span>Storage: <strong className="font-medium text-slate-200">Local session only</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <span>Inference: <strong className="font-medium text-slate-200">Simulated demo</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-3.5 w-3.5 text-emerald-400" />
            <span>No patient data is transmitted</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <ArrowUpFromLine className="h-4 w-4 text-cyan-400" />
              Upload Patient Clinical &amp; Expression CSV
            </h2>
            <span className="whitespace-nowrap font-mono text-[10px] text-slate-400">
              {patientCount} {patientCount === 1 ? 'row' : 'rows'} staged
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
              Synthetic patient CSV · browser-only
            </div>
            <h3 className="text-sm font-semibold text-white">
              Click to browse or drop a CSV file here
            </h3>
            <p className="mt-1 max-w-md text-[11px] leading-relaxed text-slate-400">
              Files are read locally for this demo and are not uploaded, saved, or sent to a server.
              Do not use real patient information.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => fileInput.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-400"
              >
                <Upload className="h-3.5 w-3.5" />
                Browse CSV File
              </button>
              <span className="font-mono text-[9px] text-slate-500">Format: .csv (UTF-8)</span>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => {
                void handleFile(event.target.files?.[0]);
                event.currentTarget.value = '';
              }}
            />
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 text-xs">
              <div className="text-slate-300">Currently staged</div>
              <div className="mt-1 truncate font-mono text-[10px] text-slate-500">{fileName}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-[10px] text-slate-300">
                {patientCount} demo rows
              </span>
              <span className="rounded-lg border border-emerald-900 bg-emerald-950/40 px-3 py-2 font-mono text-[10px] text-emerald-300">
                Local only
              </span>
            </div>
          </div>
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
