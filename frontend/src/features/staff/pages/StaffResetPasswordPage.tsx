import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { SeoHead } from '@/components/seo/SeoHead';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
    token: z.string().min(1, 'Token reset kata sandi wajib diisi'),
    password: z
      .string()
      .min(8, 'Kata sandi minimal 8 karakter')
      .regex(/[A-Z]/, 'Kata sandi harus mengandung minimal 1 huruf besar')
      .regex(/[0-9]/, 'Kata sandi harus mengandung minimal 1 angka'),
    password_confirmation: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['password_confirmation'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const StaffResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: searchParams.get('email') || '',
      token: searchParams.get('token') || '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null);
    try {
      await apiClient.post('/auth/reset-password', data);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/staff/login');
      }, 3000);
    } catch (err: unknown) {
      const errObj = err as {
        response?: {
          data?: {
            message?: string;
            errors?: Record<string, string[]>;
          };
        };
      };
      setServerError(
        errObj.response?.data?.message ||
          'Gagal mengatur ulang kata sandi. Token mungkin sudah kedaluwarsa atau tidak valid.'
      );
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 md:p-8 bg-white border border-line rounded-panel shadow-sm">
      <SeoHead title="Atur Ulang Kata Sandi — Portal Guru & Staf" />

      <div className="text-center mb-8">
        <h1 className="font-display font-semibold text-2xl md:text-3xl text-primary mb-2">
          Atur Ulang Kata Sandi
        </h1>
        <p className="font-sans text-sm text-muted">
          Buat kata sandi baru yang aman untuk akun Staff & Guru Anda.
        </p>
      </div>

      {isSuccess ? (
        <div
          role="status"
          className="flex items-start gap-2 p-4 mb-6 bg-tint-100 border border-leaf/30 rounded-control text-leaf text-sm font-sans"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Kata Sandi Berhasil Diperbarui!</p>
            <p className="mt-1">
              Anda akan dialihkan ke halaman masuk dalam beberapa detik...
            </p>
            <Link
              to="/staff/login"
              className="mt-2 inline-block font-bold text-primary hover:underline"
            >
              Klik di sini untuk langsung masuk
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {serverError && (
            <div
              role="alert"
              className="flex items-center gap-2 p-3 mb-6 bg-tint-100 border border-danger/30 rounded-control text-danger text-sm font-sans"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <Input
            id="email"
            label="Alamat Email"
            type="email"
            autoComplete="email"
            placeholder="guru@padindi.id"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            id="token"
            label="Token Verifikasi"
            type="text"
            placeholder="Masukkan token dari email"
            error={errors.token?.message}
            {...register('token')}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="font-sans font-bold text-base text-ink">
                Kata Sandi Baru
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-xs text-muted hover:text-primary transition font-sans flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Sembunyikan' : 'Tampilkan'}</span>
              </button>
            </div>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Minimal 8 karakter, huruf & angka"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password_confirmation" className="font-sans font-bold text-base text-ink">
                Konfirmasi Kata Sandi Baru
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="text-xs text-muted hover:text-primary transition font-sans flex items-center gap-1"
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showConfirmPassword ? 'Sembunyikan' : 'Tampilkan'}</span>
              </button>
            </div>
            <Input
              id="password_confirmation"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Ulangi kata sandi baru"
              error={errors.password_confirmation?.message}
              {...register('password_confirmation')}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan data...' : 'Simpan Kata Sandi Baru'}
          </Button>
        </form>
      )}

      <div className="mt-8 pt-6 border-t border-line text-center">
        <p className="font-sans text-sm text-muted">
          Kembali ke{' '}
          <Link
            to="/staff/login"
            className="font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          >
            Halaman Masuk Staff & Guru
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StaffResetPasswordPage;
