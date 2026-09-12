import React, { useState } from 'react';
import { X, ShieldCheck, Check, Lock, ArrowRight, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { InstitutionalIdentity } from '../../types';

interface CrossAgencyAccessDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentIdentity: InstitutionalIdentity | null;
  onAccessGranted?: (details: { resource: string; reason: string }) => void;
}

export const CrossAgencyAccessDrawer: React.FC<CrossAgencyAccessDrawerProps> = ({
  isOpen,
  onClose,
  currentIdentity,
  onAccessGranted
}) => {
  const [resource, setResource] = useState('Forensic Report CFSL-REP-2026-0481 (Decrypted Partitions)');
  const [caseId, setCaseId] = useState('CASE-2026-00124');
  const [targetInstitution, setTargetInstitution] = useState<'FORENSICS' | 'COURT' | 'PRISON' | 'POLICE'>('FORENSICS');
  const [reason, setReason] = useState('Investigation Subpoena — Inter-jurisdictional evidentiary review');
  
  const [state, setState] = useState<'IDLE' | 'CHECKING' | 'GRANTED'>('IDLE');
  const [checkProgress, setCheckProgress] = useState({
    identity: false,
    role: false,
    caseAssignment: false,
    smartContract: false
  });

  if (!isOpen) return null;

  const handleExecuteRequest = () => {
    setState('CHECKING');
    setCheckProgress({ identity: false, role: false, caseAssignment: false, smartContract: false });

    setTimeout(() => {
      setCheckProgress(p => ({ ...p, identity: true }));
    }, 400);

    setTimeout(() => {
      setCheckProgress(p => ({ ...p, role: true }));
    }, 800);

    setTimeout(() => {
      setCheckProgress(p => ({ ...p, caseAssignment: true }));
    }, 1200);

    setTimeout(() => {
      setCheckProgress(p => ({ ...p, smartContract: true }));
      setState('GRANTED');
      if (onAccessGranted) {
        onAccessGranted({ resource, reason });
      }
    }, 1700);
  };

  const handleReset = () => {
    setState('IDLE');
    setCheckProgress({ identity: false, role: false, caseAssignment: false, smartContract: false });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0D111A] border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-[#0A0E17]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-blue-500/10 text-blue-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase tracking-wider">
                  Request Cross-Agency Access
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Smart Contract Authorization
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {state === 'GRANTED' ? (
              <div className="space-y-6 animate-in fade-in">
                <div className="p-5 rounded border border-emerald-500/30 bg-emerald-500/10 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-emerald-300 font-mono uppercase tracking-wider">
                    Access Granted
                  </h4>
                  <p className="text-xs text-slate-300">
                    Sovereign access token issued. Decryption keys provisioned for active session.
                  </p>
                </div>

                <div className="space-y-3 text-xs bg-[#080B11] p-4 rounded border border-slate-800 font-mono">
                  <div className="flex justify-between text-slate-400 border-b border-slate-800/60 pb-2">
                    <span>Target Resource:</span>
                    <span className="text-slate-200 truncate max-w-[200px]">{resource}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 border-b border-slate-800/60 pb-2">
                    <span>Authorized Requester:</span>
                    <span className="text-slate-200">{currentIdentity?.name || 'Inspector Kumar'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 border-b border-slate-800/60 pb-2">
                    <span>Access Contract:</span>
                    <span className="text-emerald-400">0xAccessControl_v4</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Audit Log Entry:</span>
                    <span className="text-emerald-400">✓ ANCHORED (Tx: 0x82f...a1)</span>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleReset}
                    className="text-xs font-mono text-slate-400 hover:text-slate-200 underline"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Form Fields */}
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-mono uppercase text-[11px] mb-1.5">
                      Case Reference
                    </label>
                    <input
                      type="text"
                      value={caseId}
                      onChange={(e) => setCaseId(e.target.value)}
                      disabled={state === 'CHECKING'}
                      className="w-full bg-[#080B11] border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono uppercase text-[11px] mb-1.5">
                      Resource Requested
                    </label>
                    <select
                      value={resource}
                      onChange={(e) => setResource(e.target.value)}
                      disabled={state === 'CHECKING'}
                      className="w-full bg-[#080B11] border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Forensic Report CFSL-REP-2026-0481 (Decrypted Partitions)">
                        Forensic Report CFSL-REP-2026-0481 (Decrypted Partitions)
                      </option>
                      <option value="SSD Raw Bitstream Acquisition (EVD-2026-9901)">
                        SSD Raw Bitstream Acquisition (EVD-2026-9901)
                      </option>
                      <option value="Inmate Remand Medical Record (INM-2026-00812)">
                        Inmate Remand Medical Record (INM-2026-00812)
                      </option>
                      <option value="Judicial Bench In-Camera Transcript (CASE-124)">
                        Judicial Bench In-Camera Transcript (CASE-124)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono uppercase text-[11px] mb-1.5">
                      Holding Institution
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['FORENSICS', 'COURT', 'PRISON'] as const).map((inst) => (
                        <button
                          key={inst}
                          type="button"
                          onClick={() => setTargetInstitution(inst)}
                          disabled={state === 'CHECKING'}
                          className={`py-1.5 text-[11px] font-mono rounded border transition-colors ${
                            targetInstitution === inst
                              ? 'bg-slate-800 text-white border-blue-500/80 font-semibold'
                              : 'bg-[#080B11] text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {inst}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono uppercase text-[11px] mb-1.5">
                      Requester Identity
                    </label>
                    <div className="bg-[#080B11] p-3 rounded border border-slate-800 space-y-1">
                      <div className="text-slate-200 font-medium font-sans">
                        {currentIdentity?.name || 'Inspector Kumar'}
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        {currentIdentity?.role || 'Investigation Officer'} • {currentIdentity?.institution || 'POLICE'}
                      </div>
                      <div className="text-slate-500 font-mono text-[10px]">
                        ID: {currentIdentity?.id || 'POL-IND-004281'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-mono uppercase text-[11px] mb-1.5">
                      Statutory Justification
                    </label>
                    <textarea
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      disabled={state === 'CHECKING'}
                      className="w-full bg-[#080B11] border border-slate-800 rounded px-3 py-2 text-slate-200 text-xs focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Live Security Verification Ladder */}
                <div className="border border-slate-800 rounded bg-[#0A0D15] p-4 space-y-3">
                  <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider block">
                    Security & Access Protocol Checks
                  </span>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Biometric Identity Attested</span>
                      {checkProgress.identity ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> PASSED
                        </span>
                      ) : state === 'CHECKING' ? (
                        <span className="text-blue-400 animate-pulse">VERIFYING...</span>
                      ) : (
                        <span className="text-slate-600">STANDBY</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Institutional Role Clearance</span>
                      {checkProgress.role ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> PASSED
                        </span>
                      ) : state === 'CHECKING' && checkProgress.identity ? (
                        <span className="text-blue-400 animate-pulse">VERIFYING...</span>
                      ) : (
                        <span className="text-slate-600">STANDBY</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Official Case Assignment Check</span>
                      {checkProgress.caseAssignment ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> PASSED
                        </span>
                      ) : state === 'CHECKING' && checkProgress.role ? (
                        <span className="text-blue-400 animate-pulse">VERIFYING...</span>
                      ) : (
                        <span className="text-slate-600">STANDBY</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Smart Contract Consensus Rule</span>
                      {checkProgress.smartContract ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> PASSED
                        </span>
                      ) : state === 'CHECKING' && checkProgress.caseAssignment ? (
                        <span className="text-blue-400 animate-pulse">VERIFYING...</span>
                      ) : (
                        <span className="text-slate-600">STANDBY</span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800/80 bg-[#0A0E17] flex justify-end gap-3">
            {state !== 'GRANTED' ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={state === 'CHECKING'}
                  className="px-4 py-2 text-xs font-mono uppercase text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteRequest}
                  disabled={state === 'CHECKING'}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded font-medium transition-colors flex items-center gap-2"
                >
                  {state === 'CHECKING' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Evaluating Access...</span>
                    </>
                  ) : (
                    <span>Request Access</span>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
