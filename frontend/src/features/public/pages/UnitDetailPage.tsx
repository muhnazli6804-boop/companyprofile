import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, ArrowLeft, CheckCircle2, User, Phone } from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';
import { apiClient } from '@/lib/api-client';

interface EducationUnitDetail {
  id: number;
  code: string;
  name: string;
  slug: string;
  level: string;
  tagline?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  accreditation?: string | null;
  principal_name?: string | null;
  facilities?: string[] | null;
}

export const UnitDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: unit, isLoading, isError } = useQuery<EducationUnitDetail>({
    queryKey: ['public', 'unit', slug],
    queryFn: async () => {
      const res = await apiClient.get<{ data: EducationUnitDetail }>(`/public/units/${slug}`);
      return res.data.data;
    },
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <div className="bg-paper min-h-[60vh] py-16">
        <div className="max-w-4xl mx-auto px-4 space-y-6 animate-pulse">
          <div className="h-4 bg-navy/10 rounded w-24" />
          <div className="h-10 bg-navy/10 rounded w-1/2" />
          <div className="h-40 bg-navy/10 rounded" />
        </div>
      </div>
    );
  }

  if (isError || !unit) {
    return (
      <div className="bg-paper min-h-[60vh] py-16 flex items-center justify-center">
        <div className="bg-white p-8 rounded-card border border-navy/10 text-center max-w-md space-y-4">
          <h1 className="font-display font-bold text-xl text-navy">Unit Pendidikan Tidak Ditemukan</h1>
          <p className="text-muted text-xs">
            Halaman unit pendidikan yang Anda tuju mungkin tidak tersedia.
          </p>
          <Link
            to="/unit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white text-xs font-bold rounded-control hover:bg-navy-light"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Unit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper min-h-screen py-12 md:py-16">
      <SeoHead
        title={`${unit.name} - Yayasan Padindi`}
        description={unit.description || `Profil dan informasi lengkap ${unit.name} Yayasan Padindi.`}
      />

      <div className="max-w-4xl mx-auto px-4 md:px-6 space-y-8">
        <Link
          to="/unit"
          className="inline-flex items-center gap-2 text-xs font-bold text-navy hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Unit Sekolah
        </Link>

        {/* Hero Card */}
        <div className="bg-white p-8 rounded-card border border-navy/10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-navy/5 flex items-center justify-center text-navy shrink-0">
                <GraduationCap className="w-8 h-8 text-navy" />
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl md:text-3xl text-navy">{unit.name}</h1>
                <p className="text-xs text-muted font-bold uppercase tracking-wider mt-1">
                  Jenjang {unit.level.toUpperCase()} • Kode Registrasi: {unit.code}
                </p>
              </div>
            </div>

            {unit.accreditation && (
              <span className="px-4 py-2 bg-star/20 text-navy text-xs font-bold rounded-full self-start sm:self-center">
                Akreditasi {unit.accreditation}
              </span>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="font-display font-bold text-lg text-navy">Deskripsi & Profil Sekolah</h2>
            <p className="text-ink text-sm md:text-base leading-relaxed">
              {unit.description ||
                `${unit.name} berfokus pada pendidikan yang berpusat pada tumbuh kembang anak secara menyeluruh. Dengan dukungan fasilitas yang memadai dan guru-guru berdedikasi, kami menuntun setiap anak menggapai potensi terbaiknya.`}
            </p>
          </div>

          {/* Kepala Sekolah & Kontak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-navy/10 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-navy/5 flex items-center justify-center text-navy shrink-0">
                <User className="w-4 h-4 text-navy" />
              </div>
              <div>
                <span className="text-muted block text-[11px]">Kepala Sekolah:</span>
                <strong className="text-navy">{unit.principal_name || 'Dewi Rahmawati, S.Pd.'}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-navy/5 flex items-center justify-center text-navy shrink-0">
                <Phone className="w-4 h-4 text-navy" />
              </div>
              <div>
                <span className="text-muted block text-[11px]">Kontak Sekolah:</span>
                <strong className="text-navy">{unit.phone || '021-5550100'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Fasilitas & Kurikulum */}
        <div className="bg-white p-8 rounded-card border border-navy/10 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-lg text-navy">Fasilitas Penunjang Pembelajaran</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-ink">
            {[
              'Ruang Kelas Ber-AC & Proyektor',
              'Perpustakaan Lengkap & Pojok Baca',
              'Laboratorium Komputer & Sains',
              'Lapangan Olahraga Multifungsi',
              'Musholla & Ruang Bimbingan Konseling',
              'UKS & Kantin Sehat Higienis',
            ].map((fac, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2.5 bg-paper rounded-control border border-navy/5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{fac}</span>
              </div>
            ))}
          </div>

          <div className="pt-6 mt-6 border-t border-navy/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted">
              Pendaftaran Peserta Didik Baru (PPDB) untuk {unit.name} dapat dilakukan secara daring.
            </p>
            <Link
              to={`/pendaftaran?unit=${unit.code}`}
              className="px-6 py-2.5 bg-navy text-white text-xs font-bold rounded-control hover:bg-navy-light shadow-sm whitespace-nowrap"
            >
              Daftar ke {unit.name}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitDetailPage;