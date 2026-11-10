import React from 'react';

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface AdminChartProps {
  data: ChartDataPoint[];
  color?: string;
  height?: number;
  title?: string;
  emptyMessage?: string;
}

export const AdminChart: React.FC<AdminChartProps> = ({
  data,
  color = '#0A3FA8',
  height = 200,
  title,
  emptyMessage = 'Belum ada data visualisasi.',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-line rounded-panel p-5 text-center">
        {title && <h3 className="font-display font-semibold text-sm text-ink mb-3 text-left">{title}</h3>}
        <p className="font-sans text-xs text-muted py-12">{emptyMessage}</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = height - 40; // reserve 40px for labels

  return (
    <div className="bg-white border border-line rounded-panel p-5 shadow-xs">
      {title && (
        <h3 className="font-display font-semibold text-sm text-ink mb-4 flex items-center justify-between">
          <span>{title}</span>
          <span className="font-sans text-xs font-normal text-muted">
            Total: {data.reduce((acc, curr) => acc + curr.value, 0)}
          </span>
        </h3>
      )}

      <div className="flex items-end justify-between gap-2 pt-4" style={{ height }}>
        {data.map((item, idx) => {
          const barHeight = Math.round((item.value / maxValue) * chartHeight);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 bg-navy text-white text-xs font-mono rounded-control pointer-events-none z-10 whitespace-nowrap shadow-xs">
                {item.value} pendaftar
              </div>

              {/* Bar */}
              <div
                style={{
                  height: `${Math.max(barHeight, 4)}px`,
                  backgroundColor: color,
                }}
                className="w-full max-w-[36px] rounded-t-sm transition-all duration-300 group-hover:brightness-110"
              />

              {/* Label */}
              <span className="mt-2 font-sans text-xs text-muted truncate max-w-full text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

