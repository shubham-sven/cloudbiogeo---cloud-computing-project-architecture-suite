import React, { useState, useEffect } from 'react';
import { CloudProvider } from '../types';
import { Activity, AlertTriangle, CheckCircle2, Terminal, Bell, RefreshCw, Play, Filter, ShieldCheck, Database } from 'lucide-react';

interface ObservabilityConsoleProps {
  provider: CloudProvider;
}

interface AlertItem {
  id: string;
  name: string;
  severity: 'critical' | 'warning' | 'info';
  state: 'firing' | 'resolved';
  summary: string;
  promql: string;
  duration: string;
  tier: string;
}

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alt-1',
    name: 'HighInferenceLatencyP99',
    severity: 'critical',
    state: 'resolved',
    summary: 'p99 inference latency normalized to 840ms (< 2000ms SLA target)',
    promql: 'histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 2.0',
    duration: 'Resolved 8m ago',
    tier: 'Inference Engine'
  },
  {
    id: 'alt-2',
    name: 'SpotReclamationNotice',
    severity: 'warning',
    state: 'firing',
    summary: '2x g5.xlarge GPU nodes reclaimed in us-east-1a; Auto-migrated to us-east-1b spot pool',
    promql: 'rate(ec2_spot_interruption_notices_total[5m]) > 1',
    duration: 'Firing for 3m 12s',
    tier: 'Spot Compute'
  },
  {
    id: 'alt-3',
    name: 'DeadLetterQueueEmpty',
    severity: 'info',
    state: 'resolved',
    summary: 'DLQ message count is 0. All 142 ingested samples passed validation schema.',
    promql: 'aws_sqs_approximate_number_of_messages_visible{queue_name=~".*-dlq"} == 0',
    duration: 'Continuous OK',
    tier: 'Ingestion'
  }
];

