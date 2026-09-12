import React from 'react';
import { ArrowRight, Clock, Plus, ShieldCheck, ArrowUpRight, FolderLock } from 'lucide-react';
import { CaseRecord, EvidenceItem, ForensicReport, Chargesheet, CourtOrder, InmateCustodyRecord, InstitutionType } from '../../types';
import { VerificationPill } from '../common/VerificationPill';
import { InstitutionalBadge } from '../common/InstitutionalBadge';

interface DashboardViewProps {
  institution: InstitutionType;
  cases: CaseRecord[];
  evidenceList: EvidenceItem[];
  reports: ForensicReport[];
  chargesheet?: Chargesheet;
  orders: CourtOrder[];
  inmates: InmateCustodyRecord[];
  onSelectCase: (caseId: string) => void;
  onNewFIR: () => void;
  onOpenVerificationDrawer: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  institution,
  cases,
  evidenceList,
  reports,
  chargesheet,
  orders,
  inmates,
  onSelectCase,
  onNewFIR,
  onOpenVerificationDrawer
}) => {
  // 3-4 Key Restrained Metrics per Section 7
  const activeCasesCount = cases.length > 0 ? cases.length : 1;
  const pendingForensicsCount = evidenceList.filter(e => e.currentCustodian === 'FORENSICS').length;
  const totalEvidenceCount = evidenceList.length;
  const courtOrdersCount = orders.length;

  // Recent Case Activity Feed (Section 7)
  const recentActivities = [
    {
      caseId: 'CASE-2026-00124',
      action: 'Tableau Bitstream Hash Verified (CFSL Vault #03)',
      timeAgo: '12 minutes ago',
      institution: 'FORENSICS' as InstitutionType
    },
    {
      caseId: 'CASE-2026-00124',
      action: 'High Court Bail Release Decree Issued (Justice Vance)',
      timeAgo: '38 minutes ago',
      institution: 'COURT' as InstitutionType
    },
    {
      caseId: 'CASE-2026-00124',
      action: 'Physical Exhibits Transferred from Sub-station #09',
      timeAgo: '2 hours ago',
      institution: 'POLICE' as InstitutionType
    },
    {
      caseId: 'CASE-2026-00124',
      action: 'Inmate Remand Admitted to B-Wing Cell 308-A',
      timeAgo: '4 hours ago',
      institution: 'PRISON' as InstitutionType
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto">
      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase text-slate-400">Institutional Command Center</span>
            <InstitutionalBadge institution={institution} size="xs" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 font-mono uppercase">
            Operational Overview
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Autonomous multi-jurisdiction justice operations anchored to sovereign consensus ledger.
          </p>
        </div>

        {institution === 'POLICE' && (
          <button
            type="button"
            onClick={onNewFIR}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono uppercase tracking-wider rounded font-medium transition-colors self-start"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Digital FIR</span>
          </button>
        )}
      </div>

      {/* 1. Only 3-4 Key Metrics (Section 7) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0B0F1B] border border-slate-800/80 p-5 rounded">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
            Active Cases
          </span>
          <div className="text-3xl font-semibold text-slate-100 font-mono tracking-tight">
            {activeCasesCount}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-2">
            All dockets cryptographically anchored
          </div>
        </div>

        <div className="bg-[#0B0F1B] border border-slate-800/80 p-5 rounded">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
            Pending Lab Analysis
          </span>
          <div className="text-3xl font-semibold text-teal-400 font-mono tracking-tight">
            {pendingForensicsCount || 1}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-2">
            CFSL Specimen Bitstream Queue
          </div>
        </div>

        <div className="bg-[#0B0F1B] border border-slate-800/80 p-5 rounded">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
            Registered Exhibits
          </span>
          <div className="text-3xl font-semibold text-slate-100 font-mono tracking-tight">
            {totalEvidenceCount}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-2">
            ISO/IEC 27037 chain-of-custody
          </div>
        </div>

        <div className="bg-[#0B0F1B] border border-slate-800/80 p-5 rounded">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
            Judicial Orders Decreed
          </span>
          <div className="text-3xl font-semibold text-amber-400 font-mono tracking-tight">
            {courtOrdersCount}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-2">
            Bench #04 digital attestations
          </div>
        </div>
      </div>

      {/* 2. Recent Case Activity (Section 7) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Recent Case Activity
          </h3>
          <span className="text-[11px] font-mono text-slate-500">Live Consensus Stream</span>
        </div>

        <div className="bg-[#0B0F1B] border border-slate-800/80 rounded divide-y divide-slate-800/60">
          {recentActivities.map((act, idx) => (
            <div
              key={idx}
              className="p-3.5 flex items-center justify-between hover:bg-slate-850/40 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => onSelectCase(act.caseId)}
                  className="text-xs font-mono font-medium text-slate-200 hover:text-white underline hover:no-underline"
                >
                  {act.caseId}
                </button>
                <span className="text-slate-600 text-xs">•</span>
                <span className="text-xs text-slate-300 font-sans">
                  {act.action}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <InstitutionalBadge institution={act.institution} size="xs" minimal />
                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-600" />
                  {act.timeAgo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Priority Cases Clean Table (Section 7 & 15) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Priority Cases
          </h3>
          <span className="text-[11px] font-mono text-slate-500">Active Jurisdiction</span>
        </div>

        <div className="bg-[#0B0F1B] border border-slate-800/80 rounded overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-[#080C16] text-[11px] font-mono uppercase text-slate-400">
                <th className="py-3 px-4 font-medium">Case ID</th>
                <th className="py-3 px-4 font-medium">Title / Accused</th>
                <th className="py-3 px-4 font-medium">Stage</th>
                <th className="py-3 px-4 font-medium">Station</th>
                <th className="py-3 px-4 font-medium">Integrity</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {cases.map((c) => (
                <tr
                  key={c.caseId}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  onClick={() => onSelectCase(c.caseId)}
                >
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                    {c.caseId}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200">{c.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Accused: {c.accused.name} ({c.accused.charges.join(', ')})
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {c.stage.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {c.station}
                  </td>
                  <td className="py-3.5 px-4" onClick={(e) => { e.stopPropagation(); onOpenVerificationDrawer(); }}>
                    <VerificationPill status={c.tampered ? 'TAMPERED' : 'VERIFIED'} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(c.caseId);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-mono text-slate-300 group-hover:text-white transition-colors"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
