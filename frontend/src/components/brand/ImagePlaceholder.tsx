/**
 * ImagePlaceholder — pengganti gambar saat foto belum tersedia.
 * Memakai bidang datar Langit 200 dengan StarIcon Biru Padindi di tengah.
 * Sesuai DESIGN.md — tidak menggunakan URL gambar eksternal.
 */
import React from 'react';
import { StarIcon } from './StarIcon';

interface ImagePlaceholderProps {
  className?: string;
  /** Rasio aspek, mis. "4/3" atau "1/1". Default "4/3". */
  aspectRatio?: string;
  label?: string;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  className = '',
  aspectRatio = '4/3',
  label = '',
}) => (
  <div
    className={`flex items-center justify-center bg-tint-200 ${className}`}
    style={{ aspectRatio }}
    role="img"
    aria-label={label || 'Gambar belum tersedia'}
  >
    <StarIcon
      size={48}
      className="text-primary opacity-40"
      aria-hidden="true"
    />
  </div>
);

