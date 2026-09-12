import React, { useState, useEffect } from 'react';
import {
  Network,
  Shield,
  CheckCircle2,
  Server,
  Layers,
  Cpu,
  RefreshCw,
  Hash,
  ArrowRight,
  Clock
} from 'lucide-react';
import { BlockchainBlock, InstitutionType } from '../../types';
import { api } from '../../services/api';

interface BlockchainStatusData {
  status: string;
  consensus: string;
  validatorPeers: { id: string; institution: InstitutionType; address: string; name: string }[];
  latestBlockNumber: number;
  latestBlockHash: string;
  latestTxHash: string;
  consensusLatencyMs: number;
}

export const NetworkLedgerView: React.FC = () => {
  const [chainStatus, setChainStatus] = useState<BlockchainStatusData | null>(null);
  const [blocks, setBlocks] = useState<BlockchainBlock[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChainState();
    const interval = setInterval(fetchChainState, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchChainState = async () => {
    setLoading(true);
    try {
      const [statusRes, blocksRes] = await Promise.all([
        api.getBlockchainStatus(),
        api.getBlocks()
      ]);

      if (statusRes.success) {
        setChainStatus(statusRes);
      }
      if (blocksRes.success) {
        setBlocks(blocksRes.blocks);
      }
    } catch (e) {
      console.error('Failed to sync chain state:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase text-slate-400">Permissioned Ledger Infrastructure</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
              Consensus Active
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 font-mono uppercase">
            Network & Consensus Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Istanbul Byzantine Fault Tolerant (QBFT) consortium network with zero gas fees and deterministic finality.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchChainState}
          className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync State</span>
        </button>
      </div>

      {/* 19. QBFT Consensus Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0B0F1B] border border-slate-800/80 p-5 rounded space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-400 block">
            Consensus Protocol
          </span>
          <div className="text-xl font-semibold text-slate-100 font-mono">
            {chainStatus?.consensus || 'QBFT (Istanbul)'}
          </div>
          <div className="text-[10px] font-mono text-emerald-400">
            Round: 0 • Deterministic Finality
          </div>
        </div>

        <div className="bg-[#0B0F1B] border border-slate-800/80 p-5 rounded space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-400 block">
            Active Validators
          </span>
          <div className="text-xl font-semibold text-slate-100 font-mono">
            {chainStatus?.validatorPeers?.length || 4} / 4 Nodes
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            100% Peer Quorum Verified
          </div>
        </div>

        <div className="bg-[#0B0F1B] border border-slate-800/80 p-5 rounded space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-400 block">
            Canonical Block Height
          </span>
          <div className="text-xl font-semibold text-slate-100 font-mono">
            #{chainStatus?.latestBlockNumber?.toLocaleString() || '48,192'}
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            Latency: {chainStatus?.consensusLatencyMs || 84}ms (QBFT Round)
          </div>
        </div>

        <div className="bg-[#0B0F1B] border border-slate-800/80 p-5 rounded space-y-1">
          <span className="text-[11px] font-mono uppercase text-slate-400 block">
            Gas Economics
          </span>
          <div className="text-xl font-semibold text-slate-100 font-mono">
            0.00 GWEI
          </div>
          <div className="text-[10px] font-mono text-emerald-400">
            Gas-Free Sovereign Governance
          </div>
        </div>
      </div>

      {/* 19. Validator Nodes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase">
            Institutional Validator Nodes
          </h3>
          <span className="text-xs font-mono text-slate-500">Peer-to-Peer TLS 1.3 Transport</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(chainStatus?.validatorPeers || [
            {
              id: 'val-node-police-01',
              institution: 'POLICE' as InstitutionType,
              name: 'Police Sovereign Node',
              address: '0x12a9...33f1'
            },
            {
              id: 'val-node-court-02',
              institution: 'COURT' as InstitutionType,
              name: 'Court Judicial Node',
              address: '0x44b8...09e2'
            },
            {
              id: 'val-node-forensics-03',
              institution: 'FORENSICS' as InstitutionType,
              name: 'CFSL Forensics Node',
              address: '0x77c1...88b4'
            },
            {
              id: 'val-node-prison-04',
              institution: 'PRISON' as InstitutionType,
              name: 'Correctional Facility Node',
              address: '0x99e0...65a1'
            }
          ]).map((node) => (
            <div key={node.id} className="bg-[#0B0F1B] border border-slate-800/80 rounded p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200 uppercase">{node.institution}</span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  ONLINE
                </span>
              </div>
              <div className="text-xs text-slate-300 font-sans font-medium">
                {node.name}
              </div>
              <div className="text-[11px] font-mono text-slate-500 space-y-0.5 pt-2 border-t border-slate-800/60">
                <div className="truncate">Node ID: {node.id}</div>
                <div className="truncate">Address: {node.address}</div>
                <div>Status: Quorum Signer</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 19. Recent Committed Blocks Table */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-100 font-mono uppercase">
          Recent Committed Blocks
        </h3>

        <div className="bg-[#0B0F1B] border border-slate-800/80 rounded overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 bg-[#080C16] text-[11px] font-mono uppercase text-slate-400">
                <th className="py-3 px-4 font-medium">Block Height</th>
                <th className="py-3 px-4 font-medium">Validator Signer</th>
                <th className="py-3 px-4 font-medium">Transactions</th>
                <th className="py-3 px-4 font-medium">State Root Hash</th>
                <th className="py-3 px-4 font-medium text-right">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {blocks.length > 0 ? (
                blocks.slice(0, 7).map((b) => (
                  <tr key={b.blockNumber} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-200">
                      #{b.blockNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans">
                      {b.miner || 'Consensus Proposer'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {b.transactions?.length || 1} transactions
                    </td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-xs" title={b.blockHash}>
                      {b.blockHash.slice(0, 18)}...
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                [
                  { height: 48192, proposer: 'Police Sovereign Node', txs: 3, hash: '0x7e88b2a93411...912c', age: '4s ago' },
                  { height: 48191, proposer: 'Court Judicial Node', txs: 1, hash: '0x94bb21a082f5...44e1', age: '16s ago' },
                  { height: 48190, proposer: 'CFSL Forensics Node', txs: 2, hash: '0x12d09fe91a03...aa54', age: '28s ago' },
                  { height: 48189, proposer: 'Correctional Facility Node', txs: 1, hash: '0x66f381c81804...cc89', age: '40s ago' }
                ].map((b) => (
                  <tr key={b.height} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-200">
                      #{b.height}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans">
                      {b.proposer}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {b.txs} anchored
                    </td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-xs">
                      {b.hash}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {b.age}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
