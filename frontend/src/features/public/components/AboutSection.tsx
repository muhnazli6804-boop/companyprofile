/**
 * AboutSection — bagian "Tentang yayasan".
 * Sesuai prompt bagian 3.3 dan user story US-L1.
 *
 * - Judul "Tentang yayasan" (h2, Literata)
 * - Teks 2-3 paragraf (Literata 400, tinggi baris 1.75, maks 68ch)
 * - Teks dari data (paragraf dipisah baris kosong \n\n)
 * - TANPA dangerouslySetInnerHTML
 * - Latar Kertas Dermaga
 */
import React from 'react';

interface AboutSectionProps {
  description?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ description }) => {
  // Pisahkan paragraf berdasarkan baris kosong; tampilkan sebagai teks biasa
  const paragraphs = description
    ? description
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  return (
    <section
      id="tentang"
      aria-labelledby="tentang-heading"
      className="bg-paper py-16 md:py-24"
      style={{ scrollMarginTop: '4rem' }}
    >
      <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8">
        <h2
          id="tentang-heading"
          className="font-display font-semibold text-2xl text-ink mb-6"
        >
          Tentang yayasan
        </h2>

        <div className="prose max-w-prose">
          {paragraphs.length > 0 ? (
            paragraphs.map((para, i) => (
              <p key={i} className="text-ink mb-4 last:mb-0">
                {para}
              </p>
            ))
          ) : (
            <p className="text-muted italic">Belum diisi</p>
          )}
        </div>
      </div>
    </section>
  );
};

