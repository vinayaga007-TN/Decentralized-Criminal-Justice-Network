import React from 'react';
import {
  Shield,
  Scale,
  FlaskConical,
  Building2,
  FileCheck2,
  Gavel,
  CheckCircle2,
  HardDrive,
  Users,
  Radio,
  Plus,
  ArrowRight,
  Clock,
  Key
} from 'lucide-react';
import {
  CaseRecord,
  EvidenceItem,
  ForensicReport,
  Chargesheet,
  CourtOrder,
  InmateCustodyRecord,
  InstitutionType
} from '../../types';
import { InstitutionalBadge } from '../common/InstitutionalBadge';
import { VerificationPill } from '../common/VerificationPill';

interface DepartmentWorkflowViewProps {
  institution: InstitutionType;
  caseRecord: CaseRecord;
  evidenceList: EvidenceItem[];
  reports: ForensicReport[];
  chargesheet?: Chargesheet;
  orders: CourtOrder[];
  inmates: InmateCustodyRecord[];
  onSelectEvidence: (evidence: EvidenceItem) => void;
  onOpenReportModal: (evidence: EvidenceItem) => void;
  onOpenIssueCourtOrder: () => void;
  onOpenSubmitChargesheet: () => void;
  onExecuteBailRelease: (inmateId: string) => void;
  onSelectCase: (caseId: string) => void;
}

