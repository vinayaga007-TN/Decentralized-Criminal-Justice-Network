import React, { useState, useMemo } from 'react';
import { Search, Plus, HardDrive, ArrowRight } from 'lucide-react';
import { EvidenceItem, InstitutionType } from '../../types';
import { VerificationPill } from '../common/VerificationPill';
import { InstitutionalBadge } from '../common/InstitutionalBadge';

interface EvidenceListViewProps {
  evidenceList: EvidenceItem[];
  onSelectEvidence: (evidence: EvidenceItem) => void;
  onRegisterEvidence: () => void;
  userInstitution: InstitutionType;
}

export const EvidenceListView: React.FC<EvidenceListViewProps> = ({
  evidenceList,
  onSelectEvidence,
  onRegisterEvidence,
  userInstitution
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [custodianFilter, setCustodianFilter] = useState('ALL');

  const filteredEvidence = useMemo(() => {
    return evidenceList.filter((e) => {
      const matchesSearch =
        e.evidenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.custodianOfficer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCustodian = custodianFilter === 'ALL' || e.currentCustodian === custodianFilter;
      return matchesSearch && matchesCustodian;
    });
  }, [evidenceList, searchTerm, custodianFilter]);

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 font-mono uppercase">
            Evidence Exhibits & Custody
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ISO/IEC 27037 compliant physical & digital specimen tracking with write-blocked cryptographic anchors.
          </p>
        </div>

        {userInstitution === 'POLICE' && (
          <button
            type="button"
            onClick={onRegisterEvidence}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono uppercase tracking-wider rounded font-medium transition-colors self-start"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Exhibit</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exhibits, case ID, officer..."
            className="w-full bg-[#0B0F1B] border border-slate-800 rounded px-9 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono focus:border-slate-600 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={custodianFilter}
            onChange={(e) => setCustodianFilter(e.target.value)}
            className="bg-[#0B0F1B] border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 font-mono focus:border-slate-600 focus:outline-none"
          >
            <option value="ALL">All Custodian Nodes</option>
            <option value="POLICE">Police Custody</option>
            <option value="FORENSICS">CFSL Forensics Lab</option>
            <option value="COURT">Court Safe Custody</option>
          </select>
        </div>
      </div>

      {/* Restrained Database Table */}
      <div className="bg-[#0B0F1B] border border-slate-800/80 rounded overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 bg-[#080C16] text-[11px] font-mono uppercase text-slate-400">
              <th className="py-3 px-4 font-medium">Exhibit ID</th>
              <th className="py-3 px-4 font-medium">Exhibit Title</th>
              <th className="py-3 px-4 font-medium">Type</th>
              <th className="py-3 px-4 font-medium">Case Ref</th>
              <th className="py-3 px-4 font-medium">Current Custodian</th>
              <th className="py-3 px-4 font-medium">Vault Location</th>
              <th className="py-3 px-4 font-medium">Integrity</th>
              <th className="py-3 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredEvidence.length > 0 ? (
              filteredEvidence.map((ev) => (
                <tr
                  key={ev.evidenceId}
                  onClick={() => onSelectEvidence(ev)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                    {ev.evidenceId}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-200">{ev.title}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                    {ev.type}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                    {ev.caseId}
                  </td>
                  <td className="py-3.5 px-4">
                    <InstitutionalBadge institution={ev.currentCustodian} size="xs" />
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {ev.storageLocation}
                  </td>
                  <td className="py-3.5 px-4">
                    <VerificationPill status={ev.tampered ? 'TAMPERED' : 'VERIFIED'} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-xs font-mono text-slate-400 group-hover:text-slate-200 underline">
                      Inspect
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 font-mono text-xs">
                  No exhibits found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
