import React from 'react';
import { SeoHead } from '@/components/seo/SeoHead';
import { usePublicSettings } from '@/features/public/hooks';
import { Compass, Target, CheckCircle2 } from 'lucide-react';

export const VisionMissionPage: React.FC = () => {
  const { data: settings } = usePublicSettings();

  const vision =
    settings?.vision ||
    'Menjadi pusat pendidikan unggulan yang membimbing siswa mencapai potensi optimal berlandaskan budi pekerti, integritas, dan kecakapan masa depan.';

  const mission =
    settings?.mission && settings.mission.length > 0
      ? settings.mission
      : [
          'Menyelenggarakan proses pembelajaran aktif, adaptif, dan berorientasi pada pengembangan karakter.',
          'Menciptakan ekosistem sekolah yang aman, inklusif, dan mendukung eksplorasi bakat siswa.',
          'Menjalin kemitraan erat dengan orang tua dan masyarakat untuk mengawal tumbuh kembang peserta didik.',
        ];

  return (
    <div className="bg-paper min-h-screen py-12 md:py-16">
      <SeoHead
        title="Visi dan Misi - Yayasan Padindi"
        description="Arah tujuan, visi dan misi Yayasan Padindi dalam mewujudkan generasi penerus yang cerdas dan berkarakter."
      />

      <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block px-3 py-1 bg-navy/10 text-navy font-bold text-xs rounded-full uppercase tracking-wider">
            Pedoman & Arah Langkah
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-navy">
            Visi & Misi Yayasan Padindi
          </h1>
          <p className="text-muted text-sm md:text-base">
            Komitmen kami untuk memberikan kontribusi nyata dalam mencerdaskan kehidupan bangsa melalui pendidikan bermutu tinggi.
          </p>
        </div>

        {/* Visi Card */}
        <div className="bg-white p-8 md:p-10 rounded-card border-l-4 border-navy border border-navy/10 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-navy text-white flex items-center justify-center">
              <Compass className="w-5 h-5 text-star" />
            </div>
            <h2 className="font-display font-bold text-xl md:text-2xl text-navy">Visi Yayasan</h2>
          </div>
          <p className="font-display text-lg md:text-xl text-ink leading-relaxed italic pl-13">
            &ldquo;{vision}&rdquo;
          </p>
        </div>

        {/* Misi Card */}
        <div className="bg-white p-8 md:p-10 rounded-card border-l-4 border-star border border-navy/10 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-navy/5 text-navy flex items-center justify-center">
              <Target className="w-5 h-5 text-navy" />
            </div>
            <h2 className="font-display font-bold text-xl md:text-2xl text-navy">Misi Yayasan</h2>
          </div>

          <div className="space-y-4 pl-2">
            {mission.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-navy shrink-0 mt-0.5" />
                <p className="text-ink text-sm md:text-base leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionMissionPage;