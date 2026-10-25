import React, { useState } from 'react';
import { ProjectDomain, CloudProvider } from '../types';
import { FileText, Download, Printer, Check, Copy, ShieldCheck, X } from 'lucide-react';

interface ReportExportModalProps {
  domain: ProjectDomain;
  provider: CloudProvider;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  domain,
  provider,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const reportText = `================================================================================
CLOUD COMPUTING ENGINEERING CAPSTONE SPECIFICATION REPORT
Project: ${domain === 'biology' ? 'Cancer Gene Expression RNA-Seq Diagnosis Pipeline' : 'Satellite Multispectral Remote Sensing Application'}
Cloud Infrastructure Target: ${provider.toUpperCase()} Multi-Region Architecture
Generated: ${new Date().toISOString().split('T')[0]} | Status: Production-Grade IaC Ready
================================================================================

1. EXECUTIVE ARCHITECTURAL SUMMARY
--------------------------------------------------------------------------------
A 5-tier serverless, event-driven, containerized data processing architecture
engineered for high scalability, zero idle compute expenditure, and strict
regulatory compliance (HIPAA / GDPR / HITECH).

2. 5-TIER TECHNICAL TOPOLOGY
--------------------------------------------------------------------------------
* Tier 1: Ingestion Plane
  - Protocol: TLS 1.3 Strict Enforced (Cipher: TLS_AES_256_GCM_SHA384).
  - AWS: Amazon S3 with Transfer Acceleration + Time-Limited Pre-Signed PUT URLs (15m).
  - GCP: Google Cloud Storage (Dual-Region) + Signed URLs with SHA-256 Checksum.

* Tier 2: Serverless Event Router
  - AWS: Amazon EventBridge -> AWS Lambda (Schema Validator) -> AWS Step Functions Distributed Map.
  - GCP: Cloud Pub/Sub -> Cloud Functions (Gen 2) -> Cloud Workflows.
  - Dead Letter Queue (DLQ): SQS FIFO / Cloud Pub/Sub DLQ with exponential retry backoff.

* Tier 3: Container Compute & Scientific ML Inference
  - Compute: AWS Batch (EC2 Spot Instances c6i.4xlarge / g5.xlarge GPU) / Google Cloud Batch.
  - Interruption Handling: SIGTERM graceful 120-second tensor checkpointing to S3.
  - Economics: 75% to 85% discount over on-demand instance pricing.

* Tier 4: Columnar Data Lake & Indexing
  - Formats: Snappy-compressed Apache Parquet (genomics) & Cloud-Optimized GeoTIFFs (COGs).
  - Catalog: AWS Glue Data Catalog & Amazon Athena / Google Cloud BigQuery.
  - Metadata: Amazon DynamoDB with Point-in-Time Recovery (PITR) / Cloud Spanner.

* Tier 5: Scalable Edge Visualization
  - AWS: Amazon CloudFront with Origin Access Control (OAC) + TiTiler dynamic tile server on ECS Fargate.
  - GCP: Google Cloud CDN + Cloud Run dynamic raster generator.

3. ZERO-TRUST SECURITY & COMPLIANCE
--------------------------------------------------------------------------------
* KMS Envelope Encryption: Two-tier customer-managed key (CMK) envelope encryption.
  Plaintext 256-bit data key purged from worker RAM immediately after file encryption.
* Role-Based Access Control (RBAC): AWS IAM least-privilege roles for all worker instances.
  Clinical diagnostic triggers and S3 bucket modifications require FIDO2/TOTP MFA.
* Audit Trails: AWS CloudTrail / GCP Cloud Audit Logs writing to WORM-compliant
  S3 bucket with S3 Object Lock in Compliance Mode.

4. HIGH AVAILABILITY & DISASTER RECOVERY (DR)
--------------------------------------------------------------------------------
* Recovery Point Objective (RPO): < 15 minutes via Cross-Region S3 Replication (CRR).
* Recovery Time Objective (RTO): < 30 minutes via Route 53 DNS Latency Health Checks.
* Multi-Region Strategy: Active-Active DNS routing between us-east-1 and us-west-2.

5. OBSERVABILITY & ALERTING
--------------------------------------------------------------------------------
* Prometheus Operator metrics scraping every 15 seconds.
* Key Alerts:
  - HighInferenceLatencyP99 (p99 > 2000ms over 2m)
  - SpotReclamationNotice (interruption rate > 1 per 5m)
  - DeadLetterQueueBacklog (messages > 0 in DLQ)

================================================================================
END OF SPECIFICATION REPORT — CLOUDBIOGEO ARCHITECTURE SUITE
================================================================================`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-cyan-400">ENGINEERING AUDIT SPECIFICATION</div>
              <h3 className="text-base font-bold text-white">
                Comprehensive Cloud Architecture & Defense Dossier
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report Content Pre */}
        <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed max-h-[500px]">
          <pre className="whitespace-pre-wrap">{reportText}</pre>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            Export ready for University Capstone Submission & Technical Viva
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-750 rounded-lg border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
