import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, MailWarning } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types';
import { useResendVerification } from '../hooks';

/** Banner "email belum diverifikasi" untuk pendaftar, plus hasil tautan email (?verified=1|0 dari backend). */
export const EmailVerificationNotice: React.FC<{ user: User }> = ({ user }) => {
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const { resend, pending, message, error } = useResendVerification();

  const verified = params.get('verified');
  const unverified = user.user_type === 'applicant' && user.email_verified === false;

  // Tautan berhasil dibuka: muat ulang pengguna agar banner hilang.
  useEffect(() => {
    if (verified === '1') void queryClient.invalidateQueries({ queryKey: ['currentUser'] });
  }, [verified, queryClient]);

  const showSuccess = verified === '1';
  const showFailure = verified === '0' && unverified;
  if (!unverified && !showSuccess) return null;

  return (
    <div className="max-w-content mx-auto w-full px-4 pt-4 flex flex-col gap-3 font-sans text-sm">
      {showSuccess && (
        <p role="status" className="flex items-center gap-2 rounded-control border border-leaf bg-tint-100 px-4 py-3 text-ink">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-leaf" aria-hidden="true" />
          Email Anda berhasil diverifikasi.
        </p>
      )}
      {showFailure && (
        <p role="alert" className="flex items-center gap-2 rounded-control border-2 border-danger px-4 py-3 text-danger">
          <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          Tautan verifikasi tidak valid atau sudah kedaluwarsa. Silakan kirim ulang tautan verifikasi.
        </p>
      )}
      {unverified && (
        <section aria-label="Verifikasi email" className="flex flex-wrap items-center gap-3 rounded-control border border-line bg-tint-100 px-4 py-3">
          <MailWarning className="h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
          <p className="flex-1 min-w-[12rem] text-ink">
            Email <strong>{user.email}</strong> belum diverifikasi. Buka tautan verifikasi di kotak masuk Anda.
          </p>
          <Button variant="secondary" isLoading={pending} onClick={resend}>
            Kirim ulang tautan verifikasi
          </Button>
          {message && (
            <p role="status" className="w-full text-ink">
              {message}
            </p>
          )}
          {error && (
            <p role="alert" className="w-full text-danger">
              {error}
            </p>
          )}
        </section>
      )}
    </div>
  );
};
