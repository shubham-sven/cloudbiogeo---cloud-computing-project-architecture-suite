import React, { useState } from 'react';
import { TERRAFORM_FILES, TerraformFile } from '../data/terraformCode';
import { Terminal, Copy, Check, FileCode2, Layers, GitBranch, ShieldCheck } from 'lucide-react';

export const TerraformViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<TerraformFile>(TERRAFORM_FILES[0]);
  const [targetEnv, setTargetEnv] = useState<'dev' | 'staging' | 'prod'>('prod');
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="text-cyan-400 font-mono font-semibold">INFRASTRUCTURE AS CODE (IaC)</span>
            <span>·</span>
            <span>Terraform &gt;= 1.7.0</span>
            <span>·</span>
            <span>State Locking with Amazon DynamoDB</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Production Cloud Terraform Modules & GitOps Deployment
          </h2>
        </div>

        {/* Environment Parity Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Environment Parity:</span>
          <div className="flex items-center p-1 bg-slate-800 rounded-lg border border-slate-700 text-xs font-mono">
            {(['dev', 'staging', 'prod'] as const).map((env) => (
              <button
                key={env}
                onClick={() => setTargetEnv(env)}
                className={`px-3 py-1 rounded uppercase font-semibold transition-colors ${
                  targetEnv === env
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {env}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Code Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Col: File List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            <span>IaC Project Repository</span>
          </div>

          <div className="space-y-1">
            {TERRAFORM_FILES.map((f) => {
              const isSelected = selectedFile.name === f.name;
              return (
                <button
                  key={f.name}
                  onClick={() => setSelectedFile(f)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700 font-semibold'
                      : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  <span className="truncate">{f.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase">{f.language}</span>
                </button>
              );
            })}
          </div>

          {/* Environment Specs Note */}
          <div className="pt-4 mt-4 border-t border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-white">Active Profile: {targetEnv.toUpperCase()}</div>
            <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
              <li>Log Retention: {targetEnv === 'prod' ? '365 Days (HIPAA)' : targetEnv === 'staging' ? '30 Days' : '14 Days'}</li>
              <li>Spot Fallback: {targetEnv === 'prod' ? 'Spot + On-Demand Backup' : '100% Spot Instances'}</li>
              <li>Replication: {targetEnv === 'prod' ? 'Active-Active Multi-Region CRR' : 'Single Region'}</li>
            </ul>
          </div>
        </div>

        {/* Right 3 Cols: Code Display */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-0">
          <div className="px-5 py-3 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-cyan-400">{selectedFile.name}</div>
              <p className="text-xs text-slate-400 line-clamp-1">{selectedFile.description}</p>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:text-white rounded border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-5 bg-slate-950 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[540px]">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
