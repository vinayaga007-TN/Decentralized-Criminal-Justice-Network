import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  User,
  ShieldCheck,
  Plus,
  ArrowRight,
  FileText,
  Clock,
  HardDrive,
  FileSignature,
  Gavel,
  Scale,
  FlaskConical,
  Building2,
  Lock,
  CheckCircle2,
  MapPin,
  Tag,
  Share2,
  Sparkles,
  Eye,
  FileCheck,
  ExternalLink,
  Copy,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import {
  CaseRecord,
  EvidenceItem,
  ForensicReport,
  Chargesheet,
  CourtOrder,
  InmateCustodyRecord,
  InstitutionType,
  FIRDocument,
  VerificationResult
} from '../../types';
import { VerificationPill } from '../common/VerificationPill';
import { InstitutionalBadge } from '../common/InstitutionalBadge';
import { FIRDocumentViewerModal } from '../fir/FIRDocumentViewerModal';
import { FIRAIChatModal } from '../fir/FIRAIChatModal';
import { api } from '../../services/api';

export type CaseTabType =
  | 'OVERVIEW'
  | 'INVESTIGATION'
  | 'EVIDENCE'
  | 'FORENSICS'
  | 'CHARGESHEET'
  | 'COURT'
  | 'TIMELINE';

interface CaseDetailViewProps {
  caseRecord: CaseRecord;
  evidenceList: EvidenceItem[];
  reports: ForensicReport[];
  chargesheet?: Chargesheet;
  orders: CourtOrder[];
  inmates: InmateCustodyRecord[];
  userInstitution: InstitutionType;
  firDocument?: FIRDocument;
  firIntegrity?: VerificationResult | null;
  onBack: () => void;
  onSelectEvidence: (evidence: EvidenceItem) => void;
  onOpenVerificationDrawer: () => void;
  onOpenAddEvidence: () => void;
  onOpenTransferEvidence: (evidence: EvidenceItem) => void;
  onOpenReportModal: (evidence: EvidenceItem) => void;
  onOpenSubmitChargesheet: () => void;
  onOpenIssueCourtOrder: () => void;
  onExecuteBailRelease: (inmateId: string) => void;
}

