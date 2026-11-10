import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import type { User } from '@/types';
import { EmailVerificationNotice } from './EmailVerificationNotice';

vi.mock('@/lib/api-client', () => ({ apiClient: { post: vi.fn(), get: vi.fn() } }));
const api = vi.mocked(apiClient);

const user = (over: Partial<User> = {}): User => ({
  id: 1,
  name: 'Budi',
  email: 'budi@example.test',
  user_type: 'applicant',
  is_active: true,
  email_verified: false,
  ...over,
});

function renderNotice(u: User, search = '', client = new QueryClient()) {
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/akun/pendaftaran${search}`]}>
        <EmailVerificationNotice user={u} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return client;
}

const resendButton = () => screen.queryByRole('button', { name: 'Kirim ulang tautan verifikasi' });

beforeEach(() => vi.clearAllMocks());

describe('EmailVerificationNotice — banner', () => {
  it('tampil untuk pendaftar yang belum terverifikasi', () => {
    renderNotice(user());
    expect(screen.getByText(/belum diverifikasi/i)).toBeInTheDocument();
    expect(resendButton()).toBeInTheDocument();
  });

  it('tidak tampil untuk pendaftar yang sudah terverifikasi', () => {
    renderNotice(user({ email_verified: true }));
    expect(resendButton()).not.toBeInTheDocument();
  });

  it('tidak tampil untuk admin', () => {
    renderNotice(user({ user_type: 'admin' }));
    expect(resendButton()).not.toBeInTheDocument();
  });

  it('kirim ulang memanggil endpoint yang benar dan menampilkan konfirmasi', async () => {
    api.post.mockResolvedValue({ data: { message: 'Tautan verifikasi telah dikirim ke email Anda.' } });
    renderNotice(user());

    await userEvent.click(resendButton()!);

    expect(api.post).toHaveBeenCalledWith('/auth/email/verification-notification');
    expect(await screen.findByRole('status')).toHaveTextContent('Tautan verifikasi telah dikirim ke email Anda.');
  });

  it('429 menampilkan pesan tunggu yang jelas', async () => {
    api.post.mockRejectedValue({ response: { status: 429, data: { code: 'TOO_MANY_REQUESTS' } } });
    renderNotice(user());

    await userEvent.click(resendButton()!);

    expect(await screen.findByRole('alert')).toHaveTextContent(/terlalu sering/i);
  });

  it('galat lain menampilkan pesan dari server', async () => {
    api.post.mockRejectedValue({ response: { status: 500, data: { message: 'Server sedang bermasalah.' } } });
    renderNotice(user());

    await userEvent.click(resendButton()!);

    expect(await screen.findByRole('alert')).toHaveTextContent('Server sedang bermasalah.');
  });
});

describe('EmailVerificationNotice — hasil dari tautan email', () => {
  it('?verified=1 menampilkan pesan berhasil dan memuat ulang currentUser', async () => {
    const client = new QueryClient();
    const spy = vi.spyOn(client, 'invalidateQueries');
    renderNotice(user({ email_verified: true }), '?verified=1', client);

    expect(screen.getByRole('status')).toHaveTextContent('Email Anda berhasil diverifikasi.');
    await waitFor(() => expect(spy).toHaveBeenCalledWith({ queryKey: ['currentUser'] }));
  });

  it('?verified=0 menampilkan pesan gagal yang menyarankan kirim ulang', () => {
    renderNotice(user(), '?verified=0');

    expect(screen.getByRole('alert')).toHaveTextContent(/tidak valid atau sudah kedaluwarsa/i);
    expect(screen.getByRole('alert')).toHaveTextContent(/kirim ulang/i);
  });

  it('?verified=0 tidak menampilkan kegagalan bila akun sudah terverifikasi', () => {
    renderNotice(user({ email_verified: true }), '?verified=0');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('tanpa query tidak ada pesan hasil', () => {
    renderNotice(user({ email_verified: true }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
