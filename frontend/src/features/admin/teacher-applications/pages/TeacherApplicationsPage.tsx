import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { StatusBadge } from '@/components/data/StatusBadge';
import { Pagination } from '@/components/data/Pagination';
import {
  AdminPageHeader,
  StatusUpdateModal,
  ConfirmModal,
} from '@/components/admin';
import {
  fetchTeacherApplications,
  bulkUpdateTeacherStatus,
  updateTeacherApplicationStatus,
  getTeacherExportUrl,
} from '../api';
import type { AdminTeacherApplication } from '../types';
import {
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status Seleksi' },
  { value: 'submitted', label: 'Terkirim (Menunggu Peninjauan)' },
  { value: 'administrative_review', label: 'Seleksi Administrasi' },
  { value: 'interview_test', label: 'Wawancara & Tes Pedagogik' },
  { value: 'passed', label: 'Lolos / Diterima' },
  { value: 'failed', label: 'Tidak Lolos' },
  { value: 'reserve', label: 'Cadangan (Talent Pool)' },
];

const ALLOWED_TEACHER_STATUSES = [
  { value: 'administrative_review', label: 'Seleksi Administrasi', description: 'Memverifikasi berkas ijazah, CV, dan sertifikat' },
  { value: 'interview_test', label: 'Wawancara & Tes', description: 'Menjadwalkan pelamar ke tahap wawancara pedagogik' },
  { value: 'passed', label: 'Lolos / Diterima', description: 'Pelamar dinyatakan lolos sebagai tenaga pendidik' },
  { value: 'failed', label: 'Tidak Lolos Seleksi', description: 'Pelamar tidak memenuhi kualifikasi rekrutmen' },
  { value: 'reserve', label: 'Cadangan (Talent Pool)', description: 'Disimpan untuk kebutuhan formasi guru mendatang' },
];

