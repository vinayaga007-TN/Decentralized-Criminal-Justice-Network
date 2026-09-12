import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, ArrowRight, FolderLock } from 'lucide-react';
import { CaseRecord, InstitutionType } from '../../types';
import { VerificationPill } from '../common/VerificationPill';

interface CasesListViewProps {
  cases: CaseRecord[];
  onSelectCase: (caseId: string) => void;
  onNewFIR: () => void;
  userInstitution: InstitutionType;
}

export const CasesListView: React.FC<CasesListViewProps> = ({
  cases,
  onSelectCase,
  onNewFIR,
  userInstitution
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.accused.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.station.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStage = stageFilter === 'ALL' || c.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [cases, searchTerm, stageFilter]);

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 font-mono uppercase">
            Case Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Canonical criminal records anchored across independent sovereign justice nodes.
          </p>
        </div>

        {userInstitution === 'POLICE' && (
          <button
            type="button"
            onClick={onNewFIR}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono uppercase tracking-wider rounded font-medium transition-colors self-start"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New FIR Inception</span>
          </button>
        )}
      </div>

      {/* Filter Bar (Restrained, Section 15) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Case ID, accused, station..."
            className="w-full bg-[#0B0F1B] border border-slate-800 rounded px-9 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono focus:border-slate-600 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-[#0B0F1B] border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 font-mono focus:border-slate-600 focus:outline-none"
          >
            <option value="ALL">All Lifecycle Stages</option>
            <option value="FIR_REGISTERED">FIR Registered</option>
            <option value="INVESTIGATION_ACTIVE">Investigation Active</option>
            <option value="FORENSIC_ANALYSIS_COMPLETED">Forensic Analysis Completed</option>
            <option value="CHARGESHEET_SUBMITTED">Chargesheet Submitted</option>
            <option value="PRISON_CUSTODY_CREATED">Prison Remand Custody</option>
            <option value="BAIL_RELEASED">Bail Released</option>
          </select>
        </div>
      </div>

      {/* 15. Restrained Database Table */}
      <div className="bg-[#0B0F1B] border border-slate-800/80 rounded overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 bg-[#080C16] text-[11px] font-mono uppercase text-slate-400">
              <th className="py-3 px-4 font-medium">Case ID</th>
              <th className="py-3 px-4 font-medium">Title</th>
              <th className="py-3 px-4 font-medium">Accused</th>
              <th className="py-3 px-4 font-medium">Stage</th>
              <th className="py-3 px-4 font-medium">Station</th>
              <th className="py-3 px-4 font-medium">Integrity</th>
              <th className="py-3 px-4 font-medium text-right">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredCases.length > 0 ? (
              filteredCases.map((c) => (
                <tr
                  key={c.caseId}
                  onClick={() => onSelectCase(c.caseId)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                    {c.caseId}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-200">{c.title}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                    {c.accused.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {c.stage.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {c.station}
                  </td>
                  <td className="py-3.5 px-4">
                    <VerificationPill status={c.tampered ? 'TAMPERED' : 'VERIFIED'} />
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400 text-[11px]">
                    {new Date(c.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                  No cases found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
