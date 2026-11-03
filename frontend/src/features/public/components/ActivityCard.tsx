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
      {/* Foto */}
      <div className="w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={coverAlt ?? ''}
            width={480}
            height={360}
            loading={isLazyLoad ? 'lazy' : 'eager'}
            className="w-full h-full object-cover"
            style={{ borderRadius: 0 }}
          />
        ) : (
          <ImagePlaceholder
            aspectRatio="4/3"
            className="w-full h-full"
            label={coverAlt || title}
          />
        )}
      </div>

      {/* Konten teks */}
      <div className="p-4 flex flex-col gap-2">
        <time
          dateTime={publishedAt}
          className="text-xs text-muted font-sans"
        >
          {tanggal}
        </time>
        <h3
          className="font-display font-semibold text-base text-ink leading-snug"
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
          }}
        >
          {title}
        </h3>
        {excerpt && (
          <p
            className="font-sans text-xs text-muted leading-relaxed"
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
              overflow: 'hidden',
            }}
          >
            {excerpt}
          </p>
        )}
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
        flex flex-col bg-white border border-line
        overflow-hidden flex-shrink-0
      "
      style={{ borderRadius: 0 }}
    >
      {/* TODO: Bungkus dengan <a href={href}> saat halaman detail kegiatan sudah ada */}
      {href ? (
        <a
          href={href}
          className="flex flex-col flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={title}
        >
          {cardContent}
        </a>
      ) : (
        cardContent
      )}
    </article>
  );
};

