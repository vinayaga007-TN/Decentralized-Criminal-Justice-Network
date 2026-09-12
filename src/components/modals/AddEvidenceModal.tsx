import React, { useState } from 'react';
import { Layers, X, PlusCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { EvidenceItem } from '../../types';

interface AddEvidenceModalProps {
  isOpen: boolean;
  caseId: string;
  onClose: () => void;
  onCreated: (evidence: EvidenceItem) => void;
}

export const AddEvidenceModal: React.FC<AddEvidenceModalProps> = ({ isOpen, caseId, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Digital Storage');
  const [description, setDescription] = useState('');
  const [storageLocation, setStorageLocation] = useState('Division Evidence Locker #04');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Title is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.registerEvidence(caseId, {
        title,
        type,
        description,
        storageLocation,
        officerName: 'Inspector Kumar'
      });

      if (res.success && res.evidence) {
        onCreated(res.evidence);
        onClose();
      } else {
        setError('Failed to anchor evidence on blockchain.');
      }
    } catch (err) {
      setError('Evidence registration transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-sky-500/40 bg-[#0C121E] shadow-2xl text-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-sky-500/30 px-6 py-4 bg-[#101828]">
          <div className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-sky-400" />
            <h3 className="text-base font-bold text-white font-sans">
              SEIZE & ANCHOR NEW EVIDENCE ITEM
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
            <label className="block text-xs font-mono text-slate-300 mb-1">EVIDENCE ITEM TITLE</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. SanDisk Extreme 1TB NVMe Drive"
              className="w-full rounded-lg border border-[#27324B] bg-[#0A0D15] px-3.5 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">EVIDENCE CATEGORY</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-[#27324B] bg-[#0A0D15] px-3 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
            >
              <option value="Digital Storage">Digital Storage</option>
              <option value="Digital Log">Digital Log</option>
              <option value="Biochemical / DNA">Biochemical / DNA</option>
              <option value="Hardware Security">Hardware Security</option>
              <option value="Physical Ballistic">Physical Ballistic</option>
              <option value="Documentary">Documentary</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">DESCRIPTION & SEIZURE CONTEXT</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide physical condition, serial numbers, extraction procedure..."
              className="w-full rounded-lg border border-[#27324B] bg-[#0A0D15] px-3.5 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">INITIAL SECURE STORAGE LOCATION</label>
            <input
              type="text"
              value={storageLocation}
              onChange={(e) => setStorageLocation(e.target.value)}
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
              {loading ? 'CALCULATING HASH...' : 'COMMIT TO EVIDENCE REGISTRY'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
