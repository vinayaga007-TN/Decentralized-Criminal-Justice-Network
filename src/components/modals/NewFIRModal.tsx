import React, { useState } from 'react';
import {
  Shield,
  X,
  FileUp,
  Keyboard,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Hash,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { CaseRecord, FIRDocument, FIRExtractedFields, FIRAISummary } from '../../types';
import { FIRUploadComponent } from '../fir/FIRUploadComponent';
import { FIROCRReviewComponent } from '../fir/FIROCRReviewComponent';

interface NewFIRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newCase: CaseRecord) => void;
  officerName?: string;
  officerId?: string;
}

type ModalStep = 'SELECT_METHOD' | 'REVIEW_EXTRACTION' | 'SUCCESS_ANCHORED';

export const NewFIRModal: React.FC<NewFIRModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  officerName = 'Inspector V. Ramanathan',
  officerId = 'POL-TN-8821'
}) => {
  const [activeTab, setActiveTab] = useState<'UPLOAD' | 'MANUAL'>('UPLOAD');
  const [step, setStep] = useState<ModalStep>('SELECT_METHOD');

  // Uploaded and OCR parsed document state
  const [processedDoc, setProcessedDoc] = useState<{
    document: FIRDocument;
    sha256Hash: string;
    extractedFields: FIRExtractedFields;
    aiSummary: FIRAISummary;
    rawOcrText: string;
  } | null>(null);

  // Confirmed result
  const [confirmedResult, setConfirmedResult] = useState<{
    case: CaseRecord;
    firDocument: FIRDocument;
    txHash: string;
    blockIndex: number;
  } | null>(null);

  // Manual fallback form state
  const [manualTitle, setManualTitle] = useState('');
  const [manualIncident, setManualIncident] = useState('');
  const [manualComplainant, setManualComplainant] = useState('');
  const [manualAccused, setManualAccused] = useState('');
  const [manualAge, setManualAge] = useState(30);
  const [manualCharges, setManualCharges] = useState('Sec. 420 (Fraud), Sec. 120-B (Conspiracy)');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDocumentProcessed = (result: {
    document: FIRDocument;
    sha256Hash: string;
    extractedFields: FIRExtractedFields;
    aiSummary: FIRAISummary;
    rawOcrText: string;
  }) => {
    setProcessedDoc(result);
    setStep('REVIEW_EXTRACTION');
  };

  const handleConfirmFIR = async (confirmedFields: FIRExtractedFields, customTitle?: string) => {
    if (!processedDoc) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.confirmFIRDocument({
        documentId: processedDoc.document.id,
        confirmedFields,
        customTitle,
        officerId,
        officerName
      });

      if (res.success && res.case && res.firDocument) {
        setConfirmedResult({
          case: res.case,
          firDocument: res.firDocument,
          txHash: res.tx?.txHash || (res.tx as any)?.hash || res.firDocument.txHash || '0x...',
          blockIndex: res.block?.blockNumber || (res.block as any)?.index || res.firDocument.blockNumber || 0
        });
        setStep('SUCCESS_ANCHORED');
        onCreated(res.case);
      } else {
        setError(res.error || 'Failed to confirm FIR and anchor on blockchain.');
      }
    } catch (err: any) {
      setError(err?.message || 'Transaction dispatch failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualIncident) {
      setError('Title and Incident Details are required.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.createManualFIR({
        title: manualTitle,
        incidentDetails: manualIncident,
        complainant: manualComplainant || 'Citizen Complainant',
        accusedName: manualAccused || 'Suspect Undisclosed',
        accusedAge: Number(manualAge) || 30,
        charges: manualCharges.split(',').map((c) => c.trim()),
        officerId,
        officerName
      });

      if (res.success && res.case && res.firDocument) {
        setConfirmedResult({
          case: res.case,
          firDocument: res.firDocument,
          txHash: res.tx?.txHash || (res.tx as any)?.hash || res.firDocument.txHash || '0x...',
          blockIndex: res.block?.blockNumber || (res.block as any)?.index || res.firDocument.blockNumber || 0
        });
        setStep('SUCCESS_ANCHORED');
        onCreated(res.case);
      } else {
        setError('Failed to anchor FIR on DCJMN CaseRegistry.');
      }
    } catch (err: any) {
      setError('Blockchain transaction dispatch failed.');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setProcessedDoc(null);
    setConfirmedResult(null);
    setStep('SELECT_METHOD');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div
        className={`relative w-full rounded-2xl border border-sky-500/40 bg-[#090D18] shadow-2xl text-slate-200 overflow-hidden transition-all ${
          step === 'REVIEW_EXTRACTION'
            ? 'max-w-6xl max-h-[95vh] flex flex-col'
            : step === 'SUCCESS_ANCHORED'
            ? 'max-w-xl'
            : 'max-w-2xl max-h-[92vh] flex flex-col'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-[#060A13] shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans tracking-wide">
                {step === 'SELECT_METHOD' && 'REGISTER FIRST INFORMATION REPORT (FIR)'}
                {step === 'REVIEW_EXTRACTION' && 'OFFICER REVIEW & FIELD VERIFICATION'}
                {step === 'SUCCESS_ANCHORED' && 'FIR REGISTERED & BLOCKCHAIN ANCHORED'}
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                DCJMN Police Portal | Duty Officer: {officerName} ({officerId})
              </p>
            </div>
          </div>
          <button
            onClick={resetModal}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mx-6 mt-4 flex items-center space-x-2 rounded-lg bg-red-950/40 border border-red-500/40 p-3 text-xs text-red-300 font-mono">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: SELECT METHOD (DOCUMENT UPLOAD VS MANUAL FALLBACK) */}
        {step === 'SELECT_METHOD' && (
          <div className="p-6 overflow-y-auto space-y-5">
            {/* Primary Toggle: Upload vs Fallback */}
            <div className="flex rounded-xl bg-[#060A13] border border-slate-800 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('UPLOAD')}
                className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'UPLOAD'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileUp className="w-4 h-4" />
                <span>UPLOAD FIR DOCUMENT (RECOMMENDED)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('MANUAL')}
                className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'MANUAL'
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Keyboard className="w-4 h-4" />
                <span>MANUAL ENTRY (FALLBACK)</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'UPLOAD' ? (
              <FIRUploadComponent
                onDocumentProcessed={handleDocumentProcessed}
                onCancel={resetModal}
              />
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="rounded-lg bg-amber-950/20 border border-amber-500/30 p-3 text-xs font-mono text-amber-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Manual FIR creation synthesizes an immutable electronic record. For formal legal integrity, document upload with original scan/photo is preferred.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    CASE TITLE / CAPTION
                  </label>
                  <input
                    type="text"
                    required
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="e.g. State vs. Cyber Breach Suspects"
                    className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3.5 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    INCIDENT DETAILS &amp; FACTS
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={manualIncident}
                    onChange={(e) => setManualIncident(e.target.value)}
                    placeholder="Provide objective facts of incident, location, seized objects, complainant statements..."
                    className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3.5 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      COMPLAINANT NAME
                    </label>
                    <input
                      type="text"
                      value={manualComplainant}
                      onChange={(e) => setManualComplainant(e.target.value)}
                      placeholder="e.g. Anand Sundaram"
                      className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      ACCUSED NAME
                    </label>
                    <input
                      type="text"
                      value={manualAccused}
                      onChange={(e) => setManualAccused(e.target.value)}
                      placeholder="e.g. Ravi Kiran Sharma"
                      className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      ACCUSED AGE
                    </label>
                    <input
                      type="number"
                      value={manualAge}
                      onChange={(e) => setManualAge(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      STATUTORY CHARGES
                    </label>
                    <input
                      type="text"
                      value={manualCharges}
                      onChange={(e) => setManualCharges(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3.5 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={resetModal}
                    className="rounded-lg px-4 py-2 text-xs font-mono text-slate-400 hover:bg-slate-800"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-sky-600 px-5 py-2 text-xs font-bold font-mono text-white hover:bg-sky-500 shadow-md shadow-sky-950/50"
                  >
                    {loading ? 'MINING BLOCK...' : 'ANCHOR FIR ON LEDGER'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* STEP 2: REVIEW EXTRACTION & OFFICER CONFIRMATION */}
        {step === 'REVIEW_EXTRACTION' && processedDoc && (
          <div className="p-6 overflow-y-auto flex-1">
            <FIROCRReviewComponent
              document={processedDoc.document}
              extractedFields={processedDoc.extractedFields}
              aiSummary={processedDoc.aiSummary}
              rawOcrText={processedDoc.rawOcrText}
              loading={loading}
              onBack={() => setStep('SELECT_METHOD')}
              onConfirm={handleConfirmFIR}
            />
          </div>
        )}

        {/* STEP 3: SUCCESS & BLOCKCHAIN ANCHORING CONFIRMATION */}
        {step === 'SUCCESS_ANCHORED' && confirmedResult && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white font-sans">
                FIR ANCHORED &amp; REGISTERED ON LEDGER
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                Original document cryptographically bound to DCJMN Case Registry
              </p>
            </div>

            <div className="rounded-xl bg-[#050811] border border-slate-800 p-4 text-left font-mono text-xs space-y-3">
              <div className="grid grid-cols-2 gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-[10px] text-slate-500 block">CASE ID</span>
                  <span className="text-sky-400 font-bold">{confirmedResult.case.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">FIR NUMBER</span>
                  <span className="text-slate-200 font-bold">{confirmedResult.firDocument.extractedFields.firNumber}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">ORIGINAL FILE SHA-256 HASH</span>
                <code className="text-[10px] text-emerald-400 block truncate bg-black/60 p-1.5 rounded border border-slate-800 mt-0.5">
                  {confirmedResult.firDocument.sha256Hash}
                </code>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-2.5">
                <div>
                  <span className="text-[10px] text-slate-500 block">BLOCK INDEX</span>
                  <span className="text-slate-300">Block #{confirmedResult.blockIndex}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">TRANSACTION HASH</span>
                  <span className="text-sky-400 truncate block text-[11px]">{confirmedResult.txHash.slice(0, 16)}...</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={resetModal}
                className="px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold shadow-lg shadow-sky-950/40"
              >
                RETURN TO POLICE PORTAL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
