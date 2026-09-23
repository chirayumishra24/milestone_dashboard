import React from 'react';
import { AlertOctagon, AlertTriangle, Award, CheckCircle2, type LucideIcon } from 'lucide-react';
import { STATUS_META } from '@/utils/statusEngine';
import { StudentStatus } from '@/types/academic';

type DisplayStatus = keyof typeof STATUS_META;

const STATUS_ICONS: Record<DisplayStatus, LucideIcon> = {
  ACHIEVED: Award,
  ON_TRACK: CheckCircle2,
  WATCH: AlertTriangle,
  CRITICAL: AlertOctagon,
};

/**
 * Status pill with an icon and text label, so status never relies on colour alone.
 */
export default function StatusBadge({ status, className = '' }: { status: StudentStatus; className?: string }) {
  const key: DisplayStatus = status === 'INTERVENTION' ? 'WATCH' : status;
  const meta = STATUS_META[key];
  const Icon = STATUS_ICONS[key];
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${meta.badgeBg} ${meta.badgeColor} ${className}`}
    >
      <Icon className="w-3 h-3" aria-hidden="true" />
      {meta.label}
    </span>
  );
}
