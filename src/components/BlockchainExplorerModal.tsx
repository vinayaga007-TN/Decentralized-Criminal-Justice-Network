import React, { useState, useEffect } from 'react';
import {
  Layers,
  X,
  Shield,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Search,
  FileText,
  Clock,
  ExternalLink
} from 'lucide-react';
import { BlockchainBlock, AuditRecord, InstitutionType } from '../types';
import { api } from '../services/api';

interface BlockchainExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlockchainExplorerModal: React.FC<BlockchainExplorerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'BLOCKS' | 'AUDIT' | 'VALIDATORS'>('BLOCKS');
  const [blocks, setBlocks] = useState<BlockchainBlock[]>([]);
  const [auditLog, setAuditLog] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [blocksRes, auditRes] = await Promise.all([
        api.getBlocks(),
        api.getAuditTrail('all')
      ]);

      if (blocksRes.success) setBlocks(blocksRes.blocks);
      if (auditRes.success) setAuditLog(auditRes.auditTrail);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-4xl h-[85vh] flex flex-col rounded-2xl border border-[#1E293B] bg-[#0A0D15] shadow-2xl text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] px-6 py-4 bg-[#0E1322]">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                DCJMN CONSENSUS LEDGER & AUDIT EXPLORER
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  QBFT PROTOCOL
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Immutable On-Chain Anchor Repository & Non-Repudiable Event Stream
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Tabs */}
            <div className="flex rounded-lg bg-[#0A0D15] p-1 border border-[#1E293B]">
              <button
                onClick={() => setActiveTab('BLOCKS')}
                className={`px-3 py-1 text-xs font-mono rounded ${
                  activeTab === 'BLOCKS'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                BLOCKS
              </button>
              <button
                onClick={() => setActiveTab('AUDIT')}
                className={`px-3 py-1 text-xs font-mono rounded ${
                  activeTab === 'AUDIT'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AUDIT CONTRACT ({auditLog.length})
              </button>
              <button
                onClick={() => setActiveTab('VALIDATORS')}
                className={`px-3 py-1 text-xs font-mono rounded ${
                  activeTab === 'VALIDATORS'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                VALIDATOR NODES (4/4)
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="text-center py-16 text-slate-400 font-mono text-xs">
              Synchronizing with Sovereign QBFT Ledger Nodes...
            </div>
          ) : activeTab === 'BLOCKS' ? (
            <div className="space-y-3">
              {blocks.map((b) => (
                <div
                  key={b.blockNumber}
                  className="rounded-xl border border-[#1E293B] bg-[#0E1322] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold font-mono text-emerald-400">
                        BLOCK #{b.blockNumber.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        PROPOSER: {b.proposer}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(b.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-xs font-mono space-y-1 text-slate-400">
                    <div className="truncate">BLOCK HASH: <span className="text-slate-200">{b.blockHash}</span></div>
                    <div className="truncate">PARENT HASH: <span className="text-slate-400">{b.parentHash}</span></div>
                    <div className="truncate">STATE ROOT: <span className="text-slate-400">{b.stateRoot}</span></div>
                  </div>

                  {/* Transactions inside */}
                  {b.transactions.map((tx) => (
                    <div
                      key={tx.txHash}
                      className="rounded-lg bg-[#0A0D15] border border-[#1A2234] p-2.5 text-xs font-mono space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-bold">{tx.action}</span>
                        <span className="text-[10px] text-slate-500">CONTRACT: {tx.toContract}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">TX: {tx.txHash}</div>
                      <div className="text-[10px] text-slate-500 truncate">DATA HASH: {tx.dataHash}</div>
                    </div>
                  ))}

                  {/* QBFT Signatures */}
                  <div className="pt-2 border-t border-[#1E293B]/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>QBFT CONSENSUS: 4/4 QUORUM ATTESTED</span>
                    <span className="text-emerald-400 font-bold">COMMITTED</span>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'AUDIT' ? (
            <div className="space-y-2 font-mono text-xs">
              {auditLog.map((record) => {
                const isTamper = record.status === 'TAMPER_ALERT';
                return (
                  <div
                    key={record.id}
                    className={`rounded-lg border p-3 space-y-1.5 ${
                      isTamper
                        ? 'border-red-500/50 bg-red-950/20 text-red-300'
                        : 'border-[#1E293B] bg-[#0E1322] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isTamper
                            ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {record.action}
                        </span>
                        <span className="font-bold text-white">{record.institution}</span>
                        <span className="text-slate-500 text-[10px]">CASE: {record.caseId}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(record.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {record.details}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-[#1E293B]/60">
                      <span className="truncate max-w-sm">HASH: {record.recordHash}</span>
                      <span>BLOCK: #{record.blockNumber}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-sky-500/30 bg-[#0C121E] p-4 space-y-2">
                <span className="text-xs font-mono font-bold text-sky-400">POLICE_NODE (#01)</span>
                <div className="text-xs font-bold text-white">Metro Police Headquarters Node</div>
                <div className="text-[10px] font-mono text-slate-400">
                  Address: 0x3B82631024Fa4A228e9c403328fE11A99011B101
                </div>
                <div className="text-xs text-emerald-400 font-mono">STATUS: VALIDATING (WEIGHT: 1)</div>
              </div>

              <div className="rounded-xl border border-purple-500/30 bg-[#120E22] p-4 space-y-2">
                <span className="text-xs font-mono font-bold text-purple-400">FORENSIC_NODE (#03)</span>
                <div className="text-xs font-bold text-white">Central Forensic Science Laboratory</div>
                <div className="text-[10px] font-mono text-slate-400">
                  Address: 0x7C119842DA9d8123A492F009121c8B3392AA99D1
                </div>
                <div className="text-xs text-emerald-400 font-mono">STATUS: VALIDATING (WEIGHT: 1)</div>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-[#161208] p-4 space-y-2">
                <span className="text-xs font-mono font-bold text-amber-400">COURT_NODE (#04)</span>
                <div className="text-xs font-bold text-white">High Court Sovereign Judicial Bench</div>
                <div className="text-[10px] font-mono text-slate-400">
                  Address: 0xE8F9C30114002891bbCA449102A772BF88C301A2
                </div>
                <div className="text-xs text-emerald-400 font-mono">STATUS: VALIDATING (WEIGHT: 1)</div>
              </div>

              <div className="rounded-xl border border-rose-500/30 bg-[#160D0F] p-4 space-y-2">
                <span className="text-xs font-mono font-bold text-rose-400">PRISON_NODE (#04)</span>
                <div className="text-xs font-bold text-white">Central Correctional Detention Facility</div>
                <div className="text-[10px] font-mono text-slate-400">
                  Address: 0x9482A8C0B2914755102BB98F210411AB2277C091
                </div>
                <div className="text-xs text-emerald-400 font-mono">STATUS: VALIDATING (WEIGHT: 1)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
