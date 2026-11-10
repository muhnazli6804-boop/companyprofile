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
  fetchTeacherApplicationDetail,
  updateTeacherApplicationStatus,
  updateTeacherApplicationNote,
} from '../api';
import { verifyStudentDocument } from '../../student-applications/api';
import {
  ArrowLeft,
  User,
  GraduationCap,
  Briefcase,
  Award,
  FileCheck2,
  History,
  CheckCircle,
  XCircle,
  Download,
  Save,
  FileText,
  Video,
  Bookmark,
} from 'lucide-react';

export const TeacherApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [noteText, setNoteText] = useState('');
  const [noteInitialized, setNoteInitialized] = useState(false);

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
    queryKey: ['admin', 'teacher-application', id],
    queryFn: () => fetchTeacherApplicationDetail(id!),
    enabled: Boolean(id),
  });

  if (app && !noteInitialized) {
    setNoteText(app.admin_note || '');
    setNoteInitialized(true);
  }

  const statusMutation = useMutation({
    mutationFn: ({ status, note }: { status: string; note?: string }) =>
      updateTeacherApplicationStatus(id!, { status, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teacher-application', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'teacher-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setConfirmAction((prev) => ({ ...prev, open: false }));
      setCustomStatusModalOpen(false);
    },
  });

  const noteMutation = useMutation({
    mutationFn: (newNote: string) =>
      updateTeacherApplicationNote(id!, { admin_note: newNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teacher-application', id] });
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['admin', 'teacher-application', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SeoHead title="Detail Lamaran Guru — Admin" />
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
          Lamaran Tidak Ditemukan
        </h2>
        <p className="font-sans text-sm text-muted mb-4">
          Data pelamar guru dengan ID #{id} tidak ditemukan di sistem.
        </p>
        <Link
          to="/admin/lamaran-guru"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-sans text-sm font-semibold rounded-control"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar</span>
        </Link>
      </div>
    );
  }

  const {
    educations = [],
    experiences = [],
    documents = [],
    status_logs = [],
    unit,
  } = app;

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
      case 'cv':
        return 'Curriculum Vitae (CV)';
      case 'ijazah':
        return 'Ijazah Terakhir';
      case 'transkrip':
        return 'Transkrip Nilai Akademik';
      case 'sertifikat':
        return 'Sertifikat Pendidik / Pelatihan';
      case 'foto':
        return 'Pas Foto Terbaru';
      default:
        return type.toUpperCase();
    }
  };

  return (
    <div className="space-y-6">
      <SeoHead title={`Detail Pelamar: ${app.full_name} — Admin`} />

      {/* Header */}
      <AdminPageHeader
        title={app.full_name}
        subtitle={`Nomor Registrasi: ${app.registration_number} • Posisi Dilamar: ${app.applied_position} • Unit: ${unit?.name || 'Semua Unit'}`}
        breadcrumbs={[
          { label: 'Rekrutmen Guru', href: '/admin/lamaran-guru' },
          { label: app.registration_number },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/admin/lamaran-guru"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-line text-ink font-sans text-xs font-semibold rounded-control hover:bg-paper transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Daftar Pelamar</span>
            </Link>

            {/* Step 1: Lolos Administrasi -> Wawancara */}
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                handleActionClick(
                  'interview_test',
                  'Loloskan ke Tahap Wawancara',
                  'Pelamar akan dinyatakan lolos seleksi administrasi dan dijadwalkan untuk wawancara daring/luring.',
                  'accent',
                  'Jadwalkan Wawancara'
                )
              }
              className="text-xs"
            >
              <Video className="w-3.5 h-3.5 mr-1 text-primary" />
              <span>Jadwalkan Wawancara</span>
            </Button>

            {/* Cadangan / Reserve */}
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                handleActionClick(
                  'reserve',
                  'Simpan sebagai Cadangan (Talent Pool)',
                  'Pelamar akan disimpan dalam daftar cadangan untuk kebutuhan formasi pendidik berikutnya.',
                  'accent',
                  'Simpan sebagai Cadangan'
                )
              }
              className="text-xs"
            >
              <Bookmark className="w-3.5 h-3.5 mr-1 text-muted" />
              <span>Cadangan</span>
            </Button>

            {/* Tolak Pelamar */}
            <Button
              type="button"
              variant="danger"
              onClick={() =>
                handleActionClick(
                  'failed',
                  'Tolak Lamaran Guru',
                  'Apakah Anda yakin ingin menyatakan pelamar Tidak Lolos seleksi?',
                  'danger',
                  'Tolak Pelamar',
                  true
                )
              }
              className="text-xs"
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              <span>Tidak Lolos</span>
            </Button>

            {/* Terima Pelamar */}
            <Button
              type="button"
              variant="primary"
              onClick={() =>
                handleActionClick(
                  'passed',
                  'Terima Tenaga Pendidik',
                  'Pelamar akan dinyatakan Lolos Seluruh Tahapan Seleksi dan resmi diterima sebagai pengajar di Yayasan Padindi.',
                  'primary',
                  'Terima Pelamar'
                )
              }
              className="text-xs"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              <span>Terima Guru</span>
            </Button>
          </div>
        }
      />

      {/* Status Bar */}
      <div className="bg-white border border-line rounded-panel p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <StatusBadge status={app.status as any} />
          <div>
            <span className="font-sans text-xs text-muted block">Status Seleksi Saat Ini</span>
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. DATA PRIBADI */}
          <div className="bg-white border border-line rounded-panel shadow-xs overflow-hidden">
            <div className="p-5 border-b border-line flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h2 className="font-display font-semibold text-lg text-ink">
                1. Data Pribadi Pelamar
              </h2>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-sans">
              <div>
                <span className="text-muted block text-xs mb-0.5">Nama Lengkap & Gelar</span>
                <strong className="text-ink">{app.full_name}</strong>
              </div>
              <div>
                <span className="text-muted block text-xs mb-0.5">NIK (Nomor Induk Kependudukan)</span>
                <span className="font-mono text-ink font-semibold">{app.nik}</span>
              </div>
              <div>
                <span className="text-muted block text-xs mb-0.5">Jenis Kelamin</span>
                <span className="text-ink">
                  {app.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                </span>
              </div>
              <div>
                <span className="text-muted block text-xs mb-0.5">Tempat & Tanggal Lahir</span>
                <span className="text-ink">
                  {app.birth_place ? `${app.birth_place}, ` : ''}
                  {app.birth_date
                    ? new Date(app.birth_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
              </div>
              <div>
                <span className="text-muted block text-xs mb-0.5">No. Telepon / WhatsApp</span>
                <span className="font-mono text-ink font-semibold">{app.phone}</span>
              </div>
              <div>
                <span className="text-muted block text-xs mb-0.5">Alamat Email</span>
                <span className="text-ink">{app.email}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted block text-xs mb-0.5">Alamat Tempat Tinggal</span>
                <span className="text-ink leading-relaxed">{app.address}</span>
              </div>
              <div>
                <span className="text-muted block text-xs mb-0.5">Agama</span>
                <span className="text-ink">{app.religion || '—'}</span>
              </div>
              <div>
                <span className="text-muted block text-xs mb-0.5">Kota / Provinsi</span>
                <span className="text-ink">
                  {[app.city, app.province].filter(Boolean).join(', ') || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. BIDANG KEAHLIAN / MAPEL YANG DIKUASAI */}
          <div className="bg-white border border-line rounded-panel shadow-xs p-5 space-y-3">
            <h3 className="font-display font-semibold text-base text-ink flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <span>Bidang Keahlian / Mata Pelajaran yang Dikuasai</span>
            </h3>
            {app.teaching_subjects && app.teaching_subjects.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {app.teaching_subjects.map((sub, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-tint-100 text-primary font-sans text-xs font-semibold rounded-full border border-primary/20"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            ) : (
              <p className="font-sans text-xs text-muted">Tidak ada mata pelajaran spesifik yang dicantumkan.</p>
            )}

            {app.cover_letter && (
              <div className="pt-3 border-t border-line mt-3">
                <span className="block text-xs font-sans text-muted mb-1 font-semibold">
                  Surat Lamaran Ringkas / Motivasi:
                </span>
                <p className="font-sans text-xs text-ink bg-paper p-3 rounded-control leading-relaxed whitespace-pre-wrap">
                  {app.cover_letter}
                </p>
              </div>
            )}
          </div>

          {/* 3. RIWAYAT PENDIDIKAN */}
          <div className="bg-white border border-line rounded-panel shadow-xs overflow-hidden">
            <div className="p-5 border-b border-line flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-navy/10 text-navy flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h2 className="font-display font-semibold text-lg text-ink">
                2. Riwayat Pendidikan Formal
              </h2>
            </div>

            <div className="p-5 space-y-3">
              {educations.length === 0 ? (
                <p className="text-muted text-xs font-sans">Belum ada riwayat pendidikan yang ditambahkan.</p>
              ) : (
                educations.map((edu, idx) => (
                  <div
                    key={edu.id || idx}
                    className="p-4 rounded-control border border-line bg-paper/30 grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm font-sans"
                  >
                    <div>
                      <span className="text-muted block text-xs mb-0.5">Jenjang</span>
                      <strong className="text-primary">{edu.level}</strong>
                    </div>
                    <div>
                      <span className="text-muted block text-xs mb-0.5">Institusi / Universitas</span>
                      <strong className="text-ink">{edu.institution}</strong>
                    </div>
                    <div>
                      <span className="text-muted block text-xs mb-0.5">Jurusan</span>
                      <span className="text-ink">{edu.major || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted block text-xs mb-0.5">Tahun & IPK</span>
                      <span className="text-ink font-semibold">
                        Lulus {edu.graduation_year || '—'}{' '}
                        {edu.gpa ? `(IPK: ${edu.gpa})` : ''}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 4. PENGALAMAN MENGAJAR / KERJA */}
          <div className="bg-white border border-line rounded-panel shadow-xs overflow-hidden">
            <div className="p-5 border-b border-line flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-leaf/10 text-leaf flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <h2 className="font-display font-semibold text-lg text-ink">
                3. Riwayat Pengalaman Kerja
              </h2>
            </div>

            <div className="p-5 space-y-3">
              {experiences.length === 0 ? (
                <p className="text-muted text-xs font-sans">
                  Lulusan baru (Fresh Graduate) / belum ada pengalaman kerja dicantumkan.
                </p>
              ) : (
                experiences.map((exp, idx) => (
                  <div
                    key={exp.id || idx}
                    className="p-4 rounded-control border border-line bg-paper/30 space-y-2 text-sm font-sans"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-ink font-semibold">{exp.position}</strong>
                      <span className="text-xs text-muted">
                        {exp.start_date} s.d. {exp.end_date || 'Sekarang'}
                      </span>
                    </div>
                    <p className="text-xs text-primary font-medium">{exp.institution}</p>
                    {exp.description && (
                      <p className="text-xs text-muted leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 5. DOKUMEN CV & PERSYARATAN */}
          <div className="bg-white border border-line rounded-panel shadow-xs overflow-hidden">
            <div className="p-5 border-b border-line flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-warning/10 text-warning flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-lg text-ink">
                    4. Berkas Lamaran & Portofolio
                  </h2>
                  <p className="font-sans text-xs text-muted">
                    Periksa CV, ijazah, dan dokumen pendukung pelamar.
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

                      <button
                        type="button"
                        onClick={() =>
                          docMutation.mutate({
                            docId: doc.id,
                            status: 'valid',
                            note: 'Dokumen lengkap dan valid.',
                          })
                        }
                        className="p-1.5 text-leaf hover:bg-leaf/10 rounded-control transition-colors"
                        title="Tandai Sesuai"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const note = window.prompt('Masukkan alasan berkas tidak sesuai:');
                          if (note !== null) {
                            docMutation.mutate({
                              docId: doc.id,
                              status: 'invalid',
                              note: note || 'Dokumen buram atau tidak sesuai.',
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

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* CATATAN EVALUASI INTERNAL */}
          <div className="bg-white border border-line rounded-panel shadow-xs p-5 space-y-3">
            <h3 className="font-display font-semibold text-base text-ink flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Catatan Evaluasi / Rekomendasi</span>
            </h3>
            <p className="font-sans text-xs text-muted">
              Catatan hasil wawancara, nilai tes pedagogik, dan rekomendasi tim rekrutmen.
            </p>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Contoh: Penguasaan pedagogik baik, direkomendasikan untuk guru SMP..."
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
              <span>Simpan Evaluasi</span>
            </Button>
          </div>

          {/* TIMELINE RIWAYAT SELEKSI */}
          <div className="bg-white border border-line rounded-panel shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-base text-ink flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <span>Riwayat Tahapan Seleksi</span>
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
        noteLabel="Catatan Keputusan Seleksi"
        notePlaceholder="Tuliskan catatan evaluasi..."
        isLoading={statusMutation.isPending}
      />

      {/* Modal Status Custom */}
      <StatusUpdateModal
        open={customStatusModalOpen}
        onClose={() => setCustomStatusModalOpen(false)}
        onConfirm={async (newStatus, note) => {
          await statusMutation.mutateAsync({ status: newStatus, note });
        }}
        currentStatus={app.status}
        allowedStatuses={[
          { value: 'administrative_review', label: 'Seleksi Administrasi' },
          { value: 'interview_test', label: 'Wawancara & Tes Pedagogik' },
          { value: 'passed', label: 'Lolos / Diterima' },
          { value: 'failed', label: 'Tidak Lolos' },
          { value: 'reserve', label: 'Cadangan (Talent Pool)' },
        ]}
        applicantName={app.full_name}
        isLoading={statusMutation.isPending}
        type="teacher"
      />
    </div>
  );
};

export default TeacherApplicationDetailPage;
