import React from 'react';
import { Shield, Scale, FlaskConical, Building2 } from 'lucide-react';
import { InstitutionType } from '../../types';

interface InstitutionalBadgeProps {
  institution: InstitutionType;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  minimal?: boolean;
}

export const InstitutionalBadge: React.FC<InstitutionalBadgeProps> = ({
  institution,
  size = 'sm',
  showIcon = true,
  minimal = false
}) => {
  const getMeta = () => {
    switch (institution) {
      case 'POLICE':
        return {
          label: 'POLICE',
          icon: Shield,
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
          dotColor: 'bg-blue-400',
          textOnly: 'text-blue-400'
        };
      case 'COURT':
        return {
          label: 'COURT',
          icon: Scale,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          dotColor: 'bg-amber-400',
          textOnly: 'text-amber-400'
        };
      case 'FORENSICS':
        return {
          label: 'FORENSICS',
          icon: FlaskConical,
          color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
          dotColor: 'bg-teal-400',
          textOnly: 'text-teal-400'
        };
      case 'PRISON':
        return {
          label: 'PRISON',
          icon: Building2,
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
          dotColor: 'bg-rose-400',
          textOnly: 'text-rose-400'
        };
    }
  };

  const meta = getMeta();
  const Icon = meta.icon;

  if (minimal) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-medium ${meta.textOnly}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor}`} />
        <span>{meta.label}</span>
      </span>
    );
  }

  const sizeClasses = size === 'xs'
    ? 'text-[10px] px-1.5 py-0.5'
    : size === 'sm'
    ? 'text-xs px-2 py-0.5'
    : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border font-mono font-medium tracking-wide ${sizeClasses} ${meta.color}`}
    >
      {showIcon && <Icon className={size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />}
      <span>{meta.label}</span>
    </span>
  );
};
