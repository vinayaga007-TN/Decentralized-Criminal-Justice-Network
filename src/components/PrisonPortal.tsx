import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Key,
  Database,
  FileCheck,
  ShieldCheck,
  UserCheck,
  Activity,
  Layers
} from 'lucide-react';
import { InmateCustodyRecord, CourtOrder, VerificationResult } from '../types';

interface PrisonPortalProps {
  inmates: InmateCustodyRecord[];
  courtOrders: CourtOrder[];
  integrity: VerificationResult;
  onExecuteBailRelease: (inmateId: string) => void;
  onAdmitInmate: () => void;
  onTamperDemo: () => void;
}

export const PrisonPortal: React.FC<PrisonPortalProps> = ({
  inmates,
  courtOrders,
  integrity,
  onExecuteBailRelease,
  onAdmitInmate,
  onTamperDemo
}) => {
  const currentInmate = inmates[0] || {
    inmateId: 'INM-2026-00812',
    caseId: 'CASE-2026-00124',
    fullName: 'Ravi Kiran Sharma',
    wardAndCell: 'B-Wing Tier 3 (Cell 308-A)',
    securityClassification: 'MAX-SEC' as const,
    admissionDate: '2026-03-12T14:22:00Z',
    remandAuthority: 'Chief Magistrate Federal Cir. #04',
    courtOrderRef: 'CT-ORD-BAIL-2026-00492',
    custodyStatus: 'REMAND_DETENTION' as const,
    bloodScreening: 'Negative (Cannabinoid/Opiate/Stimulant) - Dr. S. Nair MD',
    quarantineCleared: true,
    biometricProofRoot: '0x3c8e41da882109aa88bc019248102ffc98a10291',
    txHash: '0x82ab719ef10082491a99bcde1920f5a0194821a8c0e11894b9812cc981af8921',
    blockNumber: 48192842
  };

  const isBailReleased = currentInmate.custodyStatus === 'BAIL_RELEASED';
  const bailOrder = courtOrders.find((o) => o.type === 'BAIL_RELEASE');

  return (
    <div className="space-y-6">
      {/* Corrections Node Header */}
      <div className="flex flex-wrap items-center justify-between rounded-xl border border-rose-500/30 bg-[#160D0F] p-4 text-slate-200">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white font-sans">
                CENTRAL CORRECTIONAL FACILITY
              </h2>
              <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono text-rose-400 border border-rose-500/30">
                NODE #04 • MAXIMUM SECURITY ENCLAVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              SUPERINTENDENT: Marcus Vance (#PRS-IND-002641) • High Security Detainment
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center space-x-2">
          {!isBailReleased ? (
            <button
              onClick={() => onExecuteBailRelease(currentInmate.inmateId)}
              className="flex items-center space-x-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors shadow-md shadow-rose-950/50 animate-pulse"
            >
              <Unlock className="h-4 w-4" />
              <span>EXECUTE SMART CONTRACT BAIL RELEASE</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 px-3.5 py-2 text-xs font-mono font-bold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>BAIL RELEASE EXECUTED & SEALED</span>
            </div>
          )}
        </div>
      </div>

      {/* Database Isolation Banner */}
      <div className="flex items-center justify-between rounded-lg border border-dashed border-[#381B22] bg-[#0E080A] px-4 py-2 text-xs text-slate-400 font-mono">
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4 text-rose-400" />
          <span>INSTITUTIONAL ISOLATION: <strong className="text-slate-200">prison_db</strong> (Inmate Biometrics, Wards & Custody Ledger). Adheres strictly to Court Orders.</span>
        </div>
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="text-rose-400">HSM DETENTION PROTOCOL</span>
        </div>
      </div>

      {/* Main Grid: Inmate Custody Dossier & 7-Stage Ladder (Matching Image 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Inmate Record & Custody Ladder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Inmate Card */}
          <div className="rounded-xl border border-[#2D161B] bg-[#140A0D] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-[#2D161B] pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-rose-400">{currentInmate.inmateId}</span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                    isBailReleased
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-950/40 text-rose-400 border-rose-500/30'
                  }`}>
                    STATUS: {currentInmate.custodyStatus}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white font-sans mt-1">
                  {currentInmate.fullName}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Remand Case: <strong className="text-slate-200">{currentInmate.caseId}</strong> • Ward: <span className="text-rose-300">{currentInmate.wardAndCell}</span>
                </p>
              </div>

              {/* Security Classification */}
              <div className="text-right">
                <div className="inline-flex items-center space-x-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-mono font-bold text-rose-400 border border-rose-500/30">
                  <Lock className="h-3.5 w-3.5" />
                  <span>CLASSIFICATION: {currentInmate.securityClassification}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">
                  COURT REF: {currentInmate.courtOrderRef}
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="rounded bg-[#0A0507] p-2.5 border border-[#2D161B]">
                <span className="text-[10px] text-slate-500 block">ADMISSION DATE</span>
                <span className="text-slate-200">{currentInmate.admissionDate.substring(0, 10)}</span>
              </div>
              <div className="rounded bg-[#0A0507] p-2.5 border border-[#2D161B]">
                <span className="text-[10px] text-slate-500 block">REMAND AUTHORITY</span>
                <span className="text-amber-400 font-bold truncate block">{currentInmate.remandAuthority}</span>
              </div>
              <div className="rounded bg-[#0A0507] p-2.5 border border-[#2D161B]">
                <span className="text-[10px] text-slate-500 block">MEDICAL QUARANTINE</span>
                <span className="text-emerald-400 font-bold">CLEARED (DR. S. NAIR)</span>
              </div>
              <div className="rounded bg-[#0A0507] p-2.5 border border-[#2D161B]">
                <span className="text-[10px] text-slate-500 block">BIOMETRIC ROOT</span>
                <span className="text-slate-300 truncate block">{currentInmate.biometricProofRoot.substring(0, 10)}...</span>
              </div>
            </div>

            {/* Complete 7-Stage Chain of Custody (Matching Image 9) */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-mono font-bold text-rose-300 flex items-center justify-between">
                <span>COMPLETE 7-STAGE CHAIN OF CUSTODY (IMMUTABLE LIFECYCLE)</span>
                <span className="text-[10px] text-slate-400">POLICE → FORENSICS → COURT → PRISON</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                {/* 1. FIR */}
                <div className="flex items-center justify-between rounded-lg border border-[#2D161B] bg-[#0A0507] p-2.5">
                  <div className="flex items-center space-x-3">
                    <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold border border-emerald-500/40">✓</span>
                    <div>
                      <span className="font-bold text-white">01. POLICE FIR REGISTERED</span>
                      <span className="text-[10px] text-slate-500 ml-2">Node #01 • Inspector Kumar</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">COMMITTED</span>
                </div>

                {/* 2. Forensics */}
                <div className="flex items-center justify-between rounded-lg border border-[#2D161B] bg-[#0A0507] p-2.5">
                  <div className="flex items-center space-x-3">
                    <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold border border-emerald-500/40">✓</span>
                    <div>
                      <span className="font-bold text-white">02. EVIDENCE FORENSICALLY VERIFIED</span>
                      <span className="text-[10px] text-slate-500 ml-2">Node #03 • Dr. Elena Rostova</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">100% BIT MATCH</span>
                </div>

                {/* 3. Chargesheet */}
                <div className="flex items-center justify-between rounded-lg border border-[#2D161B] bg-[#0A0507] p-2.5">
                  <div className="flex items-center space-x-3">
                    <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold border border-emerald-500/40">✓</span>
                    <div>
                      <span className="font-bold text-white">03. CHARGESHEET ACCEPTED BY COURT</span>
                      <span className="text-[10px] text-slate-500 ml-2">Adv. Jennifer Holt • CS-891-2026</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">DOCKETED</span>
                </div>

                {/* 4. Remand */}
                <div className="flex items-center justify-between rounded-lg border border-[#2D161B] bg-[#0A0507] p-2.5">
                  <div className="flex items-center space-x-3">
                    <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold border border-emerald-500/40">✓</span>
                    <div>
                      <span className="font-bold text-white">04. JUDICIAL REMAND ORDER ISSUED</span>
                      <span className="text-[10px] text-slate-500 ml-2">Bench #04 • Hon. Justice Sarah Vance</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">SEALED</span>
                </div>

                {/* 5. Prison Intake */}
                <div className="flex items-center justify-between rounded-lg border border-[#2D161B] bg-[#0A0507] p-2.5">
                  <div className="flex items-center space-x-3">
                    <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold border border-emerald-500/40">✓</span>
                    <div>
                      <span className="font-bold text-white">05. PRISON INTAKE & BIOMETRIC CAPTURE</span>
                      <span className="text-[10px] text-slate-500 ml-2">Corrections #04 • Superintendent Vance</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">ENROLLED</span>
                </div>

                {/* 6. Medical */}
                <div className="flex items-center justify-between rounded-lg border border-[#2D161B] bg-[#0A0507] p-2.5">
                  <div className="flex items-center space-x-3">
                    <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold border border-emerald-500/40">✓</span>
                    <div>
                      <span className="font-bold text-white">06. HEALTH & QUARANTINE SCREENING</span>
                      <span className="text-[10px] text-slate-500 ml-2">Dr. S. Nair MD • Blood/Toxicology</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">CLEARED</span>
                </div>

                {/* 7. Active Custody / Bail Release */}
                <div className={`flex items-center justify-between rounded-lg border p-2.5 ${
                  isBailReleased
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-rose-500/40 bg-[#1F0C10]'
                }`}>
                  <div className="flex items-center space-x-3">
                    <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                      isBailReleased
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      07
                    </span>
                    <div>
                      <span className={`font-bold ${isBailReleased ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {isBailReleased ? '07. SMART CONTRACT BAIL RELEASE EXECUTED' : '07. ACTIVE REMAND CUSTODY ENFORCEMENT'}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        {isBailReleased ? 'Released under RFID Ankle Geo-Tag Monitoring' : 'Detained in B-Wing Tier 3'}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold font-mono ${isBailReleased ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isBailReleased ? 'RELEASED' : 'SECURED'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Smart Bail Execution Box & Verification */}
        <div className="space-y-6">
          <div className="rounded-xl border border-rose-500/30 bg-[#140A0D] p-5 space-y-4">
            <div className="border-b border-[#2D161B] pb-3">
              <span className="text-xs font-mono text-rose-400 font-bold">AUTOMATED BAIL PROTOCOL</span>
              <h4 className="text-sm font-bold text-white font-sans mt-0.5">
                SMART CONTRACT VERIFICATION
              </h4>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <p className="text-[11px] text-slate-300 leading-relaxed bg-[#0A0507] p-2.5 rounded border border-[#2D161B]">
                Release is autonomously executed once all judicial preconditions in Order <strong className="text-amber-400">CT-ORD-BAIL-2026-00492</strong> are verified across the network.
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] p-2 rounded bg-[#0A0507] border border-[#2D161B]">
                  <span className="text-slate-400">Surety Escrow Deposit:</span>
                  <span className="text-emerald-400 font-bold">$50,000 USD (CONFIRMED)</span>
                </div>

                <div className="flex items-center justify-between text-[11px] p-2 rounded bg-[#0A0507] border border-[#2D161B]">
                  <span className="text-slate-400">RFID Ankle Geo-Tag:</span>
                  <span className="text-emerald-400 font-bold">ACTIVE (DEVICE #GEO-89)</span>
                </div>

                <div className="flex items-center justify-between text-[11px] p-2 rounded bg-[#0A0507] border border-[#2D161B]">
                  <span className="text-slate-400">Passport Impounded:</span>
                  <span className="text-emerald-400 font-bold">SURRENDERED (VAULT 04)</span>
                </div>
              </div>

              {!isBailReleased ? (
                <button
                  onClick={() => onExecuteBailRelease(currentInmate.inmateId)}
                  className="w-full rounded-lg bg-rose-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-rose-500 transition-colors shadow-md shadow-rose-950/50 flex items-center justify-center gap-2"
                >
                  <Unlock className="h-4 w-4" />
                  <span>DISPATCH RELEASE TRANSACTION</span>
                </button>
              ) : (
                <div className="rounded-lg bg-emerald-950/30 border border-emerald-500/30 p-3 text-center text-[11px] text-emerald-400">
                  ✓ Inmate {currentInmate.inmateId} successfully transitioned to conditional pre-trial release on the DCJMN ledger.
                </div>
              )}
            </div>
          </div>

          {/* Tamper Test */}
          <div className="rounded-xl border border-[#2D161B] bg-[#0E080A] p-4 text-xs font-mono space-y-2 text-slate-400">
            <div className="text-slate-300 font-bold">PRISON DATA SHIELD:</div>
            <p className="text-[11px] text-slate-400">
              Prisons cannot release inmates without cryptographically signed court orders on the blockchain. Any rogue modification in local databases is instantly rejected by consensus.
            </p>
            <button
              onClick={onTamperDemo}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline block pt-1"
            >
              TEST TAMPER DETECTION PROTOCOL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
