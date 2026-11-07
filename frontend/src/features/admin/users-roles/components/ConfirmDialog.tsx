import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ConfirmDialogProps {
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  isLoading?: boolean;
  /** Galat dari server; tampil di dalam dialog agar tidak hilang seperti toast (DESIGN.md §8.8). */
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  children,
  confirmLabel,
  danger = false,
  isLoading = false,
  error,
  onConfirm,
  onCancel,
}) => (
  <Modal isOpen title={title} onClose={onCancel}>
    <div className="text-ink mb-4">{children}</div>
    {error && (
      <p role="alert" className="mb-4 text-sm text-danger">
        {error}
      </p>
    )}
    <div className="flex flex-wrap justify-end gap-3">
      <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
        Batal
      </Button>
      <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} isLoading={isLoading}>
        {confirmLabel}
      </Button>
    </div>
  </Modal>
);
