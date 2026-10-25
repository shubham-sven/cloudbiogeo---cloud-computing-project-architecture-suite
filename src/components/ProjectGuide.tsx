import React, { useState } from 'react';
import { ProjectDomain } from '../types';
import { VIVA_QUESTIONS, RESUME_BULLETS } from '../data/vivaGuide';
import { HelpCircle, ChevronDown, ChevronUp, Award, CheckCircle2, Bookmark, FileText } from 'lucide-react';

interface ProjectGuideProps {
  domain: ProjectDomain;
}

export const ProjectGuide: React.FC<ProjectGuideProps> = ({ domain }) => {
  const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(0);

  const toggleQuestion = (idx: number) => {
    setOpenQuestionIndex(openQuestionIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <span className="text-cyan-400 font-mono font-semibold">CAPSTONE & VIVA VOCE DEFENSE MANUAL</span>
          <span>·</span>
          <span>Cloud Computing Curriculum</span>
          <span>·</span>
          <span>Google X-Y-Z Resume Statements</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Project Implementation Roadmap, Evaluation Defense & Portfolio Assets
        </h2>
      </div>

      {/* 5-Phase Implementation Roadmap */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-white">
          Step-by-Step Technical Implementation Roadmap
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400">PHASE 01</span>
            <h4 className="text-xs font-bold text-slate-100">Zero-Trust Foundation</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Provision multi-AZ VPC, KMS Customer Managed Key, least-privilege IAM roles, and Terraform remote state with DynamoDB locking.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400">PHASE 02</span>
            <h4 className="text-xs font-bold text-slate-100">Serverless Event Layer</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Configure S3/GCS event notifications, Lambda validation functions, and Step Functions DAG state machine with retry backoffs.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400">PHASE 03</span>
            <h4 className="text-xs font-bold text-slate-100">Containerized Inference</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Build hardened Docker images with Bioconductor or Rasterio/GDAL; deploy to AWS Batch / GKE Spot compute pools.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400">PHASE 04</span>
            <h4 className="text-xs font-bold text-slate-100">Data Lake & Streaming</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Format datasets as Parquet or Cloud-Optimized GeoTIFFs (COGs); configure Athena / BigQuery catalog and CloudFront edge delivery.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400">PHASE 05</span>
            <h4 className="text-xs font-bold text-slate-100">DR & Observability</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Deploy Prometheus Alertmanager rules, Route 53 latency DNS failover, and automated cross-region S3 replication (CRR).
            </p>
          </div>
        </div>
      </div>

      {/* University Viva Voce Examination Defense Q&A */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">
              Cloud Computing University Examination & Viva Voce Q&A
            </h3>
            <p className="text-xs text-slate-400">
              Anticipated technical defense questions with model answers and evaluator inspection criteria.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">5 High-Yield Questions</span>
        </div>

        <div className="space-y-3">
          {VIVA_QUESTIONS.map((q, idx) => {
            const isOpen = openQuestionIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleQuestion(idx)}
                  className="w-full text-left p-4 flex items-center justify-between hover:bg-slate-850 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      {q.category}
                    </span>
                    <span className="text-sm font-semibold text-slate-100">{q.question}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 pt-0 border-t border-slate-850 space-y-3">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Technical Defense Answer
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                        {q.answer}
                      </p>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-amber-300 bg-amber-950/20 p-2.5 rounded-lg border border-amber-900/40">
                      <Bookmark className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-amber-200">Examiner Evaluation Focus:</strong> {q.examinerLookout}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* High-Impact Resume Bullets */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-semibold text-white">
            Resume / Portfolio Statements (Google X-Y-Z Formula)
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Copy and tailor these verified accomplishment bullets for your software engineering / CloudOps resume.
        </p>

        <div className="space-y-3">
          {(domain === 'biology' ? RESUME_BULLETS.biology : RESUME_BULLETS.geoscience).map((bullet, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{bullet}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
