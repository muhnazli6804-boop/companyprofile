/**
 * HomePage — halaman beranda (landing page) Yayasan Padindi.
 * Menyusun bagian-bagian: Hero, Tentang, Visi dan Misi, Kegiatan, Kontak.
 * Data dari hook TanStack Query (mock atau API nyata via VITE_USE_MOCK).
 */
import React, { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { SeoHead } from '@/components/seo/SeoHead';
import { HeroSection } from '../components/HeroSection';
import { AboutSection } from '../components/AboutSection';
import { VisionMissionSection } from '../components/VisionMissionSection';
import { ActivitiesSection } from '../components/ActivitiesSection';
import { ContactSection } from '../components/ContactSection';
import { usePublicSettings, useActivities } from '../hooks';
import type { SiteSettings } from '../types';

// Fallback settings minimal agar halaman tidak kosong saat data belum ada
const FALLBACK_SETTINGS: SiteSettings = {
  site_name: 'Yayasan Padindi',
};

export const HomePage: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading: settingsLoading,
    isError: settingsError,
  } = usePublicSettings();

  const {
    data: activitiesData,
    isLoading: activitiesLoading,
    isError: activitiesError,
  } = useActivities();

  const handleRetryActivities = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['public', 'activities'] });
  }, [queryClient]);

  const s = settings ?? FALLBACK_SETTINGS;
  const activities = activitiesData?.data ?? [];

  // JSON-LD EducationalOrganization — hanya field yang ada
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: s.site_name,
    url: window.location.origin,
  };
  if (s.site_logo_url) jsonLd.logo = s.site_logo_url;
  if (s.contact_address) jsonLd.address = s.contact_address;
  if (s.contact_phone) jsonLd.telephone = s.contact_phone;
  if (s.contact_email) jsonLd.email = s.contact_email;
  const sameAs = [
    s.social_instagram,
    s.social_facebook,
    s.social_youtube,
  ].filter(Boolean);
  if (sameAs.length) jsonLd.sameAs = sameAs;

  return (
    <>
      <SeoHead
        title="Beranda"
        description={
          s.site_tagline ||
          `${s.site_name} — lembaga pendidikan swasta di Jakarta.`
        }
        siteName={s.site_name}
        jsonLd={jsonLd}
      />

      {/* ---- Hero ---- */}
      {/* Selalu tampil; gunakan fallback bila data belum ada */}
      <HeroSection
        siteName={s.site_name}
        tagline={s.site_tagline}
        logoUrl={s.site_logo_url}
      />

      {/* ---- Tentang ---- */}
      {/* Tampil bila tidak loading atau ada data */}
      {!settingsLoading && !settingsError && (
        <AboutSection description={s.about_description} />
      )}
      {settingsLoading && (
        <section
          className="bg-paper py-16 md:py-24"
          aria-busy="true"
          aria-label="Memuat konten tentang yayasan"
        >
          <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8">
            <div className="h-8 bg-tint-100 rounded w-1/3 mb-6" />
            <div className="space-y-3 max-w-prose">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-tint-100 rounded w-full" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- Visi dan Misi ---- */}
      {!settingsLoading && !settingsError && (
        <VisionMissionSection
          vision={s.vision}
          mission={s.mission}
        />
      )}

      {/* ---- Kegiatan ---- */}
      <section
        id="kegiatan"
        aria-label="Kegiatan yayasan"
        style={{ scrollMarginTop: '4rem' }}
      >
        <ActivitiesSection
          activities={activities}
          isLoading={activitiesLoading}
          isError={activitiesError}
          onRetry={handleRetryActivities}
        />
      </section>

      {/* ---- Kontak ---- */}
      {!settingsLoading && !settingsError && (
        <ContactSection settings={s} />
      )}
      {settingsLoading && (
        <section
          className="bg-navy py-16 md:py-24"
          aria-busy="true"
          aria-label="Memuat kontak"
        >
          <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8">
            <div className="h-8 bg-white/10 rounded w-1/4 mb-6" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-white/10 rounded w-2/3" />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default HomePage;
