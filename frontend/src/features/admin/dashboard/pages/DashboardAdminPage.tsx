import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/feedback/Skeleton';
import { StatusBadge } from '@/components/data/StatusBadge';
import { apiErrorInfo } from '@/features/admin/users-roles/api';
import { TrendChart } from '../components/TrendChart';
import { useDashboard } from '../hooks';
import type { DashboardData } from '../types';

const STUDENT_ORDER = ['submitted', 'in_review', 'revision_required', 'verified', 'accepted', 'waitlisted', 'rejected'];
const TEACHER_ORDER = ['submitted', 'administrative_review', 'interview_test', 'passed', 'reserve', 'failed'];

const PANEL = 'bg-white border border-line rounded-control';
const LINK = 'inline-block mt-2 py-1 text-primary underline underline-offset-2';

const Panel: React.FC<{ id?: string; className?: string; children: React.ReactNode }> = ({ id, className = "", children }) => (
  <section id={id} className={`${PANEL} p-5 scroll-mt-6 ${className}`}>{children}</section>
);

interface StatCardProps {
  label: string;
  value: number;
  note: string;
  tone?: 'primary' | 'warning' | 'muted';
  link: React.ReactNode;
  icon?: React.ReactNode;
  accent?: boolean;
}

const TONE = { primary: 'text-primary', warning: 'text-warning', muted: 'text-muted' };

const StatCard: React.FC<StatCardProps> = ({ label, value, note, tone = 'primary', link, icon, accent }) => (
  <div className={`${PANEL} p-5 flex flex-col gap-1 ${accent ? 'border-l-4 border-l-warning' : ''}`}>
    <p className="font-bold text-ink flex items-center gap-2">{icon}{label}</p>
    <p className={`font-display font-semibold text-3xl tabular-nums ${TONE[tone]}`}>{value}</p>
    <p className={`text-[0.9rem] ${tone === 'warning' ? 'text-warning' : 'text-muted'}`}>{note}</p>
    {link}
  </div>
);

const StatusPanel: React.FC<{
  id: string; title: string; total: string; type: 'student' | 'teacher'; order: string[]; counts: Record<string, number>;
}> = ({ id, title, total, type, order, counts }) => (
  <Panel id={id} className="flex-[1_1_440px]">
    <div className="flex items-baseline justify-between gap-3 mb-2">
      <h2 className="font-display font-semibold text-lg text-ink">{title}</h2>
      <p className="text-muted">{total}</p>
    </div>
    <ul className="list-none p-0 m-0">
      {order.map((status) => {
        const n = counts[status] ?? 0;
        return (
          <li key={status} className="border-t border-line min-h-12 flex items-center justify-between gap-3">
            <StatusBadge status={status} type={type} />
            <span className={`tabular-nums ${n > 0 ? 'font-bold text-ink' : 'text-muted'}`}>{n}</span>
          </li>
        );
      })}
    </ul>
  </Panel>
);

const LegendDot: React.FC<{ color: string; text: string }> = ({ color, text }) => (
  <span className="inline-flex items-center gap-2 text-[0.9rem] text-ink">
    <span aria-hidden="true" className={`inline-block h-3 w-3 ${color}`} />{text}
  </span>
);

