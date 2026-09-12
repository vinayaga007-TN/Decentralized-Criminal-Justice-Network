import React, { useState, useEffect } from 'react';
import { Shield, Check, Lock, Camera, Eye, Fingerprint, Key, ChevronRight, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { InstitutionalIdentity, InstitutionType } from '../../types';
import { api } from '../../services/api';

interface SecureAuthGatewayProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (identity: InstitutionalIdentity) => void;
  initialInstitution?: InstitutionType;
}

const PRESET_ACCOUNTS: Record<InstitutionType, { id: string; name: string; role: string; station: string }> = {
  POLICE: {
    id: 'POL-IND-004281',
    name: 'Inspector Kumar',
    role: 'Senior Investigating Officer',
    station: 'Metro Central Division (#POL-MC-09)'
  },
  FORENSICS: {
    id: 'FOR-IND-003914',
    name: 'Dr. Elena Rostova',
    role: 'Chief Forensic Examiner (CFSL)',
    station: 'Central Forensic Science Lab Node #03'
  },
  COURT: {
    id: 'CRT-IND-001872',
    name: 'Hon. Justice Sarah Vance',
    role: 'Presiding Magistrate Judge',
    station: 'High Court Sovereign Bench #04'
  },
  PRISON: {
    id: 'PRS-IND-002641',
    name: 'Superintendent Marcus Vance',
    role: 'Correctional Custody Superintendent',
    station: 'Central Correctional Facility #04'
  }
};