export const DepartmentWorkflowView: React.FC<DepartmentWorkflowViewProps> = ({
  institution,
  caseRecord,
  evidenceList,
  reports,
  chargesheet,
  orders,
  inmates,
  onSelectEvidence,
  onOpenReportModal,
  onOpenIssueCourtOrder,
  onOpenSubmitChargesheet,
  onExecuteBailRelease,
  onSelectCase
}) => {
  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto">
      {/* Institution Specific Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase text-slate-400">Institutional Operational Workflow</span>
            <InstitutionalBadge institution={institution} size="xs" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 font-mono uppercase">
            {institution === 'POLICE' && 'Investigation & Prosecution Pipeline'}
            {institution === 'FORENSICS' && 'CFSL Laboratory Analysis Workbench'}
            {institution === 'COURT' && 'Judicial Bench Hearings & Decrees'}
            {institution === 'PRISON' && 'Correctional Custody & Smart Bail Matrix'}
          </h2>
        </div>
      </div>

      {/* 1. POLICE WORKFLOW */}
      {institution === 'POLICE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Active Investigation Milestones */}
            <div className="bg-[#0B0F1B] border border-slate-800/80 rounded p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  Field Investigation Milestones
                </h3>
                <span className="text-xs font-mono text-blue-400">Station #POL-MC-09</span>
              </div>
              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded bg-[#080B11] border border-slate-800/80">
                  <div className="text-slate-200 font-medium">Digital FIR #CASE-2026-00124</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Suspect seized with encrypted SSD and vouchers.</div>
                  <div className="text-[10px] text-emerald-400 mt-2">✓ FIR Anchored on-chain</div>
                </div>
                <div className="p-3 rounded bg-[#080B11] border border-slate-800/80">
                  <div className="text-slate-200 font-medium">Exhibits Seized & Verified</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{evidenceList.length} total physical and digital items sealed.</div>
                  <div className="text-[10px] text-emerald-400 mt-2">✓ EvidenceRegistry Anchor Active</div>
                </div>
              </div>
            </div>

            {/* Formal Prosecution Chargesheet Status */}
            <div className="bg-[#0B0F1B] border border-slate-800/80 rounded p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  Prosecution Chargesheet
                </h3>
                {chargesheet && <VerificationPill status={chargesheet.tampered ? 'TAMPERED' : 'VERIFIED'} />}
              </div>

              {chargesheet ? (
                <div className="space-y-3 text-xs font-mono">
                  <div className="text-slate-200 font-medium">{chargesheet.chargesheetId}</div>
                  <div className="text-slate-400 font-sans text-xs line-clamp-3">
                    {chargesheet.summary}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Prosecutor: {chargesheet.leadProsecutor} • Sections: {chargesheet.sectionsApplied.join(', ')}
                  </div>
                  <div className="text-[10px] text-emerald-400 pt-1">
                    ✓ Formally Admitted to Sovereign Court Bench #04
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <p className="text-xs text-slate-500 font-mono">
                    No chargesheet submitted for the active case yet.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenSubmitChargesheet}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-mono uppercase"
                  >
                    Draft Chargesheet Docket
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. FORENSICS WORKFLOW */}
      {institution === 'FORENSICS' && (
        <div className="space-y-6">
          <div className="bg-[#0B0F1B] border border-slate-800/80 rounded p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase">
                  CFSL Evidence Analysis Queue
                </h3>
                <p className="text-xs text-slate-400">
                  Write-blocked bitstream acquisition & cryptographic report attestation
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-800/60">
              {evidenceList.map((ev) => (
                <div key={ev.evidenceId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-slate-200 text-xs">{ev.evidenceId}</span>
                      <span className="text-xs text-slate-400 font-medium">{ev.title}</span>
                      <InstitutionalBadge institution={ev.currentCustodian} size="xs" />
                    </div>
                    <div className="text-xs text-slate-400 font-mono truncate max-w-lg">
                      Hash: {ev.sha256Hash}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onSelectEvidence(ev)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-mono"
                    >
                      Audit Trail
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenReportModal(ev)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-mono font-medium"
                    >
                      Attach CFSL Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. COURT WORKFLOW */}
      {institution === 'COURT' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase">
                High Court Sovereign Bench #04 Decrees
              </h3>
              <p className="text-xs text-slate-400">
                Judicial remand, forensic subpoenas, and smart bail releases
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenIssueCourtOrder}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-mono uppercase"
            >
              Issue Judicial Decree
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((ord) => (
              <div key={ord.orderId} className="bg-[#0B0F1B] border border-slate-800/80 rounded p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-400">{ord.orderId}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                    {ord.type}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-sans leading-relaxed">
                  {ord.details}
                </div>
                {ord.stipulations && (
                  <div className="text-[11px] text-slate-400 font-mono space-y-1">
                    {ord.stipulations.map((stip, i) => (
                      <div key={i}>• {stip}</div>
                    ))}
                  </div>
                )}
                <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/60 flex justify-between">
                  <span>Presiding: {ord.issuingJudge}</span>
                  <span>{new Date(ord.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PRISON WORKFLOW */}
      {institution === 'PRISON' && (
        <div className="space-y-6">
          <div className="bg-[#0B0F1B] border border-slate-800/80 rounded p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase">
                  Central Correctional Facility Inmate Custody
                </h3>
                <p className="text-xs text-slate-400">
                  Remand admissions, quarantine clearance, and automated smart bail execution
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-800/60">
              {inmates.map((inm) => {
                const hasBailOrder = orders.some(o => o.type === 'BAIL_RELEASE');
                return (
                  <div key={inm.inmateId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-slate-200 text-xs">{inm.inmateId}</span>
                        <span className="text-xs font-semibold text-slate-100">{inm.fullName}</span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[10px] font-mono">
                          {inm.custodyStatus}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        Ward/Cell: {inm.wardAndCell} • Classification: {inm.securityClassification}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Toxicology: {inm.bloodScreening} • Quarantine Cleared: {inm.quarantineCleared ? 'YES' : 'PENDING'}
                      </div>
                    </div>

                    <div>
                      {inm.custodyStatus !== 'BAIL_RELEASED' && hasBailOrder ? (
                        <button
                          type="button"
                          onClick={() => onExecuteBailRelease(inm.inmateId)}
                          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-mono uppercase font-semibold transition-colors"
                        >
                          Execute Smart Bail Release
                        </button>
                      ) : inm.custodyStatus === 'BAIL_RELEASED' ? (
                        <span className="px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-xs">
                          ✓ Bail Released (RFID Active)
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-slate-500">
                          Remand Detention Active
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
