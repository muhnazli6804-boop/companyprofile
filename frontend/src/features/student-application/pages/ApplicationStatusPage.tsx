import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { StatusBadge } from '@/components/brand/StatusBadge';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import {
  getStudentApplication,
  getStudentStatusHistory,
} from '@/features/student-application/api';
import {
  getTeacherApplication,
  getTeacherStatusHistory,
} from '@/features/teacher-application/api';
import type { StudentApplication, StatusHistoryItem } from '@/features/student-application/types';
import type { TeacherApplication, TeacherStatusHistoryItem } from '@/features/teacher-application/types';
import {
  ArrowLeft,
  Building,
  Video,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Phone,
  ShieldAlert,
} from 'lucide-react';

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
            <div>
              <StatusBadge status={appStatus || 'draft'} className="text-sm px-3 py-1.5" />
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

        {/* Panel Panduan Langkah Berikutnya: US-R11 */}
        {isTeacher ? (
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
            {(isTeacher ? teacherApp?.documents : studentApp?.documents)?.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-control border border-line bg-paper/50 text-sm font-sans"
              >
                <div>
                  <p className="font-semibold text-ink">{doc.original_name}</p>
                  <p className="text-xs text-muted">
                    {(doc.size_bytes / 1024).toFixed(0)} KB • Diunggah {new Date(doc.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi Sistem
                </span>
              </div>
            ))}
          </div>
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
