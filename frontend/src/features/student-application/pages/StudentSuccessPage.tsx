import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { getStudentApplication } from '@/features/student-application/api';
import type { StudentApplication } from '@/features/student-application/types';
import {
  CheckCircle,
  Copy,
  Check,
  Building,
  ArrowRight,
  Home,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface LocationState {
  registrationNumber?: string;
  submittedAt?: string;
  unitName?: string;
  studentName?: string;
}

export const StudentSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  const [application, setApplication] = useState<StudentApplication | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    getStudentApplication(id)
      .then((data) => setApplication(data))
      .catch((err) => console.error(err));
  }, [id]);

  const registrationNumber =
    state.registrationNumber || application?.registration_number || `PPDB-${id}`;
  const studentName = state.studentName || application?.student?.full_name || 'Calon Murid';
  const unitName = state.unitName || application?.unit?.name || 'Sekolah Padindi';

  const handleCopy = () => {
    navigator.clipboard.writeText(registrationNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-paper min-h-screen py-10 md:py-16">
      <SeoHead title="Pendaftaran Berhasil Dikirim — Yayasan Padindi" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Success Card */}
        <div className="bg-white border border-line rounded-panel p-6 sm:p-10 shadow-sm text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink mb-2">
            Pendaftaran Berhasil Dikirim!
          </h1>
          <p className="font-sans text-sm sm:text-base text-muted max-w-lg mx-auto mb-6">
            Terima kasih telah mendaftarkan putra/putri Anda di Yayasan Padindi. Berkas pendaftaran telah kami terima dan masuk ke dalam tahap verifikasi panitia.
          </p>

          {/* Nomor Pendaftaran Box */}
          <div className="bg-tint-100 border border-primary/20 rounded-panel p-5 mb-6 inline-block w-full max-w-md">
            <span className="text-xs uppercase font-sans font-bold tracking-wider text-muted block mb-1">
              Nomor Pendaftaran Resmi
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-primary tracking-wide">
                {registrationNumber}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-control text-primary hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                title="Salin nomor pendaftaran"
                aria-label="Salin nomor pendaftaran"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {copied && (
              <span className="text-xs text-emerald-700 font-sans block mt-1">
                Tersalin ke papan klip!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-sm font-sans bg-paper p-4 rounded-control border border-line">
            <div>
              <span className="text-muted block text-xs">Nama Calon Murid</span>
              <strong className="text-ink">{studentName}</strong>
            </div>
            <div>
              <span className="text-muted block text-xs">Unit Tujuan</span>
              <strong className="text-ink">{unitName}</strong>
            </div>
          </div>
        </div>

        {/* Panel Langkah Berikutnya: US-R5 Acceptance Criteria */}
        <div className="bg-white border-2 border-primary/30 rounded-panel p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-xl text-ink mb-2">
                Langkah Berikutnya: Ikuti Tes Secara Offline
              </h2>
              <div className="font-sans text-sm text-ink leading-relaxed space-y-3">
                <p>
                  Sesuai alur penerimaan murid baru di Yayasan Padindi, calon murid wajib mengikuti kegiatan <strong>observasi / tes pemetaan kemampuan secara offline</strong> langsung di lokasi sekolah.
                </p>
                <div className="p-4 bg-tint-100/50 rounded-control border border-line space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <Clock className="w-4 h-4" />
                    <span>Jadwal & Konfirmasi Tes</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted">
                    Jadwal spesifik pelaksanaan tes dan petunjuk teknis akan dikirimkan oleh Panitia PPDB melalui nomor WhatsApp orang tua/wali yang terdaftar dalam waktu maksimal 2 hari kerja.
                  </p>
                </div>
                <div className="flex items-start gap-2 text-xs sm:text-sm text-muted">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Pastikan membawa dokumen asli (Kartu Keluarga dan Ijazah/Rapor) saat hadir ke sekolah untuk verifikasi keabsahan fisik berkas.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/akun/pendaftaran/murid/${id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-sans font-bold text-sm rounded-control hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
          >
            <span>Lihat Status Pendaftaran</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/akun/pendaftaran"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-ink border border-line font-sans font-semibold text-sm rounded-control hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>Daftar Pendaftaran Saya</span>
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-muted hover:text-ink font-sans text-sm rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentSuccessPage;
