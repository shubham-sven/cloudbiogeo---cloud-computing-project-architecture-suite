import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, FileCheck, CheckCircle2, AlertOctagon, Terminal } from 'lucide-react';

export const SecurityCompliance: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <span className="text-cyan-400 font-mono font-semibold">ZERO-TRUST SECURITY ARCHITECTURE</span>
          <span>·</span>
          <span>HIPAA / HITECH / GDPR Ready</span>
          <span>·</span>
          <span>Envelope Encryption</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Cryptography, Role-Based Access Control & Compliance Governance
        </h2>
      </div>

      {/* 4 Security Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: TLS 1.3 Transport Security */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">TLS 1.3 Strict In-Transit Encryption</h3>
              <p className="text-xs text-slate-400">Zero legacy fallback, Perfect Forward Secrecy (PFS)</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            All data in transit across edge endpoints, API gateways, internal VPC microservices, and S3/GCS buckets is locked to TLS 1.3. Any HTTP request or TLS &le; 1.2 handshake is dropped immediately at the Application Load Balancer and S3 bucket policy boundary.
          </p>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs space-y-1">
            <div className="text-slate-400">Approved TLS 1.3 Cipher Suites:</div>
            <div className="text-emerald-400">● TLS_AES_256_GCM_SHA384</div>
            <div className="text-emerald-400">● TLS_CHACHA20_POLY1305_SHA256</div>
            <div className="text-emerald-400">● TLS_AES_128_GCM_SHA256</div>
          </div>
        </div>

        {/* Pillar 2: KMS Envelope Encryption */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">KMS Two-Tier Envelope Encryption</h3>
              <p className="text-xs text-slate-400">Customer Managed Keys (CMK) with annual rotation</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] font-mono">
            <div className="p-2 bg-slate-950 border border-slate-800 rounded">
              <span className="text-cyan-400 block font-bold">Step 1</span>
              <span>KMS CMK</span>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded">
              <span className="text-cyan-400 block font-bold">Step 2</span>
              <span>Data Key</span>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded">
              <span className="text-cyan-400 block font-bold">Step 3</span>
              <span>AES-256</span>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded">
              <span className="text-cyan-400 block font-bold">Step 4</span>
              <span>RAM Wipe</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Data is never encrypted directly by the master key. KMS generates a unique single-use 256-bit plaintext data key and an encrypted ciphertext key. The plaintext key encrypts the genomic/satellite file, after which the plaintext key is purged from worker RAM.
          </p>
        </div>

        {/* Pillar 3: RBAC & MFA Enforcement */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Role-Based Access Control (RBAC) & MFA</h3>
              <p className="text-xs text-slate-400">Hardware FIDO2 / WebAuthn token verification</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Lead Clinical Bioinformatician</span>
                <span className="text-slate-400">Can trigger diagnostic pipeline & approve reports</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono">
                MFA Required
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Automated Container Worker (IAM Role)</span>
                <span className="text-slate-400">Read incoming/ S3; write processed/ S3; zero user access</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-mono">
                STS AssumeRole
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Compliance & HIPAA Auditor</span>
                <span className="text-slate-400">Read-only CloudTrail logs & metadata; cannot access patient data</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-mono">
                Least Privilege
              </span>
            </div>
          </div>
        </div>

        {/* Pillar 4: Audit Logging & Immutability */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Immutable Audit Trails (CloudTrail + Object Lock)</h3>
              <p className="text-xs text-slate-400">WORM (Write Once, Read Many) compliance</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            All API invocations, data reads, role assumptions, and object modifications are recorded by AWS CloudTrail / GCP Cloud Audit Logs and delivered to an isolated audit S3 bucket protected with S3 Object Lock in Compliance Mode (cannot be deleted even by root account).
          </p>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300">
            <div>// Sample CloudWatch Log Insights Query</div>
            <div className="text-slate-300">
              fields @timestamp, userIdentity.arn, eventName, sourceIPAddress<br />
              | filter eventName like /PutObject|GetObject/<br />
              | stats count(*) by bin(1h)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
