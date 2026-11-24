import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { useVacancies, usePublicSettings, useRegistrationInfo } from '@/features/public/hooks';
import {
  Briefcase,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Award,
  ChevronRight,
  Mail,
  Phone,
  FileCheck,
  Building,
  UserCheck,
} from 'lucide-react';

export const VacancyListPage: React.FC = () => {
  const { data: vacancies = [], isLoading } = useVacancies();
  const { data: settings } = usePublicSettings();
  const { data: regInfo } = useRegistrationInfo();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const filteredVacancies = vacancies.filter((v) => {
    if (selectedLevel === 'all') return true;
    return v.education_unit?.level === selectedLevel;
  });

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Terbuka hingga terpenuhi';
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

  const getEmploymentTypeLabel = (type?: string | null) => {
    switch (type) {
      case 'full_time':
        return 'Penuh Waktu (Full Time)';
      case 'part_time':
        return 'Paruh Waktu (Part Time)';
      case 'contract':
        return 'Kontrak Kerja';
      default:
        return type || 'Penuh Waktu';
    }
  };

  const selectionStages = [
    {
      step: '1',
      title: 'Registrasi & Kirim Berkas',
      desc: 'Mendaftar secara online melalui portal rekrutmen dan melengkapi biodata, riwayat pendidikan, serta dokumen pendukung.',
    },
    {
      step: '2',
      title: 'Seleksi Administrasi',
      desc: 'Tim penilai memeriksa kesesuaian kualifikasi ijazah, kompetensi pedagogik, dan keabsahan berkas yang diunggah.',
    },
    {
      step: '3',
      title: 'Wawancara Kompetensi & Karakter',
      desc: 'Wawancara mendalam seputar motivasi mengajar, pemahaman kurikulum, dan keselarasan visi misi bersama pimpinan yayasan.',
    },
    {
      step: '4',
      title: 'Simulasi Mengajar (Micro-Teaching)',
      desc: 'Demonstrasi proses pembelajaran di depan panel penguji untuk menilai keterampilan interaksi dan penguasaan kelas.',
    },
    {
      step: '5',
      title: 'Pengumuman & Penempatan',
      desc: 'Kandidat yang dinyatakan lulus akan menandatangani perjanjian kerja dan mengikuti program orientasi guru baru Padindi.',
    },
  ];

  return (
    <div className="bg-paper min-h-screen py-10 md:py-16">
      <SeoHead
        title="Lowongan Guru & Tenaga Kependidikan — Yayasan Padindi"
        description="Peluang karir tenaga pendidik profesional dan berkarakter unggul di lingkungan sekolah Yayasan Perguruan Padindi."
      />

      <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-ink-muted flex items-center gap-1.5">
          <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/pendaftaran" className="hover:text-primary transition-colors">Pendaftaran</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-navy">Lowongan Guru</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
            <Briefcase className="w-3.5 h-3.5" />
            Karir Pendidik Profesional
          </span>

          <h1 className="font-display font-bold text-3xl md:text-5xl text-navy tracking-tight">
            Bergabung Bersama Yayasan Padindi
          </h1>
          <p className="font-sans text-base md:text-lg text-ink-muted leading-relaxed">
            Kami membuka kesempatan bagi para pendidik berbakat, berakhlak mulia, dan berdedikasi tinggi untuk bersama-sama mendidik generasi penerus bangsa yang unggul dan berdaya saing.
          </p>
        </div>

        {/* Filter Unit Pendidikan */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-card border border-navy/10 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSelectedLevel('all')}
              className={`px-4 py-2 rounded-control text-xs font-bold transition-colors whitespace-nowrap ${
                selectedLevel === 'all'
                  ? 'bg-navy text-white shadow-sm'
                  : 'bg-paper text-ink-muted hover:text-navy hover:bg-navy/5'
              }`}
            >
              Semua Lowongan ({vacancies.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedLevel('tk')}
              className={`px-4 py-2 rounded-control text-xs font-bold transition-colors whitespace-nowrap ${
                selectedLevel === 'tk'
                  ? 'bg-navy text-white shadow-sm'
                  : 'bg-paper text-ink-muted hover:text-navy hover:bg-navy/5'
              }`}
            >
              TK Padindi
            </button>
            <button
              type="button"
              onClick={() => setSelectedLevel('sd')}
              className={`px-4 py-2 rounded-control text-xs font-bold transition-colors whitespace-nowrap ${
                selectedLevel === 'sd'
                  ? 'bg-navy text-white shadow-sm'
                  : 'bg-paper text-ink-muted hover:text-navy hover:bg-navy/5'
              }`}
            >
              SD Padindi
            </button>
            <button
              type="button"
              onClick={() => setSelectedLevel('smp')}
              className={`px-4 py-2 rounded-control text-xs font-bold transition-colors whitespace-nowrap ${
                selectedLevel === 'smp'
                  ? 'bg-navy text-white shadow-sm'
                  : 'bg-paper text-ink-muted hover:text-navy hover:bg-navy/5'
              }`}
            >
              SMP Padindi
            </button>
          </div>

          <Link
            to="/pendaftaran/guru"
            className="w-full sm:w-auto text-center px-5 py-2.5 rounded-control bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Briefcase className="w-4 h-4" />
            Kirim Lamaran Umum
          </Link>
        </div>

        {/* Daftar Lowongan */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="p-6 bg-white rounded-card border border-navy/10 animate-pulse space-y-4">
                  <div className="h-5 bg-paper rounded w-1/3" />
                  <div className="h-6 bg-paper rounded w-2/3" />
                  <div className="h-16 bg-paper rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredVacancies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVacancies.map((vac) => (
                <div
                  key={vac.id}
                  className="bg-white rounded-card border border-navy/10 p-6 md:p-8 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-all space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {vac.education_unit && (
                          <span className="text-xs uppercase tracking-wider font-bold text-primary block mb-1">
                            {vac.education_unit.name} • {vac.education_unit.level?.toUpperCase()}
                          </span>
                        )}
                        <h3 className="font-display font-bold text-xl text-navy">
                          {vac.title}
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-navy/5 text-navy border border-navy/10 shrink-0">
                        {getEmploymentTypeLabel(vac.employment_type)}
                      </span>
                    </div>

                    {vac.subject && (
                      <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        Mata Pelajaran: {vac.subject}
                      </p>
                    )}

                    {vac.description && (
                      <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">
                        {vac.description}
                      </p>
                    )}

                    {vac.requirements && (
                      <div className="bg-paper p-3.5 rounded-control border border-navy/10 text-xs space-y-1.5">
                        <span className="font-bold text-navy block">Persyaratan Utama:</span>
                        <p className="text-ink-muted whitespace-pre-line leading-relaxed">
                          {vac.requirements}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-navy/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-ink-muted">
                      <Clock className="w-3.5 h-3.5 text-rose-600" />
                      <span>Batas Lamaran: <strong>{formatDate(vac.closes_at)}</strong></span>
                    </div>

                    <Link
                      to="/pendaftaran/guru"
                      className="px-5 py-2.5 rounded-control bg-navy text-white hover:bg-navy/90 font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                    >
                      Lamar Sekarang <ArrowRight className="w-3.5 h-3.5 text-star" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-card border border-navy/10 p-10 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-navy/5 text-navy flex items-center justify-center mx-auto">
                <Briefcase className="w-8 h-8 text-navy/60" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-xl text-navy">
                  Belum Ada Posisi Dibuka Saat Ini
                </h3>
                <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
                  Seluruh formasi guru saat ini telah terpenuhi. Namun, Anda tetap dapat mengirimkan berkas data pelamar umum agar kami dapat menghubungi Anda saat formasi dibuka.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/pendaftaran/guru"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-control bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <FileCheck className="w-4 h-4" />
                  Kirim Berkas Lamaran Inisiatif
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Section: Tahapan Rekrutmen */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-navy">
              Alur & Tahapan Rekrutmen Guru
            </h2>
            <p className="text-sm text-ink-muted mt-1">
              Proses seleksi transparan, profesional, dan berbasis kompetensi kependidikan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {selectionStages.map((st) => (
              <div
                key={st.step}
                className="bg-white p-5 rounded-card border border-navy/10 shadow-sm space-y-2 flex flex-col justify-between"
              >
                <div>
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-bold text-sm mb-3">
                    {st.step}
                  </span>
                  <h4 className="font-bold text-sm text-navy">{st.title}</h4>
                  <p className="text-xs text-ink-muted leading-relaxed mt-1">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {regInfo?.next_steps?.teacher_interview_info && (
            <div className="bg-primary/5 p-4 rounded-card border border-primary/20 text-xs text-ink flex items-start gap-3">
              <UserCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>Catatan Seleksi Wawancara:</strong> {regInfo.next_steps.teacher_interview_info}
              </span>
            </div>
          )}
        </div>

        {/* Section: Mengapa Bergabung Bersama Kami? */}
        <div className="bg-white rounded-card border border-navy/10 shadow-sm p-6 md:p-10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-navy">
              Keunggulan Berkarir di Yayasan Padindi
            </h2>
            <p className="text-xs md:text-sm text-ink-muted">
              Kami berkomitmen menyediakan iklim pembelajaran yang kondusif bagi pertumbuhan profesional tenaga pendidik.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-paper rounded-control border border-navy/10 space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-navy">Pengembangan Karir Berkelanjutan</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Pelatihan kompetensi pedagogik, sertifikasi pendidik, dan lokakarya kurikulum secara berkala untuk meningkatkan mutu pengajaran.
              </p>
            </div>

            <div className="p-5 bg-paper rounded-control border border-navy/10 space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-navy">Fasilitas Sekolah Representatif</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Didukung sarana kelas berpendingin udara, proyektor interaktif, laboratorium sains terpadu, dan jaringan internet berkecepatan tinggi.
              </p>
            </div>

            <div className="p-5 bg-paper rounded-control border border-navy/10 space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-navy">Budaya Kerja Kolaboratif</h4>
              <p className="text-xs text-ink-muted leading-relaxed">
                Suasana kekeluargaan yang harmonis, saling menghargai dedikasi sesama pengajar, serta menjunjung tinggi nilai-nilai etika dan integritas.
              </p>
            </div>
          </div>
        </div>

        {/* Section: Kontak HRD Yayasan */}
        <div className="bg-navy text-white rounded-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 max-w-xl">
            <h3 className="font-display font-bold text-xl text-white">
              Pertanyaan Seputar Rekrutmen Guru?
            </h3>
            <p className="text-xs text-white/80 leading-relaxed">
              Hubungi bagian kepegawaian Yayasan Padindi untuk informasi spesifik mengenai kualifikasi posisi dan status seleksi Anda.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-white/90 font-medium">
              {settings?.contact_email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-star" />
                  <span>{settings.contact_email}</span>
                </div>
              )}
              {settings?.contact_phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-star" />
                  <span>{settings.contact_phone}</span>
                </div>
              )}
            </div>
          </div>

          <Link
            to="/pendaftaran/guru"
            className="px-6 py-3 rounded-control bg-star text-navy hover:bg-star/90 font-bold text-xs shadow-md transition-colors text-center shrink-0"
          >
            Mulai Pendaftaran Guru
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VacancyListPage;
