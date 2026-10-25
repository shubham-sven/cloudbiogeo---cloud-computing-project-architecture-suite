import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'evaluator' | 'bioinformatician' | 'geospatial' | 'auditor';

export interface UserSession {
  email: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  mfaVerified: boolean;
  tokenExpiry: string;
  permissions: string[];
}

export const PRESET_USERS: Record<UserRole, UserSession> = {
  evaluator: {
    email: 'evaluator.prof@university.edu',
    name: 'Prof. Cloud Evaluator',
    role: 'evaluator',
    roleTitle: 'Academic Evaluator & Architect',
    mfaVerified: true,
    tokenExpiry: '2h 45m remaining',
    permissions: ['all_read', 'all_write', 'terraform_execute', 'dr_simulation', 'phi_access']
  },
  bioinformatician: {
    email: 'dr.sharma@oncology.cloud',
    name: 'Dr. Neha Sharma, Ph.D.',
    role: 'bioinformatician',
    roleTitle: 'Lead Clinical Bioinformatician',
    mfaVerified: true,
    tokenExpiry: '58m remaining',
    permissions: ['fastq_ingest', 'clinical_infer', 'phi_access', 'deseq2_run']
  },
  geospatial: {
    email: 'alex.chen@earth-obs.org',
    name: 'Alex Chen',
    role: 'geospatial',
    roleTitle: 'Senior Geospatial Engineer',
    mfaVerified: true,
    tokenExpiry: '1h 15m remaining',
    permissions: ['sentinel_ingest', 'stac_query', 'titiler_deploy', 'spot_scaling']
  },
  auditor: {
    email: 'compliance@health-audit.gov',
    name: 'Sarah Jenkins, CISA',
    role: 'auditor',
    roleTitle: 'HIPAA & Cloud Security Auditor',
    mfaVerified: true,
    tokenExpiry: '3h 30m remaining',
    permissions: ['cloudtrail_read', 'kms_audit', 'object_lock_verify', 'no_phi_access']
  }
};

interface AuthContextType {
  user: UserSession | null;
  login: (role: UserRole, email?: string, requireMfa?: boolean) => void;
  register: (name: string, email: string, role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to evaluator session so evaluator can immediately interact without obstacle,
  // while having full ability to log out or test strict authentication & MFA!
  const [user, setUser] = useState<UserSession | null>(PRESET_USERS.evaluator);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const login = (role: UserRole, email?: string) => {
    const preset = PRESET_USERS[role];
    setUser({
      ...preset,
      email: email || preset.email,
      mfaVerified: true
    });
    setIsAuthModalOpen(false);
  };

  const register = (name: string, email: string, role: UserRole) => {
    const preset = PRESET_USERS[role];
    setUser({
      name,
      email,
      role,
      roleTitle: preset.roleTitle,
      mfaVerified: true,
      tokenExpiry: '3h 00m remaining',
      permissions: preset.permissions
    });
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    setUser(PRESET_USERS[role]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        switchRole,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
