import React from 'react';
import { ShieldAlert, Lock, ArrowRight, X, KeyRound, Sparkles } from 'lucide-react';
import { InstitutionalIdentity, InstitutionType } from '../../types';

interface AccessRestrictedModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPortal: InstitutionType;
  currentIdentity: InstitutionalIdentity | null;
  onAuthenticateForTarget: (institution: InstitutionType) => void;
  onSwitchDemoMode: (institution: InstitutionType) => void;
}

export const AccessRestrictedModal: React.FC<AccessRestrictedModalProps> = ({
  isOpen,
  onClose,
  targetPortal,
  currentIdentity,
  onAuthenticateForTarget,
  onSwitchDemoMode
}) => {
  if (!isOpen) return null;

  const getPortalLabel = (inst: InstitutionType) => {
    switch (inst) {
      case 'POLICE': return 'Police Investigation Portal';
      case 'FORENSICS': return 'Forensics Laboratory Portal';
      case 'COURT': return 'High Court Judicial Portal';
      case 'PRISON': return 'Correctional Custody Portal';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded border border-rose-800/80 bg-[#0B0F1B] shadow-2xl text-slate-200 overflow-hidden font-mono">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-900/60 px-6 py-4 bg-[#110A0E]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-rose-300">
                Access Restricted
              </div>
              <div className="text-[10px] text-slate-400">
                DCJMN Smart Contract RBAC Enforcer
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          <div className="p-3.5 rounded bg-rose-950/30 border border-rose-900/50 space-y-2 text-rose-200 leading-relaxed font-sans">
            <p className="font-semibold text-rose-100 text-xs">
              Your institutional identity is not authorized to enter the {getPortalLabel(targetPortal)}.
            </p>
            <p className="text-xs text-rose-300/90 font-mono">
              Identity: <span className="text-white font-bold">{currentIdentity?.id || 'UNKNOWN'}</span> ({currentIdentity?.role} at <span className="text-white font-bold">{currentIdentity?.institution}</span>)
            </p>
            <p className="text-[11px] text-slate-400">
              Under DCJMN Sovereign Federation rules, judicial identities cannot access police investigation databases or modify custody records without cross-agency biometric authorization or active departmental credentials.
            </p>
          </div>

          <div className="space-y-3 pt-1 font-sans">
            <div className="text-slate-400 text-[11px]">
              How would you like to proceed?
            </div>

            {/* Option 1: Biometric Login */}
            <button
              type="button"
              onClick={() => onAuthenticateForTarget(targetPortal)}
              className="w-full flex items-center justify-between p-3 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-100 group-hover:text-blue-300">
                    Authenticate as {targetPortal} Officer
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Run 4-stage biometric sweep with verified {targetPortal} credentials
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-200" />
            </button>

            {/* Option 2: Demo Mode Switch */}
            <button
              type="button"
              onClick={() => onSwitchDemoMode(targetPortal)}
              className="w-full flex items-center justify-between p-3 rounded bg-amber-950/20 hover:bg-amber-950/30 border border-amber-800/60 transition-colors text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-amber-200 group-hover:text-amber-100">
                    Switch via Demo Mode (Evaluation)
                  </div>
                  <div className="text-[10px] text-amber-400/70 font-mono">
                    Instantly load simulated {targetPortal} demo identity and permissions
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-500 group-hover:text-amber-300" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#080B14] border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
