import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, User, Building, QrCode, Smartphone, CheckCircle2, AlertCircle, ArrowRight, Dna, Satellite, Shield, Key } from 'lucide-react';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
  isModal?: boolean;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSwitchToLogin,
  onSuccess,
  isModal = false,
}) => {
  const { register, closeAuthModal } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('bioinformatician');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hipaaConsent, setHipaaConsent] = useState(false);

  // MFA Enrollment Step
  const [totpCode, setTotpCode] = useState('739104');
  const [enrolling, setEnrolling] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password validation checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password && password === confirmPassword;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (!passwordsMatch) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!hipaaConsent) {
      setErrorMsg('Please accept the HIPAA & Cloud Data Security Policy.');
      return;
    }

    setErrorMsg('');
    setStep(2);
  };

  const handleMfaEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length < 6) {
      setErrorMsg('Please enter the 6-digit verification code from your authenticator app.');
      return;
    }

    setEnrolling(true);
    setErrorMsg('');

    setTimeout(() => {
      register(fullName, email, selectedRole);
      setEnrolling(false);
      if (onSuccess) onSuccess();
      if (isModal) closeAuthModal();
    }, 700);
  };

  const handleDemoRegister = (role: UserRole) => {
    const defaultNames: Record<UserRole, string> = {
      bioinformatician: 'Dr. Arjun Mehta, M.D.',
      geospatial: 'Elena Rostova, M.Sc.',
      auditor: 'Marcus Vance, CISSP',
      evaluator: 'Visiting Cloud Evaluator',
    };
    register(
      defaultNames[role],
      `${role}.user@cloudbiogeo.org`,
      role
    );
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
                <span>IDENTITY PROVISIONING</span>
                <span>·</span>
                <span>STAGE {step} OF 2: {step === 1 ? 'CREDENTIALS & RBAC' : 'MFA ENROLLMENT'}</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Register Cloud Operator & Research Identity
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
          {/* Quick Demo Pre-fill Buttons */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">Quick 1-Click Evaluation Registration:</span>
              <span className="text-[10px] text-cyan-400 font-mono">Bypasses Manual Typing</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleDemoRegister('bioinformatician')}
                className="p-2 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] text-left text-cyan-300 transition-colors"
              >
                + Dr. Arjun (Oncology)
              </button>
              <button
                type="button"
                onClick={() => handleDemoRegister('geospatial')}
                className="p-2 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] text-left text-emerald-300 transition-colors"
              >
                + Elena (GeoScience)
              </button>
              <button
                type="button"
                onClick={() => handleDemoRegister('auditor')}
                className="p-2 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] text-left text-amber-300 transition-colors"
              >
                + Marcus (Auditor)
              </button>
              <button
                type="button"
                onClick={() => handleDemoRegister('evaluator')}
                className="p-2 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] text-left text-purple-300 transition-colors"
              >
                + Evaluator (Universal)
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/30 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: PERSONAL & RBAC CREDENTIALS */}
          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Dr. Samantha Vance"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Institutional / Corporate Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="s.vance@genomics-center.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Organization / University / Hospital
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Memorial Sloan Kettering / NASA Jet Propulsion Lab"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              {/* Department & Role Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Select Department Track & IAM Role:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setSelectedRole('bioinformatician')}
                    className={`cursor-pointer p-3 rounded-lg border text-xs transition-all ${
                      selectedRole === 'bioinformatician'
                        ? 'bg-cyan-950/60 border-cyan-500 text-white ring-1 ring-cyan-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-cyan-300 flex items-center gap-1.5 mb-1">
                      <Dna className="w-4 h-4" />
                      <span>Cancer Genomics & Precision Oncology</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      RNA-Seq alignment, DESeq2 differential analysis, and patient molecular subtyping.
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedRole('geospatial')}
                    className={`cursor-pointer p-3 rounded-lg border text-xs transition-all ${
                      selectedRole === 'geospatial'
                        ? 'bg-cyan-950/60 border-cyan-500 text-white ring-1 ring-cyan-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-emerald-300 flex items-center gap-1.5 mb-1">
                      <Satellite className="w-4 h-4" />
                      <span>Geospatial Earth Observation (Remote Sensing)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Sentinel-2/Landsat ingestion, dynamic STAC queries, and NDVI spectral tiling.
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedRole('auditor')}
                    className={`cursor-pointer p-3 rounded-lg border text-xs transition-all ${
                      selectedRole === 'auditor'
                        ? 'bg-cyan-950/60 border-cyan-500 text-white ring-1 ring-cyan-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
                      <Shield className="w-4 h-4" />
                      <span>HIPAA & Cloud Security Auditor</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Read-only CloudTrail compliance inspection and KMS cryptographic key auditing.
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedRole('evaluator')}
                    className={`cursor-pointer p-3 rounded-lg border text-xs transition-all ${
                      selectedRole === 'evaluator'
                        ? 'bg-cyan-950/60 border-cyan-500 text-white ring-1 ring-cyan-500'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-purple-300 flex items-center gap-1.5 mb-1">
                      <Key className="w-4 h-4" />
                      <span>Academic Evaluator / Cloud Architect</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Unrestricted universal access across all pipelines, DR tests, and FinOps calculators.
                    </p>
                  </div>
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Master Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Password criteria checklist */}
              {password && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                  <span className={hasMinLength ? 'text-emerald-400' : 'text-slate-500'}>
                    {hasMinLength ? '✓' : '○'} 8+ Characters
                  </span>
                  <span className={hasUppercase ? 'text-emerald-400' : 'text-slate-500'}>
                    {hasUppercase ? '✓' : '○'} Uppercase Letter
                  </span>
                  <span className={hasNumber ? 'text-emerald-400' : 'text-slate-500'}>
                    {hasNumber ? '✓' : '○'} Number (0-9)
                  </span>
                  <span className={hasSpecial ? 'text-emerald-400' : 'text-slate-500'}>
                    {hasSpecial ? '✓' : '○'} Special Symbol
                  </span>
                </div>
              )}

              {/* HIPAA / Security policy checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={hipaaConsent}
                    onChange={(e) => setHipaaConsent(e.target.checked)}
                    className="mt-0.5 accent-cyan-500 rounded"
                  />
                  <span>
                    I acknowledge that all genomic and satellite data transmissions are subject to TLS 1.3 encryption, KMS envelope cryptography, and HIPAA/GDPR immutable audit logging under Zero-Trust RBAC.
                  </span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Already have an account? <span className="text-cyan-400 underline">Sign in</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 py-2.5 px-5 text-xs font-semibold rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-950/40"
                >
                  <span>Continue to MFA Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: MFA ENROLLMENT */
            <form onSubmit={handleMfaEnrollment} className="space-y-5">
              <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/40 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold font-mono text-xs">
                  <Smartphone className="w-4 h-4" />
                  <span>MANDATORY MULTI-FACTOR AUTHENTICATION ENROLLMENT</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  To comply with clinical cancer research and sensitive satellite data governance, all operators must register a Time-Based One-Time Password (TOTP) authenticator.
                </p>

                {/* QR Code and Key Box */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <div className="w-28 h-28 bg-white p-2 rounded-lg flex items-center justify-center shrink-0">
                    {/* Simulated SVG QR Code */}
                    <svg className="w-full h-full text-slate-950" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2 2h8v8H2zm2 2v4h4V4zm10-2h8v8h-8zm2 2v4h4V4zM2 14h8v8H2zm2 2v4h4v-4zm13-2h3v3h-3zm-3 3h3v3h-3zm3 3h3v3h-3zm3-3h3v3h-3zm-6-3h3v3h-3zm0 6h3v3h-3z" />
                    </svg>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-slate-400 block font-mono text-[11px]">Or enter key manually:</span>
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded font-mono text-cyan-400 text-xs font-bold tracking-wider select-all">
                      CLOUDBIOGEO-X992-MFA7-SECURE
                    </div>
                    <span className="text-[11px] text-slate-400 block pt-1">
                      Compatible with Google Authenticator, Duo Mobile, 1Password, or YubiKey OATH-TOTP.
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Enter 6-Digit Code Generated by Your Authenticator Device *
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

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  &larr; Back to credentials
                </button>

                <button
                  type="submit"
                  disabled={enrolling}
                  className="flex items-center gap-2 py-2.5 px-6 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{enrolling ? 'Finalizing Cryptographic Account...' : 'Complete Registration & Sign In'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
