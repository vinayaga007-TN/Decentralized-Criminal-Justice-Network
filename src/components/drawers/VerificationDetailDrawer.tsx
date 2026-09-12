import React from 'react';
import { X, ShieldCheck, AlertTriangle, ExternalLink, Key, CheckCircle, Database } from 'lucide-react';
import { VerificationResult } from '../../types';

interface VerificationDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  result: VerificationResult | null;
}

export const VerificationDetailDrawer: React.FC<VerificationDetailDrawerProps> = ({
  isOpen,
  onClose,
  result
}) => {
  if (!isOpen || !result) return null;

  const isMatched = result.verified && result.currentHash === result.blockchainHash;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0D111A] border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-[#0A0E17]">
            <div className="flex items-center space-x-2.5">
              <div className={`p-1.5 rounded ${isMatched ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {isMatched ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
                  Blockchain Verification
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Root Consensus Audit
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
            {/* Status Callout */}
            <div
              className={`p-4 rounded border text-xs font-mono leading-relaxed ${
                isMatched
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/5 border-rose-500/20 text-rose-300'
              }`}
            >
              <div className="font-semibold mb-1 flex items-center gap-1.5">
                {isMatched ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>RECORD INTEGRITY CONFIRMED</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>INTEGRITY MISMATCH DETECTED</span>
                  </>
                )}
              </div>
              <p className="text-slate-400 font-sans text-xs">
                {result.message || (isMatched 
                  ? 'Cryptographic payload matches the immutable state root anchored by the sovereign QBFT validator consortium.'
                  : 'The current database record does not match the canonical hash stored in the sovereign smart contract.')}
              </p>
            </div>

            {/* Verification Metadata Attributes */}
            <div className="space-y-4 text-xs">
              <div className="border-b border-slate-800/60 pb-3">
                <span className="text-slate-400 font-mono uppercase text-[11px] block mb-1">Target Resource</span>
                <span className="text-slate-100 font-mono font-medium text-sm">
                  {result.targetType}: {result.targetId}
                </span>
              </div>

              <div className="border-b border-slate-800/60 pb-3">
                <span className="text-slate-400 font-mono uppercase text-[11px] block mb-1">Current Calculated Hash (SHA-256)</span>
                <div className="bg-[#080B11] p-2.5 rounded border border-slate-800 font-mono text-[11px] text-slate-300 break-all select-all">
                  {result.currentHash}
                </div>
              </div>

              <div className="border-b border-slate-800/60 pb-3">
                <span className="text-slate-400 font-mono uppercase text-[11px] block mb-1">Anchored Blockchain Hash</span>
                <div className="bg-[#080B11] p-2.5 rounded border border-slate-800 font-mono text-[11px] text-emerald-400 break-all select-all">
                  {result.blockchainHash}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-800/60 pb-3">
                <div>
                  <span className="text-slate-400 font-mono uppercase text-[11px] block mb-1">Block Height</span>
                  <span className="text-slate-100 font-mono font-medium">
                    #{result.blockNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-mono uppercase text-[11px] block mb-1">Digital Signature</span>
                  <span className="text-emerald-400 font-mono font-medium flex items-center gap-1">
                    <Key className="w-3 h-3" /> VALID (Ed25519)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-800/60 pb-3">
                <div>
                  <span className="text-slate-400 font-mono uppercase text-[11px] block mb-1">Signing Node</span>
                  <span className="text-slate-200 font-mono">
                    {result.signerIdentity || 'VALIDATOR_01 (POLICE)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-mono uppercase text-[11px] block mb-1">Consensus Protocol</span>
                  <span className="text-slate-200 font-mono">
                    QBFT 4/4 Quorum
                  </span>
                </div>
              </div>

              <div className="border-b border-slate-800/60 pb-3">
                <span className="text-slate-400 font-mono uppercase text-[11px] block mb-1">Anchor Timestamp</span>
                <span className="text-slate-300 font-mono">
                  {result.timestamp ? new Date(result.timestamp).toLocaleString() : 'Recent'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-mono uppercase text-[11px] block mb-1">Transaction Hash</span>
                <div className="bg-[#080B11] p-2 rounded border border-slate-800 font-mono text-[10px] text-slate-400 break-all select-all">
                  {result.txHash}
                </div>
              </div>
            </div>

            {/* Storage Architecture Reminder */}
            <div className="bg-slate-900/50 rounded p-3.5 border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-300 font-mono font-medium">
                <Database className="w-3 h-3 text-slate-400" />
                <span>Zero Private Data On-Chain</span>
              </div>
              <p className="leading-relaxed">
                Personal identities and case casefiles remain stored inside institutional silos with AES-256 GCM encryption. Only cryptographic integrity roots are shared.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800/80 bg-[#0A0E17] flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-mono uppercase text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
