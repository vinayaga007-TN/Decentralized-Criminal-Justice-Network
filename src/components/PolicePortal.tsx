import React, { useState } from 'react';
import {
  Shield,
  FileText,
  PlusCircle,
  Send,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Database,
  Search,
  Fingerprint
} from 'lucide-react';
import { CaseRecord, EvidenceItem, Chargesheet, VerificationResult } from '../types';

interface PolicePortalProps {
  caseRecord: CaseRecord;
  evidenceList: EvidenceItem[];
  chargesheet?: Chargesheet;
  integrity: VerificationResult;
  onOpenNewFIR: () => void;
  onOpenAddEvidence: () => void;
  onOpenTransferEvidence: (evidence: EvidenceItem) => void;
  onOpenSubmitChargesheet: () => void;
  onTamperDemo: () => void;
}

export const PolicePortal: React.FC<PolicePortalProps> = ({
  caseRecord,
  evidenceList,
  chargesheet,
  integrity,
  onOpenNewFIR,
  onOpenAddEvidence,
  onOpenTransferEvidence,
  onOpenSubmitChargesheet,
  onTamperDemo
}) => {
  const [showDecryptedDossier, setShowDecryptedDossier] = useState(false);

  return (
    <div className="space-y-6">
      {/* Node & Investigator Header Bar */}
      <div className="flex flex-wrap items-center justify-between rounded-xl border border-sky-500/30 bg-[#0C121E] p-4 text-slate-200">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white font-sans">
                POLICE INVESTIGATION TERMINAL
              </h2>
              <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-mono text-sky-400 border border-sky-500/30">
                NODE #01 • FEDERAL DISTRICT 04
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              INVESTIGATING OFFICER: Inspector Kumar (#POL-IND-004281) • Metro Central Division
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenNewFIR}
            className="flex items-center space-x-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-500 transition-colors shadow-md shadow-sky-950/40"
          >
            <PlusCircle className="h-4 w-4" />
            <span>REGISTER NEW FIR</span>
          </button>

          <button
            onClick={onOpenAddEvidence}
            className="flex items-center space-x-1.5 rounded-lg border border-sky-500/40 bg-sky-950/40 px-3 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-900/50 transition-colors"
          >
            <Layers className="h-4 w-4" />
            <span>SEIZE EVIDENCE</span>
          </button>

          <button
            onClick={onOpenSubmitChargesheet}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Send className="h-4 w-4 text-sky-400" />
            <span>SUBMIT CHARGESHEET</span>
          </button>
        </div>
      </div>

      {/* Database Isolation Banner */}
      <div className="flex items-center justify-between rounded-lg border border-dashed border-[#1E293B] bg-[#0A0D15] px-4 py-2.5 text-xs text-slate-400 font-mono">
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4 text-sky-400" />
          <span>DATA ISOLATION: <strong className="text-slate-200">police_db</strong> (Off-Chain Encrypted Store). Cross-institutional access routed via Smart Contract.</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="text-slate-500">AES-256 GCM</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400">SHA-256 ROOT ANCHORED</span>
        </div>
      </div>

      {/* Main Grid: Primary Case Dossier & Evidences */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Case Record & FIR Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Case Card */}
          <div className="rounded-xl border border-[#1E293B] bg-[#0E1322] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-sky-400">{caseRecord.caseId}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#161F33] text-slate-300 border border-slate-700">
                    STAGE: {caseRecord.stage}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-sans mt-1">
                  {caseRecord.title}
                </h3>
              </div>

              {/* Cryptographic Verification Badge */}
              <div className="text-right">
                {integrity.verified && !caseRecord.tampered ? (
                  <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>QBFT ANCHOR VERIFIED (100%)</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center space-x-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-mono font-bold text-red-400 border border-red-500/50 animate-pulse">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>INTEGRITY MISMATCH</span>
                  </div>
                )}
                <div className="text-[10px] font-mono text-slate-500 mt-1">
                  TX: {caseRecord.txHash ? caseRecord.txHash.substring(0, 18) : '0x...'}...
                </div>
              </div>
            </div>

            {/* FIR Incident Narrative */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 font-semibold block mb-1">
                FIRST INFORMATION REPORT (FIR) NARRATIVE:
              </label>
              <div className="rounded-lg bg-[#0A0D15] border border-[#1A2234] p-3 text-xs text-slate-300 leading-relaxed font-mono">
                {caseRecord.incidentDetails}
              </div>
            </div>

            {/* Accused Off-Chain Dossier with AES-256 Decryption Simulation */}
            <div className="rounded-lg border border-[#1E293B] bg-[#0A0D16] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <Fingerprint className="h-3.5 w-3.5 text-sky-400" />
                  ACCUSED SENSITIVE DOSSIER (OFF-CHAIN PRIVACY SHIELD)
                </span>
                <button
                  onClick={() => setShowDecryptedDossier(!showDecryptedDossier)}
                  className="flex items-center space-x-1 text-[11px] font-mono text-sky-400 hover:text-sky-300 transition-colors"
                >
                  {showDecryptedDossier ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  <span>{showDecryptedDossier ? 'ENCRYPT VIEW' : 'DECRYPT WITH POLICE HSM KEY'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1">
                <div className="rounded bg-[#111726] p-2 border border-[#1E293B]">
                  <span className="text-[10px] text-slate-500 block">FULL NAME</span>
                  <span className="font-bold text-white">{caseRecord.accused.name}</span>
                </div>
                <div className="rounded bg-[#111726] p-2 border border-[#1E293B]">
                  <span className="text-[10px] text-slate-500 block">AGE / GENDER</span>
                  <span className="text-slate-300">{caseRecord.accused.age} Yrs • {caseRecord.accused.gender}</span>
                </div>
                <div className="rounded bg-[#111726] p-2 border border-[#1E293B]">
                  <span className="text-[10px] text-slate-500 block">NATIONAL ID</span>
                  <span className="text-emerald-400 truncate block">
                    {showDecryptedDossier ? 'FED-ID: 8820-9411-9022' : caseRecord.accused.nationalId.substring(0, 12) + '... (ENC)'}
                  </span>
                </div>
                <div className="rounded bg-[#111726] p-2 border border-[#1E293B]">
                  <span className="text-[10px] text-slate-500 block">INMATE REF</span>
                  <span className="text-amber-400">{caseRecord.accused.inmateNumber || 'PENDING REMAND'}</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-400 pt-1">
                <span className="text-slate-500">INDICTED CHARGES:</span>{' '}
                {caseRecord.accused.charges.map((c, i) => (
                  <span key={i} className="inline-block mr-1.5 px-1.5 py-0.5 rounded bg-sky-950/40 text-sky-300 border border-sky-500/20 text-[10px]">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Cryptographic Hash Comparison & Tamper Demonstration Box */}
            <div className="rounded-lg border border-[#1E293B] bg-[#0A0E18] p-3 text-xs font-mono space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>LOCAL RECORD SHA-256:</span>
                <span className="text-slate-300 truncate max-w-xs">{caseRecord.recordHash}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>QBFT LEDGER ANCHOR:</span>
                <span className="text-emerald-400 truncate max-w-xs">{integrity.blockchainHash}</span>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-[#1E293B]/60">
                <span className="text-[10px] text-slate-500">
                  {caseRecord.tampered ? '⚠ RECORD CORRUPTED FOR DEMO' : '✓ ZERO DISCREPANCIES DETECTED'}
                </span>
                <button
                  onClick={onTamperDemo}
                  className="text-[10px] font-mono text-amber-400 hover:text-amber-300 underline"
                >
                  TEST TAMPER DETECTION & RESTORE
                </button>
              </div>
            </div>
          </div>

          {/* Registered Evidences */}
          <div className="rounded-xl border border-[#1E293B] bg-[#0E1322] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                  <Layers className="h-4 w-4 text-sky-400" />
                  SEIZED EVIDENTIARY ARTIFACTS (POLICE EVIDENCE LOCKER)
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Chain-of-Custody Cryptographically Registered on DCJMN EvidenceRegistry
                </p>
              </div>
              <span className="rounded bg-sky-500/10 px-2 py-0.5 text-xs font-mono text-sky-400 border border-sky-500/20">
                {evidenceList.length} ITEMS SEIZED
              </span>
            </div>

            <div className="space-y-3">
              {evidenceList.map((item) => (
                <div
                  key={item.evidenceId}
                  className="rounded-lg border border-[#1E293B] bg-[#0A0D16] p-3.5 space-y-2 hover:border-sky-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-sky-400">{item.evidenceId}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.type}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          item.currentCustodian === 'FORENSICS'
                            ? 'bg-purple-950/40 text-purple-300 border-purple-500/40'
                            : 'bg-sky-950/40 text-sky-300 border-sky-500/40'
                        }`}>
                          CUSTODIAN: {item.currentCustodian}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
                    </div>

                    {/* Action Button: Transfer to Forensics if currently with Police */}
                    {item.currentCustodian === 'POLICE' ? (
                      <button
                        onClick={() => onOpenTransferEvidence(item)}
                        className="flex items-center space-x-1 rounded-lg bg-purple-600/20 border border-purple-500/40 px-2.5 py-1.5 text-xs font-mono font-semibold text-purple-300 hover:bg-purple-600/30 transition-colors"
                      >
                        <span>TRANSFER TO FORENSICS</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    ) : (
                      <div className="text-right">
                        <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-purple-400 bg-purple-950/30 px-2 py-1 rounded border border-purple-500/30">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>UNDER CFSL ANALYSIS</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-[#1E293B]/60">
                    <span className="truncate max-w-sm">HASH: {item.sha256Hash}</span>
                    <span>LOCATION: {item.storageLocation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Chargesheet & Prosecution Dossier */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[#1E293B] bg-[#0E1322] p-5 space-y-4">
            <div className="border-b border-[#1E293B] pb-3">
              <span className="text-xs font-mono text-sky-400 font-bold">PROSECUTION CHARGESHEET</span>
              <h4 className="text-sm font-bold text-white font-sans mt-0.5">
                {chargesheet ? chargesheet.chargesheetId : 'PENDING POLICE SUBMISSION'}
              </h4>
            </div>

            {chargesheet ? (
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">LEAD PROSECUTOR</span>
                  <span className="text-slate-200 font-bold">{chargesheet.leadProsecutor} ({chargesheet.prosecutorBarId})</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block">INDICTMENT SECTIONS</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {chargesheet.sectionsApplied.map((s, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-sky-950/50 text-sky-300 border border-sky-500/30 text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block">SUMMARY OF PROOFS</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5 bg-[#0A0D15] p-2.5 rounded border border-[#1A2234]">
                    {chargesheet.summary}
                  </p>
                </div>

                <div className="rounded bg-[#0A0D15] p-2 border border-[#1A2234] text-[10px] text-slate-400 space-y-1">
                  <div>CHARGESHEET HASH: {chargesheet.chargesheetHash.substring(0, 20)}...</div>
                  <div className="text-emerald-400">COURT ACCEPTANCE: VERIFIED & DOCKETED</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <FileText className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-mono">
                  Chargesheet not yet filed. Finalize forensic evidence analysis before submission.
                </p>
                <button
                  onClick={onOpenSubmitChargesheet}
                  className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"
                >
                  PREPARE CHARGESHEET
                </button>
              </div>
            )}
          </div>

          {/* Institutional Data Governance Box */}
          <div className="rounded-xl border border-[#1E293B] bg-[#0A0D16] p-4 text-xs font-mono space-y-2 text-slate-400">
            <div className="text-slate-300 font-bold">INSTITUTIONAL PERMISSIONS:</div>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>Police has Write Authority over FIRs & Initial Evidence.</li>
              <li>Cannot modify Forensic Reports or Judicial Orders.</li>
              <li>Custody transfers require recipient sign-off on blockchain.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
