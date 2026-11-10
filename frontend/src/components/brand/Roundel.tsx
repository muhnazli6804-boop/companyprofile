/**
 * Roundel — foto bundar bercincin putih dengan opsi batang diagonal
 * dan bintang di pukul 12, sesuai DESIGN.md bagian 6.1, 7.1, dan 14.3.
 *
 * - Foto bundar: radius penuh (9999px)
 * - Cincin putih: konsentris
 * - Batang diagonal (empat arah 45°): di belakang foto bundar
 * - Bintang di pukul 12: StarIcon kuning
 * - Gerak masuk: satu putaran 45° sekali saat dimuat (DESIGN.md 9)
 * - Responsif: diskalakan secara proporsional sesuai viewBox agar tidak overflow di ponsel
 */
import React, { useEffect, useRef } from 'react';
import { StarIcon } from './StarIcon';
import { ImagePlaceholder } from './ImagePlaceholder';

interface RoundelProps {
  /** URL foto. Bila kosong, memakai ImagePlaceholder. */
  src?: string;
  alt?: string;
  /** Tampilkan batang diagonal dan bintang (untuk hero). */
  withSpokes?: boolean;
  /** Dianimasikan sekali saat dimuat (untuk hero). */
  animated?: boolean;
  className?: string;
  /** Ukuran lingkaran dalam piksel (pada desktop). */
  size?: number;
}

export const Roundel: React.FC<RoundelProps> = ({
  src,
  alt = '',
  withSpokes = false,
  animated = false,
  className = '',
  size = 240,
}) => {
  const spokesRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!animated || !withSpokes) return;

    // Periksa prefers-reduced-motion
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (prefersReduced) return;

    const el = spokesRef.current;
    if (!el) return;

    // Satu gerak pembuka: putar 45° dalam 900ms, lalu diam
    el.style.transition = `transform 900ms cubic-bezier(0.22, 1, 0.36, 1)`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transform = 'rotate(45deg)';
      });
    });
  }, [animated, withSpokes]);

  const outerPad = withSpokes ? Math.round(size * 0.35) : 8;
  const totalSize = size + outerPad * 2;
  const cx = totalSize / 2;
  const cy = totalSize / 2;
  const r = size / 2;
  const spokeLen = r + outerPad - 4;
  const photoPercent = (size / totalSize) * 100;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{
        width: '100%',
        maxWidth: totalSize,
        aspectRatio: '1/1',
      }}
    >
      {/* SVG lapisan: cincin + batang diagonal + bintang */}
      <svg
        viewBox={`0 0 ${totalSize} ${totalSize}`}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ overflow: 'visible' }}
      >
        {/* Batang diagonal */}
        {withSpokes && (
          <g
            ref={spokesRef}
            style={{ transformOrigin: `${cx}px ${cy}px`, transform: 'rotate(0deg)' }}
          >
            {[0, 90, 180, 270].map((deg) => {
              const angle = (deg * Math.PI) / 180;
              const x2 = cx + Math.cos(angle) * spokeLen;
              const y2 = cy + Math.sin(angle) * spokeLen;
              const x1 = cx + Math.cos(angle) * (r + 4);
              const y1 = cy + Math.sin(angle) * (r + 4);
              return (
                <line
                  key={deg}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}
          </g>
        )}

        {/* Cincin putih luar */}
        <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke="white" strokeWidth="4" />

        {/* Bintang di pukul 12 (atas) */}
        {withSpokes && (
          <foreignObject
            x={cx - 12}
            y={cy - r - outerPad + 2}
            width="24"
            height="24"
          >
            <StarIcon size={24} className="text-star" />
          </foreignObject>
        )}
      </svg>

      {/* Foto bundar responsif */}
      <div
        className="overflow-hidden rounded-full bg-tint-200 border-2 border-white z-10"
        style={{
          width: `${photoPercent}%`,
          height: `${photoPercent}%`,
          flexShrink: 0,
        }}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            width={size}
            height={size}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/logo.png';
            }}
          />
        ) : (
          <ImagePlaceholder
            aspectRatio="1/1"
            className="w-full h-full"
            label={alt || 'Foto yayasan'}
          />
        )}
      </div>
    </div>
  );
};
