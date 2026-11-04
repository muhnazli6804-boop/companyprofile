import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { SeoHead } from '@/components/seo/SeoHead';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle } from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(150),
    email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
    phone: z.string().min(8, 'Nomor telepon/WhatsApp minimal 8 digit').max(20),
    password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
    password_confirmation: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['password_confirmation'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const res = await apiClient.post('/auth/register', data);
      const token = res.data.data?.token;
      if (token) {
        localStorage.setItem('auth_token', token);
      }
      if (res.data.data?.user) {
        queryClient.setQueryData(['currentUser'], res.data.data.user);
      }
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      const destination = returnTo ? decodeURIComponent(returnTo) : '/pendaftaran';
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setServerError(errObj.response?.data?.message || 'Pendaftaran akun gagal. Silakan coba lagi.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 md:p-8 bg-white border border-line rounded-panel shadow-sm">
      <SeoHead title="Daftar Akun — Yayasan Padindi" />

      <div className="text-center mb-8">
        <h1 className="font-display font-semibold text-2xl md:text-3xl text-primary mb-2">
          Buat Akun Pendaftar
        </h1>
        <p className="font-sans text-sm text-muted">
          Buat akun untuk memulai pendaftaran murid baru atau lamaran tenaga pendidik.
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="flex items-center gap-2 p-3 mb-6 bg-tint-100 border border-danger/30 rounded-control text-danger text-sm font-sans"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          id="name"
          label="Nama Lengkap"
          autoComplete="name"
          placeholder="Nama Anda"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          id="email"
          label="Alamat Email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id="phone"
          label="Nomor Telepon / WhatsApp"
          type="tel"
          autoComplete="tel"
          placeholder="081234567890"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          id="password"
          label="Kata Sandi"
          type="password"
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          id="password_confirmation"
          label="Konfirmasi Kata Sandi"
          type="password"
          autoComplete="new-password"
          placeholder="Ulangi kata sandi"
          error={errors.password_confirmation?.message}
          {...register('password_confirmation')}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Mendaftarkan akun...' : 'Daftar sekarang'}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-line text-center">
        <p className="font-sans text-sm text-muted">
          Sudah memiliki akun?{' '}
          <Link
            to={returnTo ? `/masuk?returnTo=${returnTo}` : '/masuk'}
            className="font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
