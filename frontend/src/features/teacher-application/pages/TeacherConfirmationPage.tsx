import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { Stepper } from '@/components/form/Stepper';
import { Button } from '@/components/ui/Button';
import {
  getTeacherApplication,
  getTeacherRequirements,
  submitTeacherApplication,
} from '@/features/teacher-application/api';
import type { TeacherRequirementItem, TeacherApplication } from '@/features/teacher-application/types';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  FileText,
  Send,
  User,
  GraduationCap,
  Briefcase,
  FileCheck,
  Phone,
  Video,
} from 'lucide-react';

export const TeacherConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<TeacherApplication | null>(null);
  const [requirements, setRequirements] = useState<TeacherRequirementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const steps = [
    { number: 1, label: 'Formulir Lamaran' },
    { number: 2, label: 'Unggah Dokumen' },
    { number: 3, label: 'Konfirmasi Pendaftaran' },
  ];

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [appData, reqData] = await Promise.all([
        getTeacherApplication(id),
        getTeacherRequirements(id),
      ]);

      if (appData.status !== 'draft') {
        navigate(`/pendaftaran/guru/${id}/selesai`);
        return;
      }

      setApplication(appData);
      setRequirements(reqData);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setError(errObj.response?.data?.message || 'Gagal memuat rincian lamaran.');
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

  const maskPhone = (num?: string) => {
    if (!num) return '—';
    if (num.length <= 6) return num;
    const start = num.slice(0, 4);
    const end = num.slice(-4);
    return `${start}****${end}`;
  };

  const handleSubmit = async () => {
    if (!id || !allRequiredUploaded || !agreed) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await submitTeacherApplication(id);
      navigate(`/pendaftaran/guru/${id}/selesai`, {
        state: {
          registrationNumber: res.registration_number,
          submittedAt: res.submitted_at,
          maskedPhone: res.masked_phone || maskPhone(application?.phone),
          position: application?.applied_position,
          fullName: application?.full_name,
        },
      });
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setError(
        errObj.response?.data?.message ||
          'Gagal mengirimkan lamaran guru. Pastikan semua berkas wajib telah terunggah.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-paper min-h-screen py-12 flex items-center justify-center">
        <p className="text-muted font-sans text-center">Memuat ringkasan lamaran...</p>
      </div>
    );
  }

  const maskedPhone = maskPhone(application?.phone);

  return (
    <div className="bg-paper min-h-screen py-8 md:py-12">
      <SeoHead title="Konfirmasi Pendaftaran Guru — Yayasan Padindi" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <Link
          to={`/pendaftaran/guru/${id}/persyaratan`}
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
            Sesi 3: Konfirmasi & Kirim Lamaran
          </h1>
          <p className="font-sans text-sm md:text-base text-muted">
            Periksa kebenaran informasi sebelum mengirimkan lamaran. Perhatikan nomor telepon yang tercantum karena akan digunakan untuk konfirmasi jadwal wawancara online.
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

        {/* Pemberitahuan Nomor Telepon & Wawancara Online (US-R10) */}
        <div className="bg-white border-2 border-primary/20 rounded-panel p-5 mb-6 shadow-sm flex items-start gap-3">
          <Video className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
          <div className="font-sans text-sm">
            <h2 className="font-bold text-ink mb-1">
              Verifikasi Kontak untuk Interview Online
            </h2>
            <p className="text-muted leading-relaxed mb-2">
              Bila berkas Anda lolos seleksi administratif, tim rekrutmen Yayasan Padindi akan menghubungi Anda melalui kontak terdaftar untuk menjadwalkan <strong>interview online</strong>.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-tint-100 rounded-control border border-line text-xs font-mono font-bold text-ink">
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>Nomor Kontak: {maskedPhone}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-8">
          {/* Posisi & Unit */}
          <section className="bg-white border border-line rounded-panel p-6 shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-line">
              <h2 className="font-display font-semibold text-lg text-ink flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <span>Posisi yang Dilamar</span>
              </h2>
              <Link
                to={`/pendaftaran/guru/${id}`}
                className="text-xs font-sans text-primary hover:underline font-semibold"
              >
                Ubah
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-sans">
              <div>
                <span className="text-muted block mb-0.5">Posisi / Jabatan</span>
                <span className="font-semibold text-ink">{application?.applied_position}</span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">Unit Tujuan</span>
                <span className="font-semibold text-ink">
                  {application?.unit?.name || 'Semua Unit Yayasan'}
                </span>
              </div>
              {application?.teaching_subjects && application.teaching_subjects.length > 0 && (
                <div className="sm:col-span-2">
                  <span className="text-muted block mb-0.5">Mata Pelajaran yang Diampu</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {application.teaching_subjects.map((sub, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-tint-100 text-primary text-xs rounded-full font-medium"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Data Pribadi */}
          <section className="bg-white border border-line rounded-panel p-6 shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-line">
              <h2 className="font-display font-semibold text-lg text-ink flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <span>Data Pribadi Pelamar</span>
              </h2>
              <Link
                to={`/pendaftaran/guru/${id}`}
                className="text-xs font-sans text-primary hover:underline font-semibold"
              >
                Ubah
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-sans">
              <div>
                <span className="text-muted block mb-0.5">Nama Lengkap</span>
                <span className="font-semibold text-ink">{application?.full_name}</span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">Jenis Kelamin</span>
                <span className="font-semibold text-ink">
                  {application?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                </span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">Tempat & Tanggal Lahir</span>
                <span className="font-semibold text-ink">
                  {application?.birth_place}, {application?.birth_date}
                </span>
              </div>
              <div>
                <span className="text-muted block mb-0.5">Email</span>
                <span className="font-semibold text-ink">{application?.email}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted block mb-0.5">Alamat Tempat Tinggal</span>
                <span className="font-semibold text-ink">{application?.address}</span>
              </div>
            </div>
          </section>

          {/* Riwayat Pendidikan */}
          <section className="bg-white border border-line rounded-panel p-6 shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-line">
              <h2 className="font-display font-semibold text-lg text-ink flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                <span>Riwayat Pendidikan</span>
              </h2>
              <Link
                to={`/pendaftaran/guru/${id}`}
                className="text-xs font-sans text-primary hover:underline font-semibold"
              >
                Ubah
              </Link>
            </div>
            <div className="space-y-3">
              {application?.educations?.map((edu, idx) => (
                <div key={idx} className="p-3 bg-paper rounded-control border border-line text-sm font-sans">
                  <div className="flex items-center justify-between font-semibold text-ink">
                    <span>
                      {edu.level} — {edu.institution}
                    </span>
                    {edu.graduation_year && (
                      <span className="text-xs text-muted">Lulus {edu.graduation_year}</span>
                    )}
                  </div>
                  {edu.major && <p className="text-xs text-muted mt-0.5">Jurusan: {edu.major}</p>}
                  {edu.gpa && <p className="text-xs text-muted">IPK: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </section>

          {/* Dokumen yang Diunggah */}
          <section className="bg-white border border-line rounded-panel p-6 shadow-sm">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-line">
              <h2 className="font-display font-semibold text-lg text-ink flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                <span>Dokumen Persyaratan yang Diunggah</span>
              </h2>
              <Link
                to={`/pendaftaran/guru/${id}/persyaratan`}
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
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-danger bg-red-50 px-2 py-0.5 rounded-full font-medium">
                        <AlertCircle className="w-3.5 h-3.5" /> Wajib
                      </span>
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
                Saya menyatakan bahwa seluruh keterangan dan berkas portofolio yang saya serahkan adalah sah dan benar. Saya bersedia mengikuti seluruh tahapan seleksi rekrutmen termasuk sesi interview online bila dinyatakan lolos seleksi berkas.
              </span>
            </label>
          </section>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/pendaftaran/guru/${id}/persyaratan`)}
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
            <span>{submitting ? 'Mengirim Lamaran...' : 'Kirim Lamaran'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TeacherConfirmationPage;