export const SecureAuthGateway: React.FC<SecureAuthGatewayProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
  initialInstitution = 'POLICE'
}) => {
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionType>(initialInstitution);
  const [institutionalId, setInstitutionalId] = useState(PRESET_ACCOUNTS[initialInstitution].id);
  const [stage, setStage] = useState<'ID_INPUT' | 'BIOMETRIC_SWEEP' | 'COMPLETED'>('ID_INPUT');
  const [bioStep, setBioStep] = useState<1 | 2 | 3 | 4>(1); // 1: Face, 2: Iris, 3: Fingerprint, 4: Crypto
  const [error, setError] = useState<string | null>(null);

  // Sync default ID when institution changes
  const handleSelectInstitution = (inst: InstitutionType) => {
    setSelectedInstitution(inst);
    setInstitutionalId(PRESET_ACCOUNTS[inst].id);
    setError(null);
  };

  const handleStartBiometrics = () => {
    if (!institutionalId.trim()) {
      setError('Please enter an official Institutional Credential ID.');
      return;
    }
    setError(null);
    setStage('BIOMETRIC_SWEEP');
    setBioStep(1);
  };

  // Automated calm progression through the 4 steps
  useEffect(() => {
    if (stage !== 'BIOMETRIC_SWEEP') return;

    let timer: NodeJS.Timeout;
    if (bioStep === 1) {
      timer = setTimeout(() => setBioStep(2), 1400);
    } else if (bioStep === 2) {
      timer = setTimeout(() => setBioStep(3), 1400);
    } else if (bioStep === 3) {
      timer = setTimeout(() => setBioStep(4), 1400);
    } else if (bioStep === 4) {
      timer = setTimeout(() => setStage('COMPLETED'), 1200);
    }

    return () => clearTimeout(timer);
  }, [stage, bioStep]);

  const handleFinalEnter = () => {
    const defaultAcc = PRESET_ACCOUNTS[selectedInstitution];
    const identity: InstitutionalIdentity = {
      id: institutionalId || defaultAcc.id,
      institution: selectedInstitution,
      name: defaultAcc.name,
      role: defaultAcc.role,
      stationOrBench: defaultAcc.station,
      publicKey: '0x3B82631024Fa4A228e9c403328fE11A99011B101',
      credentialStatus: 'ACTIVE',
      badgeNumber: defaultAcc.id.replace('-IND-', '-'),
      sessionToken: 'qbft-session-token-' + Date.now()
    };
    onAuthenticated(identity);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090F]/95 backdrop-blur-md text-slate-100 p-4">
      {/* Subtle close button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 text-slate-500 hover:text-slate-300 transition-colors p-2"
        title="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Main Container - High whitespace, calm, minimal command center aesthetic */}
      <div className="w-full max-w-lg mx-auto py-12 px-6 flex flex-col items-center text-center">
        
        {/* Subtle Government Crest Icon */}
        <div className="w-12 h-12 rounded-lg border border-slate-800 bg-[#0C101B] flex items-center justify-center text-slate-400 mb-6">
          <Shield className="w-6 h-6 stroke-1 text-slate-300" />
        </div>

        {stage === 'ID_INPUT' && (
          <div className="w-full space-y-8 animate-in fade-in">
            <div className="space-y-2">
              <h1 className="text-xl font-semibold tracking-wide text-slate-100 uppercase font-mono">
                Secure Institutional Access
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Decentralized Criminal Justice Network • Identity Authentication
              </p>
            </div>

            {/* Institution Selector Tabs */}
            <div className="grid grid-cols-4 gap-2 border border-slate-800 p-1 rounded bg-[#090D17]">
              {(['POLICE', 'COURT', 'FORENSICS', 'PRISON'] as InstitutionType[]).map((inst) => {
                const isSelected = selectedInstitution === inst;
                return (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => handleSelectInstitution(inst)}
                    className={`py-2 text-[11px] font-mono tracking-wider transition-all rounded ${
                      isSelected
                        ? 'bg-slate-800 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {inst}
                  </button>
                );
              })}
            </div>

            {/* Preset Identity Preview */}
            <div className="text-left bg-[#0A0E18] border border-slate-800/80 rounded p-3.5 text-xs font-mono">
              <div className="text-slate-500 text-[10px] uppercase mb-1">Target Institutional Station:</div>
              <div className="text-slate-200 font-sans font-medium">{PRESET_ACCOUNTS[selectedInstitution].station}</div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                {PRESET_ACCOUNTS[selectedInstitution].name} ({PRESET_ACCOUNTS[selectedInstitution].role})
              </div>
            </div>

            {/* Institutional ID Field */}
            <div className="space-y-2 text-left">
              <label className="block text-[11px] font-mono uppercase text-slate-400">
                Unique Institutional ID
              </label>
              <input
                type="text"
                value={institutionalId}
                onChange={(e) => setInstitutionalId(e.target.value)}
                placeholder="e.g. POL-IND-004281"
                className="w-full bg-[#090D17] border border-slate-800 rounded px-4 py-2.5 text-sm font-mono text-slate-100 focus:border-slate-600 focus:outline-none transition-colors"
              />
              {error && (
                <p className="text-xs text-rose-400 font-mono">{error}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="button"
                onClick={handleStartBiometrics}
                className="w-full py-2.5 bg-slate-100 hover:bg-white text-slate-950 font-mono text-xs uppercase font-semibold tracking-wider rounded transition-colors"
              >
                Continue to Biometric Verification
              </button>
            </div>
          </div>
        )}

        {stage === 'BIOMETRIC_SWEEP' && (
          <div className="w-full space-y-10 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-sm font-mono uppercase tracking-widest text-slate-400">
                Biometric Verification
              </h2>
              <div className="text-xs text-slate-500 font-mono">
                Attesting credentials for {institutionalId} ({selectedInstitution})
              </div>
            </div>

            {/* Central Elegant Verification Area */}
            <div className="w-64 h-64 mx-auto rounded border border-slate-800 bg-[#090D17] flex flex-col items-center justify-center p-6 space-y-4 relative">
              {/* Subtle Scanning Frame */}
              {bioStep === 1 && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="w-16 h-16 rounded-full border border-blue-500/40 bg-blue-500/10 flex items-center justify-center mx-auto text-blue-400">
                    <Camera className="w-8 h-8 stroke-1" />
                  </div>
                  <div className="text-xs font-mono uppercase text-slate-300">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-2 animate-pulse" />
                    Camera Active
                  </div>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Position your face inside the frame
                  </p>
                </div>
              )}

              {bioStep === 2 && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="w-16 h-16 rounded-full border border-teal-500/40 bg-teal-500/10 flex items-center justify-center mx-auto text-teal-400">
                    <Eye className="w-8 h-8 stroke-1" />
                  </div>
                  <div className="text-xs font-mono uppercase text-slate-300">
                    <span className="inline-block w-2 h-2 rounded-full bg-teal-400 mr-2 animate-pulse" />
                    Iris Optical Sensor
                  </div>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Align retinas with optical scanline
                  </p>
                </div>
              )}

              {bioStep === 3 && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="w-16 h-16 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center mx-auto text-amber-400">
                    <Fingerprint className="w-8 h-8 stroke-1" />
                  </div>
                  <div className="text-xs font-mono uppercase text-slate-300">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-2 animate-pulse" />
                    Fingerprint Reader
                  </div>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Scanning minutiae patterns
                  </p>
                </div>
              )}

              {bioStep === 4 && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="w-16 h-16 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400">
                    <Key className="w-8 h-8 stroke-1" />
                  </div>
                  <div className="text-xs font-mono uppercase text-slate-300">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
                    Cryptographic Identity
                  </div>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Verifying Ed25519 keypair against IdentityRegistry
                  </p>
                </div>
              )}
            </div>

            {/* 4-Step Progress Indicator */}
            <div className="grid grid-cols-4 gap-2 text-left font-mono text-[11px] text-slate-400">
              <div className={`p-2 rounded border transition-colors ${bioStep >= 2 ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : bioStep === 1 ? 'border-slate-600 bg-slate-800 text-slate-200' : 'border-slate-800 text-slate-600'}`}>
                <div>01 Face</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{bioStep >= 2 ? '✓ Verified' : bioStep === 1 ? 'Scanning...' : 'Pending'}</div>
              </div>

              <div className={`p-2 rounded border transition-colors ${bioStep >= 3 ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : bioStep === 2 ? 'border-slate-600 bg-slate-800 text-slate-200' : 'border-slate-800 text-slate-600'}`}>
                <div>02 Iris</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{bioStep >= 3 ? '✓ Verified' : bioStep === 2 ? 'Scanning...' : 'Pending'}</div>
              </div>

              <div className={`p-2 rounded border transition-colors ${bioStep >= 4 ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : bioStep === 3 ? 'border-slate-600 bg-slate-800 text-slate-200' : 'border-slate-800 text-slate-600'}`}>
                <div>03 Fingerprint</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{bioStep >= 4 ? '✓ Verified' : bioStep === 3 ? 'Scanning...' : 'Pending'}</div>
              </div>

              <div className={`p-2 rounded border transition-colors ${stage === 'COMPLETED' ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : bioStep === 4 ? 'border-slate-600 bg-slate-800 text-slate-200' : 'border-slate-800 text-slate-600'}`}>
                <div>04 Key Identity</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{stage === 'COMPLETED' ? '✓ Verified' : bioStep === 4 ? 'Attesting...' : 'Pending'}</div>
              </div>
            </div>
          </div>
        )}

        {stage === 'COMPLETED' && (
          <div className="w-full space-y-8 animate-in fade-in">
            <div className="w-16 h-16 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400">
              <ShieldCheck className="w-8 h-8 stroke-1" />
            </div>

            <div className="space-y-2">
              <h2 className="text-base font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Identity Verified
              </h2>
              <p className="text-xs text-slate-300 font-mono">
                Cryptographic Credential Attested Across Sovereign Nodes
              </p>
            </div>

            <div className="bg-[#090D17] border border-slate-800 p-4 rounded text-left font-mono text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Identity:</span>
                <span className="text-slate-100">{PRESET_ACCOUNTS[selectedInstitution].name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Role:</span>
                <span className="text-slate-100">{PRESET_ACCOUNTS[selectedInstitution].role}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Institution:</span>
                <span className="text-slate-100">{selectedInstitution}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Session Expiry:</span>
                <span className="text-slate-400">8 Hours (QBFT Consensus Signed)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinalEnter}
              className="w-full py-3 bg-slate-100 hover:bg-white text-slate-950 font-mono text-xs uppercase font-semibold tracking-wider rounded transition-colors"
            >
              Enter {selectedInstitution} Network
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
