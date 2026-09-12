import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, ShieldAlert } from 'lucide-react';

interface VerificationPillProps {
  status?: 'VERIFIED' | 'ENCRYPTED' | 'SIGNED' | 'AUDITED' | 'TAMPERED';
  onClick?: () => void;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const VerificationPill: React.FC<VerificationPillProps> = ({
  status = 'VERIFIED',
  onClick,
  showIcon = true,
  size = 'sm'
}) => {
  const isTampered = status === 'TAMPERED';
  const isEncrypted = status === 'ENCRYPTED';

  const baseStyle = size === 'sm' 
    ? 'text-[11px] px-2 py-0.5 font-mono font-medium tracking-wide rounded-md' 
    : 'text-xs px-2.5 py-1 font-mono font-medium tracking-wide rounded-md';

  const colorStyle = isTampered
    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
    : isEncrypted
    ? 'bg-slate-800 text-slate-300 border border-slate-700/60 hover:bg-slate-750'
    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/15';

  const renderContent = () => {
    switch (status) {
      case 'TAMPERED':
        return (
          <>
            {showIcon && <ShieldAlert className="w-3 h-3 mr-1 text-rose-400" />}
            <span>INTEGRITY MISMATCH</span>
          </>
        );
      case 'ENCRYPTED':
        return (
          <>
            {showIcon && <Lock className="w-3 h-3 mr-1 text-slate-400" />}
            <span>ENCRYPTED (AES-256)</span>
          </>
        );
      case 'SIGNED':
        return (
          <>
            {showIcon && <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />}
            <span>SIGNED (Ed25519)</span>
          </>
        );
      case 'AUDITED':
        return (
          <>
            {showIcon && <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />}
            <span>AUDITED</span>
          </>
        );
      case 'VERIFIED':
      default:
        return (
          <>
            {showIcon && <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />}
            <span>VERIFIED</span>
          </>
        );
    }
  };

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center transition-all cursor-pointer select-none ${baseStyle} ${colorStyle}`}
        title="Click to view sovereign blockchain verification details"
      >
        {renderContent()}
      </button>
    );
  }

  return (
    <span className={`inline-flex items-center ${baseStyle} ${colorStyle}`}>
      {renderContent()}
    </span>
  );
};