export const TeacherApplicationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkTargetStatus, setBulkTargetStatus] = useState<string>('');

  const [statusModalTarget, setStatusModalTarget] = useState<AdminTeacherApplication | null>(null);

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const unitId = searchParams.get('education_unit_id') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = 15;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'teacher-applications', { search, status, unitId, page, perPage }],
    queryFn: () =>
      fetchTeacherApplications({
        search,
        status,
        education_unit_id: unitId,
        page,
        per_page: perPage,
      }),
  });

  const applications = data?.data || [];
  const meta = data?.meta;

  const updateParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    if (key !== 'page') {
      next.set('page', '1');
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(applications.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, newStatus, note }: { id: number; newStatus: string; note: string }) =>
      updateTeacherApplicationStatus(id, { status: newStatus, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teacher-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setStatusModalTarget(null);
    },
  });

  const bulkMutation = useMutation({
    mutationFn: ({ ids, newStatus, note }: { ids: number[]; newStatus: string; note?: string }) =>
      bulkUpdateTeacherStatus({ ids, status: newStatus, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teacher-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setSelectedIds([]);
      setBulkStatusOpen(false);
    },
  });

  const exportUrl = getTeacherExportUrl({ status, education_unit_id: unitId });

  return (
    <div className="space-y-6">
      <SeoHead title="Manajemen Rekrutmen Guru — Admin Yayasan Padindi" />

      {/* Header */}
      <AdminPageHeader
        title="Rekrutmen Guru & Tenaga Kependidikan"
        subtitle="Kelola seluruh berkas lamaran, seleksi administrasi, dan penjadwalan wawancara pendidik."
        breadcrumbs={[{ label: 'Rekrutmen Guru' }]}
        actions={
          <div className="flex items-center gap-2">
            <a
              href={exportUrl}
              download
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-line text-ink font-sans text-xs font-semibold rounded-control hover:bg-paper transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>Ekspor Pelamar (CSV)</span>
            </a>
          </div>
        }
      />

      {/* Search & Filter Bar */}
      <div className="bg-white border border-line rounded-panel p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama pelamar, nomor registrasi, atau posisi..."
              className="w-full pl-9 pr-3 py-2 text-sm font-sans bg-paper/50 border border-line-input rounded-control focus:outline-none focus:border-primary focus:bg-white"
            />
          </form>

          {/* Status Filter */}
          <div className="sm:w-60">
            <select
              value={status}
              onChange={(e) => updateParam('status', e.target.value)}
              className="w-full px-3 py-2 text-sm font-sans bg-white border border-line-input rounded-control focus:outline-none focus:border-primary"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {(search || status) && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setSearchParams(new URLSearchParams());
              }}
              className="text-xs text-danger font-sans font-semibold hover:underline shrink-0"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="pt-3 border-t border-line flex items-center justify-between gap-3 text-xs font-sans bg-tint-100/40 p-2.5 rounded-control">
            <span className="font-semibold text-primary">
              {selectedIds.length} pelamar dipilih
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setBulkTargetStatus('passed');
                  setBulkStatusOpen(true);
                }}
                className="px-2.5 py-1.5 bg-leaf text-white font-semibold rounded-control hover:bg-leaf/90 transition-colors inline-flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Terima Masal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBulkTargetStatus('failed');
                  setBulkStatusOpen(true);
                }}
                className="px-2.5 py-1.5 bg-danger text-white font-semibold rounded-control hover:bg-danger/90 transition-colors inline-flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Tolak Masal</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-muted hover:text-ink ml-1 font-medium"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-line rounded-panel shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm">
            <thead className="bg-paper text-muted text-xs uppercase font-semibold border-b border-line">
              <tr>
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={applications.length > 0 && selectedIds.length === applications.length}
                    onChange={handleSelectAll}
                    aria-label="Pilih semua pelamar"
                    className="rounded-sm border-line-input text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-4 py-3">No. Registrasi</th>
                <th className="px-4 py-3">Nama Pelamar</th>
                <th className="px-4 py-3">Posisi Dilamar</th>
                <th className="px-4 py-3">Pendidikan Terakhir</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3">Tanggal Lamaran</th>
                <th className="px-4 py-3">Status Seleksi</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                    <span>Memuat berkas pelamar guru...</span>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-danger text-xs">
                    <AlertCircle className="w-5 h-5 mx-auto mb-2" />
                    <span>Gagal memuat data rekrutmen. Silakan refresh halaman.</span>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted text-xs">
                    Tidak ditemukan data pelamar guru yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
                  const lastEdu = app.educations?.[0];
                  return (
                    <tr
                      key={app.id}
                      className={`hover:bg-paper/40 transition-colors ${
                        selectedIds.includes(app.id) ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(app.id)}
                          onChange={() => handleSelectOne(app.id)}
                          aria-label={`Pilih lamaran ${app.registration_number}`}
                          className="rounded-sm border-line-input text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary">
                        {app.registration_number}
                      </td>
                      <td className="px-4 py-3.5">
                        <strong className="text-ink block">
                          {app.full_name}
                        </strong>
                        <span className="text-[11px] text-muted">
                          {app.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-ink block text-xs">
                          {app.applied_position}
                        </span>
                        <span className="text-[11px] text-muted">
                          {app.unit?.name || 'Semua Unit'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted">
                        {lastEdu ? (
                          <>
                            <span className="font-medium text-ink block">
                              {lastEdu.level} {lastEdu.major ? `- ${lastEdu.major}` : ''}
                            </span>
                            <span className="text-[11px] truncate block max-w-[160px]">
                              {lastEdu.institution}
                            </span>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted">
                        <span className="font-mono text-ink block">{app.phone}</span>
                        <span className="text-[11px] text-muted truncate block max-w-[150px]">
                          {app.email}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted">
                        {(app.submitted_at || app.created_at)
                          ? new Date(app.submitted_at || app.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={app.status as any} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStatusModalTarget(app)}
                            className="p-1.5 text-muted hover:text-primary rounded-control hover:bg-paper transition-colors"
                            title="Ubah Status Seleksi"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <Link
                            to={`/admin/lamaran-guru/${app.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-paper hover:bg-tint-100 text-primary font-semibold text-xs rounded-control transition-colors"
                            title="Lihat Detail Lamaran"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="p-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans text-muted">
            <span>
              Menampilkan {applications.length} dari total {meta.total} pelamar (Halaman {meta.current_page} dari {meta.last_page})
            </span>
            <Pagination
              currentPage={meta.current_page}
              totalPages={meta.last_page}
              onPageChange={(p) => updateParam('page', String(p))}
            />
          </div>
        )}
      </div>

      {/* Modal Ubah Status Seleksi Tunggal */}
      {statusModalTarget && (
        <StatusUpdateModal
          open={Boolean(statusModalTarget)}
          onClose={() => setStatusModalTarget(null)}
          onConfirm={async (newStatus, note) => {
            await statusMutation.mutateAsync({
              id: statusModalTarget.id,
              newStatus,
              note,
            });
          }}
          currentStatus={statusModalTarget.status}
          allowedStatuses={ALLOWED_TEACHER_STATUSES}
          applicantName={statusModalTarget.full_name}
          isLoading={statusMutation.isPending}
          type="teacher"
        />
      )}

      {/* Modal Konfirmasi Bulk Status */}
      <ConfirmModal
        open={bulkStatusOpen}
        onClose={() => setBulkStatusOpen(false)}
        onConfirm={async (note) => {
          await bulkMutation.mutateAsync({
            ids: selectedIds,
            newStatus: bulkTargetStatus,
            note,
          });
        }}
        title={`Pembaruan Massal: ${bulkTargetStatus === 'passed' ? 'Terima Pelamar' : 'Tolak Pelamar'}`}
        description={`Anda akan mengubah status seleksi ${selectedIds.length} pelamar guru yang dipilih menjadi "${
          bulkTargetStatus === 'passed' ? 'Lolos' : 'Tidak Lolos'
        }".`}
        confirmLabel={bulkTargetStatus === 'passed' ? 'Terima Semua' : 'Tolak Semua'}
        confirmVariant={bulkTargetStatus === 'passed' ? 'primary' : 'danger'}
        showNoteField
        noteLabel="Catatan Evaluasi Massal"
        notePlaceholder="Tuliskan catatan evaluasi..."
        isLoading={bulkMutation.isPending}
      />
    </div>
  );
};

export default TeacherApplicationsPage;
