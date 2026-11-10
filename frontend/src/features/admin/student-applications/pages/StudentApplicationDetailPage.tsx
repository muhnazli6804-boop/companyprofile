import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SeoHead } from '@/components/seo/SeoHead';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/data/StatusBadge';
import {
  AdminPageHeader,
  TimelineHistory,
  ConfirmModal,
  StatusUpdateModal,
} from '@/components/admin';
import {
  fetchStudentApplicationDetail,
  updateStudentApplicationStatus,
  updateStudentApplicationNote,
  verifyStudentDocument,
} from '../api';
import {
  ArrowLeft,
  User,
  Users,
  School,
  FileCheck2,
  History,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Save,
  FileText,
} from 'lucide-react';

export const StudentApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [noteText, setNoteText] = useState('');
  const [noteInitialized, setNoteInitialized] = useState(false);

  // Modals state
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    targetStatus: string;
    title: string;
    description: string;
    variant: 'primary' | 'danger' | 'accent';
    confirmLabel: string;
    noteRequired?: boolean;
  }>({
    open: false,
    targetStatus: '',
    title: '',
    description: '',
    variant: 'primary',
    confirmLabel: 'Konfirmasi',
  });

  const [customStatusModalOpen, setCustomStatusModalOpen] = useState(false);

  const { data: app, isLoading, isError } = useQuery({
    queryKey: ['admin', 'student-application', id],
    queryFn: () => fetchStudentApplicationDetail(id!),
    enabled: Boolean(id),
  });

  // Sync admin note text once loaded
  if (app && !noteInitialized) {
    setNoteText(app.admin_note || '');
    setNoteInitialized(true);
  }

  // Update status mutation
  const statusMutation = useMutation({
    mutationFn: ({ status, note }: { status: string; note?: string }) =>
      updateStudentApplicationStatus(id!, { status, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'student-application', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'student-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setConfirmAction((prev) => ({ ...prev, open: false }));
      setCustomStatusModalOpen(false);
    },
  });

  // Update note mutation
  const noteMutation = useMutation({
    mutationFn: (newNote: string) =>
      updateStudentApplicationNote(id!, { admin_note: newNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'student-application', id] });
    },
  });

  // Verify document mutation
  const docMutation = useMutation({
    mutationFn: ({
      docId,
      status,
      note,
    }: {
      docId: number;
      status: 'valid' | 'invalid' | 'pending';
      note?: string;
    }) =>
      verifyStudentDocument(docId, {
        verification_status: status,
        verification_note: note,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'student-application', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SeoHead title="Detail Pendaftaran Murid — Admin" />
        <div className="h-6 w-32 bg-line rounded animate-pulse" />
        <div className="h-24 bg-white border border-line rounded-panel animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-white border border-line rounded-panel animate-pulse" />
            <div className="h-64 bg-white border border-line rounded-panel animate-pulse" />
          </div>
          <div className="h-80 bg-white border border-line rounded-panel animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !app) {
    return (
      <div className="p-8 bg-white border border-line rounded-panel text-center my-6">
        <XCircle className="w-10 h-10 text-danger mx-auto mb-3" />
        <h2 className="font-display font-semibold text-lg text-ink mb-1">
          Pendaftaran Tidak Ditemukan
        </h2>
        <p className="font-sans text-sm text-muted mb-4">
          Data pendaftaran murid dengan ID #{id} tidak ditemukan di sistem.
        </p>
        <Link
          to="/admin/pendaftaran-siswa"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-sans text-sm font-semibold rounded-control"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar</span>
        </Link>
      </div>
    );
  }

  const { student, guardians = [], documents = [], status_logs = [], unit } = app;

  const handleActionClick = (
    status: string,
    title: string,
    description: string,
    variant: 'primary' | 'danger' | 'accent',
    confirmLabel: string,
    noteRequired = false
  ) => {
    setConfirmAction({
      open: true,
      targetStatus: status,
      title,
      description,
      variant,
      confirmLabel,
      noteRequired,
    });
  };

  const getDocTypeLabel = (type: string) => {
    switch (type) {
      case 'kk':
        return 'Kartu Keluarga (KK)';
      case 'ijazah':
        return 'Ijazah / SKL Sementara';
      case 'foto':
        return 'Pas Foto Calon Murid';
      case 'rapor':
        return 'Buku Nilai / Rapor';
      default:
        return type.toUpperCase();
    }
  };

  return (
    <div className="space-y-6">
      <SeoHead title={`Detail Murid: ${student?.full_name || app.registration_number} — Admin`} />

      {/* Breadcrumb & Navigation */}
      <AdminPageHeader
        title={student?.full_name || app.registration_number}
        subtitle={`Nomor Registrasi: ${app.registration_number} • Jenjang: ${unit?.name || 'Semua Unit'} (${unit?.level?.toUpperCase() || '—'})`}
        breadcrumbs={[
          { label: 'Pendaftaran Murid', href: '/admin/pendaftaran-siswa' },
          { label: app.registration_number },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/admin/pendaftaran-siswa"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-line text-ink font-sans text-xs font-semibold rounded-control hover:bg-paper transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Daftar Pendaftar</span>
            </Link>

            {/* Quick Status Action Buttons */}
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                handleActionClick(
                  'revision_required',
                  'Minta Revisi / Perbaikan Dokumen',
                  'Pemohon akan menerima pemberitahuan bahwa terdapat dokumen yang perlu diperbaiki atau diunggah ulang.',
                  'accent',
                  'Kirim Permintaan Revisi',
                  true
                )
              }
              className="text-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-warning mr-1" />
              <span>Minta Revisi</span>
            </Button>

            <Button
              type="button"
              variant="danger"
              onClick={() =>
                handleActionClick(
                  'rejected',
                  'Tolak Pendaftaran Murid',
                  'Apakah Anda yakin ingin menolak pendaftaran calon murid ini? Status akan diperbarui menjadi Ditolak.',
                  'danger',
                  'Tolak Pendaftaran',
                  true
                )
              }
              className="text-xs"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              <span>Tolak</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={() =>
                handleActionClick(
                  'accepted',
                  'Terima Pendaftaran Murid',
                  'Apakah Anda yakin ingin menerima calon murid ini? Calon murid akan dinyatakan Lolos Seleksi Penerimaan.',
                  'primary',
                  'Terima Calon Murid'
                )
              }
              className="text-xs"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              <span>Terima Murid</span>
            </Button>
          </div>
        }
      />

      {/* Status Bar Card */}
      <div className="bg-white border border-line rounded-panel p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <StatusBadge status={app.status as any} />
          <div>
            <span className="font-sans text-xs text-muted block">Status Saat Ini</span>
            <span className="font-sans text-xs text-ink">
              Diajukan pada:{' '}
              <strong>
                {app.submitted_at
                  ? new Date(app.submitted_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Masih Draft'}
              </strong>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCustomStatusModalOpen(true)}
          className="text-xs font-sans font-semibold text-primary hover:underline self-start sm:self-center"
        >
          Ubah ke Status Lain...
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Data Murid, Wali, Sekolah, Dokumen */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. INFORMASI CALON MURID */}
          <div className="bg-white border border-line rounded-panel shadow-xs overflow-hidden">
            <div className="p-5 border-b border-line flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h2 className="font-display font-semibold text-lg text-ink">
                1. Data Pribadi Calon Murid
              </h2>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-sans">
              <div>
                <span className="text-muted block text-xs mb-0.5">Nama Lengkap</span>
                <strong className="text-ink">{student?.full_name || '—'}</strong>
              </div>
              <div>
                <span className="text-muted block text-xs mb-0.5">NIK Calon Murid</span>
                <span className="font-mono text-ink font-semibold">{student?.nik || '—'}</span>
              </div>
              <div>
                <span className="text-muted block text-xs mb-0.5">NISN (Nomor Induk Siswa Nasional)</span>
                <span className="font-mono text-ink">{student?.nisn || 'Tidak ada'}</span>
              </div>
              <div>
                <span className="text-muted block text-xs mb-0.5">Jenis Kelamin</span>
                <span className="text-ink">
                  {student?.gender === 'L' ? 'Laki-laki (L)' : student?.gender === 'P' ? 'Perempuan (P)' : '—'}
                </span>
              </div>
              <div>
                <span className="text-muted block text-xs mb-0.5">Tempat & Tanggal Lahir</span>
                <span className="text-ink">
                  {student?.birth_place ? `${student.birth_place}, ` : ''}
                  {student?.birth_date
                    ? new Date(student.birth_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
              </div>
              <div>
                <span className="text-muted block text-xs mb-0.5">Agama</span>
                <span className="text-ink">{student?.religion || '—'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted block text-xs mb-0.5">Alamat Tempat Tinggal</span>
                <span className="text-ink leading-relaxed">{student?.address || '—'}</span>
              </div>
              <div>
                <span className="text-muted block text-xs mb-0.5">No. Telepon / WhatsApp Siswa</span>
                <span className="text-ink">{student?.phone || '—'}</span>
              </div>
              <div>
                <span className="text-muted block text-xs mb-0.5">Jalur Pendaftaran</span>
                <span className="text-ink font-semibold capitalize">{app.track || 'Reguler'}</span>
              </div>
            </div>
          </div>

          {/* 2. INFORMASI ORANG TUA / WALI */}
          <div className="bg-white border border-line rounded-panel shadow-xs overflow-hidden">
            <div className="p-5 border-b border-line flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-navy/10 text-navy flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="font-display font-semibold text-lg text-ink">
                2. Data Orang Tua / Wali Murid
              </h2>
            </div>

            <div className="p-5 space-y-4">
              {guardians.length === 0 ? (
                <p className="text-muted text-xs font-sans">Belum ada data orang tua/wali.</p>
              ) : (
                guardians.map((g) => {
                  const relLabel =
                    g.relationship === 'father'
                      ? 'Ayah Kandung'
                      : g.relationship === 'mother'
                      ? 'Ibu Kandung'
                      : 'Wali';
                  return (
                    <div
                      key={g.id}
                      className="p-4 rounded-control border border-line bg-paper/30 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                          {relLabel}
                        </span>
                        {g.is_primary_contact && (
                          <span className="text-[11px] font-semibold text-leaf bg-leaf/10 px-2 py-0.5 rounded-full">
                            Kontak Utama
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-sans">
                        <div>
                          <span className="text-muted block text-xs mb-0.5">Nama Lengkap</span>
                          <strong className="text-ink">{g.full_name}</strong>
                        </div>
                        <div>
                          <span className="text-muted block text-xs mb-0.5">NIK Wali</span>
                          <span className="font-mono text-ink">{g.nik || '—'}</span>
                        </div>
                        <div>
                          <span className="text-muted block text-xs mb-0.5">Pekerjaan</span>
                          <span className="text-ink">{g.occupation || '—'}</span>
                        </div>
                        <div>
                          <span className="text-muted block text-xs mb-0.5">No. Telepon / WA</span>
                          <span className="text-ink font-semibold">{g.phone || '—'}</span>
                        </div>
                        <div>
                          <span className="text-muted block text-xs mb-0.5">Alamat Email</span>
                          <span className="text-ink">{g.email || '—'}</span>
                        </div>
                        <div>
                          <span className="text-muted block text-xs mb-0.5">Penghasilan</span>
                          <span className="text-ink">{g.income_range || '—'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. ASAL SEKOLAH */}
          <div className="bg-white border border-line rounded-panel shadow-xs overflow-hidden">
            <div className="p-5 border-b border-line flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-leaf/10 text-leaf flex items-center justify-center">
                <School className="w-4 h-4" />
              </div>
              <h2 className="font-display font-semibold text-lg text-ink">
                3. Pendidikan Sebelumnya
              </h2>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-sans">
              <div>
                <span className="text-muted block text-xs mb-0.5">Nama Asal Sekolah</span>
                <strong className="text-ink">{student?.previous_school || '—'}</strong>
              </div>
              <div>
                <span className="text-muted block text-xs mb-0.5">NPSN Asal Sekolah</span>
                <span className="font-mono text-ink">{student?.previous_school_npsn || '—'}</span>
              </div>
              <div>
                <span className="text-muted block text-xs mb-0.5">Tahun Kelulusan</span>
                <span className="text-ink">{student?.graduation_year || '—'}</span>
              </div>
            </div>
          </div>

          {/* 4. DOKUMEN PERSYARATAN TERLAMPIR */}
          <div className="bg-white border border-line rounded-panel shadow-xs overflow-hidden">
            <div className="p-5 border-b border-line flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-warning/10 text-warning flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg text-ink">
                    4. Dokumen Persyaratan
                  </h2>
                  <p className="font-sans text-xs text-muted">
                    Periksa keabsahan berkas yang telah diunggah pendaftar.
                  </p>
                </div>
              </div>
              <span className="text-xs font-sans text-muted">
                {documents.length} Dokumen
              </span>
            </div>

            <div className="p-5 space-y-3">
              {documents.length === 0 ? (
                <p className="text-muted text-xs font-sans text-center py-6">
                  Belum ada dokumen persyaratan yang diunggah.
                </p>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-control border border-line bg-paper/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <strong className="font-sans text-sm text-ink">
                          {getDocTypeLabel(doc.document_type)}
                        </strong>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            doc.verification_status === 'valid'
                              ? 'bg-leaf/10 text-leaf'
                              : doc.verification_status === 'invalid'
                              ? 'bg-danger/10 text-danger'
                              : 'bg-warning/10 text-warning'
                          }`}
                        >
                          {doc.verification_status === 'valid'
                            ? 'Sesuai / Valid'
                            : doc.verification_status === 'invalid'
                            ? 'Perlu Diganti'
                            : 'Menunggu Verifikasi'}
                        </span>
                      </div>
                      <p className="font-sans text-xs text-muted">
                        Berkas: <span className="font-mono text-ink">{doc.original_name}</span> (
                        {Math.round(doc.size_bytes / 1024)} KB)
                      </p>
                      {doc.verification_note && (
                        <p className="font-sans text-xs text-danger mt-1 italic">
                          Catatan: {doc.verification_note}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`/api/v1/admin/documents/${doc.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-line text-xs font-semibold text-primary rounded-control hover:bg-paper transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh</span>
                      </a>

                      {/* Tombol aksi cepat verifikasi dokumen */}
                      <button
                        type="button"
                        onClick={() =>
                          docMutation.mutate({
                            docId: doc.id,
                            status: 'valid',
                            note: 'Dokumen sah dan terbaca jelas.',
                          })
                        }
                        className="p-1.5 text-leaf hover:bg-leaf/10 rounded-control transition-colors"
                        title="Tandai Sesuai (Valid)"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const note = window.prompt(
                            'Masukkan alasan berkas tidak sesuai / perlu diganti:'
                          );
                          if (note !== null) {
                            docMutation.mutate({
                              docId: doc.id,
                              status: 'invalid',
                              note: note || 'Dokumen buram atau tidak sesuai ketentuan.',
                            });
                          }
                        }}
                        className="p-1.5 text-danger hover:bg-danger/10 rounded-control transition-colors"
                        title="Tandai Tidak Sesuai"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Catatan Administrator & Timeline Riwayat */}
        <div className="lg:col-span-4 space-y-6">
          {/* CATATAN VERIFIKASI ADMINISTRATOR */}
          <div className="bg-white border border-line rounded-panel shadow-xs p-5 space-y-3">
            <h3 className="font-display font-semibold text-base text-ink flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Catatan Verifikasi Internal</span>
            </h3>
            <p className="font-sans text-xs text-muted">
              Catatan khusus panitia penerimaan murid baru mengenai kondisi berkas pendaftar.
            </p>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Tambahkan catatan khusus untuk pendaftar ini..."
              className="w-full px-3 py-2 text-sm font-sans border border-line-input rounded-control focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <Button
              type="button"
              variant="primary"
              onClick={() => noteMutation.mutate(noteText)}
              isLoading={noteMutation.isPending}
              className="w-full text-xs"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              <span>Simpan Catatan</span>
            </Button>
          </div>

          {/* TIMELINE RIWAYAT STATUS */}
          <div className="bg-white border border-line rounded-panel shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-base text-ink flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <span>Riwayat Status</span>
              </h3>
              <span className="text-xs font-sans text-muted">
                {status_logs.length} Log
              </span>
            </div>

            <TimelineHistory entries={status_logs} />
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Tindakan Utama */}
      <ConfirmModal
        open={confirmAction.open}
        onClose={() => setConfirmAction((prev) => ({ ...prev, open: false }))}
        onConfirm={async (note) => {
          await statusMutation.mutateAsync({
            status: confirmAction.targetStatus,
            note,
          });
        }}
        title={confirmAction.title}
        description={confirmAction.description}
        confirmLabel={confirmAction.confirmLabel}
        confirmVariant={confirmAction.variant}
        showNoteField
        noteRequired={confirmAction.noteRequired}
        noteLabel="Catatan Keputusan"
        notePlaceholder="Tuliskan catatan evaluasi untuk perubahan status ini..."
        isLoading={statusMutation.isPending}
      />

      {/* Modal Ganti Status Custom */}
      <StatusUpdateModal
        open={customStatusModalOpen}
        onClose={() => setCustomStatusModalOpen(false)}
        onConfirm={async (newStatus, note) => {
          await statusMutation.mutateAsync({ status: newStatus, note });
        }}
        currentStatus={app.status}
        allowedStatuses={[
          { value: 'in_review', label: 'Sedang Diverifikasi' },
          { value: 'verified', label: 'Lolos Verifikasi' },
          { value: 'revision_required', label: 'Perlu Revisi Dokumen' },
          { value: 'accepted', label: 'Diterima' },
          { value: 'rejected', label: 'Tidak Diterima / Ditolak' },
          { value: 'waitlisted', label: 'Daftar Tunggu (Waitlist)' },
        ]}
        applicantName={student?.full_name || app.registration_number}
        isLoading={statusMutation.isPending}
        type="student"
      />
    </div>
  );
};

export default StudentApplicationDetailPage;
