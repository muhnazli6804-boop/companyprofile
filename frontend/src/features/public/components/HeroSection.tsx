/**
 * HeroSection — bagian hero beranda.
 * Sesuai DESIGN.md bagian 7.1 dan prompt bagian 3.2.
 *
 * - Latar Biru Padindi
 * - Judul Literata rata kiri, teks pendukung 1-2 kalimat
 * - Foto bundar (Roundel) bercincin putih dan bintang di pukul 12 (kanan)
 * - Tombol: "Hubungi kami" (Aksen: Kuning, teks Tinta) dan "Lihat kegiatan" (Sekunder di atas biru)
 * - Gerak: SATU putaran 45° sekali saat dimuat, mati pada prefers-reduced-motion
 * - Ponsel: teks dahulu, foto di bawah (maks 70% lebar), batang diagonal disembunyikan
 */
import React from 'react';
import { Roundel } from '@/components/brand/Roundel';

interface HeroSectionProps {
  siteName: string;
  tagline?: string;
  logoUrl?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  siteName,
  tagline,
  logoUrl,
}) => {
  return (
    <section
      aria-labelledby="hero-heading"
      className="bg-primary on-blue"
    >
      <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10 md:gap-8">

          {/* Teks kiri */}
          <div className="flex flex-col gap-6 md:max-w-[55%]">
            <h1
              id="hero-heading"
              className="font-display font-semibold text-display text-white"
            >
              {/* TODO: naskah final berasal dari yayasan */}
              {tagline || siteName}
            </h1>

            {tagline && (
              <p className="font-sans text-lg text-white/85 leading-relaxed">
                {/* TODO: deskripsi singkat dari yayasan */}
                Lembaga pendidikan swasta yang berkomitmen menuntun setiap anak
                ke arah yang tepat.
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              {/* Tombol "Hubungi kami" — Aksen: Kuning Bintang */}
              <a
                href="#kontak"
                className="
                  inline-flex items-center justify-center px-5 py-3 rounded-control
                  bg-star text-ink font-sans font-bold text-base
                  hover:bg-[#E0BE16] active:bg-[#CCA80C] transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary
                "
                style={{ minHeight: 44 }}
              >
                Hubungi kami
              </a>

              {/* Tombol "Lihat kegiatan" — Sekunder di atas biru */}
              <a
                href="#kegiatan"
                className="
                  inline-flex items-center justify-center px-5 py-3 rounded-control
                  bg-transparent text-white font-sans font-bold text-base
                  border-2 border-white
                  hover:bg-white/10 active:bg-white/20 transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary
                "
                style={{ minHeight: 44 }}
              >
                Lihat kegiatan
              </a>

              {/* TODO: Tombol pendaftaran BELUM dipasang karena halaman pendaftaran belum ada */}
            </div>
          </div>

          {/* Foto bundar (kanan di desktop, di bawah di ponsel) */}
          <div className="flex justify-center md:justify-end">
            <Roundel
              src={logoUrl}
              alt={`Logo ${siteName}`}
              withSpokes={true}
              animated={true}
              size={240}
              className="
                max-w-[70vw] md:max-w-none
                [&_line]:hidden md:[&_line]:block
              "
            />
          </div>
        </div>
      </div>
    </section>
  );
};

