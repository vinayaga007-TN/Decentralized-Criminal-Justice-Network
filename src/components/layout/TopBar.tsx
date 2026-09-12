import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  Shield,
  Scale,
  FlaskConical,
  Building2,
  Network,
  ShieldAlert,
  Sparkles,
  Check
} from 'lucide-react';
import { InstitutionalIdentity, InstitutionType } from '../../types';
import { InstitutionalBadge } from '../common/InstitutionalBadge';

export type PortalType = 'POLICE' | 'FORENSICS' | 'COURT' | 'PRISON' | 'NETWORK_GRAPH';

interface TopBarProps {
  currentPortal: PortalType;
  onSelectPortal: (portal: PortalType) => void;
  onSelectDemoPortal: (portal: PortalType) => void;
  title: string;
  subtitle?: string;
  currentIdentity: InstitutionalIdentity | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRequestAccess: () => void;
  tamperCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentPortal,
  onSelectPortal,
  onSelectDemoPortal,
  title,
  subtitle,
  currentIdentity,
  searchQuery,
  onSearchChange,
  onRequestAccess,
  tamperCount
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPortalMeta = (portal: PortalType) => {
    switch (portal) {
      case 'POLICE':
        return { label: 'POLICE', fullName: 'Police Portal', icon: Shield, color: 'text-blue-400' };
      case 'FORENSICS':
        return { label: 'FORENSICS', fullName: 'Forensics Portal', icon: FlaskConical, color: 'text-teal-400' };
      case 'COURT':
        return { label: 'COURT', fullName: 'Court Portal', icon: Scale, color: 'text-amber-400' };
      case 'PRISON':
        return { label: 'PRISON', fullName: 'Prison Portal', icon: Building2, color: 'text-rose-400' };
      case 'NETWORK_GRAPH':
        return { label: 'GRAPH', fullName: 'Network Graph', icon: Network, color: 'text-emerald-400' };
    }
  };

  const activeMeta = getPortalMeta(currentPortal);
  const ActiveIcon = activeMeta.icon;

  const portalOptions: PortalType[] = ['POLICE', 'FORENSICS', 'COURT', 'PRISON', 'NETWORK_GRAPH'];

  return (
    <header className="h-14 shrink-0 border-b border-slate-800/80 bg-[#090D17]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 font-sans">
      {/* Left: Brand + 2. Compact Institution Switcher */}
      <div className="flex items-center space-x-4">
        {/* Brand */}
        <div className="text-xs font-mono font-bold tracking-widest text-slate-200 uppercase hidden sm:block">
          DCJMN
        </div>
        <span className="text-slate-700 hidden sm:inline font-mono">/</span>

        {/* 2. Compact Institution Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center space-x-1.5 text-xs font-mono">
            <span className="text-slate-500 uppercase text-[11px]">Portal:</span>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 px-2.5 py-1 rounded bg-[#0B0F1B] hover:bg-slate-800/80 border border-slate-700/80 text-xs font-mono text-slate-100 transition-colors"
            >
              <ActiveIcon className={`w-3.5 h-3.5 ${activeMeta.color}`} />
              <span className="font-bold">{activeMeta.label}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute left-0 mt-2 w-48 rounded border border-slate-700 bg-[#0B0F1D] shadow-2xl py-1 z-50 animate-in fade-in-50 text-xs font-mono">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800/80">
                Switch Portal
              </div>
              {portalOptions.map((opt) => {
                const meta = getPortalMeta(opt);
                const Icon = meta.icon;
                const isSelected = currentPortal === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSelectPortal(opt);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-800/70 transition-colors ${
                      isSelected ? 'text-white bg-slate-800/40 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                      <span>{meta.fullName}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. DEMO MODE Quick Portal Switcher (Evaluator Friendly) */}
        <div className="hidden lg:flex items-center space-x-1.5 pl-3 border-l border-slate-800 text-[10px] font-mono">
          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            DEMO
          </span>
          {(['POLICE', 'FORENSICS', 'COURT', 'PRISON', 'NETWORK_GRAPH'] as PortalType[]).map((p) => {
            const isCurrent = currentPortal === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onSelectDemoPortal(p)}
                className={`px-2 py-0.5 rounded transition-colors uppercase ${
                  isCurrent
                    ? 'bg-slate-700 text-white font-bold border border-slate-600'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
                title={`Switch demo persona to ${p}`}
              >
                {p === 'NETWORK_GRAPH' ? 'Graph' : p.toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Center: Search Field */}
      <div className="flex-1 max-w-xs xl:max-w-sm mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search cases, exhibits, orders..."
            className="w-full bg-[#0B0F1B] border border-slate-800/80 rounded px-9 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:border-slate-600 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Right: Security Status & User Identity */}
      <div className="flex items-center space-x-3">
        {/* Quick Cross-Agency Access button */}
        <button
          type="button"
          onClick={onRequestAccess}
          className="text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded transition-colors hidden sm:inline-flex"
          title="Request Cross-Agency Access via Smart Contract"
        >
          Request Access
        </button>

        {/* Network Security Status Indicator */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#0B0F1B] border border-slate-800/80 text-[11px] font-mono">
          {tamperCount > 0 ? (
            <span className="text-rose-400 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              <span className="hidden sm:inline">Integrity Alert</span>
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="hidden sm:inline">Network Secure</span>
            </span>
          )}
        </div>

        {/* User Identity Chip */}
        {currentIdentity && (
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800/80">
            <InstitutionalBadge institution={currentIdentity.institution} size="xs" />
            <span className="text-xs font-medium text-slate-200 font-sans hidden sm:inline">
              {currentIdentity.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