export const ObservabilityConsole: React.FC<ObservabilityConsoleProps> = ({ provider }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [selectedPromql, setSelectedPromql] = useState(
    'histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))'
  );
  const [isLiveScraping, setIsLiveScraping] = useState(true);
  const [p99Value, setP99Value] = useState(842); // ms
  const [queueDepth, setQueueDepth] = useState(14);
  const [spotReclaims, setSpotReclaims] = useState(2);
  const [errorRate, setErrorRate] = useState(0.04); // %

  // Simulated live fluctuating telemetry
  useEffect(() => {
    if (!isLiveScraping) return;
    const interval = setInterval(() => {
      setP99Value((prev) => Math.max(650, Math.min(1850, prev + Math.floor((Math.random() - 0.48) * 60))));
      setQueueDepth((prev) => Math.max(0, Math.min(80, prev + Math.floor((Math.random() - 0.45) * 5))));
      setErrorRate((prev) => Math.max(0.01, Math.min(0.25, parseFloat((prev + (Math.random() - 0.49) * 0.02).toFixed(2)))));
    }, 2500);
    return () => clearInterval(interval);
  }, [isLiveScraping]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="text-cyan-400 font-mono font-semibold">PROMETHEUS & GRAFANA OBSERVABILITY PLANE</span>
            <span>·</span>
            <span>PromQL Real-Time Metric Scrapes (15s Interval)</span>
            <span>·</span>
            <span>Alertmanager SNS Webhooks</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Infrastructure Monitoring, SLI/SLO Telemetry & Incident Alerting
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLiveScraping(!isLiveScraping)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isLiveScraping
                ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isLiveScraping ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>{isLiveScraping ? 'Live Scraping (15s)' : 'Scraping Paused'}</span>
          </button>
        </div>
      </div>

      {/* Real-Time SLI Telemetry Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Inference Latency (p99)</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tracking-tight">
            {p99Value} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">Target: &lt; 2,000ms SLA</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ingestion Queue Backlog</span>
            <Database className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white tracking-tight">
            {queueDepth} <span className="text-xs font-normal text-slate-400">jobs</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">SQS / PubSub FIFO</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Spot Interruption Events</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-400 tracking-tight">
            {spotReclaims} <span className="text-xs font-normal text-slate-400">in 1h</span>
          </div>
          <div className="text-[11px] text-cyan-400 font-mono">Checkpoint Resumed 100%</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>5xx Error Rate</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400 tracking-tight">
            {errorRate}%
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">Availability: 99.96%</div>
        </div>
      </div>

      {/* PromQL Query Runner & Time-Series Graph */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white">PromQL Interactive Query Console</h3>
            <p className="text-xs text-slate-400">Execute Prometheus metric queries against scrape targets across EKS / GKE pods.</p>
          </div>
          <span className="text-xs font-mono text-cyan-400">{provider.toUpperCase()} Managed Prometheus</span>
        </div>

        {/* Preset Query Buttons */}
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setSelectedPromql('histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))')}
            className={`px-2.5 py-1 rounded font-mono border transition-colors ${
              selectedPromql.includes('http_request_duration')
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            p99 Latency
          </button>
          <button
            onClick={() => setSelectedPromql('rate(ec2_spot_interruption_notices_total[5m])')}
            className={`px-2.5 py-1 rounded font-mono border transition-colors ${
              selectedPromql.includes('ec2_spot_interruption')
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Spot Reclamations
          </button>
          <button
            onClick={() => setSelectedPromql('sum(container_memory_working_set_bytes{container="inference-worker"}) by (pod)')}
            className={`px-2.5 py-1 rounded font-mono border transition-colors ${
              selectedPromql.includes('container_memory')
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Pod Memory Saturation
          </button>
          <button
            onClick={() => setSelectedPromql('aws_sqs_approximate_number_of_messages_visible{queue_name=~".*-incoming"}')}
            className={`px-2.5 py-1 rounded font-mono border transition-colors ${
              selectedPromql.includes('sqs_approximate')
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Queue Depth
          </button>
        </div>

        {/* Input Field */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative font-mono text-xs">
            <span className="absolute left-3 top-3 text-cyan-400 font-bold">&gt;</span>
            <input
              type="text"
              value={selectedPromql}
              onChange={(e) => setSelectedPromql(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2.5 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button className="px-4 py-2.5 bg-cyan-500 text-slate-950 rounded-lg text-xs font-semibold hover:bg-cyan-400 transition-colors">
            Execute
          </button>
        </div>

        {/* Simulated SVG Graph */}
        <div className="h-48 bg-slate-950 border border-slate-800/80 rounded-lg p-3 relative overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 40">
            {/* Grid */}
            <line x1="5" y1="5" x2="95" y2="5" stroke="#1E293B" strokeWidth="0.5" />
            <line x1="5" y1="20" x2="95" y2="20" stroke="#1E293B" strokeWidth="0.5" />
            <line x1="5" y1="35" x2="95" y2="35" stroke="#334155" strokeWidth="0.5" />

            {/* Threshold Line at 2000ms */}
            <line x1="5" y1="10" x2="95" y2="10" stroke="#EF4444" strokeWidth="0.6" strokeDasharray="2,2" />
            <text x="75" y="9" fontSize="2" fill="#EF4444" fontFamily="monospace">SLA CEILING (2000ms)</text>

            {/* Telemetry Metric Curve */}
            <polyline
              fill="none"
              stroke="#06B6D4"
              strokeWidth="1.2"
              points="5,26 12,24 20,28 28,22 36,25 44,18 52,19 60,23 68,21 76,26 84,24 95,22"
            />

            {/* Area Fill */}
            <polygon
              fill="url(#cyanGrad)"
              opacity="0.15"
              points="5,35 5,26 12,24 20,28 28,22 36,25 44,18 52,19 60,23 68,21 76,26 84,24 95,22 95,35"
            />

            <defs>
              <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute bottom-1 left-4 text-[10px] font-mono text-slate-500">T - 30 minutes</div>
          <div className="absolute bottom-1 right-4 text-[10px] font-mono text-slate-500">T - 0 seconds (Now)</div>
        </div>
      </div>

      {/* Active Alertmanager Rule Incidents */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Prometheus Alertmanager Active Status</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Route: SNS / PagerDuty / Webhook</span>
        </div>

        <div className="space-y-2.5">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                alt.state === 'firing'
                  ? 'bg-amber-950/20 border-amber-600/50'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      alt.severity === 'critical'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : alt.severity === 'warning'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}
                  >
                    {alt.severity.toUpperCase()}
                  </span>
                  <span className="font-semibold text-white">{alt.name}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{alt.tier}</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{alt.summary}</p>
                <div className="font-mono text-[10px] text-cyan-400 truncate">{alt.promql}</div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-[11px] font-mono font-bold block ${
                    alt.state === 'firing' ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {alt.state.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{alt.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CloudTrail / Cloud Audit Logs Live Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Immutable Audit Log Feed (CloudTrail / Cloud Audit)</h3>
          </div>
          <span className="text-xs font-mono text-emerald-400">● WORM Object Lock Enforced</span>
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-300 space-y-1.5 max-h-48 overflow-y-auto">
          <div className="text-slate-400 text-[11px]">
            [2026-09-23T09:41:02Z] <span className="text-cyan-400">s3:PutObject</span> arn:aws:iam::123456:role/StepFunctionsExec | Bucket: prod-lake-ingest | TLS: 1.3 | Cipher: TLS_AES_256_GCM_SHA384
          </div>
          <div className="text-slate-400 text-[11px]">
            [2026-09-23T09:41:04Z] <span className="text-amber-400">kms:GenerateDataKey</span> KeyId: alias/prod-lake-key | Status: 200 OK | EncryptionContext: Project=CloudBioGeo
          </div>
          <div className="text-slate-400 text-[11px]">
            [2026-09-23T09:41:10Z] <span className="text-emerald-400">batch:SubmitJob</span> JobName: spot-inference-worker | Queue: spot-queue | InstanceType: g5.xlarge | SpotBid: 100%
          </div>
          <div className="text-slate-400 text-[11px]">
            [2026-09-23T09:41:18Z] <span className="text-purple-400">cognito-idp:InitiateAuth</span> User: dr.sharma@oncology.cloud | AuthFlow: USER_SRP_AUTH | MFA: SOFTWARE_TOKEN_MFA (Passed)
          </div>
        </div>
      </div>
    </div>
  );
};
