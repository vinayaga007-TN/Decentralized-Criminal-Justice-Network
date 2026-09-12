import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  X,
  Shield,
  Layers,
  Database,
  RefreshCw,
  Lock,
  Unlock,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

interface TamperDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export const TamperDemoModal: React.FC<TamperDemoModalProps> = ({
  isOpen,
  onClose,
  onRefreshData
}) => {
  const [targetType, setTargetType] = useState<'EVIDENCE' | 'CHARGESHEET' | 'CASE'>('EVIDENCE');
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [tamperedState, setTamperedState] = useState<boolean>(false);
  const [verificationOutput, setVerificationOutput] = useState<any>(null);

  if (!isOpen) return null;

  const handleSimulateTamper = async () => {
    setLoading(true);
    setResultMessage(null);
    try {
      const res = await api.simulateTamper(targetType);
      if (res.success) {
        setTamperedState(true);
        setResultMessage(`Tamper executed in off-chain database! Simulated malicious modification committed.`);
        // Run live verification to display the failure immediately
        runVerification();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      onRefreshData();
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const res = await api.restoreAuthentic(targetType);
      if (res.success) {
        setTamperedState(false);
        setResultMessage(`Authentic record state restored. Ledger hash match re-established.`);
        runVerification(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      onRefreshData();
    }
  };

  const runVerification = async (isRestoring: boolean = false) => {
    try {
      const id = targetType === 'EVIDENCE' ? 'EVD-2026-9901' : targetType === 'CHARGESHEET' ? 'CS-891-2026' : 'CASE-2026-00124';
      const fakeHash = isRestoring
        ? (targetType === 'EVIDENCE' ? '0x9b2d8e41a87c9812f8a0029b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b02cf6' : '0x4a71bf003c2bb0194821cc90184b291a00812f8a0029b3c4d5e6f7a8b9cee841')
        : '0x72AA43EF9100284bfa10029b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b43ef';

      const check = await api.verifyBlockchainIntegrity(targetType, id, fakeHash);
      if (check.success) {
        setVerificationOutput(check.result);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-red-500/40 bg-[#0C0B12] shadow-2xl text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-500/30 px-6 py-4 bg-[#140C12]">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-950/60 border border-red-500/50 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                TAMPER-DETECTION DEMONSTRATION LAB
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                  SECTION 25 PROTOCOL
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Observe Live Cryptographic Discrepancy Detection Against QBFT Blockchain Roots
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Target Select */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
              CHOOSE DATABASE ARTIFACT TO INJECT TAMPER:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { setTargetType('EVIDENCE'); setVerificationOutput(null); }}
                className={`p-3 rounded-lg border text-left font-mono transition-all ${
                  targetType === 'EVIDENCE'
                    ? 'border-red-500 bg-red-950/40 text-white'
                    : 'border-[#1E293B] bg-[#0A0D15] text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">01. EVIDENCE ITEM</div>
                <div className="text-[10px] text-slate-400 mt-0.5">EVD-2026-9901 (SSD)</div>
              </button>

              <button
                onClick={() => { setTargetType('CHARGESHEET'); setVerificationOutput(null); }}
                className={`p-3 rounded-lg border text-left font-mono transition-all ${
                  targetType === 'CHARGESHEET'
                    ? 'border-red-500 bg-red-950/40 text-white'
                    : 'border-[#1E293B] bg-[#0A0D15] text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">02. CHARGESHEET</div>
                <div className="text-[10px] text-slate-400 mt-0.5">CS-891-2026 (Charges)</div>
              </button>

              <button
                onClick={() => { setTargetType('CASE'); setVerificationOutput(null); }}
                className={`p-3 rounded-lg border text-left font-mono transition-all ${
                  targetType === 'CASE'
                    ? 'border-red-500 bg-red-950/40 text-white'
                    : 'border-[#1E293B] bg-[#0A0D15] text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">03. CASE RECORD</div>
                <div className="text-[10px] text-slate-400 mt-0.5">CASE-2026-00124 (FIR)</div>
              </button>
            </div>
          </div>

          {/* Action trigger buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSimulateTamper}
              disabled={loading}
              className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-xs font-bold font-mono text-white hover:bg-red-500 transition-colors shadow-md shadow-red-950/50 flex items-center justify-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>SIMULATE MALICIOUS DATABASE OVERWRITE</span>
            </button>

            <button
              onClick={handleRestore}
              disabled={loading}
              className="flex-1 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 text-xs font-bold font-mono text-emerald-300 hover:bg-emerald-900/40 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>RESTORE CERTIFIED AUTHENTIC STATE</span>
            </button>
          </div>

          {resultMessage && (
            <div className="rounded-lg border border-slate-700 bg-[#0A0D15] p-3 text-xs font-mono text-slate-300">
              {resultMessage}
            </div>
          )}

          {/* Verification Comparison Display */}
          {verificationOutput && (
            <div className={`rounded-xl border p-4 space-y-3 font-mono text-xs ${
              verificationOutput.verified
                ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                : 'border-red-500/50 bg-red-950/30 text-red-300'
            }`}>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-bold flex items-center gap-2">
                  {verificationOutput.verified ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>✓ RECORD INTEGRITY CONFIRMED (0 DISCREPANCIES)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span>⚠ INTEGRITY FAILURE: TAMPER DETECTED! ACCESS SUSPENDED</span>
                    </>
                  )}
                </span>
                <span className="text-[10px] text-slate-400">
                  Target: {verificationOutput.targetType} #{verificationOutput.targetId}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">RETRIEVED LOCAL HASH:</span>
                  <span className="font-mono text-white truncate max-w-xs">{verificationOutput.currentHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IMMUTABLE BLOCKCHAIN ROOT:</span>
                  <span className="font-mono text-emerald-400 truncate max-w-xs">{verificationOutput.blockchainHash}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ANCHORED IN BLOCK:</span>
                  <span className="text-slate-200">#{verificationOutput.blockNumber}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400">
                {verificationOutput.message}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
