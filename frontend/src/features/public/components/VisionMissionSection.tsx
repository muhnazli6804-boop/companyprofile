/**
 * VisionMissionSection — bagian "Visi dan Misi".
 * Sesuai DESIGN.md bagian 7.2 dan prompt bagian 3.4.
 * Memakai komponen Spread (dua halaman buku).
 *
 * Desktop: kiri Visi (putih), kanan Misi (Kertas Dermaga), garis punggung buku.
 * Ponsel: ditumpuk (Visi di atas Misi), garis pemisah horizontal.
 */
import React from 'react';
import { Spread } from '@/components/brand/Spread';

interface VisionMissionSectionProps {
  vision?: string;
  mission?: string[];
}

export const VisionMissionSection: React.FC<VisionMissionSectionProps> = ({
  vision,
  mission,
}) => {
  return (
    <section
      id="visi-misi"
      aria-labelledby="visimisi-heading"
      className="bg-white py-16 md:py-24"
      style={{ scrollMarginTop: '4rem' }}
    >
      <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8">
        <h2
          id="visimisi-heading"
          className="font-display font-semibold text-2xl text-ink mb-8"
        >
          Visi dan misi
        </h2>

        <Spread
          left={
            <div>
              <h3 className="font-display font-semibold text-xl text-ink mb-4">
                Visi
              </h3>
              {vision ? (
                <p className="prose text-ink font-display leading-relaxed">
                  {vision}
                </p>
              ) : (
                <p className="text-muted italic text-base">Belum diisi</p>
              )}
            </div>
          }
          right={
            <div>
              <h3 className="font-display font-semibold text-xl text-ink mb-4">
                Misi
              </h3>
              {mission && mission.length > 0 ? (
                <ol className="list-decimal list-outside pl-5 space-y-3">
                  {mission.map((item, i) => (
                    <li
                      key={i}
                      className="prose text-ink font-display leading-relaxed"
                    >
                      {item}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-muted italic text-base">Belum diisi</p>
              )}
            </div>
          }
        />
      </div>
    </section>
  );
};

