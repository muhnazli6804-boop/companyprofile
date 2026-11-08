import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { Stepper } from '@/components/form/Stepper';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import {
  getStudentApplication,
  getStudentRequirements,
  submitStudentApplication,
} from '@/features/student-application/api';
import type { RequirementItem, StudentApplication } from '@/features/student-application/types';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  FileText,
  Send,
  User,
  Users,
  GraduationCap,
  FileCheck,
} from 'lucide-react';

export const StudentConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<StudentApplication | null>(null);
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const steps = [
    { number: 1, label: 'Formulir Murid & Wali' },
    { number: 2, label: 'Unggah Persyaratan' },
    { number: 3, label: 'Konfirmasi Pendaftaran' },
  ];

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [appData, reqData] = await Promise.all([
        getStudentApplication(id),
        getStudentRequirements(id),
      ]);

      // If already submitted, redirect to success page
      if (appData.status !== 'draft') {
        navigate(`/pendaftaran/murid/${id}/selesai`);
        return;
      }

      setApplication(appData);
      setRequirements(reqData);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setError(errObj.response?.data?.message || 'Gagal memuat rincian data pendaftaran.');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const allRequiredUploaded = requirements
    .filter((r) => r.is_required)
    .every((r) => r.is_uploaded);

  const handleSubmit = async () => {
    if (!id || !allRequiredUploaded || !agreed) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await submitStudentApplication(id);
      navigate(`/pendaftaran/murid/${id}/selesai`, {
        state: {
          registrationNumber: res.registration_number,
          submittedAt: res.submitted_at,
          unitName: application?.unit?.name,
          studentName: application?.student?.full_name,
        },
      });
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setError(
        errObj.response?.data?.message ||
          'Gagal mengirimkan pendaftaran. Pastikan semua formulir dan berkas telah lengkap.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen
        message="Memuat ringkasan pendaftaran..."
        submessage="Menyiapkan data murid, orang tua/wali, dan berkas..."
        minHeight="min-h-screen"
      />
    );
  }

  const student = application?.student;
  const guardian = application?.guardians?.[0];

  return (
    <div className="bg-paper min-h-screen py-8 md:py-12">
      <SeoHead title="Konfirmasi Pendaftaran Murid Baru — Yayasan Padindi" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <Link
          to={`/pendaftaran/murid/${id}/persyaratan`}
          className="inline-flex items-center gap-1.5 font-sans text-sm text-primary hover:underline mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke unggah persyaratan</span>
        </Link>

        {/* Stepper */}
        <div className="bg-white p-6 rounded-panel border border-line mb-8 shadow-sm">
          <Stepper steps={steps} currentStep={3} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-semibold text-2xl md:text-3xl text-primary mb-2">
            Sesi 3: Konfirmasi & Kirim Pendaftaran
          </h1>
          <p className="font-sans text-sm md:text-base text-muted">
            Mohon periksa kembali seluruh data calon murid, orang tua/wali, serta dokumen yang diunggah sebelum mengirimkan formulir.
          </p>
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

        <div className="space-y-6 mb-8">
          {/* Ringkasan Unit Pendidikan */}
          <section className="bg-white border border-line rounded-panel p-6 shadow-sm">
            <h2 className="font-display font-semibold text-lg text-ink mb-4 pb-2 border-b border-line flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span>Unit & Jenjang Sekolah</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-sans">
              <div>
                <span className="text-muted block mb-0.5">Jenjang / Unit Pendidikan</span>
                <span className="font-semibold text-ink">{application?.unit?.name || '—'}</span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">Jalur Pendaftaran</span>
                <span className="font-semibold text-ink capitalize">{application?.track || 'Reguler'}</span>
              </div>
            </div>
          </section>

          {/* Ringkasan Data Calon Murid */}
          <section className="bg-white border border-line rounded-panel p-6 shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-line">
              <h2 className="font-display font-semibold text-lg text-ink flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <span>Data Calon Murid</span>
              </h2>
              <Link
                to={`/pendaftaran/murid/${id}`}
                className="text-xs font-sans text-primary hover:underline font-semibold"
              >
                Ubah
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-sans">
              <div>
                <span className="text-muted block mb-0.5">Nama Lengkap</span>
                <span className="font-semibold text-ink">{student?.full_name || '—'}</span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">Jenis Kelamin</span>
                <span className="font-semibold text-ink">
                  {student?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                </span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">Tempat & Tanggal Lahir</span>
                <span className="font-semibold text-ink">
                  {student?.birth_place}, {student?.birth_date}
                </span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">NIK Calon Murid</span>
                <span className="font-semibold text-ink font-mono">{student?.nik || '—'}</span>
              </div>
              {student?.nisn && (
                <div>
                  <span className="text-muted block mb-0.5">NISN</span>
                  <span className="font-semibold text-ink font-mono">{student.nisn}</span>
                </div>
              )}
              {student?.religion && (
                <div>
                  <span className="text-muted block mb-0.5">Agama</span>
                  <span className="font-semibold text-ink">{student.religion}</span>
                </div>
              )}
              <div className="sm:col-span-2">
                <span className="text-muted block mb-0.5">Alamat Tempat Tinggal</span>
                <span className="font-semibold text-ink">{student?.address || '—'}</span>
              </div>
              {student?.previous_school && (
                <div className="sm:col-span-2">
                  <span className="text-muted block mb-0.5">Asal Sekolah Sebelumnya</span>
                  <span className="font-semibold text-ink">{student.previous_school}</span>
                </div>
              )}
            </div>
          </section>

          {/* Ringkasan Data Orang Tua / Wali */}
          <section className="bg-white border border-line rounded-panel p-6 shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-line">
              <h2 className="font-display font-semibold text-lg text-ink flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>Data Orang Tua / Wali</span>
              </h2>
              <Link
                to={`/pendaftaran/murid/${id}`}
                className="text-xs font-sans text-primary hover:underline font-semibold"
              >
                Ubah
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-sans">
              <div>
                <span className="text-muted block mb-0.5">Hubungan Keluarga</span>
                <span className="font-semibold text-ink">
                  {guardian?.relationship === 'father'
                    ? 'Ayah Kandung'
                    : guardian?.relationship === 'mother'
                    ? 'Ibu Kandung'
                    : 'Wali'}
                </span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">Nama Orang Tua / Wali</span>
                <span className="font-semibold text-ink">{guardian?.full_name || '—'}</span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">Nomor Telepon / WhatsApp</span>
                <span className="font-semibold text-ink">{guardian?.phone || '—'}</span>
              </div>
              {guardian?.nik && (
                <div>
                  <span className="text-muted block mb-0.5">NIK Orang Tua / Wali</span>
                  <span className="font-semibold text-ink font-mono">{guardian.nik}</span>
                </div>
              )}
              {guardian?.occupation && (
                <div>
                  <span className="text-muted block mb-0.5">Pekerjaan</span>
                  <span className="font-semibold text-ink">{guardian.occupation}</span>
                </div>
              )}
            </div>
          </section>

          {/* Ringkasan Dokumen Persyaratan */}
          <section className="bg-white border border-line rounded-panel p-6 shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-line">
              <h2 className="font-display font-semibold text-lg text-ink flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                <span>Dokumen Persyaratan yang Diunggah</span>
              </h2>
              <Link
                to={`/pendaftaran/murid/${id}/persyaratan`}
                className="text-xs font-sans text-primary hover:underline font-semibold"
              >
                Kelola Berkas
              </Link>
            </div>
            <div className="space-y-3">
              {requirements.map((req) => (
                <div
                  key={req.document_type}
                  className="flex items-center justify-between p-3 rounded-control border border-line bg-tint-100/30 text-sm font-sans"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-ink">
                        {req.label}{' '}
                        {req.is_required && <span className="text-danger">*</span>}
                      </p>
                      {req.document ? (
                        <p className="text-xs text-muted">
                          {req.document.original_name} ({(req.document.size_bytes / 1024).toFixed(0)} KB)
                        </p>
                      ) : (
                        <p className="text-xs text-danger">Belum diunggah</p>
                      )}
                    </div>
                  </div>
                  <div>
                    {req.is_uploaded ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Terunggah
                      </span>
                    ) : req.is_required ? (
                      <span className="inline-flex items-center gap-1 text-xs text-danger bg-red-50 px-2 py-0.5 rounded-full font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> Wajib
                      </span>
                    ) : (
                      <span className="text-xs text-muted">Opsional</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Persetujuan Akhir */}
          <section className="bg-white border border-line rounded-panel p-6 shadow-sm">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-line-input text-primary focus:ring-primary cursor-pointer"
              />
              <span className="text-sm font-sans text-ink leading-relaxed">
                Saya menyatakan dengan sebenarnya bahwa seluruh data dan dokumen yang saya berikan adalah benar dan dapat dipertanggungjawabkan. Saya memahami bahwa data ini akan diproses untuk keperluan seleksi penerimaan murid baru Yayasan Padindi.
              </span>
            </label>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/pendaftaran/murid/${id}/persyaratan`)}
            className="w-full sm:w-auto"
          >
            Kembali ke Persyaratan
          </Button>

          <Button
            type="button"
            variant="primary"
            disabled={!allRequiredUploaded || !agreed || submitting}
            onClick={handleSubmit}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentConfirmationPage;
