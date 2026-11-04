/**
 * MapEmbed — komponen peta dengan validasi embed URL.
 * Sesuai prompt bagian 5.
 *
 * - embedUrl harus diawali "https://www.google.com/maps/embed" atau
 *   "https://www.openstreetmap.org/export/embed.html".
 * - Bila tidak valid / kosong: fallback (kotak datar tanpa iframe).
 * - Selalu sertakan tombol "Buka di Google Maps".
 *
 * ADR: iframe pihak ketiga membutuhkan CSP "frame-src" tambahan.
 * Lihat docs/adr/0002-catatan-landing-page.md.
 */
import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

const VALID_PREFIXES = [
  'https://www.google.com/maps/embed',
  'https://www.openstreetmap.org/export/embed.html',
] as const;

function isValidEmbedUrl(url: string | undefined): boolean {
  if (!url || url.trim() === '') return false;
  return VALID_PREFIXES.some((prefix) => url.startsWith(prefix));
}

function buildMapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

interface MapEmbedProps {
  embedUrl?: string;
  address?: string;
  className?: string;
}

export const MapEmbed: React.FC<MapEmbedProps> = ({
  embedUrl,
  address = '',
  className = '',
}) => {
  const valid = isValidEmbedUrl(embedUrl);
  const mapsUrl = buildMapsSearchUrl(address);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {valid ? (
        <iframe
          src={embedUrl}
          title="Peta lokasi Yayasan Padindi"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-popups"
          className="w-full border border-white/20 bg-tint-100"
          style={{
            height: 'clamp(320px, 40vw, 400px)',
            borderRadius: 0,
          }}
        />
      ) : (
        /* Fallback: tidak ada iframe */
        <div
          className="flex flex-col items-start justify-center gap-3 bg-tint-100 p-6"
          style={{ minHeight: 160 }}
        >
          <MapPin size={28} className="text-primary" aria-hidden="true" />
          {address && (
            <address className="not-italic text-ink text-base leading-relaxed">
              {address}
            </address>
          )}
        </div>
      )}

      {/* Tombol "Buka di Google Maps" — selalu tersedia */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="
          inline-flex items-center gap-2
          px-5 py-3 rounded-control
          bg-star text-ink font-sans font-bold text-base
          hover:opacity-90 focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2
          focus-visible:ring-offset-navy
          w-fit
        "
        style={{ minHeight: 44 }}
      >
        <ExternalLink size={16} aria-hidden="true" />
        Buka di Google Maps
      </a>
    </div>
  );
};

