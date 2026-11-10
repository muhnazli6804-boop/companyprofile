import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient, ensureCsrfCookie } from '@/lib/api-client';
import type { ApiResponse, User } from '@/types';
import { SeoHead } from '@/components/seo/SeoHead';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, Eye, EyeOff, Info } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const StaffLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await ensureCsrfCookie();
      const res = await apiClient.post('/auth/login', data);

      if (res.data.data?.user_type === 'admin') {
        localStorage.removeItem('auth_token');
        try {
          const meRes = await apiClient.get<ApiResponse<User>>('/auth/me');
          if (meRes.data?.data) {
            queryClient.setQueryData(['currentUser'], meRes.data.data);
          }
        } catch {
          // fallback
        }
        await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      // Akun pendaftar umum diarahkan ke akun / dicegah di portal staf
      const token = res.data.data?.token;
      if (token) {
        localStorage.setItem('auth_token', token);
      }
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setServerError('Akun ini terdaftar sebagai pendaftar murid/guru umum. Halaman ini khusus untuk Akun Guru & Staf Tata Usaha.');
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

  const fillDemo = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'password123', { shouldValidate: true });
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 md:p-8 bg-white border border-line rounded-panel shadow-sm">
      <SeoHead title="Masuk Portal Staff & Guru — Yayasan Padindi" />

      <div className="text-center mb-8">
        <h1 className="font-display font-semibold text-2xl md:text-3xl text-primary mb-2">
          Masuk ke Akun
        </h1>
        <p className="font-sans text-sm text-muted">
          Masuk sebagai Guru atau Staf Tata Usaha Yayasan Padindi.
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
          placeholder="guru@padindi.id atau staff@padindi.id"
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="font-sans font-bold text-base text-ink">
              Kata Sandi
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
            autoComplete="current-password"
            placeholder="Masukkan kata sandi"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex justify-end mt-1.5">
            <Link
              to="/staff/lupa-password"
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

      {/* Pemberitahuan Akun dibuat Admin */}
      <div className="mt-6 p-3.5 bg-tint-50 border border-tint-200 rounded-control text-xs text-muted font-sans flex items-start gap-2.5">
        <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-primary">Pemberitahuan Akun</p>
          <p className="mt-0.5">
            Akun Guru dan Staf didaftarkan oleh Administrator Yayasan dan tidak dapat melakukan registrasi mandiri. Silakan hubungi Tata Usaha jika belum memiliki akses.
          </p>
        </div>
      </div>

      {/* Akses Cepat Akun Demo */}
      <div className="mt-6 pt-5 border-t border-line text-center">
        <p className="font-sans text-xs text-muted mb-2.5">
          Akses Cepat Akun Demo (Uji Coba):
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillDemo('guru@padindi.id')}
            className="px-3 py-2 text-xs rounded-control bg-tint-50 hover:bg-tint-100 text-ink border border-line text-left transition"
          >
            <div className="font-bold text-primary">Akun Guru</div>
            <div className="text-[11px] text-muted">guru@padindi.id</div>
          </button>
          <button
            type="button"
            onClick={() => fillDemo('staff@padindi.id')}
            className="px-3 py-2 text-xs rounded-control bg-tint-50 hover:bg-tint-100 text-ink border border-line text-left transition"
          >
            <div className="font-bold text-primary">Akun Staf</div>
            <div className="text-[11px] text-muted">staff@padindi.id</div>
          </button>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-line text-center">
        <p className="font-sans text-sm text-muted">
          Bukan staf atau guru?{' '}
          <Link
            to="/masuk"
            className="font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          >
            Masuk ke Portal Pendaftaran Siswa
          </Link>
        </p>
      </div>
    </div>
  );
};

export default StaffLoginPage;
