import React, { useState } from 'react';
import { ArrowRight, X, Shield, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { EvidenceItem } from '../../types';

interface TransferEvidenceModalProps {
  isOpen: boolean;
  evidence: EvidenceItem | null;
  onClose: () => void;
  onTransferred: (evidence: EvidenceItem) => void;
}

export const TransferEvidenceModal: React.FC<TransferEvidenceModalProps> = ({
  isOpen,
  evidence,
  onClose,
  onTransferred
}) => {
  const [toInstitution, setToInstitution] = useState<'FORENSICS' | 'COURT' | 'POLICE'>('FORENSICS');
  const [reason, setReason] = useState('Expedited write-block forensic analysis on hardware partition');
  const [officerName, setOfficerName] = useState('Inspector Kumar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !evidence) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.transferEvidence(evidence.evidenceId, {
        toInstitution,
        reason,
        officerName
      });

      if (res.success && res.evidence) {
        onTransferred(res.evidence);
        onClose();
      } else {
        setError('Custody transfer rejected by smart contract.');
      }
    } catch (err) {
      setError('Blockchain transaction dispatch failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-purple-500/40 bg-[#120E22] shadow-2xl text-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-purple-500/30 px-6 py-4 bg-[#18112C]">
          <div className="flex items-center space-x-2">
            <ArrowRight className="h-5 w-5 text-purple-400" />
            <h3 className="text-base font-bold text-white font-sans">
              TRANSFER CHAIN-OF-CUSTODY
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 rounded-lg bg-red-950/40 border border-red-500/40 p-3 text-xs text-red-300 font-mono">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-lg bg-[#0C0916] border border-[#241C38] p-3 text-xs font-mono space-y-1">
            <div className="text-slate-500 text-[10px]">SELECTED EVIDENCE ARTIFACT:</div>
            <div className="text-white font-bold">{evidence.evidenceId} • {evidence.title}</div>
            <div className="text-slate-400 truncate">SHA-256: {evidence.sha256Hash}</div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">TARGET RECIPIENT INSTITUTION</label>
            <select
              value={toInstitution}
              onChange={(e: any) => setToInstitution(e.target.value)}
              className="w-full rounded-lg border border-[#27324B] bg-[#0A0D15] px-3 py-2 text-xs font-mono text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="FORENSICS">Central Forensic Science Lab (CFSL Node #03)</option>
              <option value="COURT">High Court Evidence Vault (Bench Node #04)</option>
              <option value="POLICE">Police Division Locker (Node #01)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">CUSTODY TRANSFER REASON / SUBPOENA REF</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-[#27324B] bg-[#0A0D15] px-3.5 py-2 text-xs font-mono text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-mono text-slate-400 hover:bg-slate-800"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-purple-600 px-5 py-2 text-xs font-bold font-mono text-white hover:bg-purple-500 shadow-md shadow-purple-950/50 flex items-center gap-1.5"
            >
              {loading ? 'MINING TRANSFER TX...' : 'EXECUTE HANDOVER ON CHAIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
