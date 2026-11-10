import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';
import { apiClient } from '@/lib/api-client';

interface EducationUnit {
  id: number;
  code: string;
  name: string;
  slug: string;
  level: string;
  tagline?: string | null;
  description?: string | null;
  accreditation?: string | null;
  principal_name?: string | null;
  facilities?: string[] | null;
  is_active: boolean;
}

export const UnitListPage: React.FC = () => {
  const { data: unitsData, isLoading } = useQuery<{ data: EducationUnit[] }>({
    queryKey: ['public', 'units'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: EducationUnit[] }>('/public/units');
        return res.data;
      } catch {
        return { data: [] };
      }
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const units = unitsData?.data || [];

  return (
    <div className="bg-paper min-h-screen py-12 md:py-16">
      <SeoHead
        title="Unit Pendidikan - Yayasan Padindi"
        description="Jenjang sekolah yang dinaungi Yayasan Padindi: Sekolah Dasar (SD) dan Sekolah Menengah Pertama (SMP)."
      />

      <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-block px-3 py-1 bg-navy/10 text-navy font-bold text-xs rounded-full uppercase tracking-wider">
            Jenjang Sekolah
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-navy">
            Unit Pendidikan Yayasan Padindi
          </h1>
          <p className="text-muted text-sm md:text-base">
            Membina anak didik mulai dari jenjang dasar hingga menengah pertama dengan kurikulum unggul, fasilitas modern, dan pengajar profesional.
          </p>
        </div>

        {/* Units Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-8 rounded-card border border-navy/10 animate-pulse space-y-4">
                <div className="h-8 bg-navy/10 rounded w-1/3" />
                <div className="h-4 bg-navy/10 rounded w-full" />
                <div className="h-4 bg-navy/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {units.map((unit) => (
              <div
                key={unit.id}
                className="bg-white rounded-card p-8 border border-navy/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center text-navy">
                      <GraduationCap className="w-6 h-6 text-navy" />
                    </div>
                    {unit.accreditation && (
                      <span className="px-3 py-1 bg-star/20 text-navy text-xs font-bold rounded-full">
                        Akreditasi {unit.accreditation}
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-2xl text-navy">{unit.name}</h2>
                    <p className="text-xs text-muted font-semibold uppercase tracking-wider mt-0.5">
                      Jenjang {unit.level.toUpperCase()} • Kode: {unit.code}
                    </p>
                  </div>

                  <p className="text-ink text-sm leading-relaxed">
                    {unit.description ||
                      `${unit.name} menerapkan kurikulum terintegrasi yang memadukan keunggulan akademik, pembentukan karakter islami/budi pekerti, dan penguasaan teknologi sejak dini.`}
                  </p>

                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-bold text-navy uppercase tracking-wider">Keunggulan Utama:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink-muted">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Tenaga Pendidik Tersertifikasi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Laboratorium Sains & Komputer</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Ekstrakurikuler Robotik & Seni</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Program Pembinaan Karakter</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-navy/10 flex items-center justify-between">
                  <Link
                    to={`/unit/${unit.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:text-primary transition-colors"
                  >
                    <span>Pelajari Profil Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to={`/pendaftaran?unit=${unit.code}`}
                    className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-control hover:bg-navy-light shadow-sm"
                  >
                    Daftar PPDB
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitListPage;