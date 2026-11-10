import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import RegisterPage from './RegisterPage';

vi.mock('@/lib/api-client', () => ({ apiClient: { post: vi.fn(), get: vi.fn() } }));
const api = vi.mocked(apiClient);

function renderPage() {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={['/daftar-akun']}>
        <Routes>
          <Route path="/daftar-akun" element={<RegisterPage />} />
          <Route path="/pendaftaran" element={<h1>Hub Pendaftaran</h1>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText('Nama Lengkap'), 'Budi Santoso');
  await userEvent.type(screen.getByLabelText('Alamat Email'), 'budi@example.test');
  await userEvent.type(screen.getByLabelText('Nomor Telepon / WhatsApp'), '081234567890');
  await userEvent.type(screen.getByLabelText('Kata Sandi'), 'Rahasia123!');
  await userEvent.type(screen.getByLabelText('Konfirmasi Kata Sandi'), 'Rahasia123!');
  await userEvent.click(screen.getByRole('button', { name: 'Daftar sekarang' }));
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  api.get.mockResolvedValue({ data: { data: {} } });
  api.post.mockImplementation(async (url: string) =>
    url === '/auth/register'
      ? { data: { data: { token: 'tok', email: 'budi@example.test' } } }
      : { data: { message: 'Tautan verifikasi telah dikirim ke email Anda.' } },
  );
});

describe('RegisterPage — setelah registrasi berhasil', () => {
  it('menampilkan pemberitahuan tautan verifikasi dikirim ke email, tanpa langsung berpindah halaman', async () => {
    renderPage();
    await fillAndSubmit();

    expect(await screen.findByRole('status')).toHaveTextContent('budi@example.test');
    expect(screen.getByRole('status')).toHaveTextContent(/tautan verifikasi/i);
    expect(screen.queryByRole('heading', { name: 'Hub Pendaftaran' })).not.toBeInTheDocument();
    expect(localStorage.getItem('auth_token')).toBe('tok');
  });

  it('"Kirim ulang" memanggil endpoint verifikasi dan menampilkan konfirmasi', async () => {
    renderPage();
    await fillAndSubmit();
    await userEvent.click(await screen.findByRole('button', { name: 'Kirim ulang' }));

    expect(api.post).toHaveBeenCalledWith('/auth/email/verification-notification');
    expect(await screen.findByText('Tautan verifikasi telah dikirim ke email Anda.')).toBeInTheDocument();
  });

  it('"Lanjutkan" membawa pendaftar ke tujuan', async () => {
    renderPage();
    await fillAndSubmit();
    await userEvent.click(await screen.findByRole('button', { name: 'Lanjutkan' }));

    expect(await screen.findByRole('heading', { name: 'Hub Pendaftaran' })).toBeInTheDocument();
  });
});
