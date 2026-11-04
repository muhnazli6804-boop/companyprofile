import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { getTeacherApplication } from '@/features/teacher-application/api';
import type { TeacherApplication } from '@/features/teacher-application/types';
import {
  CheckCircle,
  Copy,
  Check,
  Video,
  ArrowRight,
  Home,
  Phone,
  Clock,
} from 'lucide-react';

interface LocationState {
  registrationNumber?: string;
  submittedAt?: string;
  maskedPhone?: string;
  position?: string;
  fullName?: string;
}

export const TeacherSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  const [application, setApplication] = useState<TeacherApplication | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    getTeacherApplication(id)
      .then((data) => setApplication(data))
      .catch((err) => console.error(err));
  }, [id]);

  const maskPhone = (num?: string) => {
    if (!num) return '—';
    if (num.length <= 6) return num;
    return `${num.slice(0, 4)}****${num.slice(-4)}`;
  };

  const registrationNumber =
    state.registrationNumber || application?.registration_number || `TCH-${id}`;
  const fullName = state.fullName || application?.full_name || 'Pelamar Guru';
  const position = state.position || application?.applied_position || 'Tenaga Pendidik';
  const maskedPhone =
    state.maskedPhone ||
    application?.masked_phone ||
    maskPhone(application?.phone);

  const handleCopy = () => {
    navigator.clipboard.writeText(registrationNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-paper min-h-screen py-10 md:py-16">
      <SeoHead title="Lamaran Berhasil Dikirim — Yayasan Padindi" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Card Sukses */}
        <div className="bg-white border border-line rounded-panel p-6 sm:p-10 shadow-sm text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink mb-2">
            Lamaran Berhasil Dikirim!
          </h1>
          <p className="font-sans text-sm sm:text-base text-muted max-w-lg mx-auto mb-6">
            Terima kasih atas minat Anda untuk bergabung menjadi bagian dari tenaga pendidik Yayasan Padindi. Dokumen dan portofolio Anda telah kami terima untuk proses seleksi berkas.
          </p>

          {/* Nomor Registrasi Box */}
          <div className="bg-tint-100 border border-primary/20 rounded-panel p-5 mb-6 inline-block w-full max-w-md">
            <span className="text-xs uppercase font-sans font-bold tracking-wider text-muted block mb-1">
              Nomor Registrasi Lamaran
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-primary tracking-wide">
                {registrationNumber}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-control text-primary hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                title="Salin nomor registrasi"
                aria-label="Salin nomor registrasi"
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
              <span className="text-muted block text-xs">Nama Pelamar</span>
              <strong className="text-ink">{fullName}</strong>
            </div>
            <div>
              <span className="text-muted block text-xs">Posisi Dilamar</span>
              <strong className="text-ink">{position}</strong>
            </div>
          </div>
        </div>

        {/* Panel Langkah Berikutnya: Interview Online (US-R10) */}
        <div className="bg-white border-2 border-primary/30 rounded-panel p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-xl text-ink mb-2">
                Langkah Berikutnya: Interview Online
              </h2>
              <div className="font-sans text-sm text-ink leading-relaxed space-y-3">
                <p>
                  Tahap seleksi berikutnya bagi pelamar yang lolos verifikasi berkas administrasi adalah <strong>wawancara kompetensi dan pedagogik secara daring (interview online)</strong>.
                </p>
                <div className="p-4 bg-tint-100/50 rounded-control border border-line space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <Phone className="w-4 h-4" />
                    <span>Pemberitahuan Jadwal Lewat Nomor Telepon</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted">
                    Tim rekrutmen Yayasan Padindi akan menghubungi Anda secara langsung lewat nomor telepon/WhatsApp terdaftar (<strong className="text-ink font-mono">{maskedPhone}</strong>) untuk konfirmasi ketersediaan jadwal serta tautan ruang rapat daring (Google Meet / Zoom).
                  </p>
                </div>
                <div className="flex items-start gap-2 text-xs sm:text-sm text-muted">
                  <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>
                    Proses verifikasi berkas umumnya memakan waktu 3 hingga 5 hari kerja. Harap pastikan nomor telepon Anda selalu aktif.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/akun/pendaftaran/guru/${id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-sans font-bold text-sm rounded-control hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
          >
            <span>Lihat Status Lamaran</span>
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

export default TeacherSuccessPage;
