import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { Stepper } from '@/components/form/Stepper';
import { Button } from '@/components/ui/Button';
import { DocumentUploader } from '@/components/form/DocumentUploader';
import {
  getTeacherApplication,
  getTeacherRequirements,
  uploadTeacherDocument,
  deleteTeacherDocument,
} from '@/features/teacher-application/api';
import type { TeacherRequirementItem, TeacherApplication } from '@/features/teacher-application/types';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, FileCheck2 } from 'lucide-react';

export const TeacherRequirementsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<TeacherApplication | null>(null);
  const [requirements, setRequirements] = useState<TeacherRequirementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setApplication(appData);
      setRequirements(reqData);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setError(errObj.response?.data?.message || 'Gagal memuat dokumen persyaratan guru.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpload = async (file: File, documentType: string) => {
    if (!id) return;
    await uploadTeacherDocument(id, file, documentType);
    await loadData();
  };

  const handleDelete = async (documentId: number) => {
    if (!id) return;
    await deleteTeacherDocument(id, documentId);
    await loadData();
  };

  const allRequiredUploaded = requirements
    .filter((r) => r.is_required)
    .every((r) => r.is_uploaded);

  if (loading) {
    return (
      <div className="bg-paper min-h-screen py-12 flex items-center justify-center">
        <p className="text-muted font-sans text-center">Memuat dokumen persyaratan guru...</p>
      </div>
    );
  }

  return (
    <div className="bg-paper min-h-screen py-8 md:py-12">
      <SeoHead title="Unggah Dokumen Lamaran Guru — Yayasan Padindi" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <Link
          to={`/pendaftaran/guru/${id}`}
          className="inline-flex items-center gap-1.5 font-sans text-sm text-primary hover:underline mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke isian data lamaran</span>
        </Link>

        {/* Stepper */}
        <div className="bg-white p-6 rounded-panel border border-line mb-8 shadow-sm">
          <Stepper steps={steps} currentStep={2} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-semibold text-2xl md:text-3xl text-primary mb-2">
            Sesi 2: Unggah Berkas & Portofolio
          </h1>
          <p className="font-sans text-sm md:text-base text-muted">
            Pelamar: <strong className="text-ink">{application?.full_name}</strong> — Posisi:{' '}
            <strong className="text-ink">{application?.applied_position}</strong>
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

        {/* Petunjuk Unggah */}
        <div className="bg-white border border-line rounded-panel p-5 mb-8 shadow-sm">
          <h2 className="font-sans font-bold text-ink text-base mb-2 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-primary" />
            <span>Ketentuan Berkas Lamaran</span>
          </h2>
          <ul className="list-disc pl-5 font-sans text-sm text-muted space-y-1">
            <li>
              <strong>Curriculum Vitae (CV) & Portofolio:</strong> Format PDF, maksimal 5 MB. Cantumkan pengalaman mengajar, metode pembelajaran, atau karya tulis bila ada.
            </li>
            <li>
              <strong>Kartu Keluarga & Ijazah:</strong> Format PDF, JPG, JPEG, atau PNG yang terbaca jelas dan tidak terpotong.
            </li>
            <li>
              <strong>Pas Foto:</strong> Format JPG/PNG dengan pakaian formal dan rapi.
            </li>
          </ul>
        </div>

        {/* Kontainer Utama Persyaratan & Aksi (Satu Box) */}
        <div className="bg-white border border-line rounded-panel p-6 shadow-sm mb-8">
          {/* Daftar Dokumen Uploader */}
          <div className="divide-y divide-line">
            {requirements.map((req) => (
              <div key={req.document_type} className="py-6 first:pt-0 last:pb-6">
                <DocumentUploader
                  label={req.label}
                  documentType={req.document_type}
                  description={req.description}
                  isRequired={req.is_required}
                  maxSizeKb={req.max_size_kb}
                  allowedMimes={req.allowed_mimes}
                  existingDocument={req.document}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                  borderless
                />
              </div>
            ))}
          </div>

          {/* Prompt & Navigasi Aksi di Bagian Bawah Box */}
          <div className="pt-6 border-t border-line space-y-4">
            <div>
              <p className="font-sans text-sm font-semibold">
                {allRequiredUploaded ? (
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Seluruh dokumen lamaran wajib telah lengkap. Silakan lanjut ke tahap konfirmasi.</span>
                  </span>
                ) : (
                  <span className="text-muted flex items-center gap-1.5">
                    <span className="text-danger font-bold">*</span>
                    <span>Harap unggah seluruh berkas wajib bertanda bintang (*) untuk melanjutkan ke konfirmasi.</span>
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/pendaftaran/guru/${id}`)}
                className="w-full sm:w-auto"
              >
                Ubah Data
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={!allRequiredUploaded}
                onClick={() => navigate(`/pendaftaran/guru/${id}/konfirmasi`)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
              >
                <span>Lanjut ke Konfirmasi</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherRequirementsPage;
