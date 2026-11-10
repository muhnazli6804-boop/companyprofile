import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { SeoHead } from '@/components/seo/SeoHead';
import { usePublicSettings } from '@/features/public/hooks';
import { apiClient } from '@/lib/api-client';
import { Users, Award, BookOpen } from 'lucide-react';

interface OrgMember {
  id: number;
  name: string;
  position: string;
  bio?: string | null;
  photo_path?: string | null;
  sort_order: number;
}

export const AboutPage: React.FC = () => {
  const { data: settings } = usePublicSettings();

  const { data: orgMembers } = useQuery<OrgMember[]>({
    queryKey: ['public', 'organization'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: OrgMember[] }>('/public/organization');
        return res.data.data;
      } catch {
        return [];
      }
    },
  });

  const aboutDescription = settings?.about_description || 'Yayasan Padindi adalah lembaga pendidikan swasta yang berdedikasi membimbing dan mendidik generasi penerus bangsa berlandaskan budi pekerti, integritas, dan kompetensi masa depan.';

  return (
    <div className="bg-paper min-h-screen py-12 md:py-16">
      <SeoHead
        title="Tentang Yayasan - Yayasan Padindi"
        description="Profil, sejarah perjalanan, dan dewan pengurus Yayasan Padindi."
      />

      <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block px-3 py-1 bg-navy/10 text-navy font-bold text-xs rounded-full uppercase tracking-wider">
            Profil & Sejarah
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-navy">
            Tentang Yayasan Padindi
          </h1>
          <p className="text-muted text-sm md:text-base">
            Membangun ekosistem pendidikan yang holistik, ramah anak, dan adaptif terhadap perkembangan zaman.
          </p>
        </div>

        {/* Tentang Kami / Sejarah */}
        <div className="bg-white p-6 md:p-10 rounded-card border border-navy/10 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-navy/10 pb-4">
            <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center text-navy">
              <BookOpen className="w-5 h-5 text-navy" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-navy">Sejarah & Komitmen Pendidikan</h2>
              <p className="text-xs text-muted">Amanah dan dedikasi dalam mendidik tunas bangsa</p>
            </div>
          </div>

          <div className="prose max-w-none text-ink text-sm md:text-base leading-relaxed space-y-4">
            {aboutDescription.split('\n\n').map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </div>

        {/* Nilai Utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-card border border-navy/10 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center text-navy">
              <Award className="w-5 h-5 text-star" />
            </div>
            <h3 className="font-display font-bold text-base text-navy">Integritas & Budi Pekerti</h3>
            <p className="text-xs text-muted leading-relaxed">
              Menanamkan fondasi akhlak mulia dan kejujuran sebagai pilar utama dalam setiap tahapan pembentukan karakter siswa.
            </p>
          </div>

          <div className="bg-white p-6 rounded-card border border-navy/10 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center text-navy">
              <BookOpen className="w-5 h-5 text-navy" />
            </div>
            <h3 className="font-display font-bold text-base text-navy">Kecakapan Masa Depan</h3>
            <p className="text-xs text-muted leading-relaxed">
              Menerapkan kurikulum adaptif yang melatih kemampuan berpikir kritis, pemecahan masalah, dan penguasaan sains teknologi.
            </p>
          </div>

          <div className="bg-white p-6 rounded-card border border-navy/10 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center text-navy">
              <Users className="w-5 h-5 text-navy" />
            </div>
            <h3 className="font-display font-bold text-base text-navy">Kolaborasi Tri Sentra</h3>
            <p className="text-xs text-muted leading-relaxed">
              Mempererat sinergi yang harmonis antara lingkungan sekolah, orang tua keluarga, dan masyarakat sekitar.
            </p>
          </div>
        </div>

        {/* Struktur Organisasi / Dewan Pengurus */}
        {orgMembers && orgMembers.length > 0 && (
          <div className="bg-white p-6 md:p-10 rounded-card border border-navy/10 shadow-sm space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="font-display font-bold text-2xl text-navy">Dewan Pengurus Yayasan</h2>
              <p className="text-xs text-muted">
                Para pendidik dan profesional yang mengawal tata kelola dan mutu pendidikan Yayasan Padindi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {orgMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-paper p-4 rounded-lg border border-navy/10 text-center flex flex-col items-center space-y-3"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-navy/10 border-2 border-star">
                    <img
                      src={member.photo_path || '/images/org/ketua-pembina.jpg'}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/news/ppdb-cover.jpg';
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-navy">{member.name}</h4>
                    <p className="text-xs text-muted font-medium">{member.position}</p>
                  </div>
                  {member.bio && (
                    <p className="text-[11px] text-muted line-clamp-3 leading-relaxed">
                      {member.bio}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutPage;