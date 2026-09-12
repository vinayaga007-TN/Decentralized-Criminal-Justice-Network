import React, { useState } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Clock,
  User,
  MapPin,
  Lock,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { FIRDocument, VerificationResult } from '../../types';
import { api } from '../../services/api';
import { FIRAIChatModal } from './FIRAIChatModal';

interface FIRDocumentViewerModalProps {
  document: FIRDocument;
  initialIntegrity?: VerificationResult | null;
  onClose: () => void;
  currentOfficerName?: string;
}

export const FIRDocumentViewerModal: React.FC<FIRDocumentViewerModalProps> = ({
  document,
  initialIntegrity,
  onClose,
  currentOfficerName = 'Officer'
}) => {
  const [activeTab, setActiveTab] = useState<'ORIGINAL' | 'STRUCTURED' | 'PROVENANCE' | 'AI_FACTS'>('ORIGINAL');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showFullHash, setShowFullHash] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(
    initialIntegrity || null
  );
  const [showAIChat, setShowAIChat] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(document.sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleVerifyIntegrity = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyFIRDocument(document.id);
      if (res.success && res.verification) {
        setVerificationResult(res.verification);
      }
    } catch (err) {
      console.error('Verification failed', err);
    } finally {
      setVerifying(false);
    }
  };

  const openOriginalWindow = () => {
    const w = window.open('');
    if (w) {
      if (document.fileDataUrl.startsWith('data:image')) {
        w.document.write(`<img src="${document.fileDataUrl}" style="max-width:100%;height:auto;display:block;margin:auto;" />`);
      } else {
        w.location.href = document.fileDataUrl;
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-5xl rounded-xl border border-slate-700 bg-[#080C16] shadow-2xl flex flex-col h-[850px] max-h-[95vh] overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#050810]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 font-sans">
                  PRESERVED ORIGINAL FIR DOCUMENT
                </h3>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  IMMUTABLE ORIGINAL
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                  {document.documentType}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400">
                FIR #{document.extractedFields.firNumber} | Station: {document.extractedFields.policeStation} ({document.extractedFields.district})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Ask AI button */}
            <button
              type="button"
              onClick={() => setShowAIChat(true)}
              className="px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ask AI About This FIR</span>
            </button>

            {/* Cryptographic Verify Button */}
            <button
              type="button"
              disabled={verifying}
              onClick={handleVerifyIntegrity}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
            >
              {verifying ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              <span>Verify Integrity</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Verification Status Bar */}
        {verificationResult && (
          <div className={`px-6 py-2.5 text-xs font-mono flex items-center justify-between border-b ${
            verificationResult.isValid
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/30 border-red-500/30 text-red-300'
          }`}>
            <div className="flex items-center gap-2">
              {verificationResult.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              )}
              <span className="font-bold">
                {verificationResult.isValid
                  ? 'CRYPTOGRAPHIC INTEGRITY CONFIRMED'
                  : 'INTEGRITY MISMATCH DETECTED'}
              </span>
              <span className="opacity-80">
                — {verificationResult.message}
              </span>
            </div>
            <span className="text-[11px] opacity-70">
              Verified on Blockchain block #{verificationResult.blockIndex ?? 'N/A'}
            </span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 border-b border-slate-800 bg-[#060A13]">
          <div className="flex space-x-1 text-xs font-mono py-2">
            <button
              type="button"
              onClick={() => setActiveTab('ORIGINAL')}
              className={`px-3.5 py-1.5 rounded-md font-bold transition-colors ${
                activeTab === 'ORIGINAL'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Original Document View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('STRUCTURED')}
              className={`px-3.5 py-1.5 rounded-md font-bold transition-colors ${
                activeTab === 'STRUCTURED'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Structured FIR Record
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PROVENANCE')}
              className={`px-3.5 py-1.5 rounded-md font-bold transition-colors ${
                activeTab === 'PROVENANCE'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Provenance &amp; Custody
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('AI_FACTS')}
              className={`px-3.5 py-1.5 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'AI_FACTS'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Fact Extraction</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-[11px]">SHA-256:</span>
            <code className="text-emerald-400 text-[10px] bg-black/40 px-2 py-0.5 rounded border border-slate-800">
              {document.sha256Hash.slice(0, 16)}...
            </code>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: ORIGINAL DOCUMENT */}
          {activeTab === 'ORIGINAL' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span>File: <strong className="text-slate-200">{document.fileName}</strong></span>
                  <span>•</span>
                  <span>Size: {document.fileSizeFormatted}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(50, z - 20))}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-slate-400 px-1">
                    {zoomLevel}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(200, z + 20))}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(100)}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={openOriginalWindow}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="h-[560px] overflow-auto rounded-lg bg-[#04060B] border border-slate-800 p-2 flex items-center justify-center">
                <div
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.15s ease'
                  }}
                  className="w-full flex justify-center"
                >
                  {document.fileDataUrl.startsWith('data:image') || document.fileDataUrl.startsWith('data:text') ? (
                    <img
                      src={document.fileDataUrl}
                      alt="Preserved FIR Document"
                      className="max-w-full h-auto rounded shadow-xl border border-slate-700/50"
                    />
                  ) : (
                    <iframe
                      src={document.fileDataUrl}
                      title="Preserved FIR Document"
                      className="w-[600px] h-[800px] rounded border border-slate-700/50 bg-white"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STRUCTURED RECORD */}
          {activeTab === 'STRUCTURED' && (
            <div className="space-y-4 max-w-3xl mx-auto font-mono text-xs">
              <div className="rounded-xl border border-slate-800 bg-[#0C121E] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-slate-100 font-sans">
                    OFFICIAL STATE REGISTER OF FIRST INFORMATION REPORT
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    RECORD REGISTERED
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 block">FIR NUMBER</span>
                    <span className="text-slate-200 font-bold">{document.extractedFields.firNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">POLICE STATION</span>
                    <span className="text-slate-200">{document.extractedFields.policeStation}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">DISTRICT</span>
                    <span className="text-slate-200">{document.extractedFields.district}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 border-t border-slate-800/60 pt-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">FIR DATE</span>
                    <span className="text-slate-200">{document.extractedFields.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">FIR TIME</span>
                    <span className="text-slate-200">{document.extractedFields.time}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">OCCURRENCE DATE</span>
                    <span className="text-slate-200">{document.extractedFields.dateOfOccurrence}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">OCCURRENCE TIME</span>
                    <span className="text-slate-200">{document.extractedFields.timeOfOccurrence}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800/60 pt-3">
                  <span className="text-[10px] text-slate-500 block">PLACE OF OCCURRENCE</span>
                  <span className="text-slate-200">{document.extractedFields.placeOfOccurrence}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">COMPLAINANT / INFORMANT</span>
                    <span className="text-slate-200 font-bold">{document.extractedFields.complainantName}</span>
                    <span className="text-slate-400 block text-[11px]">{document.extractedFields.complainantContact}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ACCUSED PERSON</span>
                    <span className="text-slate-200 font-bold">{document.extractedFields.accusedName}</span>
                    {document.extractedFields.accusedAge && (
                      <span className="text-slate-400 block text-[11px]">Age: {document.extractedFields.accusedAge}</span>
                    )}
                    {document.extractedFields.accusedDetails && (
                      <span className="text-slate-400 block text-[11px]">{document.extractedFields.accusedDetails}</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-800/60 pt-3">
                  <span className="text-[10px] text-slate-500 block">CHARGES &amp; SECTIONS OF LAW</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {document.extractedFields.offences.map((offence, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[11px]">
                        {offence}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-800/60 pt-3">
                  <span className="text-[10px] text-slate-500 block">BRIEF STATEMENT OF FACTS</span>
                  <p className="text-slate-300 font-sans text-xs mt-1 leading-relaxed whitespace-pre-wrap">
                    {document.extractedFields.briefFacts}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROVENANCE */}
          {activeTab === 'PROVENANCE' && (
            <div className="space-y-4 max-w-3xl mx-auto font-mono text-xs">
              <div className="rounded-xl border border-slate-800 bg-[#0C121E] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-slate-100 font-sans">
                    IMMUTABLE AUDIT TRAIL &amp; CHAIN OF CUSTODY
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ISO/IEC 27037 Digital Forensics
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-black/40 border border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">DOCUMENT INGESTION &amp; HASHING</span>
                        <span className="text-[10px] text-slate-400">{new Date(document.uploadedAt).toLocaleString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Uploaded by Officer {document.uploadedByOfficerName} ({document.uploadedByOfficerId}). Canonical SHA-256 leaf digest calculated:
                      </p>
                      <code className="text-[10px] text-emerald-400 block bg-black/60 p-1.5 rounded border border-slate-800">
                        {document.sha256Hash}
                      </code>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-black/40 border border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">OFFICER CONFIRMATION &amp; CHAIN ANCHORING</span>
                        <span className="text-[10px] text-slate-400">{document.confirmedAt ? new Date(document.confirmedAt).toLocaleString() : 'Confirmed'}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Confirmed by Officer {document.confirmedByOfficerName}. Transaction anchored to DCJMN Permissioned Proof-of-Authority ledger.
                      </p>
                      {document.blockchainTxHash && (
                        <div className="text-[10px] text-sky-400">
                          Tx Hash: <code>{document.blockchainTxHash}</code> (Block #{document.blockchainBlockIndex})
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-black/40 border border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">CROSS-INSTITUTION VERIFIABILITY</span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px]">ACTIVE</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Police, Forensics Labs, Sessions Court, and Correctional Facilities can independently verify this original leaf with zero trust required.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI FACTS */}
          {activeTab === 'AI_FACTS' && (
            <div className="space-y-4 max-w-3xl mx-auto font-mono text-xs">
              <div className="rounded-xl border border-slate-800 bg-[#0C121E] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Sparkles className="w-4 h-4" />
                    <h4 className="text-sm font-bold text-slate-100 font-sans">
                      DCJMN DOCUMENT INTELLIGENCE FACTS
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAIChat(true)}
                    className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open AI Chat Assistant</span>
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-black/30 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 block">EXECUTIVE SUMMARY</span>
                  <p className="text-slate-200 font-sans text-xs leading-relaxed">
                    {document.aiSummary.summary}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-black/30 border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-500 block">MAIN ALLEGATIONS</span>
                  <ul className="space-y-1 text-slate-300">
                    {document.aiSummary.mainAllegations.map((a, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-sky-400">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-black/30 border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-500 block">EVIDENTIARY EXHIBITS REFERENCED</span>
                  <ul className="space-y-1 text-emerald-300">
                    {document.aiSummary.evidenceReferenced.map((e, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span>✓</span>
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Embedded AI Chat Assistant Modal if triggered */}
      {showAIChat && (
        <FIRAIChatModal
          document={document}
          officerName={currentOfficerName}
          onClose={() => setShowAIChat(false)}
        />
      )}
    </div>
  );
};
