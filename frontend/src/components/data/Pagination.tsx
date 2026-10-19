import React from 'react';

export const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void }> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => (
  <div className="flex items-center justify-between p-4">
    <button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>Sebelumnya</button>
    <span>Halaman {currentPage} dari {totalPages}</span>
    <button disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>Selanjutnya</button>
  </div>
);
