import React from 'react';
import { Button } from '@/components/ui/Button';

export const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  total?: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, total, onPageChange }) => (
  <nav aria-label="Paginasi" className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-line">
    <span className="text-sm text-muted">{total !== undefined ? `${total} data` : ''}</span>
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        className="!min-h-[40px] !px-4 !py-1.5 !text-sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Sebelumnya
      </Button>
      <span className="text-sm text-ink">
        Halaman {currentPage} dari {totalPages}
      </span>
      <Button
        variant="secondary"
        className="!min-h-[40px] !px-4 !py-1.5 !text-sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Selanjutnya
      </Button>
    </div>
  </nav>
);