const Content: React.FC<{ data: DashboardData }> = ({ data }) => {
  const quotaByUnit = new Map(data.quota.map((q) => [q.education_unit_id, q]));
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
        <StatCard label="Pendaftar siswa" value={data.totals.students} note="Periode terpilih"
          link={<a href="#status-siswa" className={LINK}>Lihat status siswa</a>} />
        <StatCard label="Pelamar guru" value={data.totals.teachers} note="Semua periode"
          link={<a href="#status-guru" className={LINK}>Lihat status guru</a>} />
        <StatCard label="Dokumen menunggu verifikasi" value={data.documents_pending} note="Perlu tindakan" tone="warning" accent
          icon={<AlertTriangle size={16} aria-hidden="true" />}
          link={<Link to="/admin/pendaftaran-siswa" className={LINK}>Periksa dokumen</Link>} />
        <StatCard label="Pesan kontak baru" value={data.unread_contact_messages}
          note={data.unread_contact_messages > 0 ? 'Belum dibaca' : 'Tidak ada pesan baru'}
          tone={data.unread_contact_messages > 0 ? 'primary' : 'muted'}
          link={<Link to="/admin/pesan-kontak" className={LINK}>Buka pesan masuk</Link>} />
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <Panel className="flex-[7_1_460px]">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display font-semibold text-lg text-ink">Pendaftar baru 7 hari terakhir</h2>
              <p className="text-[0.9rem] text-muted">Dihitung dari tanggal pengiriman</p>
            </div>
            <div className="flex gap-4">
              <LegendDot color="bg-primary" text="Siswa" />
              <LegendDot color="bg-line-input" text="Guru" />
            </div>
          </div>
          <TrendChart days={data.new_applicants} />
        </Panel>

        <Panel className="flex-[5_1_340px]">
          <h2 className="font-display font-semibold text-lg text-ink">Unit pendidikan</h2>
          <p className="text-[0.9rem] text-muted mb-3">Jumlah pendaftar dan kuota siswa. Terisi berarti berstatus Diterima.</p>
          <ul className="list-none p-0 m-0">
            {data.per_unit.map((u) => {
              const q = quotaByUnit.get(u.education_unit_id);
              const pct = q && q.quota > 0 ? Math.min(100, (q.filled / q.quota) * 100) : 0;
              return (
                <li key={u.education_unit_id} className="border-t border-line py-3 flex flex-col gap-1">
                  <div className="flex flex-wrap justify-between gap-x-3">
                    <span className="font-bold text-ink">{u.name}</span>
                    <span className="text-muted">Siswa {u.students} · Guru {u.teachers}</span>
                  </div>
                  {q ? (
                    <>
                      <div className="flex flex-wrap justify-between gap-x-3 text-[0.9rem]">
                        <span className="text-muted">Kuota siswa terisi</span>
                        <span className="text-ink tabular-nums">{q.filled} dari {q.quota}, sisa {Math.max(0, q.remaining)}</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`Kuota ${u.name}`}
                        aria-valuemin={0}
                        aria-valuemax={q.quota}
                        aria-valuenow={Math.min(q.filled, q.quota)}
                        className="h-2 rounded-control bg-tint-100 overflow-hidden"
                      >
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </>
                  ) : (
                    <p className="text-[0.9rem] text-muted">Belum ada kuota untuk periode ini.</p>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <StatusPanel id="status-siswa" title="Status pendaftar siswa" total={`Total ${data.totals.students}`}
          type="student" order={STUDENT_ORDER} counts={data.status_counts.students} />
        <StatusPanel id="status-guru" title="Status pelamar guru" total={`Total ${data.totals.teachers} · semua periode`}
          type="teacher" order={TEACHER_ORDER} counts={data.status_counts.teachers} />
      </div>
    </div>
  );
};

// Bentuknya meniru Content agar tata letak tidak melompat saat data tiba (DESIGN.md 8.8).
const DashboardSkeleton: React.FC = () => (
  <div className="flex flex-col gap-6" aria-busy="true" aria-label="Memuat dashboard">
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
      {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-36 w-full" />)}
    </div>
    <div className="flex flex-wrap gap-6">
      <Skeleton className="h-80 flex-[7_1_460px]" />
      <Skeleton className="h-80 flex-[5_1_340px]" />
    </div>
    <div className="flex flex-wrap gap-6">
      <Skeleton className="h-96 flex-[1_1_440px]" />
      <Skeleton className="h-96 flex-[1_1_440px]" />
    </div>
  </div>
);

export const DashboardAdminPage: React.FC = () => {
  const [periodId, setPeriodId] = useState<number | undefined>();
  const { data, error, isError, isPending, refetch } = useDashboard(periodId);

  return (
    <div className="flex flex-col gap-6">
      <SeoHead title="Dashboard Administrator" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-primary mb-2">Dashboard Administrator</h1>
          <p className="text-muted max-w-prose">
            Angka siswa mengikuti periode yang dipilih. Angka guru mencakup semua periode karena lamaran guru tidak terikat periode. Draft tidak dihitung.
          </p>
        </div>
        {data && data.periods.length > 0 && (
          <div className="flex flex-col gap-1">
            <label htmlFor="dashboard-period" className="font-bold text-ink">Periode</label>
            <select
              id="dashboard-period"
              className="w-[22rem] max-w-full min-h-12 px-3 rounded-control border-[1.5px] border-line-input bg-white text-ink"
              value={periodId ?? data.period?.id ?? ''}
              onChange={(e) => setPeriodId(Number(e.target.value))}
            >
              {data.periods.map((p) => (
                <option key={p.id} value={p.id}>{p.name}{p.is_active ? '' : ' (nonaktif)'}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isError ? (
        <div role="alert" className="bg-white border border-line border-l-4 border-l-danger rounded-control p-4 text-danger flex flex-wrap items-center gap-3">
          <span>{apiErrorInfo(error).message}</span>
          <Button variant="secondary" onClick={() => void refetch()}>Coba lagi</Button>
        </div>
      ) : isPending ? (
        <DashboardSkeleton />
      ) : (
        <>
          {!data.period && (
            <p className={`${PANEL} border-l-4 border-l-primary p-4 text-ink`}>
              Belum ada periode pendaftaran, jadi angka siswa tampil 0. Buat periode terlebih dahulu agar ringkasan siswa terisi.
            </p>
          )}
          <Content data={data} />
        </>
      )}
    </div>
  );
};
export default DashboardAdminPage;
