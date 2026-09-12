import React, { useState } from 'react';
import { Gavel, X, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { CourtOrder } from '../../types';

interface IssueCourtOrderModalProps {
  isOpen: boolean;
  caseId: string;
  defaultType?: 'WARRANT' | 'REMAND' | 'FORENSIC_SUBPOENA' | 'JUDGMENT_CONVICTION' | 'BAIL_RELEASE';
  onClose: () => void;
  onIssued: (order: CourtOrder) => void;
}

export const IssueCourtOrderModal: React.FC<IssueCourtOrderModalProps> = ({
  isOpen,
  caseId,
  defaultType = 'BAIL_RELEASE',
  onClose,
  onIssued
}) => {
  const [orderType, setOrderType] = useState<any>(defaultType);
  const [judge, setJudge] = useState('Hon. Justice Sarah Vance');
  const [details, setDetails] = useState(
    'Accused is admitted to pre-trial conditional release under strict surety bond, mandatory passport impoundment, and 24/7 active geo-fenced electronic monitoring.'
  );
  const [stipulations, setStipulations] = useState(
    'Surety Escrow Deposit of $50,000 USD confirmed\nRFID Ankle Geo-Tag 24/7 activated (Device #GEO-89)\nPassport Surrendered to High Court Vault 04\nBi-weekly physical check-in at Police Metro Node #01'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.issueCourtOrder({
        caseId,
        type: orderType,
        details,
        stipulations: stipulations.split('\n').filter((s) => s.trim().length > 0),
        judgeId: judge
      });

      if (res.success && res.order) {
        onIssued(res.order);
        onClose();
      } else {
        setError('Judicial order rejected by consensus.');
      }
    } catch (err) {
      setError('Blockchain transaction dispatch failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/40 bg-[#141009] shadow-2xl text-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-amber-500/30 px-6 py-4 bg-[#1C160B]">
          <div className="flex items-center space-x-2">
            <Gavel className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-bold text-white font-sans">
              ISSUE IMMUTABLE JUDICIAL ORDER
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
            <label className="block text-xs font-mono text-slate-300 mb-1">ORDER CLASSIFICATION</label>
            <select
              value={orderType}
              onChange={(e: any) => {
                setOrderType(e.target.value);
                if (e.target.value === 'REMAND') {
                  setDetails('Accused remanded to Central Correctional Facility for 14 calendar days pending final forensic analysis submission.');
                  setStipulations('Max-Sec classification detention\nMedical and toxicology screening mandated\nNext hearing scheduled for March 26, 2026');
                } else if (e.target.value === 'BAIL_RELEASE') {
                  setDetails('Accused is admitted to pre-trial conditional release under strict surety bond, mandatory passport impoundment, and 24/7 active geo-fenced electronic monitoring.');
                  setStipulations('Surety Escrow Deposit of $50,000 USD confirmed\nRFID Ankle Geo-Tag 24/7 activated (Device #GEO-89)\nPassport Surrendered to High Court Vault 04\nBi-weekly physical check-in at Police Metro Node #01');
                }
              }}
              className="w-full rounded-lg border border-[#382B14] bg-[#0E0C07] px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="BAIL_RELEASE">BAIL DECREE (Pre-Trial Conditional Release)</option>
              <option value="REMAND">JUDICIAL REMAND (Custodial Detention to Prison)</option>
              <option value="FORENSIC_SUBPOENA">EVIDENTIARY SUBPOENA (Forensics Mandate)</option>
              <option value="WARRANT">ARREST / SEARCH WARRANT</option>
              <option value="JUDGMENT_CONVICTION">FINAL JUDICIAL CONVICTION & SENTENCING</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">PRESIDING JUDGE & BENCH</label>
            <input
              type="text"
              value={judge}
              onChange={(e) => setJudge(e.target.value)}
              className="w-full rounded-lg border border-[#382B14] bg-[#0E0C07] px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">JUDICIAL DECREE DETAILS</label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full rounded-lg border border-[#382B14] bg-[#0E0C07] px-3.5 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">
              CONDITIONS & STIPULATIONS (ONE PER LINE)
            </label>
            <textarea
              rows={3}
              value={stipulations}
              onChange={(e) => setStipulations(e.target.value)}
              className="w-full rounded-lg border border-[#382B14] bg-[#0E0C07] px-3.5 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
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
              className="rounded-lg bg-amber-600 px-5 py-2 text-xs font-bold font-mono text-white hover:bg-amber-500 shadow-md shadow-amber-950/50"
            >
              {loading ? 'SEALING ORDER...' : 'CRYPTOGRAPHICALLY SEAL & DECREE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
