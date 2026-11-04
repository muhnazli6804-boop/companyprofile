/**
 * StatusBadge — komponen lencana status pendaftaran siswa dan guru.
 * Sesuai DESIGN.md bagian 8.5 dan Padindi UI Design System board.
 *
 * - Selalu IKON + TEKS, tidak hanya warna.
 * - Hanya status final positif (Diterima, Lolos) yang berlatar solid Hijau Daun.
 * - Radius 6 px (radius/control), tipografi Caption Bold (Atkinson Bold 12.8 px / 130%).
 */
import React from 'react';
import {
  Pencil,
  Send,
  Search,
  AlertTriangle,
  CheckCircle2,
  Check,
  X,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { STUDENT_STATUS_LABELS, TEACHER_STATUS_LABELS } from '@/constants';

export interface StatusBadgeProps {
  status: string;
  type?: 'student' | 'teacher';
  className?: string;
}

interface BadgeConfig {
  icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
  style: string;
}

const statusConfigs: Record<string, BadgeConfig> = {
  // Pendaftar Siswa
  draft: {
    icon: Pencil,
    style: 'bg-tint-100 text-ink border border-dashed border-ink/40',
  },
  submitted: {
    icon: Send,
    style: 'bg-tint-100 text-primary',
  },
  in_review: {
    icon: Search,
    style: 'bg-tint-100 text-primary',
  },
  revision_required: {
    icon: AlertTriangle,
    style: 'bg-tint-100 text-warning border-l-[3px] border-l-star',
  },
  verified: {
    icon: CheckCircle2,
    style: 'bg-tint-100 text-leaf',
  },
  accepted: {
    icon: Check,
    style: 'bg-leaf text-white font-bold',
  },
  rejected: {
    icon: X,
    style: 'bg-tint-100 text-danger',
  },
  waitlisted: {
    icon: Clock,
    style: 'bg-tint-100 text-primary',
  },

  // Lamaran Guru
  administrative_review: {
    icon: Search,
    style: 'bg-tint-100 text-primary',
  },
  interview_test: {
    icon: MessageSquare,
    style: 'bg-tint-100 text-primary',
  },
  passed: {
    icon: Check,
    style: 'bg-leaf text-white font-bold',
  },
  failed: {
    icon: X,
    style: 'bg-tint-100 text-danger',
  },
  reserve: {
    icon: Clock,
    style: 'bg-tint-100 text-primary',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'student',
  className = '',
}) => {
  const label =
    type === 'student'
      ? STUDENT_STATUS_LABELS[status] || status
      : TEACHER_STATUS_LABELS[status] || status;

  const config = statusConfigs[status] || {
    icon: CheckCircle2,
    style: 'bg-tint-100 text-primary',
  };
  const IconComponent = config.icon;

  return (
    <span
      data-testid="status-badge"
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-control
        font-sans font-bold text-xs tracking-normal
        ${config.style}
        ${className}
      `}
    >
      <IconComponent size={14} className="flex-shrink-0" aria-hidden={true} />
      <span>{label}</span>
    </span>
  );
};
