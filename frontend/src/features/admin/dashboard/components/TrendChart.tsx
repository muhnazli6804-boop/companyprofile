import React from 'react';
import type { DashboardTrendDay } from '../types';

const BAR_AREA = 200; // px; tinggi batang = nilai / maksimum × BAR_AREA
const PLOT_HEIGHT = 220; // px; sisa 20 px untuk angka di atas batang tertinggi

const label = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** Maksimum sumbu Y: paling sedikit 4, dibulatkan ke atas ke bilangan genap. */
export const axisMax = (days: DashboardTrendDay[]) => {
  const top = Math.max(0, ...days.flatMap((d) => [d.students, d.teachers]));
  return Math.max(4, Math.ceil(top / 2) * 2);
};

// Grafik batang CSS (tanpa library): dua batang per hari. Siswa dan Guru dibedakan terang-gelap.
export const TrendChart: React.FC<{ days: DashboardTrendDay[] }> = ({ days }) => {
  const max = axisMax(days);
  const ticks = [0, max / 2, max];
  const withData = days.filter((d) => d.students > 0 || d.teachers > 0);
  const summary = withData.length
    ? withData.map((d) => `${label(d.date)}: ${d.students} siswa, ${d.teachers} guru`).join('; ')
    : 'Tidak ada pendaftar baru.';

  return (
    <div role="img" aria-label={`Pendaftar baru 7 hari terakhir. ${summary}`}>
      <div className="relative" style={{ height: PLOT_HEIGHT }}>
        {ticks.map((t) => (
          <div key={t} className="absolute left-0 right-0 flex items-center" style={{ bottom: (t / max) * BAR_AREA, transform: 'translateY(50%)' }}>
            <span className="w-8 pr-2 text-right text-[0.9rem] text-muted tabular-nums">{t}</span>
            <div className="flex-1 border-t border-line" />
          </div>
        ))}
        <div className="absolute inset-0 pl-8 flex items-end">
          {days.map((d) => (
            <div key={d.date} className="flex-1 flex items-end justify-center gap-2">
              {([['students', 'bg-primary'], ['teachers', 'bg-line-input']] as const).map(([key, color]) => (
                <div key={key} className="flex flex-col items-center justify-end">
                  {d[key] > 0 && <span className="text-[0.9rem] font-bold text-ink tabular-nums leading-5">{d[key]}</span>}
                  <div className={`w-7 rounded-t-control ${color}`} style={{ height: (d[key] / max) * BAR_AREA }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="pl-8 flex mt-2">
        {days.map((d) => (
          <span key={d.date} className="flex-1 text-center text-[0.9rem] text-muted tabular-nums">{label(d.date)}</span>
        ))}
      </div>
    </div>
  );
};
