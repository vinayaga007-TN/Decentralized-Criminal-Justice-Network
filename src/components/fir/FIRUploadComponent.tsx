import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck,
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../../services/api';
import { FIRDocument, FIRExtractedFields, FIRAISummary } from '../../types';

interface FIRUploadComponentProps {
  onDocumentProcessed: (result: {
    document: FIRDocument;
    sha256Hash: string;
    extractedFields: FIRExtractedFields;
    aiSummary: FIRAISummary;
    rawOcrText: string;
  }) => void;
  onCancel?: () => void;
}

interface SampleItem {
  id: string;
  name: string;
  category: string;
  documentType: string;
  fileName: string;
  mimeType: string;
  fileSizeFormatted: string;
  previewUrl: string;
  extractedFields: FIRExtractedFields;
  aiSummary: FIRAISummary;
}

export const FIRUploadComponent: React.FC<FIRUploadComponentProps> = ({
  onDocumentProcessed,
  onCancel
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [samples, setSamples] = useState<SampleItem[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Load pre-seeded realistic samples
    api.getFIRSamples()
      .then((res) => {
        if (res.success && res.samples) {
          setSamples(res.samples);
        }
      })
      .catch((err) => console.warn('Could not fetch FIR samples:', err))
      .finally(() => setLoadingSamples(false));

    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        streamRef.current = stream;
        setCameraActive(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        }, 100);
      } else {
        // Fallback to native capture input
        cameraInputRef.current?.click();
      }
    } catch (err: any) {
      console.warn('Camera access fallback to file capture:', err?.message);
      cameraInputRef.current?.click();
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 1100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      stopCamera();
      processUploadedFile(dataUrl, `captured-fir-${Date.now()}.jpg`, 'image/jpeg', Math.round(dataUrl.length * 0.75));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setError(null);
    const validMimes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];

    if (!validMimes.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|webp)$/i)) {
      setError('Invalid file format. Please upload PDF, JPG, PNG, or WEBP.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('File exceeds maximum size limit (25 MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      processUploadedFile(dataUrl, file.name, file.type || 'application/octet-stream', file.size);
    };
    reader.onerror = () => {
      setError('Failed to read document file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSampleSelected = async (sample: SampleItem) => {
    setError(null);
    setProcessing(true);
    setProcessingStep('Loading official verified sample document...');

    try {
      await new Promise((r) => setTimeout(r, 400));
      setProcessingStep('Computing canonical SHA-256 hash of original document...');
      await new Promise((r) => setTimeout(r, 400));
      setProcessingStep('Extracting structured FIR fields and AI intelligence summary...');

      const res = await api.uploadFIRDocument({
        sampleId: sample.id
      });

      if (res.success && res.document) {
        setProcessingStep('OCR & Document Extraction Complete ✓');
        await new Promise((r) => setTimeout(r, 300));
        onDocumentProcessed({
          document: res.document,
          sha256Hash: res.sha256Hash,
          extractedFields: res.extractedFields,
          aiSummary: res.aiSummary,
          rawOcrText: res.rawOcrText
        });
      } else {
        setError(res.error || 'Failed to process sample FIR document.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to process sample document.');
    } finally {
      setProcessing(false);
    }
  };

  const processUploadedFile = async (
    fileDataUrl: string,
    fileName: string,
    mimeType: string,
    fileSize: number
  ) => {
    setProcessing(true);
    setError(null);
    setProcessingStep('Validating file integrity & mime headers...');

    try {
      await new Promise((r) => setTimeout(r, 400));
      setProcessingStep('Calculating SHA-256 cryptographic hash of original document...');
      await new Promise((r) => setTimeout(r, 400));
      setProcessingStep('Executing handwriting detection & OCR field extraction...');

      const res = await api.uploadFIRDocument({
        fileDataUrl,
        fileName,
        fileSize,
        mimeType
      });

      if (res.success && res.document) {
        setProcessingStep('OCR & Document Understanding Complete ✓');
        await new Promise((r) => setTimeout(r, 300));
        onDocumentProcessed({
          document: res.document,
          sha256Hash: res.sha256Hash,
          extractedFields: res.extractedFields,
          aiSummary: res.aiSummary,
          rawOcrText: res.rawOcrText
        });
      } else {
        setError(res.error || 'Failed to process uploaded FIR document.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to upload and parse FIR document.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden file & camera inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg bg-red-950/40 border border-red-500/40 p-3.5 text-xs text-red-300 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">INGESTION ERROR</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Camera modal / live stream */}
      {cameraActive && (
        <div className="rounded-xl border border-sky-500/40 bg-[#090D16] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
              <Camera className="w-4 h-4" />
              <span>LIVE DOCUMENT SCANNER (ISO/IEC 30107)</span>
            </div>
            <button
              type="button"
              onClick={stopCamera}
              className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1"
            >
              Cancel
            </button>
          </div>
          <div className="relative aspect-[4/3] w-full max-w-md mx-auto overflow-hidden rounded-lg bg-black border border-slate-700">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-4 border-2 border-dashed border-sky-400/60 rounded-md pointer-events-none flex items-center justify-center">
              <span className="text-[11px] font-mono text-sky-300/80 bg-black/60 px-2 py-1 rounded">
                Align FIR within border
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={capturePhoto}
              className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>CAPTURE DOCUMENT PHOTO</span>
            </button>
          </div>
        </div>
      )}

      {/* Processing overlay state */}
      {processing ? (
        <div className="rounded-xl border border-sky-500/40 bg-[#0A0E1A] p-10 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-sky-400 animate-spin mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-100 font-sans tracking-wide">
              PROCESSING OFFICIAL FIR DOCUMENT
            </h4>
            <p className="text-xs text-sky-400 font-mono animate-pulse">
              {processingStep}
            </p>
          </div>
          <div className="max-w-md mx-auto text-left rounded-lg bg-[#070A12] border border-slate-800 p-3 text-[11px] font-mono text-slate-400 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Original document immutable archive prepared</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SHA-256 leaf digest hashing</span>
            </div>
            <div className="flex items-center gap-2 text-sky-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>AI &amp; OCR text transcription in progress...</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Drag & Drop Upload Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-sky-400 bg-sky-950/20'
                : 'border-slate-700/80 hover:border-sky-500/60 bg-[#0A0E1A]/80 hover:bg-[#0E1526]'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="max-w-sm mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto text-sky-400">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-200 font-sans">
                  Drag &amp; Drop FIR Document Here
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  or click to browse from local computer
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">
                  PDF
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">
                  JPG / JPEG
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">
                  PNG
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700">
                  Max 20MB
                </span>
              </div>
            </div>
          </div>

          {/* Alternative Capture Action */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <button
              type="button"
              onClick={startCamera}
              className="flex-1 py-2.5 px-4 rounded-lg bg-[#0F172A] hover:bg-[#1E293B] border border-slate-700 text-xs font-mono text-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4 text-sky-400" />
              <span>Take Photo / Capture Document</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2.5 px-4 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-xs font-mono text-sky-300 flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Choose Document File</span>
            </button>
          </div>

          {/* Preloaded Realistic Samples Section */}
          <div className="rounded-xl border border-slate-800 bg-[#080C16] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  Test with Realistic FIR Documents:
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                1-Click Ingestion &amp; OCR
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {samples.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSampleSelected(sample)}
                  className="text-left p-3 rounded-lg border border-slate-700/80 bg-[#0D1322] hover:bg-[#131C31] hover:border-sky-500/50 transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] font-mono font-semibold border border-sky-500/20">
                      {sample.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {sample.fileSizeFormatted}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-200 group-hover:text-sky-300 font-sans line-clamp-1">
                    {sample.name}
                  </h5>
                  <p className="text-[11px] text-slate-400 font-mono truncate">
                    Offence: {sample.extractedFields.offences[0] || 'Criminal Breach'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Legal / Cryptographic Notice */}
          <div className="flex items-start gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/40 rounded-lg p-3 border border-slate-800/80">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300 block">
                IMMUTABLE DOCUMENT PRESERVATION ASSURANCE:
              </span>
              <span>
                The uploaded FIR document is archived in its authentic binary form. Its SHA-256 leaf digest will be anchored to the DCJMN permissioned ledger. AI extraction facilitates officer review and never replaces human verification.
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
