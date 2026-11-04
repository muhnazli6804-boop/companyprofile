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

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const res = await apiClient.post('/auth/login', data);
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
      const errObj = err as {
        response?: {
          data?: {
            message?: string;
            errors?: Record<string, string[]>;
          };
        };
      };

      const fieldErrors = errObj.response?.data?.errors;
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, msgs]) => {
          if (field in data && msgs?.[0]) {
            setError(field as keyof LoginFormData, {
              type: 'server',
              message: msgs[0],
            });
          }
        });
        const firstError = Object.values(fieldErrors).flat()[0];
        setServerError(firstError || errObj.response?.data?.message || 'Email atau kata sandi salah.');
      } else {
        setServerError(errObj.response?.data?.message || 'Email atau kata sandi salah. Silakan periksa kembali.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 md:p-8 bg-white border border-line rounded-panel shadow-sm">
      <SeoHead title="Masuk — Yayasan Padindi" />

      <div className="text-center mb-8">
        <h1 className="font-display font-semibold text-2xl md:text-3xl text-primary mb-2">
          Masuk ke Akun
        </h1>
        <p className="font-sans text-sm text-muted">
          Masuk untuk memulai atau melanjutkan pendaftaran murid dan guru.
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          id="email"
          label="Alamat Email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <Input
            id="password"
            label="Kata Sandi"
            type="password"
            autoComplete="current-password"
            placeholder="Masukkan kata sandi"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex justify-end mt-1.5">
            <Link
              to="/lupa-kata-sandi"
              className="font-sans text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
            >
              Lupa kata sandi?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Memeriksa data...' : 'Masuk sekarang'}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-line text-center">
        <p className="font-sans text-sm text-muted">
          Belum memiliki akun?{' '}
          <Link
            to={returnTo ? `/daftar-akun?returnTo=${returnTo}` : '/daftar-akun'}
            className="font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          >
            Daftar akun baru
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
