import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { SeoHead } from '@/components/seo/SeoHead';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, Eye, EyeOff, ShieldCheck, Lock, Mail, ArrowLeft, Info } from 'lucide-react';

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
      const res = await apiClient.post('/auth/login', data);

      if (res.data.data?.user_type === 'admin') {
        localStorage.removeItem('auth_token');
        await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        navigate('/staff/dashboard', { replace: true });
        return;
      }

      // If user is applicant, this portal is only for staff/guru
      const token = res.data.data?.token;
      if (token) {
        localStorage.setItem('auth_token', token);
      }
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setServerError('Akun ini terdaftar sebagai pendaftar murid/guru umum. Portal ini khusus untuk Tenaga Pengajar dan Staf Yayasan.');
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
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <SeoHead title="Masuk Portal Staff & Guru — Yayasan Padindi" />

      {/* Decorative gradient background elements */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Landing Page
          </Link>

          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h2 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">
            Portal Staff & Guru
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sistem Informasi Pengelolaan Konten & Berita Yayasan Padindi
          </p>
        </div>

        <div className="mt-8 bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <Input
                  type="email"
                  placeholder="nama@padindi.id"
                  className="pl-10 bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Kata Sandi
                </label>
                <Link
                  to="/staff/lupa-password"
                  className="text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  Lupa kata sandi?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/30 transition"
            >
              {isSubmitting ? 'Memproses Masuk...' : 'Masuk ke Dashboard'}
            </Button>
          </form>

          {/* Notice: Registrasi mandiri tidak tersedia */}
          <div className="mt-6 p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs text-slate-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-300">Pemberitahuan Akun</p>
              <p className="mt-0.5 text-slate-400">
                Akun Staff/Guru dibuat oleh Administrator dan tidak dapat melakukan registrasi mandiri. Hubungi Tata Usaha jika Anda belum memiliki akun.
              </p>
            </div>
          </div>

          {/* Demo Login Quick Fill */}
          <div className="mt-6 pt-5 border-t border-slate-700/60">
            <p className="text-xs text-center font-medium text-slate-400 mb-2.5">
              Akses Cepat Akun Demo (Uji Coba):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('guru@padindi.id')}
                className="px-3 py-2 text-xs rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 border border-slate-600/60 text-left transition"
              >
                <div className="font-semibold text-blue-300">Akun Guru</div>
                <div className="text-[10px] text-slate-400">guru@padindi.id</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('staff@padindi.id')}
                className="px-3 py-2 text-xs rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 border border-slate-600/60 text-left transition"
              >
                <div className="font-semibold text-emerald-300">Akun Staf</div>
                <div className="text-[10px] text-slate-400">staff@padindi.id</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/masuk"
            className="text-xs text-slate-400 hover:text-slate-300 underline underline-offset-4"
          >
            Bukan staf/guru? Beralih ke Portal Pendaftaran Siswa & Rekrutmen
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StaffLoginPage;
