import React, { useState } from 'react';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Gavel,
  Shield,
  Layers,
  Database,
  Lock,
  ChevronRight,
  ExternalLink,
  Clock
} from 'lucide-react';
import { CaseRecord, EvidenceItem, ForensicReport, Chargesheet, CourtOrder, VerificationResult } from '../types';

interface CourtPortalProps {
  caseRecord: CaseRecord;
  evidenceList: EvidenceItem[];
  reports: ForensicReport[];
  chargesheet?: Chargesheet;
  orders: CourtOrder[];
  integrity: VerificationResult;
  onIssueCourtOrder: (type: 'WARRANT' | 'REMAND' | 'FORENSIC_SUBPOENA' | 'JUDGMENT_CONVICTION' | 'BAIL_RELEASE') => void;
  onTamperDemo: () => void;
}

export const CourtPortal: React.FC<CourtPortalProps> = ({
  caseRecord,
  evidenceList,
  reports,
  chargesheet,
  orders,
  integrity,
  onIssueCourtOrder,
  onTamperDemo
}) => {
  const [activeTab, setActiveTab] = useState<'PROOFS' | 'ORDERS' | 'DOCKET'>('PROOFS');

  return (
    <div className="space-y-6">
      {/* Judicial Node Header */}
      <div className="flex flex-wrap items-center justify-between rounded-xl border border-amber-500/30 bg-[#161208] p-4 text-slate-200">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white font-sans">
                HIGH COURT SOVEREIGN BENCH #04
              </h2>
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-400 border border-amber-500/30">
                NODE #04 • JUDICIAL CONSENSUS VALIDATOR
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              PRESIDING MAGISTRATE: Hon. Justice Sarah Vance (#CRT-IND-001872) • Criminal Division
            </p>
          </div>
        </div>

        {/* Judicial Orders Quick Bar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onIssueCourtOrder('BAIL_RELEASE')}
            className="flex items-center space-x-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-500 transition-colors shadow-md shadow-amber-950/40"
          >
            <Gavel className="h-4 w-4" />
            <span>EXECUTE BAIL DECREE</span>
          </button>

          <button
            onClick={() => onIssueCourtOrder('REMAND')}
            className="flex items-center space-x-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-900/50 transition-colors"
          >
            <Scale className="h-4 w-4" />
            <span>ORDER PRISON REMAND</span>
          </button>
        </div>
      </div>

      {/* Database Isolation Banner */}
      <div className="flex items-center justify-between rounded-lg border border-dashed border-[#382B14] bg-[#0E0C07] px-4 py-2 text-xs text-slate-400 font-mono">
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4 text-amber-400" />
          <span>DATA INTEGRITY DOMAIN: <strong className="text-slate-200">court_db</strong> (Dockets & Judicial Writs). Accesses Police & Forensic proofs strictly via DCJMN AccessControl Smart Contract.</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="text-emerald-400">NON-REPUDIABLE JUDICIAL SEALS</span>
        </div>
      </div>

      {/* Live Evidentiary Cryptographic Proof Engine (Matching Image 1) */}
      <div className="rounded-xl border border-[#2D2312] bg-[#141009] p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between border-b border-[#2D2312] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-amber-400">{caseRecord.caseId}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-500/30">
                MAGISTRATE DOCKET #04
              </span>
            </div>
            <h3 className="text-lg font-bold text-white font-sans mt-1">
              {caseRecord.title}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Accused: <strong className="text-slate-200">{caseRecord.accused.name}</strong> • Current Stage: <span className="text-amber-400">{caseRecord.stage}</span>
            </p>
          </div>

          {/* Overall Proof Status */}
          <div className="text-right">
            {!caseRecord.tampered ? (
              <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-4 w-4" />
                <span>ALL CROSS-AGENCY PROOFS 100% VERIFIED</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-1.5 rounded-full bg-red-500/20 px-3.5 py-1 text-xs font-mono font-bold text-red-400 border border-red-500/50 animate-pulse">
                <AlertTriangle className="h-4 w-4" />
                <span>EVIDENTIARY HASH MISMATCH DETECTED</span>
              </div>
            )}
            <div className="text-[10px] font-mono text-slate-500 mt-1">
              ROOT BLOCK #48,192,842 • 4/4 QBFT CONSENSUS COMMITTED
            </div>
          </div>
        </div>

        {/* Proof Engine Checklist Cards */}
        <div className="space-y-3">
          <div className="text-xs font-mono font-bold text-amber-300 flex items-center justify-between">
            <span>MULTI-INSTITUTIONAL CRYPTOGRAPHIC PROOF VERIFICATION ENGINE</span>
            <button
              onClick={onTamperDemo}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline"
            >
              RUN TAMPER EXPERIMENT
            </button>
          </div>

          {/* 01 Police FIR Proof */}
          <div className="rounded-lg border border-[#2D2312] bg-[#0E0C07] p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                !caseRecord.tampered ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40' : 'bg-red-950/60 text-red-400 border border-red-500/40'
              }`}>
                {!caseRecord.tampered ? '✓' : '!'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">01. POLICE FIR & ACCUSED DOSSIER ROOT</span>
                  <span className="text-[10px] font-mono text-sky-400 bg-sky-950/40 px-1.5 py-0.2 rounded border border-sky-500/30">
                    POLICE #01
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Record Hash: {caseRecord.recordHash.substring(0, 24)}...
                </div>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              {!caseRecord.tampered ? (
                <span className="text-emerald-400 font-bold">✓ VERIFIED MATCH (100%)</span>
              ) : (
                <span className="text-red-400 font-bold">⚠ HASH MISMATCH - TAMPER DETECTED</span>
              )}
              <div className="text-[10px] text-slate-500">Signer: Inspector Kumar</div>
            </div>
          </div>

          {/* 02 Seized Artifacts Proof */}
          <div className="rounded-lg border border-[#2D2312] bg-[#0E0C07] p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">02. SEIZED PHYSICAL & DIGITAL ARTIFACTS CHAIN</span>
                  <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 px-1.5 py-0.2 rounded border border-purple-500/30">
                    LOCKER #04
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {evidenceList.length} Exhibits registered on EvidenceRegistry smart contract
                </div>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-emerald-400 font-bold">✓ CUSTODY PROOF COMMITTED</span>
              <div className="text-[10px] text-slate-500">Dual-Signed Police + CFSL</div>
            </div>
          </div>

          {/* 03 Forensic Attestation Proof */}
          <div className="rounded-lg border border-[#2D2312] bg-[#0E0C07] p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">03. CFSL FORENSIC ANALYSIS CERTIFICATE</span>
                  <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 px-1.5 py-0.2 rounded border border-purple-500/30">
                    FORENSICS #03
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {reports[0] ? reports[0].reportId : 'Pending lab submission'} • Bitstream Write-Blocked
                </div>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-emerald-400 font-bold">✓ ADMISSIBLE SCIENTIFIC PROOF</span>
              <div className="text-[10px] text-slate-500">Dr. Elena Rostova Ed25519 Seal</div>
            </div>
          </div>

          {/* 04 Prosecution Chargesheet Proof */}
          <div className="rounded-lg border border-[#2D2312] bg-[#0E0C07] p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">04. PROSECUTION CHARGESHEET & STATUTE INDICTMENT</span>
                  <span className="text-[10px] font-mono text-sky-400 bg-sky-950/40 px-1.5 py-0.2 rounded border border-sky-500/30">
                    BAR-#48910
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {chargesheet ? chargesheet.chargesheetId : 'Chargesheet Filed'} • Sec. 420, 467, 471, 120-B
                </div>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-emerald-400 font-bold">✓ FORMALLY ADMITTED TO BENCH</span>
              <div className="text-[10px] text-slate-500">Adv. Jennifer Holt</div>
            </div>
          </div>
        </div>

        {/* Issued Court Orders & Decrees */}
        <div className="pt-4 border-t border-[#2D2312]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold font-mono text-white flex items-center gap-2">
              <Gavel className="h-4 w-4 text-amber-400" />
              JUDICIAL ORDERS & BINDING DECREES ISSUED BY BENCH 04
            </h4>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
              {orders.length} ORDERS ATTESTED
            </span>
          </div>

          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o.orderId}
                className="rounded-lg border border-amber-500/30 bg-[#0E0C07] p-3.5 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-amber-300">{o.orderId}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-500/30">
                        {o.type}
                      </span>
                    </div>
                    <div className="text-xs text-white font-bold mt-1">{o.issuingJudge}</div>
                    <p className="text-[11px] text-slate-300 font-mono mt-0.5">{o.details}</p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/30">
                    JUDICIALLY SEALED
                  </span>
                </div>

                {o.stipulations && o.stipulations.length > 0 && (
                  <div className="rounded bg-[#161208] p-2 border border-[#2D2312] text-[10px] font-mono text-slate-400 space-y-0.5">
                    <span className="text-amber-400 font-bold block mb-1">MANDATORY CONDITIONS:</span>
                    {o.stipulations.map((stip, idx) => (
                      <div key={idx}>• {stip}</div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-[#2D2312]/60">
                  <span className="truncate max-w-sm">HASH: {o.orderHash}</span>
                  <span>BENCH 04 SEAL: NON-REPUDIABLE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
