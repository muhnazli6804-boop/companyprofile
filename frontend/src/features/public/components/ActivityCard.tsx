/**
 * ActivityCard — kartu kegiatan untuk carousel.
 * Sesuai prompt bagian 4 (Kartu kegiatan) dan DESIGN.md.
 *
 * - Foto rasio 4:3, sudut 0, loading lazy (kecuali dua pertama)
 * - Tanggal format Indonesia (Intl.DateTimeFormat id-ID)
 * - Judul: Literata 600, maks 2 baris
 * - Ringkasan: Atkinson, maks 3 baris
 * - Tanpa bayangan, tanpa sudut membulat besar
 * - Tanpa tautan bila href kosong (TODO: halaman detail belum ada)
 */
import React from 'react';
import { ImagePlaceholder } from '@/components/brand/ImagePlaceholder';

interface ActivityCardProps {
  title: string;
  excerpt?: string;
  coverUrl?: string;
  coverAlt?: string;
  publishedAt: string; // ISO 8601
  href?: string; // TODO: kosongkan hingga halaman detail tersedia
  /** Indeks kartu (0-based). Dua kartu pertama tidak lazy. */
  index?: number;
  /** Nomor kartu dari total (untuk aria-label, 1-based). */
  cardNumber?: number;
  total?: number;
}

function formatTanggalIndo(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return isoString;
  }
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  excerpt,
  coverUrl,
  coverAlt,
  publishedAt,
  href,
  index = 0,
  cardNumber,
  total,
}) => {
  const isLazyLoad = index >= 2;
  const tanggal = formatTanggalIndo(publishedAt);
  const ariaLabel = cardNumber && total ? `${cardNumber} dari ${total}` : undefined;

  const cardContent = (
    <>
      {/* Foto / Thumbnail Banner Kegiatan — ukuran terkunci tetap rasio 4:3, tidak mengikuti ukuran asli foto */}
      <div
        className="w-full relative overflow-hidden bg-tint-100 shrink-0"
        style={{ aspectRatio: '4/3' }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={coverAlt ?? ''}
            loading={isLazyLoad ? 'lazy' : 'eager'}
            className="absolute inset-0 w-full h-full object-cover object-center block"
            style={{ borderRadius: 0 }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.endsWith('/images/news/ppdb-cover.jpg')) {
                target.src = '/images/news/ppdb-cover.jpg';
              }
            }}
          />
        ) : (
          <ImagePlaceholder
            aspectRatio="4/3"
            className="absolute inset-0 w-full h-full"
            label={coverAlt || title}
          />
        )}
      </div>

      {/* Konten teks — ukuran terkunci tetap presisi */}
      <div className="p-4 flex flex-col justify-between gap-2 bg-white flex-1 min-h-[168px] shrink-0">
        <div className="flex flex-col gap-2">
          <time
            dateTime={publishedAt}
            className="text-xs text-muted font-sans block h-4 leading-4 shrink-0"
          >
            {tanggal}
          </time>
          <h3
            className="font-display font-semibold text-base text-ink leading-snug h-[2.75rem] overflow-hidden shrink-0"
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              overflow: 'hidden',
            }}
          >
            {title}
          </h3>
          <p
            className="font-sans text-xs text-muted leading-relaxed h-[3.75rem] overflow-hidden shrink-0"
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
              overflow: 'hidden',
            }}
          >
            {excerpt || '\u00A0'}
          </p>
        </div>
      </div>
    </>
  );

  // Wrapper: role="group" aria-roledescription="slide" sesuai spesifikasi carousel
  return (
    <article
      role="group"
      aria-roledescription="slide"
      aria-label={ariaLabel}
      className="
        flex flex-col h-full bg-white border border-line
        overflow-hidden flex-shrink-0 w-full
      "
      style={{ borderRadius: 0 }}
    >
      {/* Bungkus dengan <a href={href}> bila tautan tersedia */}
      {href ? (
        <a
          href={href}
          className="flex flex-col flex-1 h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={title}
        >
          {cardContent}
        </a>
      ) : (
        <div className="flex flex-col flex-1 h-full">
          {cardContent}
        </div>
      )}
    </article>
  );
};

