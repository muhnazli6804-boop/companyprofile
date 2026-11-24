import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { StatusBadge } from '@/components/brand/StatusBadge';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import {
  getStudentApplication,
  getStudentStatusHistory,
  uploadStudentDocument,
  resubmitStudentApplication,
  downloadStudentReceipt,
} from '@/features/student-application/api';
import {
  getTeacherApplication,
  getTeacherStatusHistory,
  uploadTeacherDocument,
  resubmitTeacherApplication,
  downloadTeacherReceipt,
} from '@/features/teacher-application/api';
import { triggerBlobDownload } from '@/utils/fileDownload';
import type { StudentApplication, StatusHistoryItem, DocumentItem } from '@/features/student-application/types';
import type { TeacherApplication, TeacherStatusHistoryItem, TeacherDocumentItem } from '@/features/teacher-application/types';
import {
  ArrowLeft,
  Building,
  Video,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  Phone,
  ShieldAlert,
  Upload,
  Send,
  RefreshCw,
  Download,
} from 'lucide-react';

const getDocumentTypeLabel = (docType?: string, isTeacher = false): string => {
  if (!docType) return 'Dokumen Persyaratan';
  const normalized = docType.toLowerCase().trim();
  switch (normalized) {
    case 'family_card':
      return 'Kartu Keluarga (KK)';
    case 'diploma':
      return isTeacher ? 'Ijazah Pendidikan Terakhir' : 'Ijazah / Surat Keterangan Lulus';
    case 'photo':
      return isTeacher ? 'Pas Foto Formal Terbaru' : 'Pas Foto Calon Murid';
    case 'cv':
    case 'cv_portfolio':
      return 'Curriculum Vitae (CV) & Portofolio';
    case 'birth_certificate':
      return 'Akta Kelahiran';
    case 'identity_card':
    case 'ktp':
      return 'Kartu Tanda Penduduk (KTP)';
    case 'certificate':
      return 'Sertifikat Pendidik / Pelatihan';
    default:
      return normalized
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
  }
};

