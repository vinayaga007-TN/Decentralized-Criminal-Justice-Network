import React from 'react';
import {
  Shield,
  FlaskConical,
  Scale,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Layers
} from 'lucide-react';
import { CaseRecord, EvidenceItem, ForensicReport, Chargesheet, CourtOrder, InmateCustodyRecord, InstitutionType } from '../types';

interface CaseLifecycleTimelineProps {
  caseRecord: CaseRecord;
  evidenceList: EvidenceItem[];
  reports: ForensicReport[];
  chargesheet?: Chargesheet;
  orders: CourtOrder[];
  inmates: InmateCustodyRecord[];
  onNavigateInstitution: (inst: InstitutionType) => void;
}

export const CaseLifecycleTimeline: React.FC<CaseLifecycleTimelineProps> = ({
  caseRecord,
  evidenceList,
  reports,
  chargesheet,
  orders,
  inmates,
  onNavigateInstitution
}) => {
  const steps = [
    {
      id: 1,
      title: 'POLICE: FIR & EVIDENCE SEIZURE',
      institution: 'POLICE' as InstitutionType,
      actor: 'Inspector Kumar (POL-IND-004281)',
      station: 'Metro Central Division (#POL-MC-09)',
      completed: true,
      timestamp: '2026-02-14 04:12:08Z',
      description: 'Criminal FIR logged, accused dossier compiled off-chain with AES-256 field encryption. Physical hardware & fiber traces impounded.',
      hash: caseRecord.recordHash,
      txHash: caseRecord.txHash,
      blockNumber: caseRecord.blockNumber
    },
    {
      id: 2,
      title: 'POLICE → FORENSICS: CUSTODY TRANSFER',
      institution: 'POLICE' as InstitutionType,
      actor: 'Inspector Kumar → Dr. Elena Rostova',
      station: 'Evidence Locker #04 → CFSL Specimen Vault #03',
      completed: evidenceList.some((e) => e.currentCustodian === 'FORENSICS'),
      timestamp: '2026-02-14 11:20:14Z',
      description: 'Dual-signed chain-of-custody transfer transaction executed on EvidenceRegistry smart contract. Handover recorded with zero record discrepancies.',
      hash: evidenceList[0]?.sha256Hash || '0x9b2d8e41a87c9812f8a...',
      txHash: evidenceList[0]?.txHash || '0x5d4e11bb890a2c89f18...',
      blockNumber: 48192842
    },
    {
      id: 3,
      title: 'FORENSICS: WRITE-BLOCK LAB ATTESTATION',
      institution: 'FORENSICS' as InstitutionType,
      actor: 'Dr. Elena Rostova (FOR-IND-003914)',
      station: 'CFSL Cyber & Ballistics Node #03',
      completed: reports.length > 0,
      timestamp: reports[0]?.timestamp || '2026-02-14 14:30:00Z',
      description: 'Bit-level forensic extraction via Tableau TX1 hardware write-blocker. Expert report digitally signed with Ed25519 HSM key and anchored on AuditContract.',
      hash: reports[0]?.reportHash || '0x7c9812f8a0029b3c4d5e...',
      txHash: reports[0]?.txHash || '0x82ab719ef10082491a99...',
      blockNumber: reports[0]?.blockNumber || 48192843
    },
    {
      id: 4,
      title: 'POLICE → COURT: FORMAL CHARGESHEET',
      institution: 'POLICE' as InstitutionType,
      actor: 'Adv. Jennifer Holt (BAR-#48910)',
      station: 'Prosecution Division → Sovereign Bench 04',
      completed: Boolean(chargesheet),
      timestamp: chargesheet?.timestamp || '2026-02-15 10:00:00Z',
      description: 'Chargesheet CS-891-2026 filed including 14 encrypted data containers, 3 certified forensic certificates, and full chain-of-custody proofs.',
      hash: chargesheet?.chargesheetHash || '0x4a71bf003c2bb0194821...',
      txHash: chargesheet?.txHash || '0x9482cfa193857102ae8f...',
      blockNumber: chargesheet?.blockNumber || 48192844
    },
    {
      id: 5,
      title: 'COURT: EVIDENTIARY AUDIT & DECREES',
      institution: 'COURT' as InstitutionType,
      actor: 'Hon. Justice Sarah Vance (CRT-IND-001872)',
      station: 'High Court Sovereign Bench #04',
      completed: orders.length > 0,
      timestamp: orders[0]?.timestamp || '2026-03-14 11:02:00Z',
      description: 'Cryptographic proof engine verified all off-chain hashes against QBFT root anchors. Conditional bail decree & remand warrants judicially sealed.',
      hash: orders[0]?.orderHash || '0x0a81f9c7392e01bd9482...',
      txHash: orders[0]?.txHash || '0x1920f5a0194821a8c0e1...',
      blockNumber: orders[0]?.blockNumber || 48192845
    },
    {
      id: 6,
      title: 'PRISON: INTAKE & SMART BAIL RELEASE',
      institution: 'PRISON' as InstitutionType,
      actor: 'Superintendent Marcus Vance (PRS-IND-002641)',
      station: 'Central Correctional Facility Node #04',
      completed: Boolean(inmates[0]),
      timestamp: inmates[0]?.admissionDate || '2026-03-12 14:22:00Z',
      description: 'Inmate admitted to Max-Sec enclave. Autonomous smart contract verifies escrow & RFID tag conditions, executing pre-trial release with instant network sync.',
      hash: inmates[0]?.biometricProofRoot || '0x3c8e41da882109aa88bc...',
      txHash: inmates[0]?.txHash || '0x77a82b99c148e9a22f4b...',
      blockNumber: inmates[0]?.blockNumber || 48192846
    }
  ];

  return (
    <div className="space-y-6">
      {/* Journey Header */}
      <div className="rounded-xl border border-emerald-500/30 bg-[#0A1412] p-5 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
            CASE LIFECYCLE V2.4
          </span>
          <h2 className="text-lg font-bold text-white font-sans">
            SECURE CROSS-INSTITUTION CASE LIFECYCLE: {caseRecord.caseId}
          </h2>
        </div>
        <p className="text-xs text-slate-300 font-mono">
          Tracking immutable case progression across four isolated institutional systems:
          <strong className="text-sky-400"> Police</strong> → 
          <strong className="text-purple-400"> Forensics</strong> → 
          <strong className="text-sky-400"> Police</strong> → 
          <strong className="text-amber-400"> Court</strong> → 
          <strong className="text-rose-400"> Prison</strong>.
        </p>
      </div>

      {/* Stepper Grid */}
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={`rounded-xl border p-5 transition-all ${
              step.completed
                ? 'border-emerald-500/30 bg-[#0A0E17]'
                : 'border-slate-800 bg-[#080B12] opacity-75'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start space-x-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                  step.completed
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-md shadow-emerald-950/50'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}>
                  0{step.id}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white font-sans">{step.title}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {step.station}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    SIGNING ACTOR: <strong className="text-slate-200">{step.actor}</strong>
                  </div>
                  <p className="text-xs text-slate-300 font-mono mt-1 leading-relaxed max-w-3xl">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Status & Navigation to that Institution */}
              <div className="text-right space-y-2">
                <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>BLOCKCHAIN COMMITTED</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  {step.timestamp}
                </div>
                <div>
                  <button
                    onClick={() => onNavigateInstitution(step.institution)}
                    className="inline-flex items-center space-x-1 text-xs font-mono text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
                    <span>Inspect In {step.institution} Portal</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Cryptographic Footprint Bar */}
            <div className="mt-4 pt-3 border-t border-[#1E293B]/60 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
              <div className="flex items-center space-x-2 truncate max-w-md">
                <span className="text-slate-500">PAYLOAD HASH:</span>
                <span className="text-slate-300 truncate">{step.hash}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-slate-500">TX:</span>{' '}
                  <span className="text-emerald-400">{step.txHash.substring(0, 16)}...</span>
                </div>
                <div>
                  <span className="text-slate-500">BLOCK:</span>{' '}
                  <span className="text-slate-200 font-bold">#{step.blockNumber}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
