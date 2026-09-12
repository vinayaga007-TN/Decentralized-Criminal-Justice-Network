import React, { useState } from 'react';
import { Send, X, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Chargesheet } from '../../types';

interface SubmitChargesheetModalProps {
  isOpen: boolean;
  caseId: string;
  onClose: () => void;
  onSubmitted: (chargesheet: Chargesheet) => void;
}

export const SubmitChargesheetModal: React.FC<SubmitChargesheetModalProps> = ({
  isOpen,
  caseId,
  onClose,
  onSubmitted
}) => {
  const [leadProsecutor, setLeadProsecutor] = useState('Adv. Jennifer Holt');
  const [prosecutorBarId, setProsecutorBarId] = useState('BAR-#48910');
  const [sections, setSections] = useState('Sec. 420 (Cheating), Sec. 467 (Forgery), Sec. 471 (Counterfeit Securities), Sec. 120-B (Criminal Conspiracy)');
  const [summary, setSummary] = useState(
    'Prosecution submits comprehensive evidentiary bundle comprising 14 encrypted forensic memory dumps, 3 certified CFSL laboratory attestations, and witness testimonies. All artifacts are verified on Root Block #48,192,842.'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.submitChargesheet(caseId, {
        leadProsecutor,
        prosecutorBarId,
        sectionsApplied: sections.split(',').map((s) => s.trim()),
        summary
      });

      if (res.success && res.chargesheet) {
        onSubmitted(res.chargesheet);
        onClose();
      } else {
        setError('Failed to docket chargesheet on CaseRegistry.');
      }
    } catch (err) {
      setError('Chargesheet blockchain transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-sky-500/40 bg-[#0C121E] shadow-2xl text-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-sky-500/30 px-6 py-4 bg-[#101828]">
          <div className="flex items-center space-x-2">
            <Send className="h-5 w-5 text-sky-400" />
            <h3 className="text-base font-bold text-white font-sans">
              SUBMIT PROSECUTION CHARGESHEET TO COURT
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">LEAD PROSECUTOR</label>
              <input
                type="text"
                value={leadProsecutor}
                onChange={(e) => setLeadProsecutor(e.target.value)}
                className="w-full rounded-lg border border-[#27324B] bg-[#0A0D15] px-3 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">BAR ACCREDITATION ID</label>
              <input
                type="text"
                value={prosecutorBarId}
                onChange={(e) => setProsecutorBarId(e.target.value)}
                className="w-full rounded-lg border border-[#27324B] bg-[#0A0D15] px-3 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">INDICTED STATUTORY SECTIONS</label>
            <input
              type="text"
              value={sections}
              onChange={(e) => setSections(e.target.value)}
              className="w-full rounded-lg border border-[#27324B] bg-[#0A0D15] px-3.5 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">CHARGESHEET SUMMARY & EVIDENCE MATRIX</label>
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-lg border border-[#27324B] bg-[#0A0D15] px-3.5 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
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
              className="rounded-lg bg-sky-600 px-5 py-2 text-xs font-bold font-mono text-white hover:bg-sky-500 shadow-md shadow-sky-950/50"
            >
              {loading ? 'DOCKETING TO COURT...' : 'FILE CHARGESHEET ON CHAIN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