export const ApplicationStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isTeacher = location.pathname.includes('/guru/');

  const [studentApp, setStudentApp] = useState<StudentApplication | null>(null);
  const [teacherApp, setTeacherApp] = useState<TeacherApplication | null>(null);
  const [history, setHistory] = useState<(StatusHistoryItem | TeacherStatusHistoryItem)[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isUploadingDoc, setIsUploadingDoc] = useState<number | null>(null);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [resubmitNote, setResubmitNote] = useState('');

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      setNotFound(false);

      if (isTeacher) {
        const [tData, tHist] = await Promise.all([
          getTeacherApplication(id),
          getTeacherStatusHistory(id),
        ]);
        setTeacherApp(tData);
        setHistory(tHist);
      } else {
        const [sData, sHist] = await Promise.all([
          getStudentApplication(id),
          getStudentStatusHistory(id),
        ]);
        setStudentApp(sData);
        setHistory(sHist);
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { status?: number; data?: { message?: string } } };
      if (errObj.response?.status === 404) {
        setNotFound(true);
      } else {
        setError(errObj.response?.data?.message || 'Gagal memuat status pendaftaran.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, isTeacher]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReplaceDocument = async (doc: DocumentItem | TeacherDocumentItem, file: File) => {
    if (!id) return;
    try {
      setIsUploadingDoc(doc.id);
      setActionError(null);
      setActionSuccess(null);
      if (isTeacher) {
        await uploadTeacherDocument(id, file, doc.document_type, doc.sequence);
      } else {
        await uploadStudentDocument(id, file, doc.document_type, doc.sequence);
      }
      setActionSuccess(`Berkas ${getDocumentTypeLabel(doc.document_type, isTeacher)} berhasil diunggah ulang.`);
      await loadData();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setActionError(errObj.response?.data?.message || 'Gagal mengunggah dokumen perbaikan.');
    } finally {
      setIsUploadingDoc(null);
    }
  };

  const handleResubmit = async () => {
    if (!id) return;
    try {
      setIsResubmitting(true);
      setActionError(null);
      setActionSuccess(null);
      if (isTeacher) {
        await resubmitTeacherApplication(id, { note: resubmitNote.trim() || undefined });
        setActionSuccess('Lamaran guru berhasil diajukan ulang! Berkas Anda akan diverifikasi kembali oleh panitia.');
      } else {
        await resubmitStudentApplication(id, { note: resubmitNote.trim() || undefined });
        setActionSuccess('Pendaftaran berhasil diajukan ulang! Berkas Anda akan diverifikasi kembali oleh panitia.');
      }
      setResubmitNote('');
      await loadData();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setActionError(errObj.response?.data?.message || 'Gagal mengajukan ulang pendaftaran.');
    } finally {
      setIsResubmitting(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!id) return;
    try {
      setIsDownloadingReceipt(true);
      setActionError(null);
      if (isTeacher) {
        const blob = await downloadTeacherReceipt(id);
        const filename = `bukti-lamaran-${regNumber || id}.pdf`;
        triggerBlobDownload(blob, filename);
      } else {
        const blob = await downloadStudentReceipt(id);
        const filename = `bukti-pendaftaran-${regNumber || id}.pdf`;
        triggerBlobDownload(blob, filename);
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setActionError(errObj.response?.data?.message || 'Gagal mengunduh tanda bukti pendaftaran resmi.');
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen
        message="Memuat status pendaftaran..."
        submessage="Menghubungkan ke sistem untuk mengambil pembaruan terbaru..."
        minHeight="min-h-screen"
      />
    );
  }

  if (notFound) {
    return (
      <div className="bg-paper min-h-screen py-16">
        <div className="max-w-md mx-auto px-4 text-center bg-white p-8 rounded-panel border border-line shadow-sm">
          <ShieldAlert className="w-12 h-12 text-danger mx-auto mb-3" />
          <h1 className="font-display font-semibold text-xl text-ink mb-2">
            Pendaftaran Tidak Ditemukan
          </h1>
          <p className="font-sans text-sm text-muted mb-6">
            Pendaftaran dengan ID ini tidak ditemukan atau Anda tidak memiliki hak akses untuk melihat data ini.
          </p>
          <Link
            to="/akun/pendaftaran"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-sans font-bold text-sm rounded-control hover:bg-primary-hover"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Pendaftaran Saya</span>
          </Link>
        </div>
      </div>
    );
  }

  const appStatus = isTeacher ? teacherApp?.status : studentApp?.status;
  const regNumber = isTeacher
    ? teacherApp?.registration_number
    : studentApp?.registration_number;
  const pageTitle = isTeacher
    ? `Status Lamaran Guru: ${regNumber || id}`
    : `Status Pendaftaran Murid: ${regNumber || id}`;

  return (
    <div className="bg-paper min-h-screen py-8 md:py-12">
      <SeoHead title={`${pageTitle} — Yayasan Padindi`} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <Link
          to="/akun/pendaftaran"
          className="inline-flex items-center gap-1.5 font-sans text-sm text-primary hover:underline mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke daftar pendaftaran</span>
        </Link>

        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 p-4 mb-6 bg-tint-100 border border-danger/30 rounded-control text-danger text-sm font-sans"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Card Header Status */}
        <div className="bg-white border border-line rounded-panel p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 border-b border-line">
            <div>
              <span className="font-sans text-xs uppercase font-bold tracking-wider text-muted block mb-1">
                {isTeacher ? 'Nomor Registrasi Lamaran' : 'Nomor Pendaftaran PPDB'}
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-bold text-primary">
                {regNumber || `DRAFT-${id}`}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status={appStatus || 'draft'} className="text-sm px-3 py-1.5" />
              {appStatus && appStatus !== 'draft' && (
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  disabled={isDownloadingReceipt}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white text-xs sm:text-sm font-semibold rounded-control hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors shadow-xs disabled:opacity-50"
                  title="Unduh Tanda Bukti Pendaftaran Resmi Berstempel Digital (PDF)"
                >
                  {isDownloadingReceipt ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengunduh...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Bukti (PDF)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-sans">
            <div>
              <span className="text-muted block text-xs mb-0.5">
                {isTeacher ? 'Nama Pelamar' : 'Nama Calon Murid'}
              </span>
              <strong className="text-ink">
                {isTeacher ? teacherApp?.full_name : studentApp?.student?.full_name || '—'}
              </strong>
            </div>
            <div>
              <span className="text-muted block text-xs mb-0.5">
                {isTeacher ? 'Posisi yang Dilamar' : 'Unit Pendidikan'}
              </span>
              <span className="text-ink font-semibold">
                {isTeacher
                  ? teacherApp?.applied_position
                  : studentApp?.unit?.name || 'SD/SMP Padindi'}
              </span>
            </div>
            <div>
              <span className="text-muted block text-xs mb-0.5">Tanggal Pengajuan</span>
              <span className="text-ink">
                {isTeacher
                  ? teacherApp?.submitted_at
                    ? new Date(teacherApp.submitted_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })
                    : 'Masih draft'
                  : studentApp?.submitted_at
                  ? new Date(studentApp.submitted_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })
                  : 'Masih draft'}
              </span>
            </div>
          </div>
        </div>

        {/* Panel Panduan Langkah Berikutnya / Status Revisi */}
        {appStatus === 'revision_required' ? (
          <div className="bg-amber-50/80 border-2 border-warning/50 rounded-panel p-6 shadow-sm mb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-warning text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="font-sans flex-1">
                <h2 className="font-display font-semibold text-lg text-amber-950 mb-1.5">
                  {isTeacher ? 'Perlu Revisi Berkas Lamaran Guru' : 'Perlu Revisi Dokumen Pendaftaran'}
                </h2>
                <p className="text-sm text-amber-900 leading-relaxed mb-3">
                  {isTeacher
                    ? 'Tim panitia seleksi rekrutmen telah memeriksa berkas Anda dan meminta perbaikan atau penggantian dokumen yang belum memenuhi persyaratan.'
                    : 'Panitia verifikator telah memeriksa pendaftaran Anda dan meminta perbaikan atau penggantian berkas dokumen yang belum memenuhi persyaratan.'}
                </p>
                {(isTeacher ? teacherApp?.admin_note : studentApp?.admin_note) && (
                  <div className="p-3 bg-white/90 rounded-control border border-amber-300 text-sm font-sans text-ink mb-3 shadow-xs">
                    <span className="font-bold text-xs uppercase text-amber-800 tracking-wider block mb-1">
                      Catatan Verifikator:
                    </span>
                    <p className="whitespace-pre-wrap">{isTeacher ? teacherApp?.admin_note : studentApp?.admin_note}</p>
                  </div>
                )}
                <p className="text-xs text-amber-800">
                  Silakan periksa dokumen bertanda <strong className="text-rose-700">Perlu Diganti</strong> di bawah, unggah berkas baru, kemudian klik tombol <strong>{isTeacher ? 'Ajukan Ulang Lamaran' : 'Ajukan Ulang Pendaftaran'}</strong>.
                </p>
              </div>
            </div>
          </div>
        ) : isTeacher ? (
          <div className="bg-white border-2 border-primary/20 rounded-panel p-6 shadow-sm mb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Video className="w-5 h-5" />
              </div>
              <div className="font-sans">
                <h2 className="font-display font-semibold text-lg text-ink mb-1.5">
                  Langkah Berikutnya: Interview Online
                </h2>
                <p className="text-sm text-muted leading-relaxed mb-3">
                  Kandidat yang memenuhi kualifikasi administratif akan dihubungi oleh panitia rekrutmen Yayasan Padindi untuk mengikuti sesi interview online.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-tint-100 rounded-control border border-line text-xs font-mono font-bold text-ink">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>Nomor Telepon: {teacherApp?.masked_phone || teacherApp?.phone || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-primary/20 rounded-panel p-6 shadow-sm mb-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Building className="w-5 h-5" />
              </div>
              <div className="font-sans">
                <h2 className="font-display font-semibold text-lg text-ink mb-1.5">
                  Langkah Berikutnya: Ikuti Tes Secara Offline
                </h2>
                <p className="text-sm text-muted leading-relaxed mb-2">
                  Calon murid dijadwalkan mengikuti tes observasi / pemetaan kemampuan secara offline langsung di kampus sekolah Yayasan Padindi.
                </p>
                <p className="text-xs text-muted">
                  Panitia akan mengirimkan rincian hari, tanggal, dan ruang tes melalui kontak WhatsApp orang tua/wali terdaftar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dokumen yang Telah Diunggah */}
        <section className="bg-white border border-line rounded-panel p-6 shadow-sm mb-6">
          <h2 className="font-display font-semibold text-lg text-ink mb-4 pb-2 border-b border-line flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Dokumen Persyaratan Terlampir</span>
          </h2>
          <div className="space-y-3">
            {(isTeacher ? teacherApp?.documents : studentApp?.documents)?.map((doc) => {
              const isInvalid = doc.verification_status === 'invalid';
              const isValid = doc.verification_status === 'valid';

              return (
                <div
                  key={doc.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-control border ${
                    isInvalid ? 'border-rose-300 bg-rose-50/40' : 'border-line bg-paper/50'
                  } text-sm font-sans`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-control ${isInvalid ? 'bg-rose-100 text-rose-700' : 'bg-tint-100 text-primary'} shrink-0 mt-0.5`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-sans font-bold text-ink text-sm sm:text-base">
                          {getDocumentTypeLabel(doc.document_type, isTeacher)}
                        </h3>
                        {isInvalid && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded">
                            Revisi
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-ink/80 font-medium truncate max-w-xs sm:max-w-md mt-0.5">
                        {doc.original_name}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {(doc.size_bytes / 1024).toFixed(0)} KB • Diunggah {new Date(doc.created_at).toLocaleDateString('id-ID')}
                      </p>
                      {doc.verification_note && (
                        <div className="mt-2 p-2 bg-rose-100/70 border border-rose-200 rounded text-xs text-rose-900 font-sans">
                          <span className="font-bold">Catatan Verifikator: </span>
                          {doc.verification_note}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:self-center shrink-0 flex flex-wrap items-center gap-2">
                    {isValid ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Sesuai
                      </span>
                    ) : isInvalid ? (
                      <span className="inline-flex items-center gap-1 text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full font-medium border border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5" /> Perlu Diganti
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-medium border border-amber-200">
                        <Clock className="w-3.5 h-3.5" /> Menunggu Verifikasi
                      </span>
                    )}

                    {appStatus === 'revision_required' && (
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-line hover:border-primary text-xs font-semibold text-primary rounded-control transition-colors shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingDoc === doc.id ? 'Mengunggah...' : 'Ganti Berkas'}</span>
                        <input
                          type="file"
                          className="hidden"
                          disabled={isUploadingDoc !== null}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleReplaceDocument(doc, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form Pengajuan Ulang Saat Status Perlu Revisi */}
          {appStatus === 'revision_required' && (
            <div className="mt-6 pt-6 border-t border-line bg-amber-50/50 -mx-6 -mb-6 p-6 rounded-b-panel">
              <h3 className="font-display font-semibold text-base text-ink mb-1">
                {isTeacher ? 'Kirim Pengajuan Ulang Lamaran Guru' : 'Kirim Pengajuan Ulang Pendaftaran'}
              </h3>
              <p className="text-xs text-muted font-sans mb-3">
                Setelah mengganti dokumen yang perlu diperbaiki, Anda dapat menulis catatan dan mengirim ulang {isTeacher ? 'lamaran' : 'pendaftaran'} agar dapat diperiksa kembali oleh panitia.
              </p>
              <div className="mb-3">
                <label htmlFor="resubmit-note" className="block text-xs font-semibold text-ink mb-1 font-sans">
                  Catatan untuk Verifikator (Opsional):
                </label>
                <textarea
                  id="resubmit-note"
                  rows={2}
                  value={resubmitNote}
                  onChange={(e) => setResubmitNote(e.target.value)}
                  placeholder="Contoh: Saya sudah mengunggah ulang dokumen yang diminta dengan berkas yang lebih jelas."
                  className="w-full px-3 py-2 text-sm border border-line rounded-control focus:border-primary focus:ring-1 focus:ring-primary font-sans bg-white"
                />
              </div>

              {actionError && (
                <div role="alert" className="p-3 mb-3 bg-rose-50 border border-rose-300 rounded text-xs text-rose-800 font-sans flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{actionError}</span>
                </div>
              )}
              {actionSuccess && (
                <div role="status" className="p-3 mb-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-800 font-sans flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleResubmit}
                disabled={isResubmitting || isUploadingDoc !== null}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-sans font-bold text-sm rounded-control hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm"
              >
                {isResubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengirim Ulang...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isTeacher ? 'Ajukan Ulang Lamaran' : 'Ajukan Ulang Pendaftaran'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* Riwayat Status Timeline: US-R11 */}
        <section className="bg-white border border-line rounded-panel p-6 shadow-sm">
          <h2 className="font-display font-semibold text-lg text-ink mb-4 pb-2 border-b border-line flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span>Riwayat Aktivitas & Perubahan Status</span>
          </h2>

          {history.length === 0 ? (
            <p className="text-sm font-sans text-muted italic">
              Belum ada catatan perubahan status pendaftaran.
            </p>
          ) : (
            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
              {history.map((item) => (
                <div key={item.id} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-primary ring-4 ring-white" />
                  <div className="text-sm font-sans">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={item.to_status} />
                        {item.from_status && (
                          <span className="text-xs text-muted">
                            (sebelumnya: {item.from_status})
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted">
                        {new Date(item.created_at).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    {item.note && (
                      <p className="text-ink text-xs sm:text-sm bg-paper p-2.5 rounded-control border border-line mt-1.5">
                        {item.note}
                      </p>
                    )}
                    <span className="text-xs text-muted mt-1 block">
                      Oleh: {item.changed_by}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ApplicationStatusPage;
