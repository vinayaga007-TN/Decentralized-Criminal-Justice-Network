import React, { useState } from 'react';
import { Shield, X, PlusCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { CaseRecord } from '../../types';

interface NewFIRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newCase: CaseRecord) => void;
}

export const NewFIRModal: React.FC<NewFIRModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [incidentDetails, setIncidentDetails] = useState('');
  const [complainant, setComplainant] = useState('');
  const [accusedName, setAccusedName] = useState('');
  const [accusedAge, setAccusedAge] = useState(30);
  const [charges, setCharges] = useState('Sec. 420 (Fraud), Sec. 120-B (Conspiracy)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !incidentDetails) {
      setError('Title and Incident Details are required.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.createCase({
        title,
        incidentDetails,
        complainant: complainant || 'Citizen Complainant',
        accusedName: accusedName || 'Suspect Undisclosed',
        accusedAge: Number(accusedAge) || 30,
        charges: charges.split(',').map((c) => c.trim())
      });

      if (res.success && res.case) {
        onCreated(res.case);
        onClose();
      } else {
        setError('Failed to anchor FIR on DCJMN CaseRegistry.');
      }
    } catch (err: any) {
      setError('Blockchain transaction dispatch failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-sky-500/40 bg-[#0C121E] shadow-2xl text-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-sky-500/30 px-6 py-4 bg-[#101828]">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-sky-400" />
            <h3 className="text-base font-bold text-white font-sans">
              REGISTER NEW FIRST INFORMATION REPORT (FIR)
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

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">CASE TITLE</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. State vs. Cyber Breach Suspects"
              className="w-full rounded-lg border border-[#27324B] bg-[#0A0D15] px-3.5 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">FIR INCIDENT DETAILS</label>
            <textarea
              required
              rows={3}
              value={incidentDetails}
              onChange={(e) => setIncidentDetails(e.target.value)}
              placeholder="Provide objective facts of incident, location, seized objects..."
              className="w-full rounded-lg border border-[#27324B] bg-[#0A0D15] px-3.5 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">ACCUSED NAME</label>
              <input
                type="text"
                value={accusedName}
                onChange={(e) => setAccusedName(e.target.value)}
                placeholder="Ravi Kiran Sharma"
                className="w-full rounded-lg border border-[#27324B] bg-[#0A0D15] px-3 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">AGE</label>
              <input
                type="number"
                value={accusedAge}
                onChange={(e) => setAccusedAge(Number(e.target.value))}
                className="w-full rounded-lg border border-[#27324B] bg-[#0A0D15] px-3 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">INDICTED STATUTORY CHARGES (COMMA SEPARATED)</label>
            <input
              type="text"
              value={charges}
              onChange={(e) => setCharges(e.target.value)}
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
              {loading ? 'MINING BLOCK...' : 'ANCHOR FIR ON LEDGER'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
