import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { StatusBadge } from '@/components/brand/StatusBadge';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import {
  getStudentApplications,
  deleteStudentDraft,
} from '@/features/student-application/api';
import {
  getTeacherApplications,
  deleteTeacherDraft,
} from '@/features/teacher-application/api';
import type { StudentApplication } from '@/features/student-application/types';
import type { TeacherApplication } from '@/features/teacher-application/types';
import {
  Plus,
  ArrowRight,
  Trash2,
  GraduationCap,
  Briefcase,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const ApplicationListPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [studentApps, setStudentApps] = useState<StudentApplication[]>([]);
  const [teacherApps, setTeacherApps] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [sApps, tApps] = await Promise.all([
        getStudentApplications(),
        getTeacherApplications(),
      ]);
      setStudentApps(sApps);
      setTeacherApps(tApps);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setError(errObj.response?.data?.message || 'Gagal memuat daftar pendaftaran.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteStudent = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus draft pendaftaran ini?')) return;
    try {
      await deleteStudentDraft(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus draft pendaftaran.');
    }
  };

  const handleDeleteTeacher = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus draft lamaran ini?')) return;
    try {
      await deleteTeacherDraft(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus draft lamaran.');
    }
  };

  const getStudentResumeUrl = (app: StudentApplication) => {
    if (app.current_step === 2) return `/pendaftaran/murid/${app.id}/persyaratan`;
    if (app.current_step === 3) return `/pendaftaran/murid/${app.id}/konfirmasi`;
    return `/pendaftaran/murid/${app.id}`;
  };

  const getTeacherResumeUrl = (app: TeacherApplication) => {
    if (app.current_step === 2) return `/pendaftaran/guru/${app.id}/persyaratan`;
    if (app.current_step === 3) return `/pendaftaran/guru/${app.id}/konfirmasi`;
    return `/pendaftaran/guru/${app.id}`;
  };

  return (
    <div className="bg-paper min-h-screen py-8 md:py-12">
      <SeoHead title="Daftar Pendaftaran Saya — Yayasan Padindi" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-semibold text-2xl md:text-3xl text-primary">
              Pendaftaran Saya
            </h1>
            <p className="font-sans text-sm md:text-base text-muted mt-1">
              Pantau status pendaftaran murid baru atau lamaran kerja pendidik Anda.
            </p>
          </div>

          <Link
            to="/pendaftaran"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-sans font-bold text-sm rounded-control hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Pendaftaran Baru</span>
          </Link>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 p-4 mb-6 bg-tint-100 border border-danger/30 rounded-control text-danger text-sm font-sans"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-line mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`flex items-center gap-2 px-5 py-3 font-sans text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'student'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Pendaftaran Murid Baru ({studentApps.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teacher')}
            className={`flex items-center gap-2 px-5 py-3 font-sans text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'teacher'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Lamaran Pendidik / Guru ({teacherApps.length})</span>
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="bg-white rounded-panel border border-line shadow-sm overflow-hidden">
            <LoadingScreen
              message="Memuat daftar pendaftaran saya..."
              submessage="Mengambil riwayat pendaftaran murid dan lamaran guru..."
              minHeight="min-h-[40vh]"
            />
          </div>
        ) : (
          <div>
            {/* TAB 1: PENDAFTARAN MURID */}
            {activeTab === 'student' && (
              <div>
                {studentApps.length === 0 ? (
                  <div className="bg-white border border-line rounded-panel p-8 text-center shadow-sm">
                    <GraduationCap className="w-12 h-12 text-muted/40 mx-auto mb-3" />
                    <h2 className="font-display font-semibold text-lg text-ink mb-1">
                      Belum Ada Pendaftaran Murid
                    </h2>
                    <p className="font-sans text-sm text-muted max-w-md mx-auto mb-6">
                      Anda belum memulai pendaftaran murid baru di jenjang SD maupun SMP Padindi.
                    </p>
                    <Link
                      to="/pendaftaran/murid"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-sans font-bold text-sm rounded-control hover:bg-primary-hover shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Daftarkan Murid Baru</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentApps.map((app) => {
                      const isDraft = app.status === 'draft';
                      return (
                        <div
                          key={app.id}
                          className="bg-white border border-line rounded-panel p-5 sm:p-6 shadow-sm hover:border-primary/40 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 mb-3 border-b border-line">
                            <div className="flex items-center gap-2.5">
                              <StatusBadge status={app.status} />
                              {app.registration_number ? (
                                <span className="font-mono text-sm font-bold text-primary">
                                  {app.registration_number}
                                </span>
                              ) : (
                                <span className="font-sans text-xs text-muted">
                                  Draft #{app.id}
                                </span>
                              )}
                            </div>
                            <span className="font-sans text-xs text-muted">
                              Diperbarui: {app.updated_at ? new Date(app.updated_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '—'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-sm font-sans">
                            <div>
                              <span className="text-muted block text-xs mb-0.5">Nama Calon Murid</span>
                              <strong className="text-ink">
                                {app.student?.full_name || '(Belum diisi)'}
                              </strong>
                            </div>
                            <div>
                              <span className="text-muted block text-xs mb-0.5">Unit Pendidikan</span>
                              <span className="text-ink font-semibold">
                                {app.unit?.name || 'SD/SMP Padindi'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted block text-xs mb-0.5">Jalur Pendaftaran</span>
                              <span className="text-ink capitalize">{app.track || 'Reguler'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            {isDraft ? (
                              <div className="flex items-center justify-between w-full">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStudent(app.id)}
                                  className="inline-flex items-center gap-1.5 text-xs font-sans text-danger hover:underline p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus Draft</span>
                                </button>

                                <Link
                                  to={getStudentResumeUrl(app)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-sans font-bold text-xs rounded-control hover:bg-primary-hover shadow-xs"
                                >
                                  <span>Lanjutkan Pendaftaran</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end w-full">
                                <Link
                                  to={`/akun/pendaftaran/murid/${app.id}`}
                                  className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-primary hover:underline"
                                >
                                  <span>Lihat Status & Riwayat</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: LAMARAN PENDIDIK / GURU */}
            {activeTab === 'teacher' && (
              <div>
                {teacherApps.length === 0 ? (
                  <div className="bg-white border border-line rounded-panel p-8 text-center shadow-sm">
                    <Briefcase className="w-12 h-12 text-muted/40 mx-auto mb-3" />
                    <h2 className="font-display font-semibold text-lg text-ink mb-1">
                      Belum Ada Lamaran Pendidik
                    </h2>
                    <p className="font-sans text-sm text-muted max-w-md mx-auto mb-6">
                      Anda belum mengajukan lamaran sebagai guru atau tenaga kependidikan di Yayasan Padindi.
                    </p>
                    <Link
                      to="/pendaftaran/guru"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-sans font-bold text-sm rounded-control hover:bg-primary-hover shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajukan Lamaran Guru</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teacherApps.map((app) => {
                      const isDraft = app.status === 'draft';
                      return (
                        <div
                          key={app.id}
                          className="bg-white border border-line rounded-panel p-5 sm:p-6 shadow-sm hover:border-primary/40 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 mb-3 border-b border-line">
                            <div className="flex items-center gap-2.5">
                              <StatusBadge status={app.status} />
                              {app.registration_number ? (
                                <span className="font-mono text-sm font-bold text-primary">
                                  {app.registration_number}
                                </span>
                              ) : (
                                <span className="font-sans text-xs text-muted">
                                  Draft #{app.id}
                                </span>
                              )}
                            </div>
                            <span className="font-sans text-xs text-muted">
                              Diperbarui: {app.updated_at ? new Date(app.updated_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '—'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-sm font-sans">
                            <div>
                              <span className="text-muted block text-xs mb-0.5">Nama Pelamar</span>
                              <strong className="text-ink">{app.full_name || '—'}</strong>
                            </div>
                            <div>
                              <span className="text-muted block text-xs mb-0.5">Posisi Dilamar</span>
                              <span className="text-ink font-semibold">{app.applied_position}</span>
                            </div>
                            <div>
                              <span className="text-muted block text-xs mb-0.5">Unit Tujuan</span>
                              <span className="text-ink">{app.unit?.name || 'Semua Unit'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            {isDraft ? (
                              <div className="flex items-center justify-between w-full">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTeacher(app.id)}
                                  className="inline-flex items-center gap-1.5 text-xs font-sans text-danger hover:underline p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus Draft</span>
                                </button>

                                <Link
                                  to={getTeacherResumeUrl(app)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-sans font-bold text-xs rounded-control hover:bg-primary-hover shadow-xs"
                                >
                                  <span>Lanjutkan Lamaran</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end w-full">
                                <Link
                                  to={`/akun/pendaftaran/guru/${app.id}`}
                                  className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-primary hover:underline"
                                >
                                  <span>Lihat Status & Riwayat</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationListPage;
