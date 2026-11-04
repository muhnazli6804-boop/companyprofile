import React from 'react';
import {
  FileEdit,
  Send,
  Search,
  AlertTriangle,
  CheckCircle2,
  Check,
  XCircle,
  Clock,
  Video,
} from 'lucide-react';

export type ApplicationStatusType =
  | 'draft'
  | 'submitted'
  | 'verified'
  | 'under_review'
  | 'need_revision'
  | 'verification_passed'
  | 'interview_scheduled'
  | 'interviewed'
  | 'test_scheduled'
  | 'tested'
  | 'accepted'
  | 'rejected'
  | 'waitlist'
  | 'withdrawn'
  | string;

interface StatusBadgeProps {
  status: ApplicationStatusType;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const norm = status?.toLowerCase() || 'draft';

  switch (norm) {
    case 'draft':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control text-xs font-sans font-semibold bg-white border border-line-input text-ink ${className}`}
        >
          <FileEdit className="w-3.5 h-3.5 text-muted" />
          <span>Draft</span>
        </span>
      );

    case 'submitted':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control text-xs font-sans font-semibold bg-tint-100 border border-primary/20 text-primary ${className}`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Terkirim</span>
        </span>
      );

    case 'under_review':
    case 'sedang_diverifikasi':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control text-xs font-sans font-semibold bg-sky-50 border border-sky-200 text-sky-800 ${className}`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Sedang diverifikasi</span>
        </span>
      );

    case 'need_revision':
    case 'perlu_revisi':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control text-xs font-sans font-semibold bg-amber-50 border border-amber-300 text-amber-900 ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
          <span>Perlu revisi</span>
        </span>
      );

    case 'verified':
    case 'verification_passed':
    case 'lolos_verifikasi':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control text-xs font-sans font-semibold bg-emerald-50 border border-emerald-300 text-emerald-800 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Lolos verifikasi</span>
        </span>
      );

    case 'test_scheduled':
    case 'tested':
    case 'interview_scheduled':
    case 'interviewed':
    case 'wawancara_atau_tes':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control text-xs font-sans font-semibold bg-blue-50 border border-blue-200 text-primary ${className}`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Wawancara atau tes</span>
        </span>
      );

    case 'accepted':
    case 'diterima':
    case 'lolos':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control text-xs font-sans font-bold bg-leaf text-white shadow-xs ${className}`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>Diterima</span>
        </span>
      );

    case 'rejected':
    case 'tidak_diterima':
    case 'tidak_lolos':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control text-xs font-sans font-semibold bg-rose-50 border border-rose-300 text-danger ${className}`}
        >
          <XCircle className="w-3.5 h-3.5 text-danger" />
          <span>Tidak diterima</span>
        </span>
      );

    case 'waitlist':
    case 'daftar_tunggu':
    case 'cadangan':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control text-xs font-sans font-semibold bg-slate-50 border border-slate-300 text-slate-800 ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-muted" />
          <span>Daftar tunggu</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-control text-xs font-sans font-semibold bg-gray-100 border border-gray-300 text-ink ${className}`}
        >
          <span>{status}</span>
        </span>
      );
  }
};
