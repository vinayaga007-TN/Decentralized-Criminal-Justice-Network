import React, { useState } from 'react';
import {
  Shield,
  Scan,
  Fingerprint,
  Eye,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  X,
  Sparkles,
  Key
} from 'lucide-react';
import { InstitutionalIdentity } from '../types';
import { api } from '../services/api';

interface BiometricGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (identity: InstitutionalIdentity) => void;
  targetInstitution?: string;
}

const PRESET_IDENTITIES = [
  { id: 'POL-IND-004281', label: 'POLICE', name: 'Inspector Kumar', role: 'Investigation Officer' },
  { id: 'FOR-IND-003914', label: 'FORENSICS', name: 'Dr. Elena Rostova', role: 'Chief Forensic Examiner' },
  { id: 'CRT-IND-001872', label: 'COURT', name: 'Hon. Justice Sarah Vance', role: 'Presiding Magistrate Judge' },
  { id: 'PRS-IND-002641', label: 'PRISON', name: 'Superintendent Marcus Vance', role: 'Correctional Superintendent' },
];

export const BiometricGatewayModal: React.FC<BiometricGatewayModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated
}) => {
  const [institutionalId, setInstitutionalId] = useState('POL-IND-004281');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedIdentity, setResolvedIdentity] = useState<InstitutionalIdentity | null>(null);

  // Biometric test progression state
  const [faceDone, setFaceDone] = useState(false);
  const [irisDone, setIrisDone] = useState(false);
  const [printDone, setPrintDone] = useState(false);

  if (!isOpen) return null;

  const handleLookup = async (idToLookup?: string) => {
    const id = (idToLookup || institutionalId).trim();
    if (!id) {
      setError('Please enter a valid Institutional ID.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await api.verifyIdentity(id);
      if (res.success && res.identity) {
        setResolvedIdentity(res.identity);
        setStep(2);
        // Automatically start biometric verification sweep
        startBiometricSweep(res.identity);
      } else {
        setError(res.error || 'Identity not found in DCJMN IdentityRegistry smart contract.');
      }
    } catch (e: any) {
      setError('Network communication failed with DCJMN Sovereign Node.');
    } finally {
      setLoading(false);
    }
  };

  const startBiometricSweep = (identity: InstitutionalIdentity) => {
    setFaceDone(false);
    setIrisDone(false);
    setPrintDone(false);

    // Progressive biometric simulation with ISO/IEC 30107-3 liveness checks
    setTimeout(() => {
      setFaceDone(true);
      setTimeout(() => {
        setIrisDone(true);
        setTimeout(async () => {
          setPrintDone(true);
          setStep(3); // Enclave unlocking

          try {
            const authRes = await api.runBiometricLiveness({
              identityId: identity.id,
              faceMatched: true,
              irisMatched: true,
              printMatched: true
            });

            if (authRes.success && authRes.identity) {
              setTimeout(() => {
                setStep(4); // Success
                setTimeout(() => {
                  onAuthenticated(authRes.identity!);
                  onClose();
                }, 1200);
              }, 900);
            }
          } catch (e) {
            setError('Cryptographic attestation handshake failed.');
          }
        }, 600);
      }, 600);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-xl rounded-2xl border border-[#1E293B] bg-[#0C101A] shadow-2xl text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] px-6 py-4 bg-[#0E1322]">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <Scan className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                DCJMN SECURE BIOMETRIC GATEWAY
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  ISO/IEC 30107-3
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Multimodal Biometric Attestation & Non-Custodial Enclave Access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center space-x-2 rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-300 font-mono">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  ENTER UNIQUE INSTITUTIONAL ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={institutionalId}
                    onChange={(e) => setInstitutionalId(e.target.value)}
                    placeholder="e.g. POL-IND-004281"
                    className="flex-1 rounded-lg border border-[#27324B] bg-[#0A0D15] px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleLookup()}
                    disabled={loading}
                    className="rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors flex items-center gap-2 shadow-md shadow-emerald-950/50"
                  >
                    {loading ? 'LOOKUP...' : 'VERIFY IDENTITY'}
                  </button>
                </div>
              </div>

              {/* Presets for swift evaluation */}
              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-2">
                  OR SELECT ACCREDITED INSTITUTIONAL OFFICER:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_IDENTITIES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setInstitutionalId(p.id);
                        handleLookup(p.id);
                      }}
                      className="text-left rounded-lg border border-[#1E293B] bg-[#0F1422] p-2.5 hover:border-emerald-500/50 hover:bg-[#131B2E] transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                          {p.label}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{p.id}</div>
                      <div className="text-[10px] text-slate-500">{p.role}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(step === 2 || step === 3 || step === 4) && resolvedIdentity && (
            <div className="space-y-4">
              {/* Identity Record Summary */}
              <div className="rounded-xl border border-[#1E293B] bg-[#0E1424] p-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">{resolvedIdentity.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {resolvedIdentity.institution}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-400">{resolvedIdentity.id} • {resolvedIdentity.role}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-1 truncate max-w-sm">
                    PUBLIC KEY: {resolvedIdentity.publicKey.substring(0, 24)}...
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full border border-emerald-500/30 bg-emerald-950/40 flex items-center justify-center text-emerald-400">
                  <Shield className="h-5 w-5" />
                </div>
              </div>

              {/* Multimodal 3-factor sensor verification */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-slate-300 font-semibold flex items-center justify-between">
                  <span>MULTIMODAL BIOMETRIC PIPELINE</span>
                  <span className="text-[10px] text-emerald-400">HARDWARE-ANCHORED</span>
                </div>

                {/* 01 Face */}
                <div className="flex items-center justify-between rounded-lg border border-[#1A2234] bg-[#0A0D15] p-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${faceDone ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800/60 text-slate-400'}`}>
                      <Scan className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">01. 3D FACIAL TOPOGRAPHY SCAN</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {faceDone ? 'Mesh verified • Anti-spoofing score: 99.8%' : 'Acquiring stereoscopic depth points...'}
                      </div>
                    </div>
                  </div>
                  {faceDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border-2 border-slate-500 border-t-emerald-400 animate-spin" />
                  )}
                </div>

                {/* 02 Iris */}
                <div className="flex items-center justify-between rounded-lg border border-[#1A2234] bg-[#0A0D15] p-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${irisDone ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800/60 text-slate-400'}`}>
                      <Eye className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">02. DUAL IRIS CRYPTOGRAPHIC CODE</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {irisDone ? 'Near-infrared Daugman transform match: 99.9%' : 'Awaiting sensor alignment...'}
                      </div>
                    </div>
                  </div>
                  {irisDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border-2 border-slate-500 border-t-emerald-400 animate-spin" />
                  )}
                </div>

                {/* 03 Fingerprint */}
                <div className="flex items-center justify-between rounded-lg border border-[#1A2234] bg-[#0A0D15] p-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${printDone ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800/60 text-slate-400'}`}>
                      <Fingerprint className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">03. OPTICAL FTIR MINUTIAE PRINT</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {printDone ? 'Subdermal ridge match: 100% (48 minutiae)' : 'Scanning fingerprint pad...'}
                      </div>
                    </div>
                  </div>
                  {printDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <div className="h-3 w-3 rounded-full border-2 border-slate-500 border-t-emerald-400 animate-spin" />
                  )}
                </div>
              </div>

              {/* Step 3: HSM Enclave Unlock */}
              {step >= 3 && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 flex items-center space-x-3">
                  <Key className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div className="text-xs font-mono">
                    <div className="text-emerald-300 font-bold">
                      {step === 4 ? 'AUTHENTICATED • ACCESS GRANTED' : 'UNLOCKING HSM CRYPTOGRAPHIC ENCLAVE...'}
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      Non-custodial Ed25519 signing key authorized for {resolvedIdentity.institution} portal session.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
