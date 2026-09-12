import React from 'react';
import {
  Shield,
  Activity,
  Lock,
  Layers,
  Fingerprint,
  AlertTriangle,
  Scale,
  FlaskConical,
  Building2,
  GitCommit,
  CheckCircle2
} from 'lucide-react';
import { InstitutionType, InstitutionalIdentity } from '../types';

interface NavbarProps {
  activeInstitution: InstitutionType | 'LIFECYCLE';
  onSelectInstitution: (inst: InstitutionType | 'LIFECYCLE') => void;
  currentIdentity: InstitutionalIdentity | null;
  onOpenBiometricGateway: () => void;
  onOpenLedger: () => void;
  onOpenTamperDemo: () => void;
  blockHeight: number;
  tamperCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeInstitution,
  onSelectInstitution,
  currentIdentity,
  onOpenBiometricGateway,
  onOpenLedger,
  onOpenTamperDemo,
  blockHeight,
  tamperCount
}) => {
  const getInstitutionBadgeColor = (inst: InstitutionType) => {
    switch (inst) {
      case 'POLICE':
        return 'border-sky-500/40 text-sky-400 bg-sky-500/10';
      case 'FORENSICS':
        return 'border-purple-500/40 text-purple-400 bg-purple-500/10';
      case 'COURT':
        return 'border-amber-500/40 text-amber-400 bg-amber-500/10';
      case 'PRISON':
        return 'border-rose-500/40 text-rose-400 bg-rose-500/10';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1E2638] bg-[#0A0D14]/95 backdrop-blur-md">
      {/* Top Status Bar: Sovereign Federation Info */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#161C2A] px-4 py-1.5 text-xs text-slate-400 font-mono">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>QBFT SOVEREIGN CONSENSUS</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">JURISDICTION: FEDERAL DISTRICT #04</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">VALIDATOR NODES: 4/4 ACTIVE</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            <span>BLOCK HEIGHT:</span>
            <span className="text-emerald-400 font-bold">#{blockHeight.toLocaleString()}</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1 text-slate-400">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>LATENCY: 18ms</span>
          </div>
        </div>
      </div>

      {/* Main Header & Institutional Cores Navigation */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 gap-3">
        {/* Brand & Crest */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 shadow-inner">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold tracking-tight text-white font-sans">
                DCJMN
              </h1>
              <span className="rounded bg-[#161F33] px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                PROTOTYPE V2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Decentralized Criminal Justice Network • Permissioned Ledger
            </p>
          </div>
        </div>

        {/* 4 Independent Institutional Systems Switcher */}
        <nav className="flex items-center rounded-xl bg-[#0F1420] p-1 border border-[#1E293B]">
          <button
            onClick={() => onSelectInstitution('POLICE')}
            className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeInstitution === 'POLICE'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Shield className="h-3.5 w-3.5 text-sky-400" />
            <span>POLICE <span className="text-[10px] text-slate-400 font-mono">#01</span></span>
          </button>

          <button
            onClick={() => onSelectInstitution('FORENSICS')}
            className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeInstitution === 'FORENSICS'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5 text-purple-400" />
            <span>FORENSICS <span className="text-[10px] text-slate-400 font-mono">#03</span></span>
          </button>

          <button
            onClick={() => onSelectInstitution('COURT')}
            className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeInstitution === 'COURT'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Scale className="h-3.5 w-3.5 text-amber-400" />
            <span>COURT <span className="text-[10px] text-slate-400 font-mono">#04</span></span>
          </button>

          <button
            onClick={() => onSelectInstitution('PRISON')}
            className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeInstitution === 'PRISON'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Building2 className="h-3.5 w-3.5 text-rose-400" />
            <span>PRISON <span className="text-[10px] text-slate-400 font-mono">#04</span></span>
          </button>

          <button
            onClick={() => onSelectInstitution('LIFECYCLE')}
            className={`flex items-center space-x-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeInstitution === 'LIFECYCLE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <GitCommit className="h-3.5 w-3.5 text-emerald-400" />
            <span>LIFECYCLE JOURNEY</span>
          </button>
        </nav>

        {/* Right Tools: Ledger Explorer, Tamper Demo, Biometric Identity */}
        <div className="flex items-center space-x-2">
          {/* Tamper Simulation Button */}
          <button
            onClick={onOpenTamperDemo}
            className={`flex items-center space-x-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              tamperCount > 0
                ? 'border-red-500/60 bg-red-950/40 text-red-300 animate-pulse'
                : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
            }`}
          >
            <AlertTriangle className={`h-3.5 w-3.5 ${tamperCount > 0 ? 'text-red-400' : 'text-amber-400'}`} />
            <span>{tamperCount > 0 ? `TAMPER DETECTED (${tamperCount})` : 'TAMPER LAB'}</span>
          </button>

          {/* Blockchain Ledger Explorer */}
          <button
            onClick={onOpenLedger}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-colors"
          >
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span>LEDGER & AUDIT</span>
          </button>

          {/* Biometric Identity Pill (Click to open Biometric Gateway) */}
          <button
            onClick={onOpenBiometricGateway}
            className={`flex items-center space-x-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              currentIdentity
                ? getInstitutionBadgeColor(currentIdentity.institution)
                : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-emerald-500/50'
            }`}
          >
            <Fingerprint className="h-4 w-4 text-emerald-400" />
            <div className="text-left font-mono">
              <div className="font-semibold leading-tight">
                {currentIdentity ? currentIdentity.name : 'AUTHENTICATE BIOMETRIC'}
              </div>
              <div className="text-[10px] opacity-75">
                {currentIdentity ? currentIdentity.id : 'ID VERIFY REQUIRED'}
              </div>
            </div>
            {currentIdentity ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-1" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-slate-500 ml-1" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
