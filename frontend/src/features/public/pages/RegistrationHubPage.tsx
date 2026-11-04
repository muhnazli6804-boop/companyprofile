import React from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { StatusRibbon } from '@/components/brand/StatusRibbon';
import { useRegistrationInfo } from '@/features/public/hooks';
import { GraduationCap, Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RegistrationHubPage: React.FC = () => {
  const { data: regInfo } = useRegistrationInfo();

  const activePeriod = regInfo?.active_period;
  const isOpen = activePeriod?.is_open ?? true;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const ribbonText = activePeriod
    ? `Periode ${activePeriod.name} dibuka • Ditutup ${formatDate(activePeriod.closes_at)}`
    : 'Periode pendaftaran baru tahun ajaran 2027/2028 sedang dibuka';

  return (
    <div className="bg-paper min-h-screen py-10 md:py-16">
      <SeoHead
        title="Pendaftaran Siswa Baru & Guru — Yayasan Padindi"
        description="Portal resmi pendaftaran peserta didik baru (SD dan SMP) serta rekrutmen tenaga pendidik Yayasan Padindi Jakarta."
      />

      <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="mb-4">
            <StatusRibbon text={ribbonText} isOpen={isOpen} />
          </div>

          <h1 className="font-display font-semibold text-3xl md:text-4xl text-primary mb-4">
            Pendaftaran Yayasan Padindi
          </h1>
          <p className="font-sans text-base md:text-lg text-muted leading-relaxed">
            Selamat datang di portal pendaftaran terpadu Yayasan Padindi. Silakan pilih jalur pendaftaran yang sesuai dengan kebutuhan Anda.
          </p>
        </div>

        {/* Pilihan Pendaftaran: Murid vs Guru */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Kartu Pendaftaran Murid */}
          <div className="bg-white border-2 border-line hover:border-primary transition-all duration-200 rounded-panel p-6 md:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-14 h-14 rounded-panel bg-tint-100 flex items-center justify-center text-primary mb-6">
                <GraduationCap className="w-8 h-8" />
              </div>

              <h2 className="font-display font-semibold text-2xl text-ink mb-3">
                Pendaftaran Murid Baru
              </h2>

              <p className="font-sans text-muted text-sm md:text-base leading-relaxed mb-6">
                Pendaftaran calon peserta didik baru untuk jenjang <strong>SD Padindi</strong> dan <strong>SMP Padindi</strong> tahun ajaran 2027/2028.
              </p>

              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2 text-sm text-ink font-sans">
                  <CheckCircle2 className="w-4 h-4 text-leaf flex-shrink-0" />
                  <span>Pilihan jenjang SD dan SMP</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink font-sans">
                  <CheckCircle2 className="w-4 h-4 text-leaf flex-shrink-0" />
                  <span>Unggah Kartu Keluarga, Ijazah/SKL, & Foto</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink font-sans">
                  <CheckCircle2 className="w-4 h-4 text-leaf flex-shrink-0" />
                  <span>Ikuti observasi & tes secara offline</span>
                </div>
              </div>
            </div>

            <Link
              to="/pendaftaran/murid"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-primary text-white font-sans font-bold text-base rounded-control hover:bg-primary-hover active:bg-primary-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
              style={{ minHeight: 48 }}
            >
              <span>Mulai Pendaftaran Murid</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Kartu Pendaftaran Guru */}
          <div className="bg-white border-2 border-line hover:border-primary transition-all duration-200 rounded-panel p-6 md:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-14 h-14 rounded-panel bg-tint-100 flex items-center justify-center text-primary mb-6">
                <Briefcase className="w-8 h-8" />
              </div>

              <h2 className="font-display font-semibold text-2xl text-ink mb-3">
                Pendaftaran Guru & Staf
              </h2>

              <p className="font-sans text-muted text-sm md:text-base leading-relaxed mb-6">
                Kesempatan berkarir dan mengabdi sebagai tenaga pendidik berdedikasi di lingkungan sekolah Yayasan Padindi.
              </p>

              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2 text-sm text-ink font-sans">
                  <CheckCircle2 className="w-4 h-4 text-leaf flex-shrink-0" />
                  <span>Formasi guru SD dan SMP</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink font-sans">
                  <CheckCircle2 className="w-4 h-4 text-leaf flex-shrink-0" />
                  <span>Lampirkan CV, Portofolio, & Ijazah Terakhir</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink font-sans">
                  <CheckCircle2 className="w-4 h-4 text-leaf flex-shrink-0" />
                  <span>Tahapan wawancara secara daring</span>
                </div>
              </div>
            </div>

            <Link
              to="/pendaftaran/guru"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-primary text-white font-sans font-bold text-base rounded-control hover:bg-primary-hover active:bg-primary-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
              style={{ minHeight: 48 }}
            >
              <span>Mulai Pendaftaran Guru</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Informasi Tahapan Ringkas */}
        <div className="bg-white border border-line rounded-panel p-6 md:p-8 max-w-4xl mx-auto">
          <h3 className="font-display font-semibold text-xl text-primary mb-6 text-center">
            Alur Pendaftaran Mudah dalam 3 Tahap
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-tint-100 text-primary font-bold flex items-center justify-center mb-3">
                1
              </div>
              <h4 className="font-sans font-bold text-base text-ink mb-1">Pengisian Formulir</h4>
              <p className="font-sans text-sm text-muted">
                Lengkapi identitas diri, orang tua/wali, serta riwayat pendidikan.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-tint-100 text-primary font-bold flex items-center justify-center mb-3">
                2
              </div>
              <h4 className="font-sans font-bold text-base text-ink mb-1">Unggah Dokumen</h4>
              <p className="font-sans text-sm text-muted">
                Unggah berkas persyaratan wajib (KK, Ijazah/SKL, dan pas foto).
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-tint-100 text-primary font-bold flex items-center justify-center mb-3">
                3
              </div>
              <h4 className="font-sans font-bold text-base text-ink mb-1">Nomor & Langkah Lanjutan</h4>
              <p className="font-sans text-sm text-muted">
                Terima nomor pendaftaran dan ikuti tes offline (murid) atau wawancara daring (guru).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationHubPage;
