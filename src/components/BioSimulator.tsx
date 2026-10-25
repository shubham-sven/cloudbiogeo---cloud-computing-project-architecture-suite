import React, { useState } from 'react';
import { GENE_EXPRESSION_DATASET, SAMPLE_CANCER_COHORTS, SUBTYPE_PREDICTION_MODELS, HEATMAP_SAMPLE_DATA } from '../data/bioData';
import { GeneDataPoint } from '../types';
import { Dna, Activity, Sliders, CheckCircle2, ChevronRight, AlertTriangle, Info, Play, RefreshCw } from 'lucide-react';

export const BioSimulator: React.FC = () => {
  const [selectedCohort, setSelectedCohort] = useState(SAMPLE_CANCER_COHORTS[0].id);
  const [selectedGene, setSelectedGene] = useState<GeneDataPoint>(GENE_EXPRESSION_DATASET[0]);
  const [pValCutoff, setPValCutoff] = useState<number>(2.0);
  const [fcCutoff, setFcCutoff] = useState<number>(1.5);
  const [activeView, setActiveView] = useState<'volcano' | 'heatmap' | 'classifier' | 'survival'>('volcano');

  // Classification state
  const [classifying, setClassifying] = useState(false);
  const [predictionResult, setPredictionResult] = useState(SUBTYPE_PREDICTION_MODELS[0]);
  const [selectedPatient, setSelectedPatient] = useState('TCGA-A2-0099');

  const runClassifier = () => {
    setClassifying(true);
    setTimeout(() => {
      // Pick based on patient
      const idx = selectedPatient === 'TCGA-A2-0099' ? 0 : selectedPatient === 'TCGA-E2-A14X' ? 1 : 2;
      setPredictionResult(SUBTYPE_PREDICTION_MODELS[idx]);
      setClassifying(false);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Header & Cohort Selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="text-cyan-400 font-mono font-semibold">TCGA BIOINFORMATICS WORKBENCH</span>
            <span>·</span>
            <span>RNA-Seq Counts (DESeq2 Normalization)</span>
            <span>·</span>
            <span>Human Genome GRCh38 / Ensembl v108</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Cancer Differential Gene Expression & Molecular Diagnostic Engine
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">TCGA Cohort:</label>
          <select
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            {SAMPLE_CANCER_COHORTS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.name} ({c.samples} samples)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub-Tabs: Volcano Plot | Heatmap | AI Classifier | Survival Analysis */}
      <div className="flex items-center gap-1 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveView('volcano')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeView === 'volcano'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Volcano Plot (Differential Expression)
        </button>
        <button
          onClick={() => setActiveView('heatmap')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeView === 'heatmap'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Hierarchical Expression Heatmap
        </button>
        <button
          onClick={() => setActiveView('classifier')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeView === 'classifier'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tumor Subtype AI Classifier (PyTorch)
        </button>
        <button
          onClick={() => setActiveView('survival')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeView === 'survival'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Kaplan-Meier Survival Analysis
        </button>
      </div>

      {/* VIEW 1: VOLCANO PLOT */}
      {activeView === 'volcano' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Volcano Interactive Canvas Display */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Volcano Plot: Log2 Fold Change vs -Log10(Adjusted P-Value)
                </h3>
                <p className="text-xs text-slate-400">
                  Click any gene dot to inspect bioinformatic relevance, clinical drugs, and expression metrics.
                </p>
              </div>

              {/* Threshold Controls */}
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span>|Log2FC| &ge; {fcCutoff}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>-Log10(P) &ge; {pValCutoff}</span>
                </div>
              </div>
            </div>

            {/* Volcano SVG Coordinate Space */}
            <div className="relative w-full h-80 bg-slate-950 border border-slate-800/80 rounded-lg p-4 overflow-hidden">
              {/* Threshold Lines */}
              {/* Vertical line FC = -1.5 */}
              <div className="absolute top-0 bottom-8 left-[35%] w-px border-l border-dashed border-slate-700/60" />
              {/* Vertical line FC = +1.5 */}
              <div className="absolute top-0 bottom-8 left-[65%] w-px border-l border-dashed border-slate-700/60" />
              {/* Center Line FC = 0 */}
              <div className="absolute top-0 bottom-8 left-[50%] w-px border-l border-slate-800" />
              {/* Horizontal line P = 2.0 */}
              <div className="absolute left-8 right-0 bottom-[35%] h-px border-t border-dashed border-slate-700/60" />

              {/* SVG Dots */}
              <svg className="w-full h-full" viewBox="-5 0 10 16">
                {GENE_EXPRESSION_DATASET.map((g) => {
                  const isSignificantUp = g.log2FoldChange >= fcCutoff && g.negLog10PValue >= pValCutoff;
                  const isSignificantDown = g.log2FoldChange <= -fcCutoff && g.negLog10PValue >= pValCutoff;
                  const isSelected = selectedGene.gene === g.gene;

                  let color = '#64748B'; // slate
                  if (isSignificantUp) color = '#F43F5E'; // rose/red
                  if (isSignificantDown) color = '#06B6D4'; // cyan

                  // Invert Y for SVG coordinates (0 at top, 16 at bottom)
                  const svgY = 15 - g.negLog10PValue;
                  const svgX = g.log2FoldChange;

                  return (
                    <g key={g.gene} onClick={() => setSelectedGene(g)} className="cursor-pointer group">
                      <circle
                        cx={svgX}
                        cy={svgY}
                        r={isSelected ? 0.35 : 0.22}
                        fill={color}
                        stroke={isSelected ? '#FFFFFF' : '#0F172A'}
                        strokeWidth={0.06}
                        className="transition-all hover:scale-125"
                      />
                      <text
                        x={svgX + 0.3}
                        y={svgY + 0.1}
                        fontSize="0.45"
                        fill={isSelected ? '#38BDF8' : '#94A3B8'}
                        fontFamily="monospace"
                        className="pointer-events-none select-none"
                      >
                        {g.gene.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Axis Labels */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-mono text-slate-400">
                &larr; Downregulated in Tumor | Log2 Fold Change | Upregulated in Tumor &rarr;
              </div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[11px] font-mono text-slate-400 origin-center">
                -Log10(p-value) &uarr;
              </div>
            </div>

            {/* Threshold Sliders */}
            <div className="mt-4 grid grid-cols-2 gap-4 bg-slate-950/40 p-3 rounded-lg border border-slate-800 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Log2 Fold Change Cutoff:</span>
                  <span className="font-mono text-cyan-400">{fcCutoff.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                  value={fcCutoff}
                  onChange={(e) => setFcCutoff(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Significance Cutoff (-Log10 P):</span>
                  <span className="font-mono text-cyan-400">{pValCutoff.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.5"
                  value={pValCutoff}
                  onChange={(e) => setPValCutoff(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Gene Detail Inspector Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-xs font-mono text-slate-400">BIOMARKER INSPECTION</div>
                <h3 className="text-lg font-bold text-white">{selectedGene.gene}</h3>
              </div>
              <span
                className={`text-xs font-mono px-2 py-1 rounded font-semibold ${
                  selectedGene.regulation === 'up'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : selectedGene.regulation === 'down'
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {selectedGene.regulation.toUpperCase()}REGULATED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Log2 Fold Change</span>
                <span className="font-mono text-base font-bold text-slate-100">
                  {selectedGene.log2FoldChange > 0 ? `+${selectedGene.log2FoldChange}` : selectedGene.log2FoldChange}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block mb-0.5">-Log10(Adj. P-Value)</span>
                <span className="font-mono text-base font-bold text-slate-100">
                  {selectedGene.negLog10PValue}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 col-span-2">
                <span className="text-slate-400 block mb-0.5">Normalized Abundance (TPM)</span>
                <span className="font-mono text-base font-bold text-cyan-400">
                  {selectedGene.expressionLevel.toLocaleString()} TPM
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Clinical Significance
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                {selectedGene.cancerRelevance}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Associated Malignancy
              </span>
              <div className="text-xs text-amber-300 font-mono bg-slate-950 p-2 rounded border border-slate-800">
                {selectedGene.associatedCancer}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: HEATMAP */}
      {activeView === 'heatmap' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Biomarker Expression Matrix: Tumor vs Normal Control Matched Pairs
              </h3>
              <p className="text-xs text-slate-400">
                Values represent Z-score normalized Log2(TPM + 1) counts across clinical biopsies.
              </p>
            </div>

            {/* Gradient Legend */}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Low (Blue)</span>
              <div className="w-24 h-3 rounded bg-gradient-to-r from-blue-700 via-slate-800 to-rose-600 border border-slate-700" />
              <span>High (Red)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3 text-left">Gene Symbol</th>
                  <th className="py-2.5 px-3 text-center bg-rose-950/20 text-rose-300">Tumor Sample #1</th>
                  <th className="py-2.5 px-3 text-center bg-rose-950/20 text-rose-300">Tumor Sample #2</th>
                  <th className="py-2.5 px-3 text-center bg-rose-950/20 text-rose-300">Tumor Sample #3</th>
                  <th className="py-2.5 px-3 text-center bg-cyan-950/20 text-cyan-300">Normal Sample #1</th>
                  <th className="py-2.5 px-3 text-center bg-cyan-950/20 text-cyan-300">Normal Sample #2</th>
                  <th className="py-2.5 px-3 text-center bg-cyan-950/20 text-cyan-300">Normal Sample #3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {HEATMAP_SAMPLE_DATA.map((row) => (
                  <tr key={row.gene} className="hover:bg-slate-850">
                    <td className="py-2 px-3 font-semibold text-slate-200">{row.gene}</td>
                    {['tumor1', 'tumor2', 'tumor3', 'normal1', 'normal2', 'normal3'].map((col) => {
                      const val = (row as any)[col] as number;
                      // Determine background color based on intensity (2 to 10)
                      const isHigh = val >= 6.0;
                      const intensity = Math.min(100, Math.round(((val - 2) / 8) * 100));
                      const bgStyle = isHigh
                        ? `rgba(225, 29, 72, ${val / 10})`
                        : `rgba(2, 132, 199, ${(10 - val) / 10})`;

                      return (
                        <td
                          key={col}
                          className="py-2 px-3 text-center font-bold"
                          style={{
                            backgroundColor: bgStyle,
                            color: '#FFFFFF'
                          }}
                        >
                          {val.toFixed(1)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: AI CLASSIFIER */}
      {activeView === 'classifier' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Diagnostic Inference Console</h3>
            <p className="text-xs text-slate-300">
              Submit patient RNA-Seq count matrix to the containerized PyTorch classifier running on Spot compute.
            </p>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Select Patient Biopsy Case:</label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-cyan-500"
              >
                <option value="TCGA-A2-0099">TCGA-A2-0099 (ER+ High, Luminal Candidate)</option>
                <option value="TCGA-E2-A14X">TCGA-E2-A14X (ERBB2 4.2x Amplification)</option>
                <option value="TCGA-BH-A0BQ">TCGA-BH-A0BQ (Basal-like Triple Negative)</option>
              </select>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
              <div className="text-slate-400">Container Image:</div>
              <div className="text-cyan-400 truncate">123456.dkr.ecr.us-east-1/onco-infer:v2.4</div>
              <div className="text-slate-400 mt-2">Compute Instance:</div>
              <div className="text-amber-400">g5.xlarge (Spot NVIDIA A10G)</div>
            </div>

            <button
              onClick={runClassifier}
              disabled={classifying}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors shadow-sm disabled:opacity-50"
            >
              {classifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Spot Container Inference...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Classify Molecular Subtype</span>
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400">INFERENCE REPORT</span>
                <h3 className="text-lg font-bold text-white">{predictionResult.subtype}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-400 block">Model Confidence</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {(predictionResult.probability * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Probability Distribution */}
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Subtype Softmax Probability Distribution
              </div>
              <div className="space-y-2">
                {SUBTYPE_PREDICTION_MODELS.map((m) => (
                  <div key={m.subtype} className="text-xs">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span className="truncate pr-2">{m.subtype}</span>
                      <span className="font-mono text-slate-400">{(m.probability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                        style={{ width: `${m.probability * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Regimen & Prognosis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Prognostic Assessment
                </span>
                <p className="text-xs text-slate-200">{predictionResult.prognosis}</p>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Targeted Therapy Regimen
                </span>
                <p className="text-xs text-amber-300">{predictionResult.recommendedTherapy}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: SURVIVAL ANALYSIS */}
      {activeView === 'survival' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Kaplan-Meier Overall Survival Estimator (60-Month Cohort Follow-up)
              </h3>
              <p className="text-xs text-slate-400">
                Stratified by ERBB2/HER2 expression level in TCGA Breast Cancer (BRCA). Log-rank test p = 0.0014.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <div className="w-3 h-0.5 bg-cyan-400" />
                <span>Low Expression (Favorable)</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-400">
                <div className="w-3 h-0.5 bg-rose-400" />
                <span>High Expression (Targetable)</span>
              </div>
            </div>
          </div>

          {/* SVG Kaplan Meier Curve */}
          <div className="relative w-full h-64 bg-slate-950 border border-slate-800 rounded-lg p-4">
            <svg className="w-full h-full" viewBox="0 0 100 50">
              {/* Gridlines */}
              <line x1="10" y1="5" x2="95" y2="5" stroke="#1E293B" strokeWidth="0.5" />
              <line x1="10" y1="25" x2="95" y2="25" stroke="#1E293B" strokeWidth="0.5" />
              <line x1="10" y1="45" x2="95" y2="45" stroke="#334155" strokeWidth="0.5" />
              <line x1="10" y1="5" x2="10" y2="45" stroke="#334155" strokeWidth="0.5" />

              {/* Low Expression Curve (Cyan) */}
              <polyline
                fill="none"
                stroke="#06B6D4"
                strokeWidth="1.2"
                points="10,6 25,7 35,9 45,11 60,13 75,15 90,16"
              />

              {/* High Expression Curve (Rose) */}
              <polyline
                fill="none"
                stroke="#F43F5E"
                strokeWidth="1.2"
                points="10,6 20,12 30,19 45,26 60,32 75,37 90,41"
              />

              {/* Axis labels */}
              <text x="10" y="49" fontSize="2.5" fill="#94A3B8" fontFamily="monospace">0m</text>
              <text x="30" y="49" fontSize="2.5" fill="#94A3B8" fontFamily="monospace">15m</text>
              <text x="50" y="49" fontSize="2.5" fill="#94A3B8" fontFamily="monospace">30m</text>
              <text x="70" y="49" fontSize="2.5" fill="#94A3B8" fontFamily="monospace">45m</text>
              <text x="90" y="49" fontSize="2.5" fill="#94A3B8" fontFamily="monospace">60m</text>

              <text x="2" y="7" fontSize="2.5" fill="#94A3B8" fontFamily="monospace">1.0</text>
              <text x="2" y="26" fontSize="2.5" fill="#94A3B8" fontFamily="monospace">0.5</text>
              <text x="2" y="45" fontSize="2.5" fill="#94A3B8" fontFamily="monospace">0.0</text>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
