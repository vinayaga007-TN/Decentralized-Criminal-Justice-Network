import React from 'react';
import {
  Shield,
  Scale,
  FlaskConical,
  Building2,
  LayoutDashboard,
  FolderLock,
  HardDrive,
  FileCheck2,
  FileText,
  Gavel,
  Users,
  KeyRound,
  Network,
  LogOut,
  ChevronDown,
  GitFork,
  Radio,
  Lock
} from 'lucide-react';
import { InstitutionalIdentity, InstitutionType } from '../../types';

export type NavigationTarget =
  | 'DASHBOARD'
  | 'CASES'
  | 'CASE_DETAIL'
  | 'EVIDENCE'
  | 'WORKFLOW_DEPT'
  | 'SECURITY_CENTER'
  | 'NETWORK_LEDGER'
  | 'NETWORK_GRAPH';

interface SidebarProps {
  currentView: NavigationTarget;
  onNavigate: (view: NavigationTarget) => void;
  currentIdentity: InstitutionalIdentity | null;
  onSwitchInstitution: () => void;
  onLockSession: () => void;
  tamperCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  currentIdentity,
  onSwitchInstitution,
  onLockSession,
  tamperCount
}) => {
  const institution = currentIdentity?.institution || 'POLICE';

  const getInstitutionStyle = () => {
    switch (institution) {
      case 'POLICE':
        return {
          icon: Shield,
          name: 'POLICE',
          tag: 'Sovereign Node #01',
          accentBorder: 'border-blue-500',
          accentText: 'text-blue-400',
          accentBg: 'bg-blue-500/10',
          workflowLabel: 'Investigation',
          workflowIcon: FileCheck2
        };
      case 'COURT':
        return {
          icon: Scale,
          name: 'COURT',
          tag: 'Judicial Node #04',
          accentBorder: 'border-amber-500',
          accentText: 'text-amber-400',
          accentBg: 'bg-amber-500/10',
          workflowLabel: 'Hearings & Decrees',
          workflowIcon: Gavel
        };
      case 'FORENSICS':
        return {
          icon: FlaskConical,
          name: 'FORENSICS',
          tag: 'CFSL Lab Node #03',
          accentBorder: 'border-teal-500',
          accentText: 'text-teal-400',
          accentBg: 'bg-teal-500/10',
          workflowLabel: 'Lab Analysis',
          workflowIcon: FlaskConical
        };
      case 'PRISON':
        return {
          icon: Building2,
          name: 'PRISON',
          tag: 'Custody Facility #04',
          accentBorder: 'border-rose-500',
          accentText: 'text-rose-400',
          accentBg: 'bg-rose-500/10',
          workflowLabel: 'Inmate Custody',
          workflowIcon: Users
        };
    }
  };

  const instStyle = getInstitutionStyle();
  const InstitutionIcon = instStyle.icon;
  const WorkflowIcon = instStyle.workflowIcon;

  return (
    <aside className="w-60 shrink-0 bg-[#090D17] border-r border-slate-800/80 flex flex-col justify-between select-none h-screen sticky top-0">
      <div className="flex flex-col">
        {/* Top Institution Logo & Switcher */}
        <div className="p-4 border-b border-slate-800/80">
          <button
            type="button"
            onClick={onSwitchInstitution}
            className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-800/50 transition-colors text-left group"
            title="Switch Institution or Re-authenticate"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded border ${instStyle.accentBorder}/40 ${instStyle.accentBg} flex items-center justify-center ${instStyle.accentText}`}>
                <InstitutionIcon className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">
                  {instStyle.name}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {instStyle.tag}
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 py-4 space-y-6 overflow-y-auto">
          {/* MAIN Section */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-mono uppercase text-slate-500 tracking-wider font-medium mb-1.5">
              Main
            </div>

            <button
              type="button"
              onClick={() => onNavigate('DASHBOARD')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-mono transition-colors text-left ${
                currentView === 'DASHBOARD'
                  ? `bg-slate-800 text-white font-semibold ${instStyle.accentText}`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('CASES')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-mono transition-colors text-left ${
                currentView === 'CASES' || currentView === 'CASE_DETAIL'
                  ? `bg-slate-800 text-white font-semibold ${instStyle.accentText}`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <FolderLock className="w-4 h-4 text-slate-400" />
              <span>Cases</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('EVIDENCE')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-mono transition-colors text-left ${
                currentView === 'EVIDENCE'
                  ? `bg-slate-800 text-white font-semibold ${instStyle.accentText}`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <HardDrive className="w-4 h-4 text-slate-400" />
              <span>Evidence</span>
            </button>
          </div>

          {/* WORKFLOW Section */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-mono uppercase text-slate-500 tracking-wider font-medium mb-1.5">
              Workflow
            </div>

            <button
              type="button"
              onClick={() => onNavigate('WORKFLOW_DEPT')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-mono transition-colors text-left ${
                currentView === 'WORKFLOW_DEPT'
                  ? `bg-slate-800 text-white font-semibold ${instStyle.accentText}`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <WorkflowIcon className="w-4 h-4 text-slate-400" />
              <span>{instStyle.workflowLabel}</span>
            </button>
          </div>

          {/* GOVERNANCE & SECURITY Section */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-mono uppercase text-slate-500 tracking-wider font-medium mb-1.5">
              Governance
            </div>

            <button
              type="button"
              onClick={() => onNavigate('SECURITY_CENTER')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-mono transition-colors text-left ${
                currentView === 'SECURITY_CENTER'
                  ? `bg-slate-800 text-white font-semibold ${instStyle.accentText}`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <KeyRound className="w-4 h-4 text-slate-400" />
                <span>Security Center</span>
              </div>
              {tamperCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Integrity Tamper Alert Active" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('NETWORK_LEDGER')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-mono transition-colors text-left ${
                currentView === 'NETWORK_LEDGER'
                  ? `bg-slate-800 text-white font-semibold ${instStyle.accentText}`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Network className="w-4 h-4 text-slate-400" />
              <span>Network Ledger</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('NETWORK_GRAPH')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-mono transition-colors text-left ${
                currentView === 'NETWORK_GRAPH'
                  ? `bg-slate-800 text-white font-semibold ${instStyle.accentText}`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <GitFork className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 font-medium">Network Graph</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Area: User Identity & Connection Status */}
      <div className="p-3 border-t border-slate-800/80 space-y-3 bg-[#080B14]">
        {/* User Identity widget */}
        <div className="p-2.5 rounded bg-[#0B0F1B] border border-slate-800/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-200 truncate max-w-[130px]" title={currentIdentity?.name}>
              {currentIdentity?.name || 'Officer Kumar'}
            </span>
            <button
              type="button"
              onClick={onLockSession}
              className="text-slate-500 hover:text-slate-300 p-1 transition-colors"
              title="Lock / Biometric Re-authentication"
            >
              <Lock className="w-3 h-3" />
            </button>
          </div>
          <div className="text-[10px] font-mono text-slate-400 truncate">
            {currentIdentity?.role || 'Investigation Officer'}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1 flex items-center justify-between">
            <span>{currentIdentity?.badgeNumber || 'POL-004281'}</span>
            <span className="text-emerald-400 text-[9px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              ATTESTED
            </span>
          </div>
        </div>

        {/* Network connection status */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>QBFT Consortium</span>
          </span>
          <span className="text-slate-500">4/4 Nodes</span>
        </div>
      </div>
    </aside>
  );
};
