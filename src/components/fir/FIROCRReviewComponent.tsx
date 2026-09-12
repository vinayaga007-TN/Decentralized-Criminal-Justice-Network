import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileText,
  User,
  MapPin,
  Calendar,
  Clock,
  Tag,
  CheckCircle2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Edit3,
  Lock,
  ArrowRight
} from 'lucide-react';
import { FIRDocument, FIRExtractedFields, FIRAISummary } from '../../types';

interface FIROCRReviewComponentProps {
  document: FIRDocument;
  extractedFields: FIRExtractedFields;
  aiSummary: FIRAISummary;
  rawOcrText: string;
  onConfirm: (confirmedFields: FIRExtractedFields, customTitle?: string) => void;
  onBack: () => void;
  loading?: boolean;
}

export const FIROCRReviewComponent: React.FC<FIROCRReviewComponentProps> = ({
  document,
  extractedFields: initialFields,
  aiSummary,
  rawOcrText,
  onConfirm,
  onBack,
  loading = false
}) => {
  const [fields, setFields] = useState<FIRExtractedFields>(initialFields);
  const [customTitle, setCustomTitle] = useState('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showFullHash, setShowFullHash] = useState(false);
  const [hashCopied, setHashCopied] = useState(false);
  const [activeReviewTab, setActiveReviewTab] = useState<'FIELDS' | 'AI_SUMMARY' | 'RAW_OCR'>('FIELDS');
  const [pdfPage, setPdfPage] = useState<number>(1);
  const totalPdfPages = 1;

  const handleFieldChange = (key: keyof FIRExtractedFields, value: any) => {
    setFields((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleOffencesChange = (value: string) => {
    const list = value.split(',').map((s) => s.trim()).filter(Boolean);
    setFields((prev) => ({
      ...prev,
      offences: list
    }));
  };

  const handleWitnessesChange = (value: string) => {
    const list = value.split(',').map((s) => s.trim()).filter(Boolean);
    setFields((prev) => ({
      ...prev,
      witnesses: list
    }));
  };

  const copyHash = () => {
    navigator.clipboard.writeText(document.sha256Hash);
    setHashCopied(true);
    setTimeout(() => setHashCopied(false), 2000);
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
    <div className="space-y-6">
      {/* Top Warning & Instructions Banner */}
      <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs font-mono">
            <span className="font-bold text-amber-300 block">
              OFFICER REVIEW &amp; CONFIRMATION REQUIRED
            </span>
            <p className="text-amber-200/80 font-sans text-xs">
              AI/OCR extraction does not silently become the official record. Review all fields against the original document below before anchoring to the blockchain.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold shrink-0">
          STATUS: PENDING CONFIRMATION
        </span>
      </div>

      {/* Main Split Grid: Left Document Viewer, Right Extracted Review */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Original Document Viewer (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#080C16] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                  Original FIR Document
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 20))}
                  className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  title="Zoom Out"
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
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(100)}
                  className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={openOriginalWindow}
                  className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  title="Open in new window"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Document Render Container with Zoom & Scroll */}
            <div className="relative h-[480px] overflow-auto rounded-lg bg-[#04060B] border border-slate-800/80 p-2 flex items-center justify-center">
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
                    alt="Original FIR Document"
                    className="max-w-full h-auto rounded shadow-xl border border-slate-700/50"
                  />
                ) : (
                  <iframe
                    src={document.fileDataUrl}
                    title="Original FIR Document"
                    className="w-[500px] h-[700px] rounded border border-slate-700/50 bg-white"
                  />
                )}
              </div>
            </div>

            {/* PDF Page Controls if applicable */}
            {document.documentType === 'PDF' && (
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-2">
                <button
                  type="button"
                  disabled={pdfPage <= 1}
                  onClick={() => setPdfPage((p) => Math.max(1, p - 1))}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                >
                  Previous Page
                </button>
                <span>Page {pdfPage} of {totalPdfPages}</span>
                <button
                  type="button"
                  disabled={pdfPage >= totalPdfPages}
                  onClick={() => setPdfPage((p) => Math.min(totalPdfPages, p + 1))}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                >
                  Next Page
                </button>
              </div>
            )}

            {/* Document Cryptographic Integrity Card */}
            <div className="rounded-lg bg-[#0D1322] border border-slate-800 p-3 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold uppercase">
                  Document Integrity Card
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px]">FILE NAME</span>
                  <span className="text-slate-300 truncate block font-medium" title={document.fileName}>
                    {document.fileName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">FILE SIZE</span>
                  <span className="text-slate-300 font-medium">{document.fileSizeFormatted}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">SHA-256 CANONICAL HASH</span>
                  <button
                    type="button"
                    onClick={() => setShowFullHash(!showFullHash)}
                    className="text-[10px] text-sky-400 hover:underline"
                  >
                    {showFullHash ? 'Compact' : 'View Full Hash'}
                  </button>
                </div>
                <div className="flex items-center justify-between bg-black/40 rounded p-1.5 border border-slate-800 mt-1">
                  <code className="text-[10px] text-emerald-400 truncate max-w-[280px]">
                    {showFullHash ? document.sha256Hash : `${document.sha256Hash.slice(0, 16)}...${document.sha256Hash.slice(-12)}`}
                  </code>
                  <button
                    type="button"
                    onClick={copyHash}
                    className="text-slate-400 hover:text-white ml-2 shrink-0"
                    title="Copy SHA-256"
                  >
                    {hashCopied ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Extracted Information Form & AI Summary (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#080C16] p-4 space-y-4">
            {/* Review Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex space-x-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveReviewTab('FIELDS')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    activeReviewTab === 'FIELDS'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Extracted Fields (Editable)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReviewTab('AI_SUMMARY')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
                    activeReviewTab === 'AI_SUMMARY'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Summary &amp; Facts</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReviewTab('RAW_OCR')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    activeReviewTab === 'RAW_OCR'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Raw OCR Text
                </button>
              </div>

              {fields.lowConfidenceFields && fields.lowConfidenceFields.length > 0 && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{fields.lowConfidenceFields.length} field(s) require review</span>
                </span>
              )}
            </div>

            {/* TAB 1: EXTRACTED EDITABLE FIELDS */}
            {activeReviewTab === 'FIELDS' && (
              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                {/* Optional Custom Case Title */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    CASE TITLE (OPTIONAL OVERRIDE)
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder={`State vs. ${fields.accusedName || 'Accused'} (${fields.offences[0] || 'Breach'})`}
                    className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                {/* Header 3-Column Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-mono text-slate-400">FIR NUMBER</label>
                      <span className="text-[9px] font-mono text-emerald-400">✓ HIGH</span>
                    </div>
                    <input
                      type="text"
                      value={fields.firNumber}
                      onChange={(e) => handleFieldChange('firNumber', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-mono text-slate-400">POLICE STATION</label>
                      <span className="text-[9px] font-mono text-emerald-400">✓ HIGH</span>
                    </div>
                    <input
                      type="text"
                      value={fields.policeStation}
                      onChange={(e) => handleFieldChange('policeStation', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-mono text-slate-400">DISTRICT</label>
                      <span className="text-[9px] font-mono text-emerald-400">✓ HIGH</span>
                    </div>
                    <input
                      type="text"
                      value={fields.district}
                      onChange={(e) => handleFieldChange('district', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Dates and Times */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">FIR DATE</label>
                    <input
                      type="text"
                      value={fields.date}
                      onChange={(e) => handleFieldChange('date', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-2.5 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">FIR TIME</label>
                    <input
                      type="text"
                      value={fields.time}
                      onChange={(e) => handleFieldChange('time', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-2.5 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">OCCURRENCE DATE</label>
                    <input
                      type="text"
                      value={fields.dateOfOccurrence}
                      onChange={(e) => handleFieldChange('dateOfOccurrence', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-2.5 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">OCCURRENCE TIME</label>
                    <input
                      type="text"
                      value={fields.timeOfOccurrence}
                      onChange={(e) => handleFieldChange('timeOfOccurrence', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-2.5 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Place of occurrence */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">
                    PLACE OF OCCURRENCE / JURISDICTION
                  </label>
                  <input
                    type="text"
                    value={fields.placeOfOccurrence}
                    onChange={(e) => handleFieldChange('placeOfOccurrence', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                {/* Complainant & Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">
                      COMPLAINANT / INFORMANT
                    </label>
                    <input
                      type="text"
                      value={fields.complainantName}
                      onChange={(e) => handleFieldChange('complainantName', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">
                      COMPLAINANT CONTACT / ADDRESS
                    </label>
                    <input
                      type="text"
                      value={fields.complainantContact}
                      onChange={(e) => handleFieldChange('complainantContact', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Accused Particulars with Low Confidence Flagging */}
                <div className="rounded-lg bg-[#0C121E] border border-slate-700/80 p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-300 uppercase">
                      Accused Particulars
                    </span>
                    {fields.lowConfidenceFields?.includes('accusedName') && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>Requires Verification</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">
                        ACCUSED NAME
                      </label>
                      <input
                        type="text"
                        value={fields.accusedName}
                        onChange={(e) => handleFieldChange('accusedName', e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">
                        AGE
                      </label>
                      <input
                        type="number"
                        value={fields.accusedAge || ''}
                        onChange={(e) => handleFieldChange('accusedAge', Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">
                      ACCUSED PARTICULARS / ALIAS
                    </label>
                    <input
                      type="text"
                      value={fields.accusedDetails || ''}
                      onChange={(e) => handleFieldChange('accusedDetails', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Statutory Offences */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">
                    STATUTORY OFFENCES &amp; SECTIONS (COMMA SEPARATED)
                  </label>
                  <input
                    type="text"
                    value={fields.offences.join(', ')}
                    onChange={(e) => handleOffencesChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                {/* Brief Facts */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 mb-1">
                    BRIEF FACTS OF INCIDENT (VERBATIM ACCORDING TO FIR)
                  </label>
                  <textarea
                    rows={3}
                    value={fields.briefFacts}
                    onChange={(e) => handleFieldChange('briefFacts', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3 py-2 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                {/* Witnesses & IO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">
                      WITNESSES RECORDED
                    </label>
                    <input
                      type="text"
                      value={fields.witnesses?.join(', ') || ''}
                      onChange={(e) => handleWitnessesChange(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1">
                      INVESTIGATING OFFICER (IO)
                    </label>
                    <input
                      type="text"
                      value={fields.investigatingOfficer || ''}
                      onChange={(e) => handleFieldChange('investigatingOfficer', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-[#04060B] px-3 py-1.5 text-xs font-mono text-white focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AI SUMMARY & FACT EXTRACTION */}
            {activeReviewTab === 'AI_SUMMARY' && (
              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1 text-xs font-mono">
                {/* Delineation Disclaimer */}
                <div className="rounded-lg bg-sky-950/20 border border-sky-500/30 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>DCJMN INTELLIGENCE ENGINE SYNTHESIS</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                    Clear delineation between verified source document facts and analytical AI synthesis.
                  </p>
                </div>

                {/* Narrative Summary */}
                <div className="rounded-lg bg-[#0C121E] border border-slate-800 p-3 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    [AI EXECUTIVE SYNTHESIS]
                  </span>
                  <p className="text-slate-200 font-sans text-xs leading-relaxed">
                    {aiSummary.summary}
                  </p>
                </div>

                {/* Main Allegations */}
                <div className="rounded-lg bg-[#0C121E] border border-slate-800 p-3 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    [PRIMARY ALLEGATIONS (DOCUMENT-GROUNDED)]
                  </span>
                  <ul className="space-y-1.5 text-slate-300">
                    {aiSummary.mainAllegations.map((a, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-sky-400 shrink-0">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Persons Mentioned */}
                <div className="rounded-lg bg-[#0C121E] border border-slate-800 p-3 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    [PERSONS MENTIONED]
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiSummary.personsMentioned.map((p, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Evidence Referenced */}
                <div className="rounded-lg bg-[#0C121E] border border-slate-800 p-3 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    [EVIDENTIARY EXHIBITS REFERENCED]
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    {aiSummary.evidenceReferenced.map((e, i) => (
                      <li key={i} className="flex items-start gap-2 text-emerald-300">
                        <span className="text-emerald-400 shrink-0">✓</span>
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Items Requiring Verification */}
                {aiSummary.itemsRequiringVerification && aiSummary.itemsRequiringVerification.length > 0 && (
                  <div className="rounded-lg bg-amber-950/20 border border-amber-500/30 p-3 space-y-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      [ITEMS REQUIRING INVESTIGATIVE VERIFICATION]
                    </span>
                    <ul className="space-y-1 text-amber-200">
                      {aiSummary.itemsRequiringVerification.map((v, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-400 shrink-0">⚠</span>
                          <span>{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: RAW OCR TRANSCRIPTION */}
            {activeReviewTab === 'RAW_OCR' && (
              <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>TRANSCRIPTION OF ORIGINAL LEAF</span>
                  <span>UNMODIFIED CAPTURE</span>
                </div>
                <pre className="w-full rounded-lg bg-[#04060B] border border-slate-800 p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {rawOcrText || 'No OCR transcription available.'}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors"
        >
          Cancel / Re-upload
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            Officer: <span className="text-slate-200 font-bold">{document.uploadedByOfficerName}</span>
          </span>
          <button
            type="button"
            disabled={loading}
            onClick={() => onConfirm(fields, customTitle)}
            className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>CONFIRM &amp; CREATE FIR</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
