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
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface BannerData {
  id: number;
  title: string;
  subtitle?: string | null;
  image_path?: string | null;
  cta_label?: string | null;
  link_url?: string | null;
}

interface HeroSectionProps {
  siteName: string;
  tagline?: string;
  logoUrl?: string;
  heroBgImage?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  siteName,
  tagline,
  heroBgImage,
}) => {
  const { data: banners } = useQuery<BannerData[]>({
    queryKey: ['public', 'banners'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: BannerData[] }>('/public/banners');
        return res.data.data;
      } catch {
        return [];
      }
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const [currentIdx, setCurrentIdx] = React.useState(0);
  const activeBanners = banners && banners.length > 0 ? banners : [];
  const currentBanner = activeBanners[currentIdx] || activeBanners[0] || null;

  const displayTitle = currentBanner?.title || tagline || siteName;
  const displaySubtitle =
    currentBanner?.subtitle ||
    (tagline
      ? 'Lembaga pendidikan swasta yang berkomitmen menuntun setiap anak ke arah yang tepat.'
      : undefined);
  const displayCtaLabel = currentBanner?.cta_label || 'Daftar sekarang';
  const displayCtaLink = currentBanner?.link_url || '/pendaftaran';
  const bgImage = currentBanner?.image_path || heroBgImage || '/images/banner-hero-1.jpg';

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative bg-primary on-blue bg-cover bg-center overflow-hidden transition-all duration-700"
      style={bgImage ? { backgroundImage: `url("${bgImage}")` } : undefined}
    >
      {/* Overlay gradien biru navy agar teks dan tombol selalu jelas terbaca dan kontras sesuai standar WCAG AA/AAA */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-500"
        style={{
          background: bgImage
            ? 'linear-gradient(90deg, rgba(6, 31, 92, 0.92) 0%, rgba(6, 31, 92, 0.80) 55%, rgba(6, 31, 92, 0.55) 100%)'
            : 'var(--color-primary, #0B3C95)',
        }}
      />

      <div className="relative z-10 max-w-content mx-auto px-4 md:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-3xl flex flex-col gap-6">
          <h1
            id="hero-heading"
            className="font-display font-semibold text-display text-white leading-tight"
          >
            {displayTitle}
          </h1>

          {displaySubtitle && (
            <p className="font-sans text-lg md:text-xl text-white/90 leading-relaxed font-normal max-w-2xl">
              {displaySubtitle}
            </p>
          )}

          <div className="flex flex-wrap gap-4 pt-1">
            {/* Tombol CTA Utama — Aksen: Kuning Bintang */}
            <a
              href={displayCtaLink}
              className="
                inline-flex items-center justify-center px-6 py-3 rounded-control
                bg-star text-ink font-sans font-bold text-base shadow-sm
                hover:bg-[#E0BE16] active:bg-[#CCA80C] transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary
              "
              style={{ minHeight: 44 }}
            >
              {displayCtaLabel}
            </a>

            {/* Tombol "Hubungi kami" — Sekunder di atas biru */}
            <a
              href="#kontak"
              className="
                inline-flex items-center justify-center px-6 py-3 rounded-control
                bg-transparent text-white font-sans font-bold text-base
                border-2 border-white
                hover:bg-white/10 active:bg-white/20 transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary
              "
              style={{ minHeight: 44 }}
            >
              Hubungi kami
            </a>
          </div>

          {activeBanners.length > 1 && (
            <div className="flex items-center gap-2 pt-2" aria-label="Navigasi Banner Hero">
              {activeBanners.map((b, idx) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  aria-label={`Lihat banner ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIdx ? 'w-8 bg-star' : 'w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

