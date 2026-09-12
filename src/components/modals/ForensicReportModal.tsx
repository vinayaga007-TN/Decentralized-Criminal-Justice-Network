import React, { useState } from 'react';
import { FileCheck, X, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { EvidenceItem, ForensicReport } from '../../types';

interface ForensicReportModalProps {
  isOpen: boolean;
  evidence: EvidenceItem | null;
  onClose: () => void;
  onCreated: (report: ForensicReport) => void;
}

export const ForensicReportModal: React.FC<ForensicReportModalProps> = ({
  isOpen,
  evidence,
  onClose,
  onCreated
}) => {
  const [methodology, setMethodology] = useState(
    'Sector-by-sector write-blocked bitstream acquisition using Tableau TX1 hardware, followed by SHA-256 and BLAKE3 cryptographic hash verification.'
  );
  const [findings, setFindings] = useState(
    'Hardware vault bit-level clone image 100% matched against original physical hash. Decrypted database artifacts confirm 18 spoofed state transactions injected into municipal accounts.'
  );
  const [conclusions, setConclusions] = useState(
    'Primary defendant workstation was the verifiable origin of unauthorized smart contract approvals. Tamper-evident seals intact with zero bit-level discrepancies.'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !evidence) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.submitForensicReport({
        caseId: evidence.caseId,
        evidenceId: evidence.evidenceId,
        methodology,
        findings,
        conclusions,
        examinerName: 'Dr. Elena Rostova',
        examinerId: 'CFSL-DIR-881'
      });

      if (res.success && res.report) {
        onCreated(res.report);
        onClose();
      } else {
        setError('Failed to anchor forensic report on blockchain.');
      }
    } catch (err) {
      setError('Forensic report registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-xl rounded-2xl border border-purple-500/40 bg-[#120E22] shadow-2xl text-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-purple-500/30 px-6 py-4 bg-[#18112C]">
          <div className="flex items-center space-x-2">
            <FileCheck className="h-5 w-5 text-purple-400" />
            <h3 className="text-base font-bold text-white font-sans">
              CERTIFY FORENSIC ANALYSIS REPORT
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
            <div className="text-slate-500 text-[10px]">ANALYZING EXHIBIT:</div>
            <div className="text-white font-bold">{evidence.evidenceId} • {evidence.title}</div>
            <div className="text-purple-300 truncate">VERIFIED HASH: {evidence.sha256Hash}</div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">SCIENTIFIC METHODOLOGY</label>
            <textarea
              rows={2}
              value={methodology}
              onChange={(e) => setMethodology(e.target.value)}
              className="w-full rounded-lg border border-[#27324B] bg-[#0A0D15] px-3.5 py-2 text-xs font-mono text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">TECHNICAL LABORATORY FINDINGS</label>
            <textarea
              rows={3}
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              className="w-full rounded-lg border border-[#27324B] bg-[#0A0D15] px-3.5 py-2 text-xs font-mono text-white focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">EXPERT OPINION & CONCLUSIONS</label>
            <textarea
              rows={2}
              value={conclusions}
              onChange={(e) => setConclusions(e.target.value)}
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
              className="rounded-lg bg-purple-600 px-5 py-2 text-xs font-bold font-mono text-white hover:bg-purple-500 shadow-md shadow-purple-950/50"
            >
              {loading ? 'DIGITALLY SEALING...' : 'DIGITALLY SEAL & ANCHOR REPORT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
