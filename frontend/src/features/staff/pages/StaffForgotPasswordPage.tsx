import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { SeoHead } from '@/components/seo/SeoHead';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const StaffForgotPasswordPage: React.FC = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      await apiClient.post('/auth/forgot-password', data);
      setSuccessMessage(
        'Tautan instruksi pengaturan ulang kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk atau spam.'
      );
    } catch (err: unknown) {
      const errObj = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };
      setServerError(
        errObj.response?.data?.message ||
          'Gagal mengirim instruksi reset kata sandi. Pastikan email terdaftar atau hubungi Administrator Yayasan.'
      );
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 md:p-8 bg-white border border-line rounded-panel shadow-sm">
      <SeoHead title="Lupa Kata Sandi — Portal Guru & Staf" />

      <div className="text-center mb-8">
        <h1 className="font-display font-semibold text-2xl md:text-3xl text-primary mb-2">
          Lupa Kata Sandi
        </h1>
        <p className="font-sans text-sm text-muted">
          Masukkan alamat email Guru atau Staf Anda untuk menerima instruksi pemulihan kata sandi.
        </p>
      </div>

      {successMessage && (
        <div
          role="status"
          className="flex items-start gap-2 p-4 mb-6 bg-tint-100 border border-leaf/30 rounded-control text-leaf text-sm font-sans"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Permintaan Terkirim</p>
            <p className="mt-1">{successMessage}</p>
            <Link
              to="/staff/login"
              className="mt-2 inline-block font-bold text-primary hover:underline"
            >
              Kembali ke Halaman Masuk
            </Link>
          </div>
        </div>
      )}

      {serverError && (
        <div
          role="alert"
          className="flex items-center gap-2 p-3 mb-6 bg-tint-100 border border-danger/30 rounded-control text-danger text-sm font-sans"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {!successMessage && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Input
            id="email"
            label="Alamat Email Terdaftar"
            type="email"
            autoComplete="email"
            placeholder="guru@padindi.id"
            error={errors.email?.message}
            {...register('email')}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Mengirim data...' : 'Kirim Tautan Atur Ulang'}
          </Button>
        </form>
      )}

      <div className="mt-8 pt-6 border-t border-line text-center">
        <p className="font-sans text-sm text-muted">
          Sudah ingat kata sandi?{' '}
          <Link
            to="/staff/login"
            className="font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          >
            Masuk kembali
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StaffForgotPasswordPage;
