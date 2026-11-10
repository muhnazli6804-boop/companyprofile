import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, resendVerification } from './api';

export const useAuth = () => {
  return useQuery({ queryKey: ['currentUser'], queryFn: getCurrentUser });
};

// Kirim ulang tautan verifikasi email; 429 (batas kirim) diberi pesan tersendiri.
export const useResendVerification = () => {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resend = async () => {
    setPending(true);
    setMessage(null);
    setError(null);
    try {
      const res = await resendVerification();
      setMessage(res.data?.message ?? 'Tautan verifikasi telah dikirim ke email Anda.');
    } catch (err) {
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      setError(
        e.response?.status === 429
          ? 'Terlalu sering meminta tautan. Tunggu satu menit, lalu coba lagi.'
          : (e.response?.data?.message ?? 'Gagal mengirim tautan verifikasi. Silakan coba lagi.'),
      );
    } finally {
      setPending(false);
    }
  };

  return { resend, pending, message, error };
};
