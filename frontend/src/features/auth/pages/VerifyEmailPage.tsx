import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, AlertCircle, MailCheck, ArrowRight, Home } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const verified = searchParams.get('verified');

  const isSuccess = verified === '1';
  const isFailed = verified === '0';

  return (
    <div className="max-w-md mx-auto my-12 p-6 md:p-8 bg-white border border-line rounded-panel shadow-sm text-center">
      <SeoHead
        title={
          isSuccess
            ? 'Email Berhasil Diverifikasi — Yayasan Padindi'
            : isFailed
            ? 'Verifikasi Email Gagal — Yayasan Padindi'
            : 'Verifikasi Email — Yayasan Padindi'
        }
      />

      {isSuccess && (
        <div data-testid="verification-success" className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-leaf/10 flex items-center justify-center text-leaf">
            <CheckCircle2 className="w-10 h-10" aria-hidden="true" />
          </div>

          <h1 className="font-display font-semibold text-2xl text-primary">
            Email Berhasil Diverifikasi
          </h1>

          <p className="font-sans text-sm text-ink leading-relaxed">
            Alamat email akun Anda telah berhasil diverifikasi. Akun Anda kini aktif dan siap digunakan untuk melanjutkan pendaftaran murid baru atau lamaran kerja.
          </p>

          <div className="pt-4 space-y-3">
            <Link to="/masuk">
              <Button className="w-full justify-center">
                <span>Masuk ke Akun</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      )}

      {isFailed && (
        <div data-testid="verification-failed" className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-danger/10 flex items-center justify-center text-danger">
            <AlertCircle className="w-10 h-10" aria-hidden="true" />
          </div>

          <h1 className="font-display font-semibold text-2xl text-danger">
            Verifikasi Email Gagal
          </h1>

          <p className="font-sans text-sm text-ink leading-relaxed">
            Tautan verifikasi tidak valid atau masa berlakunya telah kedaluwarsa. Silakan masuk ke akun Anda untuk mengirim ulang tautan verifikasi yang baru.
          </p>

          <div className="pt-4 space-y-3">
            <Link to="/masuk">
              <Button className="w-full justify-center">
                <span>Masuk untuk Kirim Ulang</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      )}

      {!isSuccess && !isFailed && (
        <div data-testid="verification-info" className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <MailCheck className="w-10 h-10" aria-hidden="true" />
          </div>

          <h1 className="font-display font-semibold text-2xl text-primary">
            Verifikasi Alamat Email
          </h1>

          <p className="font-sans text-sm text-ink leading-relaxed">
            Tautan konfirmasi telah dikirimkan ke email yang Anda daftarkan. Silakan buka kotak masuk atau folder spam email Anda dan klik tombol verifikasi untuk mengaktifkan akun.
          </p>

          <div className="pt-4 space-y-3">
            <Link to="/masuk">
              <Button className="w-full justify-center">
                <span>Sudah Verifikasi? Masuk</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>

            <Link
              to="/daftar-akun"
              className="inline-block text-xs font-semibold text-primary hover:underline"
            >
              Belum Punya Akun? Daftar Sekarang
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyEmailPage;
