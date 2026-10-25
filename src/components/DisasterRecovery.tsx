import React, { useState } from 'react';
import { Globe, AlertTriangle, CheckCircle2, ShieldAlert, RefreshCw, ArrowRight } from 'lucide-react';

export const DisasterRecovery: React.FC = () => {
  const [primaryStatus, setPrimaryStatus] = useState<'healthy' | 'degraded' | 'failed'>('healthy');
  const [failoverActive, setFailoverActive] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);

  const triggerOutage = () => {
    setTesting(true);
    setPrimaryStatus('degraded');

    setTimeout(() => {
      setPrimaryStatus('failed');
      setFailoverActive(true);
      setTesting(false);
    }, 1800);
  };

  const restorePrimary = () => {
    setTesting(true);
    setTimeout(() => {
      setPrimaryStatus('healthy');
      setFailoverActive(false);
      setTesting(false);
    }, 1400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="text-cyan-400 font-mono font-semibold">HIGH AVAILABILITY & DISASTER RECOVERY</span>
            <span>·</span>
            <span>Multi-Region Active-Active / Hot-Standby</span>
            <span>·</span>
            <span>Route 53 DNS Latency Routing</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Automated Multi-Region Disaster Recovery & Business Continuity
          </h2>
        </div>

        {/* SLA Targets */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px]">RPO Target</span>
            <span className="font-mono font-bold text-cyan-400">&lt; 15 Minutes</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px]">RTO Target</span>
            <span className="font-mono font-bold text-emerald-400">&lt; 30 Minutes</span>
          </div>
        </div>
      </div>

      {/* Interactive Region Simulator Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Live Multi-Region Topology Simulation</h3>
            <p className="text-xs text-slate-400">
              Test automated DNS failover response when primary region encounters infrastructure degradation.
            </p>
          </div>

          <div>
            {failoverActive ? (
              <button
                onClick={restorePrimary}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>Restore Primary Region (us-east-1)</span>
              </button>
            ) : (
              <button
                onClick={triggerOutage}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50"
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                <span>Simulate Primary Outage (us-east-1)</span>
              </button>
            )}
          </div>
        </div>

        {/* Region Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* Primary Region Card */}
          <div
            className={`p-5 rounded-xl border transition-all ${
              primaryStatus === 'healthy'
                ? 'bg-slate-950/80 border-emerald-500/50 shadow-md shadow-emerald-950/20'
                : primaryStatus === 'degraded'
                ? 'bg-slate-950/80 border-amber-500/60 animate-pulse'
                : 'bg-slate-950/80 border-rose-600/70'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-cyan-400 font-bold">PRIMARY REGION: us-east-1 (N. Virginia)</span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                  primaryStatus === 'healthy'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : primaryStatus === 'degraded'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {primaryStatus.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Route 53 Latency Weight:</span>
                <span className="font-mono font-bold text-white">{failoverActive ? '0%' : '100%'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Health Check Endpoint:</span>
                <span className="font-mono text-cyan-400">/healthz (200 OK)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>S3 Lake Storage:</span>
                <span className="font-mono text-slate-200">Source Bucket (CRR Enabled)</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Batch Spot Workers:</span>
                <span className="font-mono text-slate-200">{failoverActive ? 'Paused' : 'Active (Max 256 vCPUs)'}</span>
              </div>
            </div>
          </div>

          {/* Secondary DR Region Card */}
          <div
            className={`p-5 rounded-xl border transition-all ${
              failoverActive
                ? 'bg-slate-950/80 border-cyan-500/70 shadow-lg shadow-cyan-950/30'
                : 'bg-slate-950/80 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-cyan-400 font-bold">SECONDARY DR: us-west-2 (Oregon)</span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                  failoverActive
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {failoverActive ? 'ACTIVE FAILOVER TARGET' : 'HOT STANDBY'}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Route 53 Latency Weight:</span>
                <span className="font-mono font-bold text-white">{failoverActive ? '100%' : '0% (Standby)'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Cross-Region Replication:</span>
                <span className="font-mono text-emerald-400">In Sync (Lag &lt; 3 mins)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>S3 Replica Bucket:</span>
                <span className="font-mono text-slate-200">Replica KMS Encrypted</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Standby Batch Queue:</span>
                <span className="font-mono text-slate-200">{failoverActive ? 'Active (Auto-Scaled)' : 'Ready on Trigger'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* DR Automated Runbook Playbook */}
        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Automated Disaster Recovery Runbook Execution Steps
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="font-mono font-bold text-cyan-400 mb-1">01. Health Check Trip</div>
              <p className="text-slate-400 text-[11px]">Route 53 detects 3 consecutive 5xx errors or timeouts from primary ALB.</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="font-mono font-bold text-cyan-400 mb-1">02. DNS Reroute</div>
              <p className="text-slate-400 text-[11px]">DNS records flip 100% traffic to secondary region within 10–30 seconds.</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="font-mono font-bold text-cyan-400 mb-1">03. Compute Auto-Scale</div>
              <p className="text-slate-400 text-[11px]">AWS Batch / GKE secondary cluster scales desired vCPUs from 0 to target load.</p>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="font-mono font-bold text-cyan-400 mb-1">04. Audit & Reconciliation</div>
              <p className="text-slate-400 text-[11px]">Automated Lambda reconciles replication watermarks and alerts Ops team via SNS.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
