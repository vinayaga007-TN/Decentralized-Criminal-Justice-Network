import React, { useState } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Cpu,
  Layers,
  Search,
  Key,
  Database,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { EvidenceItem, ForensicReport, VerificationResult } from '../types';

interface ForensicsPortalProps {
  evidenceList: EvidenceItem[];
  reports: ForensicReport[];
  integrity: VerificationResult;
  onOpenReportModal: (evidence: EvidenceItem) => void;
  onTamperDemo: () => void;
}

export const ForensicsPortal: React.FC<ForensicsPortalProps> = ({
  evidenceList,
  reports,
  integrity,
  onOpenReportModal,
  onTamperDemo
}) => {
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem>(
    evidenceList.find((e) => e.currentCustodian === 'FORENSICS') || evidenceList[0]
  );

  const [activeStep, setActiveStep] = useState(4); // 04 Lab Checksum Re-calculation

  return (
    <div className="space-y-6">
      {/* Node Header */}
      <div className="flex flex-wrap items-center justify-between rounded-xl border border-purple-500/30 bg-[#100D1C] p-4 text-slate-200">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-400">
            <FlaskConical className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white font-sans">
                CENTRAL FORENSIC SCIENCE LABORATORY (CFSL)
              </h2>
              <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono text-purple-400 border border-purple-500/30">
                NODE #03 • SCIENTIFIC INTEGRITY ENCLAVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              EXAMINER: Dr. Elena Rostova (#FOR-IND-003914) • Cyber & Ballistics Directorate
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-[#161224] border border-purple-500/20 px-3 py-1.5 text-xs font-mono text-slate-300 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-purple-400" />
            <span>WRITE-BLOCK: <strong className="text-emerald-400">HARDWARE ACTIVE</strong></span>
          </div>
        </div>
      </div>

      {/* Database Isolation Banner */}
      <div className="flex items-center justify-between rounded-lg border border-dashed border-[#281E3B] bg-[#0C0916] px-4 py-2 text-xs text-slate-400 font-mono">
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4 text-purple-400" />
          <span>DATABASE SCOPE: <strong className="text-slate-200">forensics_db</strong> (Lab Analyses & Certified Certificates). Isolated from Police FIR records.</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="text-purple-400">TABLEAU TX1 INTERFACE</span>
        </div>
      </div>

      {/* Main Grid: Evidence Queue & Deep HSM Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Received Evidence Queue */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#231C38] bg-[#120E22] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#231C38] pb-2">
              <h3 className="text-xs font-bold font-mono text-purple-300">
                INCOMING SPECIMEN REPOSITORY
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {evidenceList.filter((e) => e.currentCustodian === 'FORENSICS').length} In Lab Custody
              </span>
            </div>

            <div className="space-y-2">
              {evidenceList.map((item) => {
                const isCurrent = selectedEvidence?.evidenceId === item.evidenceId;
                const inForensics = item.currentCustodian === 'FORENSICS';

                return (
                  <button
                    key={item.evidenceId}
                    onClick={() => setSelectedEvidence(item)}
                    className={`w-full text-left rounded-lg p-3 transition-all border ${
                      isCurrent
                        ? 'border-purple-500 bg-[#1D1438] text-white shadow-md'
                        : 'border-[#241C38] bg-[#0E0B1A] text-slate-400 hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-purple-400">{item.evidenceId}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                        inForensics
                          ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {item.currentCustodian}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white truncate">{item.title}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                      HASH: {item.sha256Hash.substring(0, 20)}...
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Action: Generate Report */}
          {selectedEvidence && (
            <div className="rounded-xl border border-purple-500/30 bg-[#160F2B] p-4 text-center space-y-3">
              <FileCheck className="h-7 w-7 text-purple-400 mx-auto" />
              <div>
                <h4 className="text-xs font-bold text-white font-sans">
                  GENERATE FORENSIC ATTESTATION
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Execute sector write-block extraction and anchor certificate on QBFT blockchain.
                </p>
              </div>
              <button
                onClick={() => onOpenReportModal(selectedEvidence)}
                className="w-full rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition-colors shadow-md shadow-purple-950/50"
              >
                COMPILE & SIGN REPORT
              </button>
            </div>
          )}
        </div>

        {/* Right 2 Cols: Deep HSM Audit & Chain-of-Custody Ladder (Matching Image 7) */}
        <div className="lg:col-span-2 space-y-6">
          {selectedEvidence ? (
            <div className="rounded-xl border border-[#231C38] bg-[#120E22] p-5 space-y-5">
              {/* Evidence Overview Bar */}
              <div className="flex flex-wrap items-center justify-between border-b border-[#231C38] pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-purple-400">{selectedEvidence.evidenceId}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-500/30">
                      {selectedEvidence.type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white font-sans mt-1">
                    {selectedEvidence.title}
                  </h3>
                </div>

                {/* Real-time Checksum Verification Status */}
                <div className="text-right">
                  {!selectedEvidence.tampered ? (
                    <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>CHECKSUM VERIFIED (100% BIT MATCH)</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center space-x-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-mono font-bold text-red-400 border border-red-500/50 animate-pulse">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>CORRUPTED SECTOR / HASH MISMATCH</span>
                    </div>
                  )}
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    LOCATION: {selectedEvidence.storageLocation}
                  </div>
                </div>
              </div>

              {/* Visual Chain-of-Custody Audit Ladder (Image 7 Design) */}
              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-purple-300 flex items-center justify-between">
                  <span>CHAIN-OF-CUSTODY AUDIT LADDER</span>
                  <span className="text-[10px] text-slate-400">IMMUTABLE TIME-STAMPED STAGES</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  {/* Step 1: Police Seizure */}
                  <div className="flex items-start space-x-3 rounded-lg border border-[#241C38] bg-[#0E0A1A] p-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-500/40">
                      ✓
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">01. POLICE SEIZURE & INITIAL HASH ANCHOR</span>
                        <span className="text-[10px] text-slate-500">2026-02-14 04:12:08Z</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Item physically impounded at arrest site by Inspector Kumar. Initial SHA-256 fingerprint generated and registered on CaseRegistry.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Transit Vault */}
                  <div className="flex items-start space-x-3 rounded-lg border border-[#241C38] bg-[#0E0A1A] p-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-500/40">
                      ✓
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">02. PHYSICAL VAULT LOCK & TAMPER-SEAL ATTESTATION</span>
                        <span className="text-[10px] text-slate-500">2026-02-14 08:15:00Z</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Specimen secured in Division Evidence Locker #04 with tamper-evident seal #SEAL-9042A.
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Blockchain Transfer */}
                  <div className="flex items-start space-x-3 rounded-lg border border-[#241C38] bg-[#0E0A1A] p-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-500/40">
                      ✓
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">03. SMART CONTRACT CUSTODY TRANSFER TRANSACTION</span>
                        <span className="text-[10px] text-slate-500">2026-02-14 11:20:14Z</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Police signed transfer to Forensics on EvidenceRegistry contract. Block #48,192,842 consensus accepted.
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Lab Checksum */}
                  <div className="flex items-start space-x-3 rounded-lg border border-purple-500/40 bg-[#18112C] p-3">
                    <div className="h-6 w-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-purple-500/40">
                      04
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-300">04. LAB CHECKSUM RE-CALCULATION & COMPARISON</span>
                        <span className="text-[10px] text-purple-400 font-bold">CFSL NODE #03</span>
                      </div>
                      <div className="mt-1 space-y-1 text-[10px] text-slate-400">
                        <div className="flex justify-between">
                          <span>PHYSICAL SPECIMEN READ:</span>
                          <span className="text-slate-200 font-mono truncate max-w-xs">{selectedEvidence.sha256Hash}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CHAIN REGISTRY HASH:</span>
                          <span className="text-emerald-400 font-mono truncate max-w-xs">{selectedEvidence.sha256Hash}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 5: Bitstream Extraction */}
                  <div className="flex items-start space-x-3 rounded-lg border border-[#241C38] bg-[#0E0A1A] p-3">
                    <div className="h-6 w-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-slate-700">
                      05
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300">05. WRITE-BLOCK BITSTREAM EXTRACTION & REPORT</span>
                        <span className="text-[10px] text-slate-500">EXPERT ATTESTATION</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Read-only raw bitstream mirror extracted to CFSL secure storage array.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tamper Test Trigger */}
              <div className="flex items-center justify-between rounded-lg bg-[#0E0A1A] border border-[#241C38] p-3 text-xs font-mono">
                <span className="text-slate-400">
                  WANT TO DEMONSTRATE FORENSIC TAMPER DETECTION?
                </span>
                <button
                  onClick={onTamperDemo}
                  className="rounded px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                >
                  SIMULATE TAMPERED EVIDENCE HASH
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl border border-[#231C38] bg-[#120E22] text-slate-400">
              Select an evidentiary artifact to inspect forensic ledger details.
            </div>
          )}

          {/* Certified Forensic Reports Section */}
          <div className="rounded-xl border border-[#231C38] bg-[#120E22] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#231C38] pb-3">
              <h3 className="text-xs font-bold font-mono text-white flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-purple-400" />
                DIGITALLY SIGNED FORENSIC CERTIFICATES & ANALYSIS REPORTS
              </h3>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30">
                {reports.length} CERTIFICATES ANCHORED
              </span>
            </div>

            {reports.length > 0 ? (
              <div className="space-y-3">
                {reports.map((rep) => (
                  <div
                    key={rep.reportId}
                    className="rounded-lg border border-purple-500/30 bg-[#0C0916] p-3.5 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-purple-300">{rep.reportId}</span>
                          <span className="text-[10px] font-mono text-slate-400">EVIDENCE: {rep.evidenceId}</span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1">
                          <strong className="text-white">EXAMINER:</strong> {rep.examinerName} ({rep.examinerId})
                        </div>
                      </div>
                      <div className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                        <ShieldCheck className="h-3 w-3" />
                        <span>CRYPTOGRAPHICALLY CERTIFIED</span>
                      </div>
                    </div>

                    <div className="rounded bg-[#140F22] p-2.5 border border-[#231C38] text-[11px] font-mono text-slate-300 leading-relaxed">
                      <div className="text-slate-500 text-[10px] mb-1">FINDINGS:</div>
                      {rep.findings}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-[#231C38]/60">
                      <span className="truncate max-w-sm">REPORT HASH: {rep.reportHash}</span>
                      <span>DIGITAL SEAL: Ed25519 VERIFIED</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs font-mono text-slate-500">
                No forensic reports generated yet for this docket.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
