import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { Stepper } from '@/components/form/Stepper';
import { Button } from '@/components/ui/Button';
import { DocumentUploader } from '@/components/form/DocumentUploader';
import {
  getStudentApplication,
  getStudentRequirements,
  uploadStudentDocument,
  deleteStudentDocument,
} from '@/features/student-application/api';
import type { RequirementItem, StudentApplication } from '@/features/student-application/types';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, FileCheck2, Loader2 } from 'lucide-react';

export const StudentRequirementsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<StudentApplication | null>(null);
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { number: 1, label: 'Formulir Murid & Wali' },
    { number: 2, label: 'Unggah Persyaratan' },
    { number: 3, label: 'Konfirmasi Pendaftaran' },
  ];

  const loadData = useCallback(async (isInitial = false) => {
    if (!id) return;
    try {
      if (isInitial) setInitialLoading(true);
      setError(null);
      const [appData, reqData] = await Promise.all([
        getStudentApplication(id),
        getStudentRequirements(id),
      ]);
      setApplication(appData);
      setRequirements(reqData);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setError(errObj.response?.data?.message || 'Gagal memuat dokumen persyaratan.');
    } finally {
      if (isInitial) setInitialLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const handleUpload = async (file: File, documentType: string) => {
    if (!id) return;
    try {
      await uploadStudentDocument(id, file, documentType);
      await loadData(false);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setError(errObj.response?.data?.message || 'Gagal mengunggah dokumen.');
      throw err;
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!id) return;
    try {
      await deleteStudentDocument(id, documentId);
      await loadData(false);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setError(errObj.response?.data?.message || 'Gagal menghapus dokumen.');
      throw err;
    }
  };

  const allRequiredUploaded = requirements
    .filter((r) => r.is_required)
    .every((r) => r.is_uploaded);

  return (
    <div className="bg-paper min-h-screen py-8 md:py-12">
      <SeoHead title="Unggah Dokumen Persyaratan Murid — Yayasan Padindi" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <Link
          to={`/pendaftaran/murid/${id}`}
          className="inline-flex items-center gap-1.5 font-sans text-sm text-primary hover:underline mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke isian data murid</span>
        </Link>

        {/* Stepper */}
        <div className="bg-white p-6 rounded-panel border border-line mb-8 shadow-sm">
          <Stepper steps={steps} currentStep={2} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-semibold text-2xl md:text-3xl text-primary mb-2">
            Sesi 2: Unggah Dokumen Persyaratan
          </h1>
          <p className="font-sans text-sm md:text-base text-muted">
            {application?.student?.full_name ? (
              <>Pendaftaran calon murid baru: <strong className="text-ink">{application.student.full_name}</strong> ({application.unit?.name || 'Sekolah Padindi'}).</>
            ) : (
              'Unggah dokumen pendukung untuk verifikasi data calon murid.'
            )}
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
            <span>Ketentuan Berkas Pendaftaran</span>
          </h2>
          <ul className="list-disc pl-5 font-sans text-sm text-muted space-y-1">
            <li>Format berkas yang diterima: PDF, JPG, JPEG, PNG (maksimal 2 MB per berkas).</li>
            <li>Pastikan tulisan pada dokumen (KK, ijazah) terbaca jelas dan tidak buram/terpotong.</li>
            <li>Pas foto formal calon murid dengan latar belakang polos.</li>
            <li>Foto dari kamera ponsel akan otomatis disesuaikan ukurannya agar cepat diunggah.</li>
          </ul>
        </div>

        {/* Kontainer Utama Persyaratan & Aksi (Satu Box) */}
        <div className="bg-white border border-line rounded-panel p-6 shadow-sm mb-8">
          {initialLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <div className="relative flex items-center justify-center mb-1">
                <div className="w-12 h-12 rounded-full bg-tint-100 animate-pulse absolute" />
                <Loader2 className="w-7 h-7 text-primary animate-spin relative z-10" />
              </div>
              <p className="font-sans font-semibold text-sm text-ink">Memuat dokumen persyaratan...</p>
              <p className="font-sans text-xs text-muted">Menyiapkan berkas dan daftar persyaratan pendaftaran...</p>
            </div>
          ) : (
            <>
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
                        <span>Seluruh dokumen wajib telah lengkap diunggah. Silakan lanjut ke tahap konfirmasi.</span>
                      </span>
                    ) : (
                      <span className="text-muted flex items-center gap-1.5">
                        <span className="text-danger font-bold">*</span>
                        <span>Harap lengkapi semua dokumen bertanda bintang (*) untuk melanjutkan ke konfirmasi.</span>
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate(`/pendaftaran/murid/${id}`)}
                    className="w-full sm:w-auto"
                  >
                    Ubah Data
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={!allRequiredUploaded}
                    onClick={() => navigate(`/pendaftaran/murid/${id}/konfirmasi`)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
                  >
                    <span>Lanjut ke Konfirmasi</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRequirementsPage;
