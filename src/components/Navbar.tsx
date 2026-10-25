import React, { useState } from 'react';
import { CloudProvider, ProjectDomain } from '../types';
import { useAuth } from '../context/AuthContext';
import { Cloud, Dna, Satellite, ShieldCheck, User, LogOut, ChevronDown, Key, Check, UploadCloud, FileText, Database } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  domain: ProjectDomain;
  setDomain: (domain: ProjectDomain) => void;
  provider: CloudProvider;
  setProvider: (provider: CloudProvider) => void;
  onOpenIngest: () => void;
  onOpenExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  domain,
  setDomain,
  provider,
  setProvider,
  onOpenIngest,
  onOpenExport,
}) => {
  const { user, logout, switchRole, openAuthModal } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Zone 1: Single text element wordmark + Domain Switcher */}
        <div className="flex items-center gap-2.5">
          <a
            href="#architecture"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('architecture');
            }}
            className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 shrink-0"
          >
            <Cloud className="w-5 h-5 text-cyan-400" />
            <span className="font-semibold hidden sm:inline">CloudBioGeo</span>
          </a>

          {/* Domain Switcher */}
          <div className="flex items-center p-1 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => setDomain('biology')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                domain === 'biology'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Dna className="w-3.5 h-3.5" />
              <span>Cancer Genomics</span>
            </button>
            <button
              onClick={() => setDomain('geoscience')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                domain === 'geoscience'
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Satellite Remote Sensing</span>
            </button>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-3.5 text-xs font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`transition-colors hover:text-white py-1 ${
              activeTab === 'architecture' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
            }`}
          >
            Architecture
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`transition-colors hover:text-white py-1 ${
              activeTab === 'simulator' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
            }`}
          >
            {domain === 'biology' ? 'Genomic Workbench' : 'Satellite Workbench'}
          </button>
          {domain === 'biology' && (
            <button
              onClick={() => setActiveTab('patient-diagnosis')}
              className={`transition-colors hover:text-white py-1 ${
                activeTab === 'patient-diagnosis' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
              }`}
            >
              Patient CSV & Diagnosis
            </button>
          )}
          <button
            onClick={() => setActiveTab('terraform')}
            className={`transition-colors hover:text-white py-1 ${
              activeTab === 'terraform' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
            }`}
          >
            Terraform IaC
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`transition-colors hover:text-white py-1 ${
              activeTab === 'security' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
            }`}
          >
            Security & RBAC
          </button>
          <button
            onClick={() => setActiveTab('observability')}
            className={`transition-colors hover:text-white py-1 ${
              activeTab === 'observability' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
            }`}
          >
            Observability & PromQL
          </button>
          <button
            onClick={() => setActiveTab('dr')}
            className={`transition-colors hover:text-white py-1 ${
              activeTab === 'dr' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
            }`}
          >
            HA & DR
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`transition-colors hover:text-white py-1 ${
              activeTab === 'calculator' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
            }`}
          >
            FinOps
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`transition-colors hover:text-white py-1 ${
              activeTab === 'guide' ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold' : ''
            }`}
          >
            Viva Defense
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Ingest + Export + Cloud Toggle + User) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
              activeTab === 'data'
                ? 'border-cyan-500 bg-cyan-500 text-slate-950'
                : 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600'
            }`}
            title="Open the local demo data catalog"
          >
            <Database className="h-3.5 w-3.5" />
            <span>Data</span>
          </button>

          {/* Quick Action: Ingest Payload */}
          <button
            onClick={onOpenIngest}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
            title="Ingest Sample Payload via S3 Pre-Signed URL"
          >
            <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Ingest</span>
          </button>

          {/* Quick Action: Export Dossier */}
          <button
            onClick={onOpenExport}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
            title="Export Architecture Dossier"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* Cloud Provider Toggle */}
          <div className="flex items-center p-1 bg-slate-800 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setProvider('aws')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                provider === 'aws'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AWS
            </button>
            <button
              onClick={() => setProvider('gcp')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                provider === 'gcp'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              GCP
            </button>
          </div>

          {/* User Authentication Status & Role Switcher */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 p-1.5 pl-2 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 text-xs transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-semibold text-slate-200 hidden sm:inline">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 space-y-2">
                  <div className="pb-2 border-b border-slate-800">
                    <div className="text-xs font-bold text-white">{user.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono mt-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>FIDO2 / TOTP MFA Verified</span>
                    </div>
                  </div>

                  {/* Switch Identity Role */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono text-slate-500 px-1 block">
                      Switch RBAC Role:
                    </span>
                    {(
                      [
                        { id: 'bioinformatician', label: 'Clinical Bioinformatician' },
                        { id: 'geospatial', label: 'Geospatial Engineer' },
                        { id: 'auditor', label: 'HIPAA Auditor' },
                        { id: 'evaluator', label: 'Evaluator / Architect' },
                      ] as const
                    ).map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          switchRole(r.id);
                          setUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between ${
                          user.role === r.id
                            ? 'bg-slate-800 text-cyan-400 font-semibold'
                            : 'text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        <span>{r.label}</span>
                        {user.role === r.id && <Check className="w-3 h-3 text-cyan-400" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                    <button
                      onClick={() => {
                        openAuthModal();
                        setUserMenuOpen(false);
                      }}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      Auth Gateway
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors shadow-sm"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Sign In / MFA</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
