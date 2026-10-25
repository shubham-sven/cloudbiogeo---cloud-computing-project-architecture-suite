import React, { useState } from 'react';
import { useAuth, UserRole, PRESET_USERS } from '../context/AuthContext';
import { ShieldCheck, Lock, Key, Mail, CheckCircle2, AlertCircle, ArrowRight, Dna, Satellite, Shield, Smartphone } from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  isModal?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onSwitchToRegister, isModal = false }) => {
  const { login, closeAuthModal } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('bioinformatician');
  const [email, setEmail] = useState('dr.sharma@oncology.cloud');
  const [password, setPassword] = useState('••••••••••••');
  const [mfaStep, setMfaStep] = useState(false);
  const [totpCode, setTotpCode] = useState('849201');
  const [authError, setAuthError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(PRESET_USERS[role].email);
    setAuthError('');
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please enter a valid email address and password.');
      return;
    }

    setAuthenticating(true);
    setAuthError('');

    setTimeout(() => {
      setAuthenticating(false);
      // All administrative and clinical roles require MFA challenge step
      setMfaStep(true);
    }, 700);
  };

  const handleMfaVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length < 6) {
      setAuthError('Please enter a valid 6-digit TOTP authentication code.');
      return;
    }

    setAuthenticating(true);
    setTimeout(() => {
      login(selectedRole, email);
      setAuthenticating(false);
      if (onSuccess) onSuccess();
      if (isModal) closeAuthModal();
    }, 600);
  };

  const handleQuickLogin = (role: UserRole) => {
    login(role);
    if (onSuccess) onSuccess();
    if (isModal) closeAuthModal();
  };

  return (
    <div className={`w-full ${isModal ? 'p-2' : 'max-w-2xl mx-auto py-8 px-4'}`}>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="bg-slate-850 border-b border-slate-800 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span>AWS COGNITO / CLOUD IDENTITY</span>
                <span>·</span>
                <span>TLS 1.3 SECURE OIDC</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Enterprise Zero-Trust Authentication Gateway
              </h2>
            </div>
          </div>
          {isModal && (
            <button
              onClick={closeAuthModal}
              className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded bg-slate-800 border border-slate-700"
            >
              ESC / Close
            </button>
          )}
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Quick Evaluator Role Selector Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Identity Profile (RBAC Simulation):
              </span>
              <span className="text-[11px] text-cyan-400 font-mono">1-Click Sign-In Enabled</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('bioinformatician')}
                className={`p-2.5 rounded-lg border text-left transition-all text-xs ${
                  selectedRole === 'bioinformatician'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-cyan-300 flex items-center gap-1.5 mb-1">
                  <Dna className="w-3.5 h-3.5" />
                  <span>Oncologist</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Clinical Bioinformatician</div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('geospatial')}
                className={`p-2.5 rounded-lg border text-left transition-all text-xs ${
                  selectedRole === 'geospatial'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-emerald-300 flex items-center gap-1.5 mb-1">
                  <Satellite className="w-3.5 h-3.5" />
                  <span>Geo Engineer</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Earth Observation</div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('auditor')}
                className={`p-2.5 rounded-lg border text-left transition-all text-xs ${
                  selectedRole === 'auditor'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Auditor</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">HIPAA Compliance</div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('evaluator')}
                className={`p-2.5 rounded-lg border text-left transition-all text-xs ${
                  selectedRole === 'evaluator'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-purple-300 flex items-center gap-1.5 mb-1">
                  <Key className="w-3.5 h-3.5" />
                  <span>Evaluator</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Cloud Architect</div>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="p-3 bg-rose-950/30 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* STEP 1: CREDENTIALS */}
          {!mfaStep ? (
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Federated Corporate / University Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Enforcing FIDO2 / TOTP Second Factor</span>
                </span>
                <span className="text-cyan-400">AWS IAM Condition Key: aws:MultiFactorAuthPresent</span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={authenticating}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-950/40 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{authenticating ? 'Authenticating Credentials...' : 'Authenticate & Request MFA Token'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin(selectedRole)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
                >
                  Instant Bypass (Evaluation Mode)
                </button>
              </div>

              {onSwitchToRegister && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Don't have an operator identity?{' '}
                    <span className="text-cyan-400 underline font-semibold">
                      Register new account & MFA &rarr;
                    </span>
                  </button>
                </div>
              )}
            </form>
          ) : (
            /* STEP 2: MFA CHALLENGE */
            <form onSubmit={handleMfaVerify} className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-cyan-500/40 text-xs space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold font-mono">
                  <Smartphone className="w-4 h-4" />
                  <span>STEP 2: MULTI-FACTOR AUTHENTICATION CHALLENGE</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Enter the 6-digit Time-Based One-Time Password (TOTP) from your authenticator device (Google Authenticator / YubiKey hardware token).
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  6-Digit Security Token
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="w-full text-center tracking-[0.5em] text-lg font-mono font-bold bg-slate-950 border border-slate-800 rounded-lg py-3 text-cyan-400 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="000000"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Code refreshed every 30 seconds</span>
                <button
                  type="button"
                  onClick={() => setMfaStep(false)}
                  className="text-cyan-400 hover:underline"
                >
                  &larr; Back to login
                </button>
              </div>

              <button
                type="submit"
                disabled={authenticating}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{authenticating ? 'Verifying Cryptographic MFA Signature...' : 'Confirm MFA & Access Cloud Platform'}</span>
              </button>
            </form>
          )}

          {/* Role Access Matrix Note */}
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <span className="font-semibold text-slate-300 block">Lead Bioinformatician:</span>
              <span>Can upload RNA-Seq counts, run DESeq2, and view patient clinical subtypes.</span>
            </div>
            <div>
              <span className="font-semibold text-slate-300 block">Geospatial Engineer:</span>
              <span>Can query STAC catalog, run NDVI/NDWI algorithms, and configure Spot instances.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
