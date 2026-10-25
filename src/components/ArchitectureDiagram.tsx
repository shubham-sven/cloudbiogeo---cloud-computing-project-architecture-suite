import React, { useState } from 'react';
import { CloudProvider, ProjectDomain, ArchitectureNode } from '../types';
import { ARCHITECTURE_NODES, PIPELINE_STAGES } from '../data/cloudArchitecture';
import { 
  Server, Shield, Cpu, Database, Eye, Activity, Play, CheckCircle, 
  ArrowRight, Sparkles, AlertCircle, Copy, Check, ExternalLink, Zap
} from 'lucide-react';

interface ArchitectureDiagramProps {
  domain: ProjectDomain;
  provider: CloudProvider;
}

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ domain, provider }) => {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode>(ARCHITECTURE_NODES[0]);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const runSimulation = () => {
    if (simulationRunning) return;
    setSimulationRunning(true);
    setActiveStep(1);

    const stepIntervals = [1500, 1800, 2600, 1800, 1500];
    let current = 1;

    const advance = () => {
      if (current < 5) {
        current += 1;
        setActiveStep(current);
        setTimeout(advance, stepIntervals[current - 1]);
      } else {
        setTimeout(() => {
          setSimulationRunning(false);
          setActiveStep(null);
        }, 1200);
      }
    };

    setTimeout(advance, stepIntervals[0]);
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Domain Context Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span className="font-semibold text-cyan-400">
                {domain === 'biology' ? 'Project Track A: Computational Oncology' : 'Project Track B: Remote Sensing & Earth Observation'}
              </span>
              <span>·</span>
              <span>{provider.toUpperCase()} Cloud Native Architecture</span>
              <span>·</span>
              <span>TLS 1.3 & Zero-Trust RBAC</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {domain === 'biology'
                ? 'Gene Expression Analysis for Cancer Diagnosis'
                : 'Satellite Multispectral Remote Sensing Pipeline'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {domain === 'biology'
                ? 'High-throughput bioinformatic workflow orchestrating RNA-Seq normalization (DESeq2/TPM), biomarker discovery (BRCA1, TP53, EGFR), and containerized deep learning cancer subtyping on Spot GPU instances.'
                : 'Automated geospatial data pipeline querying STAC catalogs, ingesting Sentinel-2/Landsat-9 granules, computing spectral indices (NDVI/NDWI/NBR), and streaming dynamic Cloud-Optimized GeoTIFFs (COGs).'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runSimulation}
              disabled={simulationRunning}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                simulationRunning
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-900/30'
              }`}
            >
              <Play className={`w-4 h-4 ${simulationRunning ? 'animate-spin' : ''}`} />
              <span>{simulationRunning ? `Simulating Stage ${activeStep} of 5...` : 'Simulate Pipeline'}</span>
            </button>
          </div>
        </div>

        {/* Live Simulation Progress Ribbon */}
        {simulationRunning && (
          <div className="mt-5 pt-4 border-t border-slate-800 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-cyan-400">EXECUTION_STATUS: ACTIVE</span>
              <span>Latency SLA Target: &lt; 5m end-to-end</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {PIPELINE_STAGES.map((s) => (
                <div
                  key={s.step}
                  className={`p-2.5 rounded-lg border text-xs transition-all ${
                    activeStep === s.step
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500'
                      : activeStep! > s.step
                      ? 'bg-slate-800/80 border-emerald-500/60 text-emerald-300'
                      : 'bg-slate-900/50 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span>Stage 0{s.step}</span>
                    {activeStep! > s.step ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    ) : activeStep === s.step ? (
                      <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    ) : null}
                  </div>
                  <div className="truncate font-medium">{s.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5-Tier Architecture Topology Flow */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">5-Tier Production Cloud Topology</h2>
          <span className="text-xs text-slate-400">Select any component for IAM policies & Terraform definitions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {ARCHITECTURE_NODES.slice(0, 5).map((node, idx) => {
            const isSelected = selectedNode.id === node.id;
            const isCurrentlySimulating = activeStep === idx + 1;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`cursor-pointer rounded-xl p-4 border transition-all relative ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                } ${isCurrentlySimulating ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-mono text-cyan-400">TIER 0{idx + 1}</span>
                  <span className="capitalize">{node.category}</span>
                </div>

                <h3 className="font-semibold text-slate-100 text-sm leading-tight mb-2">
                  {node.name}
                </h3>

                <div className="text-xs font-mono text-amber-400/90 bg-slate-950/60 p-2 rounded border border-slate-800 mb-3 truncate">
                  {provider === 'aws' ? node.awsService : node.gcpService}
                </div>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {domain === 'biology' ? node.bioRole : node.geoRole}
                </p>

                {isSelected && (
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-cyan-400 font-medium">
                    <span>Inspect Specs</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Cross-Cutting Pillars (Security & Observability) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {ARCHITECTURE_NODES.slice(5).map((node) => {
            const isSelected = selectedNode.id === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`cursor-pointer rounded-xl p-4 border transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500 ring-2 ring-cyan-500/30'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-mono text-cyan-400">CROSS-CUTTING</span>
                  <span className="capitalize">{node.category}</span>
                </div>
                <h3 className="font-semibold text-slate-100 text-sm mb-1">{node.name}</h3>
                <div className="text-xs font-mono text-cyan-300 bg-slate-950/60 p-1.5 rounded border border-slate-800 mb-2 truncate">
                  {provider === 'aws' ? node.awsService : node.gcpService}
                </div>
                <p className="text-xs text-slate-300 line-clamp-2">{node.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Deep-Dive Inspection Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-mono">SELECTED COMPONENT BLUEPRINT</div>
              <h3 className="text-base font-bold text-white">{selectedNode.name}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-amber-300">
              {provider.toUpperCase()}: {provider === 'aws' ? selectedNode.awsService.split('+')[0] : selectedNode.gcpService.split('+')[0]}
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Specifications & Roles */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Domain Workflow Mission ({domain === 'biology' ? 'Cancer Genomics' : 'Satellite Earth Observation'})
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                {domain === 'biology' ? selectedNode.bioRole : selectedNode.geoRole}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Security & Encryption Specification
              </h4>
              <div className="flex items-start gap-2 text-sm text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{selectedNode.securitySpec}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Cost Optimization Technique
              </h4>
              <div className="flex items-start gap-2 text-sm text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{selectedNode.costTip}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Production Terraform Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                Terraform Resource: <span className="text-cyan-400">{selectedNode.terraformResource}</span>
              </span>
              <button
                onClick={() => copyCode(selectedNode.sampleCode)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:text-white rounded border border-slate-700 transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy HCL'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-72">
              <code>{selectedNode.sampleCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
