import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Network,
  Users,
  AlertTriangle,
  FileText,
  Clock,
  RefreshCw,
  CheckCircle2,
  Database,
  ArrowRight,
  RotateCcw,
  Fingerprint
} from 'lucide-react';
import { InstitutionalIdentity, AuditRecord } from '../../types';
import { api } from '../../services/api';

interface SecurityCenterViewProps {
  currentIdentity: InstitutionalIdentity | null;
  onRefreshData: () => void;
  tamperCount: number;
}

export const SecurityCenterView: React.FC<SecurityCenterViewProps> = ({
  currentIdentity,
  onRefreshData,
  tamperCount
}) => {
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAuditTrail();
  }, []);

  const fetchAuditTrail = async () => {
    try {
      const res = await api.getAuditTrail('all');
      if (res.success) {
        setAuditLogs(res.auditTrail);
      }
    } catch (e) {
      console.error('Failed to load audit trail:', e);
    }
  };

  const handleSimulateTamper = async (targetType: 'CASE' | 'EVIDENCE' | 'CHARGESHEET') => {
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await api.simulateTamper(targetType);
      if (res.success) {
        setActionMessage(`MALICIOUS WRITE SIMULATED: ${res.message}. Hash discrepancy triggered in smart contract.`);
        onRefreshData();
        fetchAuditTrail();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreAuthentic = async (targetType: 'CASE' | 'EVIDENCE' | 'CHARGESHEET') => {
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await api.restoreAuthentic(targetType);
      if (res.success) {
        setActionMessage(`CANONICAL RESTORATION: ${res.message}. Authentic off-chain state synced to blockchain state root.`);
        onRefreshData();
        fetchAuditTrail();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono uppercase text-slate-400">Sovereign Cryptographic Infrastructure</span>
          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono">
            Zero-Trust Architecture
          </span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100 font-mono uppercase">
          Security Center & Cryptographic Attestation
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Identity lifecycle, off-chain AES-256 GCM storage isolation, permissioned consensus roots, and immutable audit trails.
        </p>
      </div>

      {/* 18. Identity & Credential Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Identity Card */}
        <div className="bg-[#0B0F1B] border border-slate-800/80 rounded p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Identity Status
            </h3>
            <span className="text-emerald-400 text-xs font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ACTIVE
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="text-slate-100 font-sans font-medium text-sm">
              {currentIdentity?.name || 'Inspector Kumar'}
            </div>
            <div className="text-slate-400">
              {currentIdentity?.role} ({currentIdentity?.institution})
            </div>
            <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-800/60">
              Badge ID: {currentIdentity?.badgeNumber}
            </div>
          </div>
        </div>

        {/* Credential Status */}
        <div className="bg-[#0B0F1B] border border-slate-800/80 rounded p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Credential Status
            </h3>
            <span className="text-xs font-mono text-emerald-400">Ed25519 VALID</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="text-slate-400 text-[11px]">Public Key Anchor:</div>
            <div className="p-2 rounded bg-[#080B11] border border-slate-800 text-[11px] text-slate-300 break-all select-all">
              {currentIdentity?.publicKey || '0x3B82631024Fa4A228e9c403328fE11A99011B101'}
            </div>
            <div className="text-[10px] text-slate-500 pt-1">
              Biometric Minutiae Attested: Face, Iris, Fingerprint
            </div>
          </div>
        </div>

        {/* Cryptographic Encryption Architecture */}
        <div className="bg-[#0B0F1B] border border-slate-800/80 rounded p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Encryption Protocol
            </h3>
            <span className="text-xs font-mono text-slate-400">FIPS 140-2</span>
          </div>

          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Off-Chain Database:</span>
              <span>AES-256 GCM</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">On-Chain State Root:</span>
              <span>SHA-256 Merkle</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Node Signature:</span>
              <span>Ed25519 Sovereign</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 25: Interactive Tamper-Detection Lab */}
      <div className="bg-[#0B0F1B] border border-slate-800/80 rounded p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase">
                Section 25: Database Integrity & Tamper-Detection Demonstration
              </h3>
              {tamperCount > 0 ? (
                <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-mono animate-pulse">
                  ⚠ INTEGRITY COMPROMISED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                  ✓ ZERO DISCREPANCIES
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Test sovereign ledger defense against malicious off-chain database manipulation.
            </p>
          </div>
        </div>

        {actionMessage && (
          <div className={`p-3 rounded border text-xs font-mono ${
            tamperCount > 0
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            {actionMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Case Tamper */}
          <div className="p-4 rounded bg-[#080B11] border border-slate-800 space-y-3">
            <div className="text-xs font-mono font-semibold text-slate-200">
              Police FIR Record
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Simulate rogue database administrator modifying FIR charges and incident notes in police_db.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSimulateTamper('CASE')}
                className="flex-1 px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-200 rounded text-[11px] font-mono uppercase transition-colors"
              >
                Inject Tamper
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleRestoreAuthentic('CASE')}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono uppercase transition-colors"
                title="Restore from Blockchain Canonical State"
              >
                Restore
              </button>
            </div>
          </div>

          {/* Evidence Tamper */}
          <div className="p-4 rounded bg-[#080B11] border border-slate-800 space-y-3">
            <div className="text-xs font-mono font-semibold text-slate-200">
              CFSL Seized Exhibit
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Simulate unauthorized alteration of SSD raw bitstream image hash in laboratory storage logs.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSimulateTamper('EVIDENCE')}
                className="flex-1 px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-200 rounded text-[11px] font-mono uppercase transition-colors"
              >
                Inject Tamper
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleRestoreAuthentic('EVIDENCE')}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono uppercase transition-colors"
                title="Restore from Blockchain Canonical State"
              >
                Restore
              </button>
            </div>
          </div>

          {/* Chargesheet Tamper */}
          <div className="p-4 rounded bg-[#080B11] border border-slate-800 space-y-3">
            <div className="text-xs font-mono font-semibold text-slate-200">
              Prosecution Chargesheet
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Simulate tampering with statutory penal sections docketed in the court registry.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSimulateTamper('CHARGESHEET')}
                className="flex-1 px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-200 rounded text-[11px] font-mono uppercase transition-colors"
              >
                Inject Tamper
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleRestoreAuthentic('CHARGESHEET')}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono uppercase transition-colors"
                title="Restore from Blockchain Canonical State"
              >
                Restore
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 18. Non-Repudiable Audit Trail & Security Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase">
              Immutable Security Event Stream
            </h3>
            <p className="text-xs text-slate-400">
              All interactions digitally signed and permanently appended to AuditContract
            </p>
          </div>
          <button
            type="button"
            onClick={fetchAuditTrail}
            className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="bg-[#0B0F1B] border border-slate-800/80 rounded divide-y divide-slate-800/60">
          {auditLogs.length > 0 ? (
            auditLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded ${
                    log.status === 'TAMPER_ALERT' 
                      ? 'bg-rose-500/10 text-rose-400'
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {log.status === 'TAMPER_ALERT' ? <AlertTriangle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">{log.action}</span>
                    <span className="text-slate-400 font-sans text-xs ml-2">{log.details}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-[11px] text-slate-500 pl-8 sm:pl-0">
                  <span>Block #{log.blockNumber}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  <span className={log.status === 'TAMPER_ALERT' ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              No audit logs recorded for the selected scope.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
