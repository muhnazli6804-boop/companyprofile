import React from 'react';
import { STUDENT_STATUS_LABELS, TEACHER_STATUS_LABELS } from '@/constants';

interface StatusBadgeProps {
  status: string;
  type?: 'student' | 'teacher';
}

// TODO: see DESIGN.md section 8.5
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'student' }) => {
  const label = type === 'student' ? STUDENT_STATUS_LABELS[status] || status : TEACHER_STATUS_LABELS[status] || status;
  return (
    <span data-testid="status-badge" className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-tint-100 text-primary">
      {label}
    </span>
  );
};