export const CaseDetailView: React.FC<CaseDetailViewProps> = ({
  caseRecord,
  evidenceList,
  reports,
  chargesheet,
  orders,
  inmates,
  userInstitution,
  firDocument: initialFirDoc,
  firIntegrity: initialFirIntegrity,
  onBack,
  onSelectEvidence,
  onOpenVerificationDrawer,
  onOpenAddEvidence,
  onOpenTransferEvidence,
  onOpenReportModal,
  onOpenSubmitChargesheet,
  onOpenIssueCourtOrder,
  onExecuteBailRelease
}) => {
  const [activeTab, setActiveTab] = useState<CaseTabType>('OVERVIEW');
  const [localFirDoc, setLocalFirDoc] = useState<FIRDocument | null>(initialFirDoc || null);
  const [localFirIntegrity, setLocalFirIntegrity] = useState<VerificationResult | null>(initialFirIntegrity || null);
  const [showFIRModal, setShowFIRModal] = useState(false);
  const [showAIChatModal, setShowAIChatModal] = useState(false);
  const [verifyingDoc, setVerifyingDoc] = useState(false);
  const [hashCopied, setHashCopied] = useState(false);

  // Sync / fetch FIR document if caseRecord changes or localFirDoc is missing
  useEffect(() => {
    if (initialFirDoc) {
      setLocalFirDoc(initialFirDoc);
      return;
    }
    const docId = caseRecord.firDocumentId || `FIR-DOC-${caseRecord.caseId}`;
    api.getFIRDocument(docId)
      .then((res) => {
        if (res.success && res.firDocument) {
          setLocalFirDoc(res.firDocument);
        }
      })
      .catch(() => {});
  }, [caseRecord.caseId, caseRecord.firDocumentId, initialFirDoc]);

  const handleVerifyFIRIntegrity = async () => {
    if (!localFirDoc) return;
    setVerifyingDoc(true);
    try {
      const res = await api.verifyFIRDocument(localFirDoc.id);
      if (res.success && res.verification) {
        setLocalFirIntegrity(res.verification);
      }
    } catch (e) {
      console.warn('FIR verification error', e);
    } finally {
      setVerifyingDoc(false);
    }
  };

  const copyFIRHash = () => {
    if (!localFirDoc) return;
    navigator.clipboard.writeText(localFirDoc.sha256Hash);
    setHashCopied(true);
    setTimeout(() => setHashCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto pb-12">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Case Registry</span>
      </button>

      {/* 8. Professional Case Header */}
      <div className="bg-[#0B0F1B] border border-slate-800/80 rounded p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800/60 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-mono font-bold text-slate-400 tracking-wider">
                {caseRecord.caseId}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-semibold">
                {caseRecord.status}
              </span>
              <VerificationPill
                status={caseRecord.tampered ? 'TAMPERED' : 'VERIFIED'}
                onClick={onOpenVerificationDrawer}
              />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-100 font-sans">
              {caseRecord.title}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Stage: {caseRecord.stage.replace(/_/g, ' ')}
            </p>
          </div>

          {/* Quick Context-Aware Action Button */}
          <div className="flex items-center gap-2 self-start flex-wrap">
            {localFirDoc && (
              <button
                type="button"
                onClick={() => setShowFIRModal(true)}
                className="px-3 py-1.5 bg-sky-950/40 hover:bg-sky-900/50 text-sky-300 border border-sky-500/40 text-xs font-mono uppercase tracking-wider rounded font-medium transition-colors flex items-center gap-1.5"
                title="View original preserved FIR document"
              >
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Original FIR</span>
              </button>
            )}

            {userInstitution === 'POLICE' && (
              <>
                <button
                  type="button"
                  onClick={onOpenAddEvidence}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono uppercase tracking-wider rounded border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Seize Exhibit</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenSubmitChargesheet}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono uppercase tracking-wider rounded font-medium transition-colors"
                >
                  Docket Chargesheet
                </button>
              </>
            )}

            {userInstitution === 'COURT' && (
              <button
                type="button"
                onClick={onOpenIssueCourtOrder}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono uppercase tracking-wider rounded font-medium transition-colors"
              >
                Issue Judicial Decree
              </button>
            )}

            {userInstitution === 'PRISON' && inmates.length > 0 && orders.some(o => o.type === 'BAIL_RELEASE') && (
              <button
                type="button"
                onClick={() => onExecuteBailRelease(inmates[0].inmateId)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono uppercase tracking-wider rounded font-medium transition-colors"
              >
                Execute Smart Bail
              </button>
            )}
          </div>
        </div>

        {/* Case Metadata Grid (Clean, Restrained) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 uppercase text-[10px] block mb-1">Police Station</span>
            <span className="text-slate-200 font-medium font-sans">{caseRecord.station}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block mb-1">Investigating Officer</span>
            <span className="text-slate-200 font-medium font-sans">{caseRecord.officerName}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block mb-1">Registered Timestamp</span>
            <span className="text-slate-300">{new Date(caseRecord.timestamp).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block mb-1">Blockchain Hash</span>
            <button
              onClick={onOpenVerificationDrawer}
              className="text-emerald-400 hover:underline truncate max-w-[140px] block text-left"
              title={caseRecord.recordHash}
            >
              {caseRecord.recordHash.slice(0, 12)}...
            </button>
          </div>
        </div>

        {/* 8. Professional Tabs Navigation */}
        <div className="flex border-b border-slate-800/80 -mx-6 px-6 overflow-x-auto space-x-6 text-xs font-mono">
          {(
            [
              { id: 'OVERVIEW', label: 'Overview' },
              { id: 'INVESTIGATION', label: 'Investigation' },
              { id: 'EVIDENCE', label: `Evidence (${evidenceList.length})` },
              { id: 'FORENSICS', label: `Forensics (${reports.length})` },
              { id: 'CHARGESHEET', label: chargesheet ? 'Chargesheet (Filed)' : 'Chargesheet' },
              { id: 'COURT', label: `Court Orders (${orders.length})` },
              { id: 'TIMELINE', label: 'Timeline' }
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-white font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Preserved Original FIR Document Card */}
              {localFirDoc && (
                <div className="bg-[#0B0F1B] border border-sky-500/30 rounded-lg p-5 space-y-4 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-100 font-bold">
                            Original Preserved FIR Document
                          </h4>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                            IMMUTABLE ORIGINAL
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400">
                          FIR #{localFirDoc.extractedFields.firNumber || localFirDoc.id} • Registered by {localFirDoc.uploadedByOfficerName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAIChatModal(true)}
                        className="px-2.5 py-1.5 rounded bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ask AI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowFIRModal(true)}
                        className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-sky-950/40 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Original</span>
                      </button>
                    </div>
                  </div>

                  {/* Document preview & integrity summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    {/* Thumbnail preview */}
                    <div
                      onClick={() => setShowFIRModal(true)}
                      className="sm:col-span-4 h-36 rounded bg-[#05070E] border border-slate-800 p-1 flex items-center justify-center cursor-pointer group hover:border-sky-500/50 transition-colors relative overflow-hidden"
                    >
                      {localFirDoc.fileDataUrl.startsWith('data:image') || localFirDoc.fileDataUrl.startsWith('data:text') ? (
                        <img
                          src={localFirDoc.fileDataUrl}
                          alt="FIR Document thumbnail"
                          className="w-full h-full object-contain rounded opacity-85 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-sky-400">
                          <FileText className="w-8 h-8 mb-1" />
                          <span className="text-[10px] font-mono">PDF Document</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-[11px] font-mono font-bold text-white bg-sky-600/90 px-2 py-1 rounded">
                          Click to View Original
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Hash info */}
                    <div className="sm:col-span-8 space-y-2.5 font-mono text-xs">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500 uppercase text-[10px] block">Document File</span>
                          <span className="text-slate-200 font-medium truncate block">{localFirDoc.fileName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase text-[10px] block">File Size &amp; Type</span>
                          <span className="text-slate-200">{localFirDoc.fileSizeFormatted} • {localFirDoc.documentType}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 uppercase">SHA-256 Anchored Leaf Digest</span>
                          {localFirIntegrity ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-bold">
                              <ShieldCheck className="w-3 h-3" />
                              VERIFIED ON CHAIN
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={verifyingDoc}
                              onClick={handleVerifyFIRIntegrity}
                              className="text-sky-400 hover:underline"
                            >
                              {verifyingDoc ? 'Verifying...' : 'Verify with Chain'}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center justify-between bg-black/50 rounded p-1.5 border border-slate-800 mt-1">
                          <code className="text-[10px] text-emerald-400 truncate max-w-[280px]">
                            {localFirDoc.sha256Hash}
                          </code>
                          <button
                            type="button"
                            onClick={copyFIRHash}
                            className="text-slate-400 hover:text-white ml-2 shrink-0"
                            title="Copy SHA-256"
                          >
                            {hashCopied ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                        <span className="text-slate-500">Extracted Offences:</span>
                        <span className="text-sky-300 font-medium">
                          {localFirDoc.extractedFields.offences.slice(0, 2).join(', ') || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Incident Details */}
              <div className="bg-[#0B0F1B] border border-slate-800/80 rounded p-5 space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Incident Report Summary
                </h3>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {caseRecord.incidentDetails}
                </p>
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Complainant: <span className="text-slate-300">{caseRecord.complainant}</span></span>
                  <span>Jurisdiction: Federal Cyber District #04</span>
                </div>
              </div>

              {/* Accused Profile with Cryptographic Privacy Note */}
              <div className="bg-[#0B0F1B] border border-slate-800/80 rounded p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Accused Profile
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    Off-chain AES-256 Storage
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] block mb-1">Full Name</span>
                    <span className="text-slate-200 font-medium font-sans">{caseRecord.accused.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] block mb-1">Alias</span>
                    <span className="text-slate-300">{caseRecord.accused.alias || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] block mb-1">Age & Gender</span>
                    <span className="text-slate-300">{caseRecord.accused.age} yrs • {caseRecord.accused.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] block mb-1">National ID Token</span>
                    <span className="text-slate-400 font-mono text-[11px] truncate block" title={caseRecord.accused.nationalId}>
                      {caseRecord.accused.nationalId.slice(0, 16)}...
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] block mb-1">Inmate ID</span>
                    <span className="text-slate-200 font-mono">{caseRecord.accused.inmateNumber || 'Not in Custody'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/60">
                  <span className="text-slate-500 font-mono uppercase text-[10px] block mb-2">Penal Statutory Charges</span>
                  <div className="flex flex-wrap gap-2">
                    {caseRecord.accused.charges.map((charge, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700">
                        {charge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Quick Summary */}
            <div className="space-y-6">
              <div className="bg-[#0B0F1B] border border-slate-800/80 rounded p-5 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Chain-of-Custody Summary
                </h3>
                <div className="space-y-2 text-xs font-mono text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-500">Total Exhibits:</span>
                    <span>{evidenceList.length}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-500">Forensic Certificates:</span>
                    <span>{reports.length}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-500">Chargesheet Status:</span>
                    <span className={chargesheet ? 'text-emerald-400' : 'text-slate-500'}>
                      {chargesheet ? 'DOCKETED' : 'PENDING'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Active Decrees:</span>
                    <span className="text-amber-400">{orders.length}</span>
                  </div>
                </div>
              </div>

              {/* Cryptographic Sovereign Receipt */}
              <div className="bg-[#080B11] border border-slate-800 rounded p-4 text-[11px] font-mono space-y-2 text-slate-400">
                <div className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>LEDGER RECEIPT</span>
                  <span className="text-emerald-400">QBFT CONFIRMED</span>
                </div>
                <div className="break-all text-[10px] text-slate-500">
                  TX: {caseRecord.txHash}
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Block Height: #{caseRecord.blockNumber}</span>
                  <span>Gas: 0 (Sovereign)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. INVESTIGATION TAB */}
        {activeTab === 'INVESTIGATION' && (
          <div className="bg-[#0B0F1B] border border-slate-800/80 rounded p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase">
                  Investigation Docket & Field Milestones
                </h3>
                <p className="text-xs text-slate-400">
                  Supervised by Metro Central Police Division (#POL-MC-09)
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Officer: Inspector Kumar (POL-004281)
              </span>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded bg-[#080B11] border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-300 font-semibold">
                  <span>01. Digital FIR Inception & Intercept Execution</span>
                  <span className="text-slate-500">14 Feb 2026 • 04:12 UTC</span>
                </div>
                <p className="text-slate-400 font-sans leading-relaxed">
                  Cyber division detection systems flagged irregular automated withdrawals. Sub-station intercept team deployed to workstation location and executed arrest of suspect Ravi Kiran Sharma. Hardware security authenticators and encrypted storage media seized immediately.
                </p>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Bitstream Image Seizure Certificate Anchored in Block #48192842</span>
                </div>
              </div>

              <div className="p-4 rounded bg-[#080B11] border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-300 font-semibold">
                  <span>02. CFSL Subpoena & Forensic Custody Transfer</span>
                  <span className="text-slate-500">14 Feb 2026 • 08:15 UTC</span>
                </div>
                <p className="text-slate-400 font-sans leading-relaxed">
                  Samsung 2TB T7 SSD transferred to Central Forensic Science Laboratory Node #03 for write-block bitstream acquisition and hash verification per ISO/IEC 27037 protocol.
                </p>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Chain-of-Custody Transfer Receipt Handshake Executed</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. EVIDENCE TAB */}
        {activeTab === 'EVIDENCE' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase">
                  Physical & Digital Exhibits
                </h3>
                <p className="text-xs text-slate-400">
                  Select an exhibit to inspect bitstream hash and chain of custody
                </p>
              </div>
              {userInstitution === 'POLICE' && (
                <button
                  type="button"
                  onClick={onOpenAddEvidence}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono uppercase rounded transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Exhibit</span>
                </button>
              )}
            </div>

            <div className="bg-[#0B0F1B] border border-slate-800/80 rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-[#080C16] text-[11px] font-mono uppercase text-slate-400">
                    <th className="py-3 px-4">Exhibit ID</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Current Custodian</th>
                    <th className="py-3 px-4">Storage Location</th>
                    <th className="py-3 px-4">Integrity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {evidenceList.map((ev) => (
                    <tr
                      key={ev.evidenceId}
                      onClick={() => onSelectEvidence(ev)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                        {ev.evidenceId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{ev.title}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{ev.description}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                        {ev.type}
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
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {userInstitution === 'POLICE' && ev.currentCustodian === 'POLICE' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenTransferEvidence(ev);
                            }}
                            className="text-xs font-mono text-blue-400 hover:text-blue-300 underline"
                          >
                            Transfer
                          </button>
                        )}
                        {userInstitution === 'FORENSICS' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenReportModal(ev);
                            }}
                            className="text-xs font-mono text-teal-400 hover:text-teal-300 underline"
                          >
                            Analyze
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. FORENSICS TAB */}
        {activeTab === 'FORENSICS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase">
                  Forensic Science Laboratory Certificates
                </h3>
                <p className="text-xs text-slate-400">
                  CFSL Node #03 bitstream write-block analysis & Ed25519 signatures
                </p>
              </div>
            </div>

            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((rep) => (
                  <div key={rep.reportId} className="bg-[#0B0F1B] border border-slate-800/80 rounded p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-200">{rep.reportId}</span>
                          <span className="text-xs font-mono text-slate-400">Exhibit: {rep.evidenceId}</span>
                          <VerificationPill status={rep.tampered ? 'TAMPERED' : 'VERIFIED'} />
                        </div>
                        <div className="text-xs text-slate-400 font-sans mt-0.5">
                          Examiner: {rep.examinerName} ({rep.labNode})
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {new Date(rep.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                      <div>
                        <span className="text-slate-500 uppercase text-[10px] block mb-1">Acquisition Methodology</span>
                        <div className="bg-[#080B11] p-3 rounded border border-slate-800 text-slate-300 leading-relaxed font-sans">
                          {rep.methodology}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase text-[10px] block mb-1">Findings & Hash Verification</span>
                        <div className="bg-[#080B11] p-3 rounded border border-slate-800 text-slate-300 leading-relaxed font-sans">
                          {rep.findings}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Digital Seal:</span>
                        <span className="text-emerald-400">{rep.digitalSignature}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Block #{rep.blockNumber} • Tx: {rep.txHash.slice(0, 14)}...
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#0B0F1B] border border-slate-800/80 rounded text-slate-500 text-xs font-mono">
                No forensic reports docketed yet. Seized exhibits currently pending laboratory analysis.
              </div>
            )}
          </div>
        )}

        {/* 5. CHARGESHEET TAB */}
        {activeTab === 'CHARGESHEET' && (
          <div className="space-y-4">
            {chargesheet ? (
              <div className="bg-[#0B0F1B] border border-slate-800/80 rounded p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-slate-100">{chargesheet.chargesheetId}</span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[11px] font-mono">
                        DOCKETED IN HIGH COURT
                      </span>
                      <VerificationPill status={chargesheet.tampered ? 'TAMPERED' : 'VERIFIED'} />
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-sans">
                      Lead Prosecutor: {chargesheet.leadProsecutor} ({chargesheet.prosecutorBarId})
                    </div>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {new Date(chargesheet.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-mono uppercase text-slate-400 font-semibold block">
                    Prosecution Executive Summary
                  </span>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed bg-[#080B11] p-4 rounded border border-slate-800">
                    {chargesheet.summary}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] block mb-1">Admitted Evidence Exhibits</span>
                    <span className="text-slate-200 font-medium">{chargesheet.admittedEvidenceCount} Specimens Cross-Referenced</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] block mb-1">Penal Statutory Sections</span>
                    <span className="text-slate-200">{chargesheet.sectionsApplied.join(', ')}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Signature: <span className="text-emerald-400">{chargesheet.digitalSignature}</span></span>
                  <span>Court Acceptance: <span className="text-emerald-400">VERIFIED</span></span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-[#0B0F1B] border border-slate-800/80 rounded text-slate-500 text-xs font-mono space-y-3">
                <p>Formal prosecution chargesheet has not yet been docketed for this investigation.</p>
                {userInstitution === 'POLICE' && (
                  <button
                    type="button"
                    onClick={onOpenSubmitChargesheet}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-mono uppercase tracking-wider transition-colors"
                  >
                    Draft Chargesheet Docket
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 6. COURT ORDERS TAB */}
        {activeTab === 'COURT' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase">
                  Judicial Orders & Decrees
                </h3>
                <p className="text-xs text-slate-400">
                  High Court Sovereign Bench #04 rulings and bail conditions
                </p>
              </div>
              {userInstitution === 'COURT' && (
                <button
                  type="button"
                  onClick={onOpenIssueCourtOrder}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono uppercase rounded transition-colors"
                >
                  Issue Court Order
                </button>
              )}
            </div>

            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div key={ord.orderId} className="bg-[#0B0F1B] border border-slate-800/80 rounded p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-400">{ord.orderId}</span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                            {ord.type}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 font-sans mt-0.5">
                          Presiding: {ord.issuingJudge} ({ord.courtBench})
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {new Date(ord.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {ord.details}
                    </p>

                    {ord.stipulations && ord.stipulations.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                        <span className="text-[11px] font-mono uppercase text-slate-400">Binding Decrees & Bail Stipulations:</span>
                        <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 font-sans">
                          {ord.stipulations.map((stip, i) => (
                            <li key={i}>{stip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-500">
                      <span>Judicial Seal: <span className="text-emerald-400">{ord.digitalSignature}</span></span>
                      <span>Block #{ord.blockNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#0B0F1B] border border-slate-800/80 rounded text-slate-500 text-xs font-mono">
                No judicial decrees or bail orders on record.
              </div>
            )}
          </div>
        )}

        {/* 7. TIMELINE TAB (Strictly per Section 9) */}
        {activeTab === 'TIMELINE' && (
          <div className="bg-[#0B0F1B] border border-slate-800/80 rounded p-6 space-y-6">
            <div className="border-b border-slate-800/60 pb-3">
              <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase">
                Case Progression Lifecycle
              </h3>
              <p className="text-xs text-slate-400">
                Cross-institutional chronological progression verified against QBFT blockchain roots
              </p>
            </div>

            {/* Clean Timeline per Section 9:
                FIR -> INVESTIGATION STARTED -> EVIDENCE REGISTERED -> FORENSIC ANALYSIS -> CHARGESHEET -> COURT -> PRISON */}
            <div className="relative pl-6 space-y-6 border-l border-slate-800 ml-3">
              {/* Event 1: FIR Inception */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-[#0B0F1B]" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-100 uppercase">
                      01. Digital FIR Registered
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">14 Feb 2026 • 04:12</span>
                  </div>
                  <div className="text-xs text-slate-300 font-sans">
                    Initial offense logged and signed by Inspector Kumar (Div 04). Record canonical hash generated.
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 pt-1">
                    <InstitutionalBadge institution="POLICE" size="xs" minimal />
                    <span className="text-emerald-400">✓ ANCHORED (Block #{caseRecord.blockNumber})</span>
                  </div>
                </div>
              </div>

              {/* Event 2: Evidence Registered */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-[#0B0F1B]" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-100 uppercase">
                      02. Exhibits Seized & Barcoded
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">14 Feb 2026 • 08:15</span>
                  </div>
                  <div className="text-xs text-slate-300 font-sans">
                    Samsung 2TB T7 SSD and physical trace fibers cataloged with SHA-256 write-blocked hash.
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 pt-1">
                    <InstitutionalBadge institution="POLICE" size="xs" minimal />
                    <span className="text-emerald-400">✓ ANCHORED (EvidenceRegistry)</span>
                  </div>
                </div>
              </div>

              {/* Event 3: Forensics Analysis */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-teal-500 ring-4 ring-[#0B0F1B]" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-100 uppercase">
                      03. CFSL Laboratory Analysis Completed
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">14 Feb 2026 • 14:30</span>
                  </div>
                  <div className="text-xs text-slate-300 font-sans">
                    Tableau TX1 bitstream clone verified. Injected transactions confirmed. Signed by Dr. Rostova.
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 pt-1">
                    <InstitutionalBadge institution="FORENSICS" size="xs" minimal />
                    <span className="text-emerald-400">✓ CERTIFIED (Ed25519)</span>
                  </div>
                </div>
              </div>

              {/* Event 4: Chargesheet Docketed */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-[#0B0F1B]" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-100 uppercase">
                      04. Formal Prosecution Chargesheet Filed
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">15 Feb 2026 • 10:00</span>
                  </div>
                  <div className="text-xs text-slate-300 font-sans">
                    Adv. Jennifer Holt submitted CS-891-2026 with 3 admitted exhibits under Sections 420/467/471.
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 pt-1">
                    <InstitutionalBadge institution="POLICE" size="xs" minimal />
                    <span className="text-emerald-400">✓ VERIFIED DOCKET</span>
                  </div>
                </div>
              </div>

              {/* Event 5: High Court Decrees */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-[#0B0F1B]" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-100 uppercase">
                      05. Judicial Remand & Bail Decrees
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">14 Mar 2026 • 11:02</span>
                  </div>
                  <div className="text-xs text-slate-300 font-sans">
                    Hon. Justice Sarah Vance issued conditional bail release order upon $50K escrow and RFID ankle tag.
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 pt-1">
                    <InstitutionalBadge institution="COURT" size="xs" minimal />
                    <span className="text-emerald-400">✓ SEALED BENCH DECREE</span>
                  </div>
                </div>
              </div>

              {/* Event 6: Correctional Facility & Bail */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-rose-500 ring-4 ring-[#0B0F1B]" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-100 uppercase">
                      06. Remand Custody & Smart Bail Execution
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">14 Mar 2026 • Current</span>
                  </div>
                  <div className="text-xs text-slate-300 font-sans">
                    Correctional Facility #04 logged inmate admission (Cell 308-A) and monitors smart bail escrow release status.
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 pt-1">
                    <InstitutionalBadge institution="PRISON" size="xs" minimal />
                    <span className="text-emerald-400">✓ SMART CUSTODY ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FIR Preserved Document Viewer Modal */}
      {showFIRModal && localFirDoc && (
        <FIRDocumentViewerModal
          document={localFirDoc}
          initialIntegrity={localFirIntegrity}
          currentOfficerName={caseRecord.officerName}
          onClose={() => setShowFIRModal(false)}
        />
      )}

      {/* FIR AI Chat Modal */}
      {showAIChatModal && localFirDoc && (
        <FIRAIChatModal
          document={localFirDoc}
          officerName={caseRecord.officerName}
          onClose={() => setShowAIChatModal(false)}
        />
      )}
    </div>
  );
};
