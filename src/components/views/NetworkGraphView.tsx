import React, { useState, useEffect } from 'react';
import {
  Shield,
  Scale,
  FlaskConical,
  Building2,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Layers,
  ArrowRight,
  Database,
  Lock,
  Sparkles,
  Search,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Send,
  HelpCircle,
  Clock,
  Fingerprint
} from 'lucide-react';
import { CaseRecord, EvidenceItem, ForensicReport, Chargesheet, CourtOrder, InmateCustodyRecord } from '../../types';
import { api } from '../../services/api';

interface NetworkGraphViewProps {
  caseRecord: CaseRecord | null;
  evidenceList: EvidenceItem[];
  reports: ForensicReport[];
  chargesheet?: Chargesheet;
  orders: CourtOrder[];
  inmates: InmateCustodyRecord[];
  onNavigateToPortal: (portal: 'POLICE' | 'FORENSICS' | 'COURT' | 'PRISON') => void;
}

interface CaseFlowStep {
  stepIndex: number;
  institution: 'POLICE' | 'FORENSICS' | 'COURT' | 'PRISON';
  title: string;
  description: string;
  docId: string;
  txHash: string;
  timestamp: string;
  connectionId?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
}

export const NetworkGraphView: React.FC<NetworkGraphViewProps> = ({
  caseRecord,
  evidenceList,
  reports,
  chargesheet,
  orders,
  inmates,
  onNavigateToPortal
}) => {
  // Active Case Selection
  const [selectedCaseId, setSelectedCaseId] = useState<string>(caseRecord?.caseId || 'CASE-2026-000127');

  // Animation Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Selected Item for Contextual Event Panel
  const [selectedElement, setSelectedElement] = useState<{
    type: 'NODE' | 'CONNECTION' | 'STEP';
    id: string;
    title: string;
    from?: string;
    to?: string;
    event?: string;
    docId?: string;
    status?: string;
    txHash?: string;
    timestamp?: string;
    isTampered?: boolean;
    currentHash?: string;
    registeredHash?: string;
  }>({
    type: 'CONNECTION',
    id: 'police-forensics',
    title: 'Police ↔ Forensics',
    from: 'POLICE NODE',
    to: 'FORENSIC NODE',
    event: 'Evidence Transfer & Chain of Custody',
    docId: evidenceList[0]?.evidenceId || 'EVD-2026-00481',
    status: 'Verified',
    txHash: '0x82ab7710c2834fa09823190823412ea847291ef1',
    timestamp: '12 Sep 2026, 09:42 UTC'
  });

  // Tamper Demo State in Network Graph
  const [tamperSimulated, setTamperSimulated] = useState<boolean>(
    Boolean(caseRecord?.tampered || evidenceList.some((e) => e.tampered) || chargesheet?.tampered)
  );
  const [tamperLoading, setTamperLoading] = useState<boolean>(false);

  // AI Intelligence Panel State
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<{
    question: string;
    answer: string;
    source: string;
  } | null>({
    question: 'Explain how this case moved through the network.',
    answer: `Case ${caseRecord?.caseId || 'CASE-2026-000127'} began at Police Sovereign Node via Digital FIR. Hardware exhibits were transferred under ISO/IEC 27037 write-block rules to CFSL Forensic Lab Node. Following scientific verification, Police filed formal prosecution chargesheet CS-891-2026 to High Court Judicial Bench. The Court decreed remand and conditional bail orders, which were anchored on the QBFT consortium ledger for Correctional Custody compliance.`,
    source: 'DCJMN_SOVEREIGN_INTELLIGENCE'
  });

  // Predefined Case Flow Journey
  const caseSteps: CaseFlowStep[] = [
    {
      stepIndex: 0,
      institution: 'POLICE',
      title: 'Digital FIR Inception',
      description: 'First Information Report docketed & hash committed to CaseRegistry smart contract.',
      docId: caseRecord?.caseId || 'CASE-2026-000127',
      txHash: caseRecord?.txHash || '0x4f82a...912a',
      timestamp: '11 Sep 2026, 08:30 UTC',
      status: 'COMPLETED'
    },
    {
      stepIndex: 1,
      institution: 'POLICE',
      title: 'Physical Evidence Registered',
      description: 'Physical SSD exhibit seized with ISO/IEC 27037 write-block SHA-256 fingerprint.',
      docId: evidenceList[0]?.evidenceId || 'EVD-2026-00481',
      txHash: evidenceList[0]?.txHash || '0x12bb4...77c1',
      timestamp: '11 Sep 2026, 11:15 UTC',
      status: 'COMPLETED'
    },
    {
      stepIndex: 2,
      institution: 'FORENSICS',
      title: 'Evidence Transfer Handshake',
      description: 'Custody transferred to CFSL Lab Node under digital signature verification.',
      docId: evidenceList[0]?.evidenceId || 'EVD-2026-00481',
      txHash: '0x82ab7...91ef',
      timestamp: '12 Sep 2026, 09:42 UTC',
      connectionId: 'police-forensics',
      status: 'COMPLETED'
    },
    {
      stepIndex: 3,
      institution: 'FORENSICS',
      title: 'CFSL Forensic Certificate Attested',
      description: 'Bitstream acquisition verified. Forensic report sealed with Ed25519 validator signature.',
      docId: reports[0]?.reportId || 'CFSL-REP-2026-0481',
      txHash: reports[0]?.txHash || '0x77c19...44a2',
      timestamp: '12 Sep 2026, 16:30 UTC',
      status: 'COMPLETED'
    },
    {
      stepIndex: 4,
      institution: 'COURT',
      title: 'Chargesheet Docketed & Accepted',
      description: 'Formal prosecution chargesheet submitted by Police & verified by Court Bench #04.',
      docId: chargesheet?.chargesheetId || 'CS-891-2026',
      txHash: chargesheet?.txHash || '0x99e01...33b9',
      timestamp: '13 Sep 2026, 10:00 UTC',
      connectionId: 'police-court',
      status: 'COMPLETED'
    },
    {
      stepIndex: 5,
      institution: 'COURT',
      title: 'Judicial Remand & Bail Decrees',
      description: 'Bench #04 presided over bail hearing and issued attested judicial orders.',
      docId: orders[0]?.orderId || 'CT-ORD-2026-00492',
      txHash: orders[0]?.txHash || '0xee44b...88f1',
      timestamp: '13 Sep 2026, 14:15 UTC',
      connectionId: 'forensics-court',
      status: 'COMPLETED'
    },
    {
      stepIndex: 6,
      institution: 'PRISON',
      title: 'Correctional Custody & Smart Bail',
      description: 'Prison node verified court order; automated bail release executed with RFID escrow.',
      docId: inmates[0]?.inmateId || 'INM-2026-00812',
      txHash: inmates[0]?.txHash || '0xaa128...55d0',
      timestamp: '14 Sep 2026, 08:00 UTC',
      connectionId: 'court-prison',
      status: 'COMPLETED'
    }
  ];

  // Auto-play animation interval
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= caseSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const nextIndex = prev + 1;
          const step = caseSteps[nextIndex];
          setSelectedElement({
            type: 'STEP',
            id: `step-${nextIndex}`,
            title: step.title,
            from: step.institution,
            event: step.description,
            docId: step.docId,
            status: 'Verified on Blockchain',
            txHash: step.txHash,
            timestamp: step.timestamp
          });
          return nextIndex;
        });
      }, 2600);
    }
    return () => clearInterval(timer);
  }, [isPlaying, caseSteps]);

  // Handle Tamper Toggle Simulation
  const handleToggleTamper = async () => {
    setTamperLoading(true);
    try {
      if (tamperSimulated) {
        await api.restoreAuthentic('EVIDENCE', evidenceList[0]?.evidenceId || 'EVD-2026-9901');
        setTamperSimulated(false);
      } else {
        await api.simulateTamper('EVIDENCE', evidenceList[0]?.evidenceId || 'EVD-2026-9901');
        setTamperSimulated(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTamperLoading(false);
    }
  };

  // Handle Ask DCJMN Intelligence
  const handleAskAI = async (queryText: string) => {
    if (!queryText.trim()) return;
    setAiLoading(true);
    try {
      const res = await api.queryIntelligence(queryText, selectedCaseId);
      if (res.success) {
        setAiResponse({
          question: queryText,
          answer: res.answer,
          source: res.source
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const currentStep = caseSteps[currentStepIndex];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans animate-in fade-in">
      {/* 17. Network Status Header */}
      <div className="bg-[#0B0F1B] border border-slate-800/90 rounded p-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-100 uppercase tracking-wider">
              DCJMN NETWORK ONLINE
            </span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="text-slate-400">
            Consensus: <span className="text-slate-200 font-bold">QBFT</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="text-slate-400">
            Validator Nodes: <span className="text-emerald-400 font-bold">4 / 4 Active</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-[11px] text-slate-400">
          <div>
            Latest Block: <span className="text-slate-200 font-bold">#48,192</span>
          </div>
          <div className="hidden md:block">
            Latest Tx: <span className="text-slate-300">0x82ab...91ef</span>
          </div>
          <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
            Zero Gas Fees
          </div>
        </div>
      </div>

      {/* Case Journey Controller Banner */}
      <div className="bg-[#0D1220] border border-slate-800 rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Fingerprint className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-slate-100 uppercase tracking-wider">
                Case Progression Journey:
              </span>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="bg-[#080C16] border border-slate-700 rounded px-2 py-0.5 text-xs font-mono text-blue-300 focus:outline-none"
              >
                <option value="CASE-2026-000127">CASE-2026-000127 (Cyber Heist & Seized SSD)</option>
                <option value="CASE-2026-00124">CASE-2026-00124 (Apex Cyber Intrusion)</option>
              </select>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Watch cryptographic custody move seamlessly: <span className="text-blue-300 font-mono">Police</span> → <span className="text-teal-300 font-mono">Forensics</span> → <span className="text-amber-300 font-mono">Court</span> → <span className="text-rose-300 font-mono">Prison</span>
            </div>
          </div>
        </div>

        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center space-x-2 self-start md:self-auto font-mono text-xs">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Case Journey</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(0);
            }}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset Journey"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="pl-2 text-[11px] text-slate-400">
            Step <span className="text-slate-100 font-bold">{currentStepIndex + 1}</span> of {caseSteps.length}
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Graph + Event Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Network Architecture Diagram (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="relative bg-[#090D18] border border-slate-800/80 rounded p-6 min-h-[560px] flex flex-col justify-between overflow-hidden">
            {/* Subtle background grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#161E3015_1px,transparent_1px),linear-gradient(to_bottom,#161E3015_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* TOP: Police Node */}
            <div className="flex justify-center z-10">
              <div
                onClick={() => {
                  setSelectedElement({
                    type: 'NODE',
                    id: 'POLICE',
                    title: 'POLICE SOVEREIGN NODE',
                    from: 'POLICE',
                    event: 'First Information Report & Hardware Seizure',
                    docId: caseRecord?.caseId || 'CASE-2026-000127',
                    status: 'Connected & Active',
                    txHash: caseRecord?.txHash || '0x4f82a...912a',
                    timestamp: '11 Sep 2026'
                  });
                }}
                className={`w-64 p-4 rounded border transition-all cursor-pointer bg-[#0B0F1D] ${
                  currentStep.institution === 'POLICE'
                    ? 'border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-100 uppercase">
                      POLICE NODE
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToPortal('POLICE');
                    }}
                    className="text-[10px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                    title="Enter Police Portal"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="pt-2.5 space-y-1.5 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database:</span>
                    <span className="text-slate-300">Private (Off-Chain)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Validator:</span>
                    <span className="text-blue-400">Active Signer</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE: Forensics Node (Left) <---> CENTER BLOCKCHAIN <---> Court Node (Right) */}
            <div className="flex items-center justify-between my-6 z-10 gap-4">
              {/* Forensics Node (Left) */}
              <div
                onClick={() => {
                  setSelectedElement({
                    type: 'NODE',
                    id: 'FORENSICS',
                    title: 'FORENSIC CFSL NODE',
                    from: 'FORENSICS',
                    event: 'Write-Block Bitstream Extraction & Scientific Attestation',
                    docId: reports[0]?.reportId || 'CFSL-REP-2026-0481',
                    status: 'Connected & Active',
                    txHash: reports[0]?.txHash || '0x77c19...44a2',
                    timestamp: '12 Sep 2026'
                  });
                }}
                className={`w-60 p-4 rounded border transition-all cursor-pointer bg-[#0B0F1D] ${
                  currentStep.institution === 'FORENSICS'
                    ? 'border-teal-500 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/50'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                      <FlaskConical className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-100 uppercase">
                      FORENSIC NODE
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToPortal('FORENSICS');
                    }}
                    className="text-[10px] font-mono text-teal-400 hover:text-teal-300 flex items-center gap-0.5"
                    title="Enter Forensics Portal"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="pt-2.5 space-y-1.5 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database:</span>
                    <span className="text-slate-300">Private (Off-Chain)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Validator:</span>
                    <span className="text-teal-400">Active Signer</span>
                  </div>
                </div>
              </div>

              {/* CENTER: DCJMN Permissioned Blockchain Layer */}
              <div className="flex-1 max-w-xs p-4 rounded border border-slate-700 bg-[#080B15]/90 text-center shadow-2xl relative">
                <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold mb-1">
                  DCJMN PERMISSIONED NETWORK
                </div>
                <div className="text-xs font-mono font-bold text-slate-100">
                  QBFT CONSENSUS CONSORTIUM
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-1">
                  4 Validator Nodes • Zero Gas Fees
                </div>

                {/* Conceptual pipeline */}
                <div className="mt-3 pt-3 border-t border-slate-800 text-[9px] font-mono text-slate-500 space-y-1 text-left">
                  <div className="flex items-center justify-between">
                    <span>Institutional DBs</span>
                    <span className="text-slate-400">→ APIs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Authorization Layer</span>
                    <span className="text-slate-400">→ Ed25519</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>State Roots</span>
                    <span className="text-emerald-400">→ QBFT Ledger</span>
                  </div>
                </div>
              </div>

              {/* Court Node (Right) */}
              <div
                onClick={() => {
                  setSelectedElement({
                    type: 'NODE',
                    id: 'COURT',
                    title: 'COURT JUDICIAL NODE',
                    from: 'COURT',
                    event: 'Chargesheet Verification & Judicial Decrees',
                    docId: orders[0]?.orderId || 'CT-ORD-2026-00492',
                    status: 'Connected & Active',
                    txHash: orders[0]?.txHash || '0xee44b...88f1',
                    timestamp: '13 Sep 2026'
                  });
                }}
                className={`w-60 p-4 rounded border transition-all cursor-pointer bg-[#0B0F1D] ${
                  currentStep.institution === 'COURT'
                    ? 'border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Scale className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-100 uppercase">
                      COURT NODE
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToPortal('COURT');
                    }}
                    className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
                    title="Enter Court Portal"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="pt-2.5 space-y-1.5 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database:</span>
                    <span className="text-slate-300">Private (Off-Chain)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Validator:</span>
                    <span className="text-amber-400">Active Signer</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM: Prison Node */}
            <div className="flex justify-center z-10">
              <div
                onClick={() => {
                  setSelectedElement({
                    type: 'NODE',
                    id: 'PRISON',
                    title: 'PRISON CUSTODY NODE',
                    from: 'PRISON',
                    event: 'Correctional Custody & Smart Bail Execution',
                    docId: inmates[0]?.inmateId || 'INM-2026-00812',
                    status: 'Connected & Active',
                    txHash: inmates[0]?.txHash || '0xaa128...55d0',
                    timestamp: '14 Sep 2026'
                  });
                }}
                className={`w-64 p-4 rounded border transition-all cursor-pointer bg-[#0B0F1D] ${
                  currentStep.institution === 'PRISON'
                    ? 'border-rose-500 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500/50'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-100 uppercase">
                      PRISON NODE
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToPortal('PRISON');
                    }}
                    className="text-[10px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-0.5"
                    title="Enter Prison Portal"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="pt-2.5 space-y-1.5 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Database:</span>
                    <span className="text-slate-300">Private (Off-Chain)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Validator:</span>
                    <span className="text-rose-400">Active Signer</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 12. Interactive Authorized Data Exchange Connections */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => {
                  setSelectedElement({
                    type: 'CONNECTION',
                    id: 'police-forensics',
                    title: 'Police ↔ Forensics',
                    from: 'POLICE',
                    to: 'FORENSICS',
                    event: 'Evidence Transfer & Custody Handshake',
                    docId: evidenceList[0]?.evidenceId || 'EVD-2026-00481',
                    status: tamperSimulated ? 'INTEGRITY ALERT' : 'Verified',
                    txHash: '0x82ab7...91ef',
                    timestamp: '12 Sep 2026',
                    isTampered: tamperSimulated,
                    currentHash: tamperSimulated ? '0x72AA...43EF' : '0xA83F...91BC',
                    registeredHash: '0xA83F...91BC'
                  });
                }}
                className={`p-2 rounded text-left border transition-colors ${
                  tamperSimulated
                    ? 'border-rose-500/60 bg-rose-950/20 text-rose-300'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Police → Forensics</span>
                  {tamperSimulated && <span className="text-rose-400 font-mono">⚠</span>}
                </div>
                <div className="text-slate-500 truncate">Evidence Transfer</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedElement({
                    type: 'CONNECTION',
                    id: 'forensics-court',
                    title: 'Forensics ↔ Court',
                    from: 'FORENSICS',
                    to: 'COURT',
                    event: 'Verified Forensic Report Attestation',
                    docId: reports[0]?.reportId || 'CFSL-REP-2026-0481',
                    status: 'Verified',
                    txHash: '0x77c19...44a2',
                    timestamp: '12 Sep 2026'
                  });
                }}
                className="p-2 rounded text-left border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300 transition-colors"
              >
                <div className="font-bold">Forensics → Court</div>
                <div className="text-slate-500 truncate">CFSL Report</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedElement({
                    type: 'CONNECTION',
                    id: 'police-court',
                    title: 'Police ↔ Court',
                    from: 'POLICE',
                    to: 'COURT',
                    event: 'Prosecution Chargesheet Docketing',
                    docId: chargesheet?.chargesheetId || 'CS-891-2026',
                    status: 'Verified',
                    txHash: '0x99e01...33b9',
                    timestamp: '13 Sep 2026'
                  });
                }}
                className="p-2 rounded text-left border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300 transition-colors"
              >
                <div className="font-bold">Police → Court</div>
                <div className="text-slate-500 truncate">Chargesheet CS-891</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedElement({
                    type: 'CONNECTION',
                    id: 'court-prison',
                    title: 'Court ↔ Prison',
                    from: 'COURT',
                    to: 'PRISON',
                    event: 'Court Order & Smart Bail Decree',
                    docId: orders[0]?.orderId || 'CT-ORD-2026-00492',
                    status: 'Verified',
                    txHash: '0xaa128...55d0',
                    timestamp: '14 Sep 2026'
                  });
                }}
                className="p-2 rounded text-left border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300 transition-colors"
              >
                <div className="font-bold">Court → Prison</div>
                <div className="text-slate-500 truncate">Judicial Decrees</div>
              </button>
            </div>
          </div>

          {/* 16. Tamper Detection Interactive Lab Demonstration */}
          <div className={`p-4 rounded border transition-colors ${
            tamperSimulated
              ? 'bg-rose-950/20 border-rose-800 text-rose-200'
              : 'bg-[#0B0F1B] border-slate-800 text-slate-300'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                  tamperSimulated
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {tamperSimulated ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider">
                    {tamperSimulated ? '⚠ INTEGRITY FAILURE DETECTED ON NETWORK' : 'Tamper Detection Simulation'}
                  </div>
                  <div className="text-xs font-sans text-slate-400 mt-0.5">
                    {tamperSimulated
                      ? 'Blockchain verification failed. The current document does not match the cryptographic fingerprint registered on the DCJMN network.'
                      : 'Test how the DCJMN permissioned blockchain flags off-chain database alterations immediately.'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 font-mono text-xs">
                <button
                  type="button"
                  onClick={handleToggleTamper}
                  disabled={tamperLoading}
                  className={`px-3 py-1.5 rounded font-medium transition-colors ${
                    tamperSimulated
                      ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                      : 'bg-rose-700 hover:bg-rose-600 text-white'
                  }`}
                >
                  {tamperLoading ? 'Processing...' : tamperSimulated ? 'Restore Authentic Document' : 'Simulate Off-Chain Alteration'}
                </button>
              </div>
            </div>

            {tamperSimulated && (
              <div className="mt-3 pt-3 border-t border-rose-900/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-black/40">
                  <span className="text-slate-400 block text-[10px]">Current Off-Chain Hash:</span>
                  <span className="text-rose-400 font-bold break-all">0x72AA88910023412B...43EF</span>
                </div>
                <div className="p-2 rounded bg-black/40">
                  <span className="text-slate-400 block text-[10px]">Registered On-Chain Hash:</span>
                  <span className="text-emerald-400 font-bold break-all">0xA83F91BC77123901...91BC</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 14. Event Panel & 18. AI Intelligence (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* 14 & 15. Network Graph Contextual Event Panel */}
          <div className="bg-[#0B0F1B] border border-slate-800 rounded p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                  Network Event Details
                </span>
                <h3 className="text-sm font-bold text-slate-100 font-mono">
                  {selectedElement.title}
                </h3>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                selectedElement.isTampered
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}>
                {selectedElement.isTampered ? 'INTEGRITY ALERT' : 'VERIFIED'}
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Event</div>
                <div className="text-slate-200 font-sans mt-0.5">{selectedElement.event}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Case ID</div>
                  <div className="text-blue-300 font-bold">{selectedCaseId}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Exhibit / Doc ID</div>
                  <div className="text-slate-300 truncate">{selectedElement.docId}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 uppercase">Transaction Hash</div>
                <div className="text-slate-400 text-[11px] truncate">{selectedElement.txHash}</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 uppercase">Timestamp</div>
                <div className="text-slate-400 text-[11px]">{selectedElement.timestamp}</div>
              </div>

              {/* 15. Blockchain Verification Ladder */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Consensus Verification Ladder
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>AUTHORIZED (RBAC Gate Passed)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>DIGITALLY SIGNED (Ed25519 Keypair)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>HASH VERIFIED (SHA-256 Bitstream)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>BLOCKCHAIN RECORDED (QBFT Round #0)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 18. Ask DCJMN Intelligence (AI Grounded on Network Graph) */}
          <div className="bg-[#0B0F1B] border border-slate-800 rounded p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <div>
                <h4 className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wider">
                  Ask DCJMN Intelligence
                </h4>
                <div className="text-[10px] text-slate-400">
                  Grounded on authorized network state & custody records
                </div>
              </div>
            </div>

            {/* Suggested quick questions */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Suggested Inquiries</div>
              {[
                'Explain how this case moved through the network.',
                'Why was the evidence transferred to Forensics?',
                'Which institution currently has custody of the evidence?',
                'Is the forensic report verified?',
                'Explain why this access request was denied.'
              ].map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAskAI(q)}
                  className="w-full text-left p-2 rounded bg-[#080C16] hover:bg-slate-800/70 border border-slate-800 text-[11px] text-slate-300 hover:text-slate-100 transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">{q}</span>
                  <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300 shrink-0 ml-1" />
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAI(aiQuery);
              }}
              className="relative"
            >
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask about case journey, custody, or consensus..."
                className="w-full bg-[#080C16] border border-slate-800 rounded px-3 py-2 pr-9 text-xs text-slate-200 placeholder-slate-500 font-mono focus:border-slate-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-200 p-1"
                title="Send question"
              >
                <Send className={`w-3.5 h-3.5 ${aiLoading ? 'animate-pulse text-emerald-400' : ''}`} />
              </button>
            </form>

            {/* AI Response Display */}
            {aiResponse && (
              <div className="p-3 rounded bg-[#080C16] border border-slate-800/80 space-y-1.5 text-xs font-mono">
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span className="text-emerald-400">Response</span>
                  <span>{aiResponse.source}</span>
                </div>
                <div className="text-slate-300 font-sans text-xs leading-relaxed">
                  {aiResponse.answer}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
