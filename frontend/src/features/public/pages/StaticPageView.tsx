import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { usePublicPage, usePublicSettings } from '@/features/public/hooks';
import {
  FileText,
  ChevronRight,
  Calendar,
  Share2,
  Check,
  AlertCircle,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const StaticPageView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const activeSlug = slug || '';
  const { data: page, isLoading, isError } = usePublicPage(activeSlug);
  const { data: settings } = usePublicSettings();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const formattedDate = page?.updated_at
    ? new Date(page.updated_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="bg-paper min-h-screen py-10 md:py-16">
      <SeoHead
        title={page?.meta_title || (page ? `${page.title} — Yayasan Padindi` : 'Halaman Informasi — Yayasan Padindi')}
        description={
          page?.meta_description ||
          'Informasi resmi dan publikasi panduan dari Yayasan Perguruan Padindi Jakarta.'
        }
      />

      <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-ink-muted flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">
            Beranda
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-ink-muted/60" />
          <span className="text-ink-muted">Halaman</span>
          <ChevronRight className="w-3.5 h-3.5 text-ink-muted/60" />
          <span className="font-semibold text-navy truncate max-w-xs md:max-w-md">
            {isLoading ? 'Memuat...' : page?.title || activeSlug}
          </span>
        </nav>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-card border border-navy/10 p-8 md:p-12 shadow-sm space-y-6 animate-pulse">
            <div className="h-6 w-36 bg-navy/10 rounded-full" />
            <div className="h-10 w-3/4 bg-navy/10 rounded-md" />
            <div className="h-4 w-48 bg-navy/10 rounded-md" />
            <div className="space-y-3 pt-6 border-t border-navy/10">
              <div className="h-4 w-full bg-navy/10 rounded" />
              <div className="h-4 w-full bg-navy/10 rounded" />
              <div className="h-4 w-5/6 bg-navy/10 rounded" />
              <div className="h-4 w-2/3 bg-navy/10 rounded" />
            </div>
          </div>
        )}

        {/* 404 / Not Found State */}
        {!isLoading && (isError || !page) && (
          <div className="bg-white rounded-card border border-navy/10 p-8 md:p-14 shadow-sm text-center max-w-2xl mx-auto space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display font-bold text-2xl md:text-3xl text-navy">
                Halaman Tidak Ditemukan
              </h1>
              <p className="text-sm text-ink-muted leading-relaxed">
                Halaman dengan alamat <code className="px-2 py-0.5 bg-paper rounded font-mono text-navy font-semibold text-xs">/halaman/{activeSlug}</code> belum diterbitkan, telah dihapus, atau tautan yang Anda tuju kurang tepat.
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/">
                <Button variant="primary" className="text-xs flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Beranda
                </Button>
              </Link>
              <Link to="/berita">
                <Button variant="outline" className="text-xs">
                  Lihat Berita & Informasi
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Content View */}
        {!isLoading && page && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Content Article */}
            <main className="lg:col-span-8 bg-white rounded-card border border-navy/10 p-6 md:p-10 shadow-sm space-y-6">
              {/* Header Info */}
              <div className="space-y-4 border-b border-navy/10 pb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-navy/5 text-navy border border-navy/10">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span>Halaman Informasi Resmi</span>
                </div>

                <h1 className="font-display font-bold text-2xl md:text-4xl text-navy tracking-tight leading-tight">
                  {page.title}
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-ink-muted">
                  {formattedDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>Terakhir diperbarui: <strong className="text-navy">{formattedDate}</strong></span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-paper text-navy font-semibold hover:bg-navy/5 border border-navy/10 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tautan Disalin</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-ink-muted" />
                        <span>Bagikan Halaman</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Dynamic Body Content */}
              <article className="prose prose-navy max-w-none text-ink text-sm leading-relaxed space-y-4">
                <div dangerouslySetInnerHTML={{ __html: page.content }} />
              </article>
            </main>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Layanan & Pendaftaran Card */}
              <div className="bg-white rounded-card border border-navy/10 p-5 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-sm text-navy flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Layanan & Portal Padindi
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Akses langsung portal pendaftaran peserta didik baru dan informasi karir pengajar Yayasan Padindi.
                </p>
                <div className="space-y-2 pt-2">
                  <Link
                    to="/pendaftaran"
                    className="flex items-center justify-between p-3 rounded-control bg-navy/5 hover:bg-navy/10 text-navy text-xs font-semibold transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      Pendaftaran Murid (PPDB)
                    </span>
                    <ChevronRight className="w-4 h-4 text-ink-muted" />
                  </Link>
                  <Link
                    to="/lowongan-guru"
                    className="flex items-center justify-between p-3 rounded-control bg-navy/5 hover:bg-navy/10 text-navy text-xs font-semibold transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary" />
                      Lowongan Guru & Staf
                    </span>
                    <ChevronRight className="w-4 h-4 text-ink-muted" />
                  </Link>
                </div>
              </div>

              {/* Kontak Yayasan Card */}
              <div className="bg-white rounded-card border border-navy/10 p-5 shadow-sm space-y-3">
                <h3 className="font-display font-bold text-sm text-navy">
                  Pusat Bantuan & Layanan
                </h3>
                <p className="text-xs text-ink-muted">
                  Memerlukan informasi lebih lanjut mengenai konten ini? Hubungi sekretariat yayasan:
                </p>
                <div className="space-y-2 pt-1 text-xs">
                  {settings?.contact_phone && (
                    <div className="flex items-center gap-2 text-ink">
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{settings.contact_phone}</span>
                    </div>
                  )}
                  {settings?.contact_email && (
                    <div className="flex items-center gap-2 text-ink">
                      <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                      <a href={`mailto:${settings.contact_email}`} className="hover:text-primary transition-colors">
                        {settings.contact_email}
                      </a>
                    </div>
                  )}
                </div>
                <div className="pt-2">
                  <Link to="/kontak">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Buka Halaman Kontak
                    </Button>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaticPageView;
