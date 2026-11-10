import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { SeoHead } from '@/components/seo/SeoHead';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, CheckCircle, Mail, ArrowLeft, KeyRound } from 'lucide-react';

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
      // Even if email not found, for security show polite message or specific API error
      setServerError(
        errObj.response?.data?.message ||
          'Gagal mengirim instruksi reset kata sandi. Pastikan email terdaftar atau hubungi Administrator Yayasan.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <SeoHead title="Lupa Kata Sandi — Portal Staff & Guru" />

      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
          <Link
            to="/staff/login"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Halaman Masuk
          </Link>

          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20 mb-4">
            <KeyRound className="w-8 h-8" />
          </div>

          <h2 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">
            Lupa Kata Sandi
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Masukkan alamat email akun Staff/Guru Anda untuk menerima instruksi reset kata sandi.
          </p>
        </div>

        <div className="mt-8 bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-300">Permintaan Terkirim</p>
                <p className="mt-1 text-slate-300">{successMessage}</p>
                <Link
                  to="/staff/login"
                  className="mt-3 inline-block font-semibold text-emerald-400 hover:text-emerald-300 underline"
                >
                  Kembali ke Login Staff
                </Link>
              </div>
            </div>
          )}

          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {!successMessage && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Alamat Email Terdaftar
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <Input
                    type="email"
                    placeholder="guru@padindi.id"
                    className="pl-10 bg-slate-900/80 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/30 transition"
              >
                {isSubmitting ? 'Mengirim Instruksi...' : 'Kirim Tautan Reset'}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-700/60 text-center">
            <p className="text-xs text-slate-400">
              Mengalami kendala akun atau lupa email terdaftar?{' '}
              <span className="text-slate-300 font-medium">Hubungi Admin IT Yayasan di kantor tata usaha.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffForgotPasswordPage;
