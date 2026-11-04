import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { SeoHead } from '@/components/seo/SeoHead';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      const res = await apiClient.post('/auth/forgot-password', data);
      setSuccessMessage(res.data?.message || 'Tautan atur ulang kata sandi telah dikirim ke email Anda.');
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setServerError(errObj.response?.data?.message || 'Gagal mengirim permintaan. Silakan coba lagi.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 md:p-8 bg-white border border-line rounded-panel shadow-sm">
      <SeoHead title="Lupa Kata Sandi — Yayasan Padindi" />

      <div className="text-center mb-8">
        <h1 className="font-display font-semibold text-2xl md:text-3xl text-primary mb-2">
          Lupa Kata Sandi
        </h1>
        <p className="font-sans text-sm text-muted">
          Masukkan alamat email Anda untuk menerima instruksi pemulihan akun.
        </p>
      </div>

      {successMessage && (
        <div
          role="status"
          className="flex items-start gap-2 p-4 mb-6 bg-tint-100 border border-leaf/30 rounded-control text-leaf text-sm font-sans"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{successMessage}</span>
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            id="email"
            label="Alamat Email Terdaftar"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Mengirim instruksi...' : 'Kirim tautan atur ulang'}
          </Button>
        </form>
      )}

      <div className="mt-8 pt-6 border-t border-line text-center">
        <Link
          to="/masuk"
          className="font-sans text-sm font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
