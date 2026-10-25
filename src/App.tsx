/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CloudProvider, ProjectDomain } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { BioSimulator } from './components/BioSimulator';
import { GeoSimulator } from './components/GeoSimulator';
import { TerraformViewer } from './components/TerraformViewer';
import { SecurityCompliance } from './components/SecurityCompliance';
import { ObservabilityConsole } from './components/ObservabilityConsole';
import { DisasterRecovery } from './components/DisasterRecovery';
import { CostCalculator } from './components/CostCalculator';
import { ProjectGuide } from './components/ProjectGuide';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { DataIngestModal } from './components/DataIngestModal';
import { ReportExportModal } from './components/ReportExportModal';
import { DataCatalog } from './components/DataCatalog';
import { PatientDiagnosis } from './components/PatientDiagnosis';
import { Cloud, ShieldCheck, CheckCircle2 } from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('patient-diagnosis');
  const [domain, setDomain] = useState<ProjectDomain>('biology');
  const [provider, setProvider] = useState<CloudProvider>('aws');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Modals state
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [ingestSuccessToast, setIngestSuccessToast] = useState<string | null>(null);

  const { user, isAuthModalOpen, closeAuthModal, openAuthModal } = useAuth();

  const handleIngestSuccess = (fileName: string) => {
    setIngestSuccessToast(`Demo ingestion simulated for "${fileName}". No file was uploaded or stored.`);
    setTimeout(() => setIngestSuccessToast(null), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* 3-Zone Top Navigation Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        domain={domain}
        setDomain={setDomain}
        provider={provider}
        setProvider={setProvider}
        onOpenIngest={() => setIsIngestModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
      />

      {/* Ingestion Toast Notification */}
      {ingestSuccessToast && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/50 px-4 py-2.5 text-xs text-emerald-200 flex items-center justify-between animate-fadeIn z-40">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-mono">{ingestSuccessToast}</span>
          </div>
          <button onClick={() => setIngestSuccessToast(null)} className="text-emerald-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* If user logged out completely, render Login or Register Gateway screen */}
      {!user ? (
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          {authMode === 'login' ? (
            <LoginPage onSwitchToRegister={() => setAuthMode('register')} />
          ) : (
            <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />
          )}
        </div>
      ) : (
        <>
          {/* Active Session Identity & Permission Banner */}
          <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2 text-xs">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-200 font-semibold">{user.roleTitle}</span>
                <span>·</span>
                <span className="font-mono text-cyan-400">{user.email}</span>
                <span>·</span>
                <span className="text-emerald-400">FIDO2/TOTP Verified</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span>STS Token: {user.tokenExpiry}</span>
                <span>·</span>
                <button
                  onClick={openAuthModal}
                  className="text-cyan-400 hover:underline"
                >
                  Manage IAM Session
                </button>
              </div>
            </div>
          </div>

          {/* Main Viewport Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'patient-diagnosis' && <PatientDiagnosis />}

            {activeTab === 'architecture' && (
              <ArchitectureDiagram domain={domain} provider={provider} />
            )}

            {activeTab === 'simulator' && (
              domain === 'biology' ? <BioSimulator /> : <GeoSimulator />
            )}

            {activeTab === 'terraform' && <TerraformViewer />}

            {activeTab === 'security' && <SecurityCompliance />}

            {activeTab === 'observability' && <ObservabilityConsole provider={provider} />}

            {activeTab === 'dr' && <DisasterRecovery />}

            {activeTab === 'calculator' && <CostCalculator />}

            {activeTab === 'guide' && <ProjectGuide domain={domain} />}

            {activeTab === 'data' && <DataCatalog domain={domain} />}
          </main>
        </>
      )}

      {/* Auth Modal Overlay (when user opens from navbar) */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-2xl">
            {authMode === 'login' ? (
              <LoginPage
                isModal={true}
                onSwitchToRegister={() => setAuthMode('register')}
              />
            ) : (
              <RegisterPage
                isModal={true}
                onSwitchToLogin={() => setAuthMode('login')}
              />
            )}
          </div>
        </div>
      )}

      {/* Data Ingestion Gateway Modal */}
      <DataIngestModal
        domain={domain}
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onSuccess={handleIngestSuccess}
      />

      {/* Report & Dossier Export Modal */}
      <ReportExportModal
        domain={domain}
        provider={provider}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Clean Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-200">CloudBioGeo Architecture Suite</span>
            <span>·</span>
            <span>Cloud Computing Engineering Capstone</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('architecture')}
              className="hover:text-slate-200 transition-colors"
            >
              5-Tier Cloud Pipeline
            </button>
            <button
              onClick={() => setActiveTab('terraform')}
              className="hover:text-slate-200 transition-colors"
            >
              Terraform IaC
            </button>
            <button
              onClick={() => setActiveTab('observability')}
              className="hover:text-slate-200 transition-colors"
            >
              Prometheus Scrapes
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className="hover:text-slate-200 transition-colors"
            >
              HIPAA & TLS 1.3
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className="hover:text-slate-200 transition-colors"
            >
              Viva Defense
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
