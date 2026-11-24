import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { StatusRibbon } from '@/components/brand/StatusRibbon';
import { useRegistrationInfo, usePublicSettings } from '@/features/public/hooks';
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  FileText,
  Users,
  ArrowRight,
  Clock,
  Sparkles,
  Info,
  Phone,
  Mail,
  HelpCircle,
  ChevronRight,
  Check,
} from 'lucide-react';

export const RegistrationInfoPage: React.FC = () => {
  const { data: regInfo, isLoading } = useRegistrationInfo();
  const { data: settings } = usePublicSettings();
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

  const activePeriod = regInfo?.active_period;
  const units = regInfo?.units || [];
  const isOpen = activePeriod?.is_open ?? true;

  // Set default selected unit when units are loaded
  const currentUnit =
    units.find((u) => u.id === selectedUnitId) || units[0] || null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
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

  const formatRupiah = (val?: number) => {
    if (val === undefined || val === null || val === 0) return 'Gratis (Rp 0)';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const ribbonText = activePeriod
    ? `Periode ${activePeriod.name} ${isOpen ? 'Sedang Dibuka' : 'Ditutup'} • Ditutup ${formatDate(activePeriod.closes_at)}`
    : 'Periode pendaftaran baru tahun ajaran 2027/2028 sedang dibuka';

  const steps = [
    {
      num: '01',
      title: 'Pembuatan Akun Pendaftar',
      desc: 'Orang tua / wali murid membuat akun pendaftar dengan alamat email aktif dan nomor WhatsApp yang dapat dihubungi.',
    },
    {
      num: '02',
      title: 'Pengisian Biodata Siswa',
      desc: 'Melengkapi data diri calon peserta didik, identitas orang tua/wali, serta memilih jenjang dan unit sekolah (TK, SD, atau SMP).',
    },
    {
      num: '03',
      title: 'Unggah Berkas Persyaratan',
      desc: 'Mengunggah dokumen administratif seperti Kartu Keluarga, Akta Kelahiran, dan Pas Foto dalam format digital (PDF/JPG).',
    },
    {
      num: '04',
      title: 'Observasi / Tes Penempatan',
      desc: 'Calon murid mengikuti observasi kematangan sekolah atau tes pemetaan potensi secara langsung di kampus sekolah Padindi.',
    },
    {
      num: '05',
      title: 'Pengumuman & Daftar Ulang',
      desc: 'Melihat status kelulusan melalui portal pendaftaran dan menyelesaikan administrasi daftar ulang sesuai petunjuk panitia.',
    },
  ];

  return (
    <div className="bg-paper min-h-screen py-10 md:py-16">
      <SeoHead
        title="Informasi Pendaftaran Siswa Baru (PPDB) — Yayasan Padindi"
        description="Informasi lengkap jadwal, alur pendaftaran, persyaratan dokumen, dan kuota penerimaan peserta didik baru Yayasan Padindi."
      />

      <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-ink-muted flex items-center gap-1.5">
          <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/pendaftaran" className="hover:text-primary transition-colors">Pendaftaran</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-navy">Informasi PPDB</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex justify-center mb-2">
            <StatusRibbon text={ribbonText} isOpen={isOpen} />
          </div>

          <h1 className="font-display font-bold text-3xl md:text-5xl text-navy tracking-tight">
            Penerimaan Peserta Didik Baru (PPDB)
          </h1>
          <p className="font-sans text-base md:text-lg text-ink-muted leading-relaxed">
            Selamat datang di portal informasi resmi PPDB Yayasan Padindi. Temukan panduan lengkap jadwal seleksi, daya tampung kuota, persyaratan berkas, dan tata cara pendaftaran.
          </p>
        </div>

        {/* Card: Periode & Biaya Aktif */}
        <div className="bg-white rounded-card border border-navy/10 shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy/10 pb-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary mb-2">
                Tahun Ajaran {activePeriod?.academic_year || '2027/2028'}
              </span>
              <h2 className="font-display font-bold text-2xl text-navy">
                {activePeriod?.name || 'Pendaftaran Peserta Didik Baru'}
              </h2>
              <p className="text-sm text-ink-muted mt-1">
                Gelombang {activePeriod?.wave || 1} • Pendaftaran Online Mandiri
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/pendaftaran/siswa"
                className="px-6 py-3 rounded-control bg-navy text-white hover:bg-navy/90 font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-star" />
                Daftar PPDB Sekarang
              </Link>
            </div>
          </div>

          {/* Grid Informasi Jadwal & Biaya */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-paper rounded-control border border-navy/10 space-y-1">
              <div className="flex items-center gap-2 text-ink-muted text-xs">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Pembukaan Pendaftaran</span>
              </div>
              <p className="font-bold text-navy text-sm md:text-base">
                {formatDate(activePeriod?.opens_at)}
              </p>
            </div>

            <div className="p-4 bg-paper rounded-control border border-navy/10 space-y-1">
              <div className="flex items-center gap-2 text-ink-muted text-xs">
                <Clock className="w-4 h-4 text-rose-600" />
                <span>Batas Akhir Pendaftaran</span>
              </div>
              <p className="font-bold text-navy text-sm md:text-base">
                {formatDate(activePeriod?.closes_at)}
              </p>
            </div>

            <div className="p-4 bg-paper rounded-control border border-navy/10 space-y-1">
              <div className="flex items-center gap-2 text-ink-muted text-xs">
                <Sparkles className="w-4 h-4 text-star" />
                <span>Pengumuman Kelulusan</span>
              </div>
              <p className="font-bold text-navy text-sm md:text-base">
                {formatDate(activePeriod?.announcement_at)}
              </p>
            </div>

            <div className="p-4 bg-paper rounded-control border border-navy/10 space-y-1">
              <div className="flex items-center gap-2 text-ink-muted text-xs">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Biaya Formulir</span>
              </div>
              <p className="font-bold text-emerald-700 text-sm md:text-base">
                {formatRupiah(activePeriod?.registration_fee)}
              </p>
            </div>
          </div>
        </div>

        {/* Section: Alur Pendaftaran */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-navy">
              Alur & Tahapan Pendaftaran
            </h2>
            <p className="text-sm text-ink-muted mt-1">
              Ikuti 5 langkah mudah pendaftaran peserta didik baru hingga daftar ulang.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((st, i) => (
              <div
                key={st.num}
                className="bg-white p-5 rounded-card border border-navy/10 shadow-sm flex flex-col justify-between relative"
              >
                <div className="space-y-2">
                  <span className="font-display font-extrabold text-2xl text-primary/40 block">
                    {st.num}
                  </span>
                  <h3 className="font-bold text-sm text-navy">{st.title}</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">{st.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-primary/40">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section: Daya Tampung & Kuota Unit */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <h2 className="font-display font-bold text-2xl text-navy">
                Daya Tampung & Kuota Siswa
              </h2>
              <p className="text-sm text-ink-muted mt-1">
                Ketersediaan kuota rombel kelas baru tahun ajaran {activePeriod?.academic_year || '2027/2028'}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {units.map((u) => {
              const quota = u.quota || 0;
              const filled = u.filled || 0;
              const remaining = Math.max(0, quota - filled);
              const percent = quota > 0 ? Math.min(100, Math.round((filled / quota) * 100)) : 0;
              const isFull = u.is_full || (quota > 0 && remaining === 0);

              return (
                <div
                  key={u.id}
                  className="bg-white rounded-card border border-navy/10 p-6 shadow-sm space-y-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-bold text-primary">
                        Jenjang {u.level?.toUpperCase()}
                      </span>
                      <h3 className="font-display font-bold text-lg text-navy">{u.name}</h3>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isFull
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isFull ? 'Kuota Penuh' : 'Tersedia'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-ink-muted font-medium">
                      <span>Terisi: <strong className="text-navy">{filled}</strong> dari {quota || '-'} kursi</span>
                      <span>Sisa: <strong className="text-primary">{remaining}</strong></span>
                    </div>
                    <div className="w-full bg-paper rounded-full h-2.5 overflow-hidden border border-navy/10">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          percent >= 90 ? 'bg-rose-500' : 'bg-primary'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-navy/10 flex justify-between items-center text-xs">
                    <span className="text-ink-muted">Kode Unit: <strong>{u.code}</strong></span>
                    <Link
                      to={`/unit/${u.slug}`}
                      className="text-primary hover:underline font-bold flex items-center gap-1"
                    >
                      Profil Sekolah <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Persyaratan Dokumen per Jenjang */}
        <div className="bg-white rounded-card border border-navy/10 shadow-sm p-6 md:p-8 space-y-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-navy">
              Persyaratan Dokumen Pendaftaran
            </h2>
            <p className="text-sm text-ink-muted mt-1">
              Pilih jenjang sekolah untuk melihat daftar berkas yang wajib diunggah saat pendaftaran.
            </p>
          </div>

          {/* Unit Selector Tabs */}
          {units.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto border-b border-navy/10 pb-3">
              {units.map((u) => {
                const isSelected = (currentUnit?.id || units[0].id) === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUnitId(u.id)}
                    className={`px-4 py-2 rounded-control text-xs font-bold transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-navy text-white shadow-sm'
                        : 'bg-paper text-ink-muted hover:text-navy hover:bg-navy/5'
                    }`}
                  >
                    {u.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Document Requirements List */}
          {currentUnit ? (
            <div className="space-y-3">
              {currentUnit.required_documents && currentUnit.required_documents.length > 0 ? (
                currentUnit.required_documents.map((doc, idx) => (
                  <div
                    key={doc.document_type || idx}
                    className="p-4 bg-paper rounded-control border border-navy/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-navy">{doc.label}</h4>
                          {doc.is_required ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                              Wajib
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy/10 text-ink-muted">
                              Opsional
                            </span>
                          )}
                        </div>
                        {doc.description && (
                          <p className="text-xs text-ink-muted mt-0.5">{doc.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-ink-muted flex items-center gap-3 shrink-0 sm:self-center pl-10 sm:pl-0">
                      <span>Format: <strong className="text-navy">{doc.allowed_mimes || 'PDF, JPG'}</strong></span>
                      <span>Maks: <strong className="text-navy">{Math.round((doc.max_size_kb || 2048) / 1024)} MB</strong></span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-ink-muted bg-paper rounded-control border border-dashed border-navy/20">
                  <FileText className="w-8 h-8 text-ink-muted/50 mx-auto mb-2" />
                  Seluruh persyaratan administrasi umum (Kartu Keluarga, Akta Kelahiran, dan Foto) berlaku untuk unit ini.
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-ink-muted">Memuat informasi unit...</p>
          )}
        </div>

        {/* Section: Observasi & Tes Penempatan */}
        <div className="bg-gradient-to-br from-navy to-navy/90 text-white rounded-card p-6 md:p-8 shadow-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-star/20 flex items-center justify-center text-star shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-white">
                Tahap Observasi & Tes Penempatan
              </h3>
              <p className="text-xs text-white/80">Informasi resmi panitia PPDB Padindi</p>
            </div>
          </div>

          <div className="bg-white/10 p-4 rounded-control border border-white/15 text-sm leading-relaxed text-white/95">
            {regInfo?.next_steps?.student_test_info ||
              'Calon murid perlu mengikuti tes penempatan / observasi kesiapan belajar secara offline di kampus sekolah Yayasan Padindi sesuai jadwal yang akan diinformasikan oleh panitia.'}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs text-white/80">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-star shrink-0" />
              <span>Observasi ramah anak & non-diskriminatif</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-star shrink-0" />
              <span>Pendampingan penuh oleh psikolog & guru ahli</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-star shrink-0" />
              <span>Pemetaan minat dan gaya belajar murid</span>
            </div>
          </div>
        </div>

        {/* Section: Bantuan Kontak */}
        <div className="bg-white rounded-card border border-navy/10 shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <h3 className="font-display font-bold text-xl text-navy">
              Butuh Informasi Tambahan Seputar PPDB?
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Tim sekretariat pendaftaran Yayasan Padindi siap membantu Anda. Kunjungi langsung kantor kami atau hubungi nomor layanan di bawah ini.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-navy font-semibold">
              {settings?.contact_phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>{settings.contact_phone}</span>
                </div>
              )}
              {settings?.contact_email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>{settings.contact_email}</span>
                </div>
              )}
              {settings?.contact_hours && (
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <Clock className="w-3.5 h-3.5 text-ink-muted" />
                  <span>{settings.contact_hours}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/kontak"
              className="px-5 py-2.5 rounded-control border border-navy/20 hover:bg-navy/5 text-navy font-bold text-xs transition-colors"
            >
              Kirim Pesan Pertanyaan
            </Link>
            <Link
              to="/pendaftaran/siswa"
              className="px-5 py-2.5 rounded-control bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-sm transition-colors"
            >
              Mulai Pendaftaran Siswa
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationInfoPage;
