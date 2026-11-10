import React from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface AdminDonutChartProps {
  segments?: DonutSegment[];
  data?: DonutSegment[];
  title?: string;
  centerLabel?: string;
  totalLabel?: string;
}

export const AdminDonutChart: React.FC<AdminDonutChartProps> = ({
  segments,
  data,
  title,
  centerLabel,
  totalLabel,
}) => {
  const items = segments || data || [];
  const displayCenter = totalLabel || centerLabel || 'Total';
  const total = items.reduce((sum, s) => sum + (s?.value || 0), 0);

  if (items.length === 0 || total === 0) {
    return (
      <div className="bg-white border border-line rounded-panel p-5 shadow-xs w-full">
        {title && <h3 className="font-display font-semibold text-sm text-ink mb-4">{title}</h3>}
        <div className="h-48 flex items-center justify-center">
          <p className="font-sans text-xs text-muted">Belum ada data visualisasi.</p>
        </div>
      </div>
    );
  }

  // Calculate SVG stroke dashes
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="bg-white border border-line rounded-panel p-5 shadow-xs flex flex-col justify-between w-full">
      {title && <h3 className="font-display font-semibold text-sm text-ink mb-4">{title}</h3>}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-auto py-2">
        {/* SVG Donut */}
        <div className="relative w-40 h-40 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {items.map((seg, idx) => {
              const strokeDasharray = `${(seg.value / total) * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercent * circumference;
              accumulatedPercent += seg.value / total;

              return (
                <circle
                  key={idx}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="22"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 hover:opacity-85"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="font-display font-bold text-xl text-ink leading-tight">{total}</span>
            <span className="font-sans text-xs text-muted">{displayCenter}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-1.5 w-full max-w-[200px]">
          {items.map((seg, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs font-sans">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-muted truncate">{seg.label}</span>
              </div>
              <span className="font-semibold text-ink ml-2">
                {seg.value} ({Math.round((seg.value / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
