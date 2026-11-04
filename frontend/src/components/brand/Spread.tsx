/**
 * Spread — tata letak dua halaman buku untuk Visi dan Misi.
 * Sesuai DESIGN.md bagian 7.2 dan 14.3.
 *
 * Desktop: dua kolom berdampingan, garis tengah sebagai "punggung buku".
 * Ponsel: ditumpuk (kiri di atas kanan) dengan garis pemisah horizontal.
 */
import React from 'react';

interface SpreadProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

export const Spread: React.FC<SpreadProps> = ({ left, right, className = '' }) => (
  <div
    className={`
      flex flex-col md:flex-row
      divide-y md:divide-y-0 md:divide-x
      divide-line
      border border-line
      ${className}
    `}
  >
    {/* Halaman kiri: Visi — latar putih */}
    <div className="flex-1 bg-white p-6 md:p-10">{left}</div>

    {/* Halaman kanan: Misi — latar Kertas Dermaga */}
    <div className="flex-1 bg-paper p-6 md:p-10">{right}</div>
  </div>
);
