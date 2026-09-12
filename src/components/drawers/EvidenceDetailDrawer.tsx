import React from 'react';
import { X, ArrowRight, ShieldCheck, HardDrive, FileText, ArrowDown, MapPin, User, Hash, Lock } from 'lucide-react';
import { EvidenceItem } from '../../types';
import { InstitutionalBadge } from '../common/InstitutionalBadge';
import { VerificationPill } from '../common/VerificationPill';

interface EvidenceDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: EvidenceItem | null;
  onTransferClick?: (evidence: EvidenceItem) => void;
  onAnalyzeClick?: (evidence: EvidenceItem) => void;
  userInstitution?: string;
}

export const EvidenceDetailDrawer: React.FC<EvidenceDetailDrawerProps> = ({
  isOpen,
  onClose,
  evidence,
  onTransferClick,
  onAnalyzeClick,
  userInstitution
}) => {
  if (!isOpen || !evidence) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0D111A] border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-[#0A0E17]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-slate-400">EXHIBIT SPECIMEN</span>
                <VerificationPill status={evidence.tampered ? 'TAMPERED' : 'VERIFIED'} size="sm" />
              </div>
              <h3 className="text-base font-semibold text-slate-100 tracking-tight">
                {evidence.evidenceId}
              </h3>
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
            {/* Title & Description */}
            <div>
              <h4 className="text-sm font-semibold text-slate-200 mb-1.5">
                {evidence.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {evidence.description}
              </p>
            </div>

            {/* Specimen Key Metadata */}
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400 font-mono uppercase text-[11px]">Exhibit Type</span>
                <span className="text-slate-200 font-medium font-sans">
                  {evidence.type}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400 font-mono uppercase text-[11px]">Associated Case</span>
                <span className="text-slate-200 font-mono font-medium">
                  {evidence.caseId}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400 font-mono uppercase text-[11px]">Current Custodian</span>
                <InstitutionalBadge institution={evidence.currentCustodian} size="xs" />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400 font-mono uppercase text-[11px]">Custodian Officer</span>
                <span className="text-slate-300 font-medium">
                  {evidence.custodianOfficer}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400 font-mono uppercase text-[11px]">Storage Vault</span>
                <span className="text-slate-300 font-mono text-[11px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {evidence.storageLocation}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400 font-mono uppercase text-[11px]">Seizure Date</span>
                <span className="text-slate-300 font-mono text-[11px]">
                  {new Date(evidence.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Cryptographic SHA-256 Fingerprint */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono uppercase text-slate-400">Cryptographic Hash (SHA-256)</span>
                <span className="text-[10px] font-mono text-emerald-400">Immutable Bitstream Root</span>
              </div>
              <div className="p-2.5 rounded bg-[#080B11] border border-slate-800 text-[11px] font-mono text-slate-300 break-all select-all">
                {evidence.sha256Hash}
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Block #{evidence.blockNumber}</span>
                <span>Tx: {evidence.txHash.slice(0, 16)}...</span>
              </div>
            </div>

            {/* Chain of Custody Ladder (Section 16: Police ↓ Forensics ↓ Court) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase text-slate-300 tracking-wider">
                  Chain of Custody Ladder
                </span>
                <span className="text-[10px] font-mono text-slate-500">ISO/IEC 27037 Standard</span>
              </div>

              <div className="space-y-3 relative pl-4 border-l border-slate-800">
                {/* Initial seizure */}
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-[#0D111A]" />
                  <div className="text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">Physical Seizure & Sealing</span>
                      <span className="text-[10px] font-mono text-slate-400">POLICE</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Specimen sealed with tamper-evident cryptographic barcode.
                    </p>
                    <span className="text-[10px] font-mono text-slate-400 block mt-1">
                      {new Date(evidence.timestamp).toLocaleDateString()} • {evidence.custodianOfficer}
                    </span>
                  </div>
                </div>

                {/* Transfers */}
                {evidence.transferHistory && evidence.transferHistory.length > 0 ? (
                  evidence.transferHistory.map((th, idx) => (
                    <div key={idx} className="relative pt-2">
                      <div className="absolute -left-[21px] top-3 w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-[#0D111A]" />
                      <div className="text-xs bg-[#090C14] p-2.5 rounded border border-slate-800/80">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-200 flex items-center gap-1.5">
                            <span>{th.from}</span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                            <span className="text-teal-400">{th.to}</span>
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400">VERIFIED</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mb-1.5">
                          {th.reason}
                        </p>
                        <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                          <span>Officer: {th.officer}</span>
                          <span>{new Date(th.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-slate-500 italic pt-1">
                    No cross-institution custody transfers logged yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-800/80 bg-[#0A0E17] flex items-center justify-between gap-3">
            {onTransferClick && (
              <button
                onClick={() => onTransferClick(evidence)}
                className="flex-1 px-3 py-2 text-xs font-mono uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
              >
                Transfer Custody
              </button>
            )}
            {onAnalyzeClick && userInstitution === 'FORENSICS' && (
              <button
                onClick={() => onAnalyzeClick(evidence)}
                className="flex-1 px-3 py-2 text-xs font-mono uppercase tracking-wider bg-teal-600 hover:bg-teal-500 text-white rounded font-medium transition-colors"
              >
                Attach Lab Report
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono uppercase text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
