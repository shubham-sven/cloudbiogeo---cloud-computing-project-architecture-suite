import React, { useState } from 'react';
import { ProjectDomain } from '../types';
import { UploadCloud, CheckCircle2, FileText, Shield, Key, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

interface DataIngestModalProps {
  domain: ProjectDomain;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fileName: string) => void;
}

export const DataIngestModal: React.FC<DataIngestModalProps> = ({
  domain,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(
    domain === 'biology' ? 'TCGA-BRCA-Counts-Matrix-Cohort4.tsv.gz' : 'S2B_MSIL2A_AmazonDeforestation_2024.tif'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [sha256Hash, setSha256Hash] = useState<string>('');

  if (!isOpen) return null;

  const presets = domain === 'biology' ? [
    { name: 'TCGA-BRCA-Counts-Matrix-Cohort4.tsv.gz', size: '48.2 MB', desc: '1,098 Breast Invasive Carcinoma patients with 20,531 RNA-Seq gene expressions' },
    { name: 'Illumina-NovaSeq6000-Pair1.fastq.gz', size: '1.42 GB', desc: 'Paired-end 150bp genomic sequencing reads with Phred quality scores >= 30' },
    { name: 'TCGA-LUAD-LungAdenocarcinoma.parquet', size: '18.9 MB', desc: 'Snappy-compressed columnar TPM expression matrix with clinical subtyping labels' },
  ] : [
    { name: 'S2B_MSIL2A_AmazonDeforestation_2024.tif', size: '124.5 MB', desc: 'Cloud-Optimized GeoTIFF with 12 multispectral bands (10m B02, B03, B04, B08)' },
    { name: 'Landsat9-OLI2-SierraWildfire-NBR.cog', size: '86.1 MB', desc: 'Pre-processed Normalized Burn Ratio raster with 30m thermal infrared calibration' },
    { name: 'Copernicus-STAC-Collection-Item.json', size: '4.8 KB', desc: 'SpatioTemporal Asset Catalog (STAC v1.0.0) spatial granule metadata envelope' },
  ];

  const handleSimulateUpload = () => {
    setIsProcessing(true);
    setProgressStage('Generating TLS 1.3 Pre-Signed PUT URL (AWS S3 Transfer Acceleration)...');

    setTimeout(() => {
      setProgressStage('Computing SHA-256 Checksum & Verifying HIPAA/GDPR Integrity...');
      setSha256Hash('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    }, 800);

    setTimeout(() => {
      setProgressStage('Requesting AWS KMS Customer-Managed Key (CMK) Plaintext & Ciphertext Key...');
    }, 1600);

    setTimeout(() => {
      setProgressStage('Publishing S3 ObjectCreated Event to Amazon EventBridge -> Step Functions...');
    }, 2400);

    setTimeout(() => {
      setIsProcessing(false);
      onSuccess(selectedPreset);
      onClose();
    }, 3200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-cyan-400">SERVERLESS INGESTION GATEWAY</div>
              <h3 className="text-base font-bold text-white">
                {domain === 'biology' ? 'Upload Genomic FASTQ / Counts' : 'Upload Satellite Raster COG'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
          >
            ESC
          </button>
        </div>

        {/* Preset Selection */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">
            Select Scientific Ingestion Payload (S3 / GCS Data Lake Target):
          </label>
          <div className="space-y-2">
            {presets.map((p) => (
              <div
                key={p.name}
                onClick={() => setSelectedPreset(p.name)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedPreset === p.name
                    ? 'bg-cyan-950/50 border-cyan-500 text-white ring-1 ring-cyan-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-mono mb-1">
                  <span className="font-semibold text-cyan-300 truncate">{p.name}</span>
                  <span className="text-[11px] text-slate-400 shrink-0 ml-2">{p.size}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Pipeline */}
        {isProcessing && (
          <div className="p-4 bg-slate-950 rounded-xl border border-cyan-500/40 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-semibold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Pipeline Stage Executing...</span>
            </div>
            <p className="text-slate-300 font-mono text-[11px]">{progressStage}</p>
            {sha256Hash && (
              <div className="text-[10px] font-mono text-emerald-400 truncate">
                SHA-256: {sha256Hash}
              </div>
            )}
          </div>
        )}

        {/* Security Specs Checklist */}
        <div className="text-[11px] text-slate-400 space-y-1 font-mono bg-slate-950/80 p-3 rounded-lg border border-slate-800">
          <div className="text-slate-300 font-semibold mb-1">Ingestion Security Verification:</div>
          <div>✓ TLS 1.3 Strict In-Transit Encryption (`TLS_AES_256_GCM_SHA384`)</div>
          <div>✓ KMS Envelope Encryption Customer-Managed Key (CMK)</div>
          <div>✓ S3 Bucket Key active (99% KMS request cost reduction)</div>
          <div>✓ Immediate RAM wipe of plaintext decryption key</div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleSimulateUpload}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-950/40 disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isProcessing ? 'Streaming to S3...' : 'Execute Ingest Pipeline'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
