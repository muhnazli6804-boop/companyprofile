import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import ResetPasswordPage from './ResetPasswordPage';

vi.mock('@/lib/api-client', () => ({ apiClient: { post: vi.fn(), get: vi.fn() } }));
const api = vi.mocked(apiClient);

function renderPage(search = '?token=test-token-123&email=user@example.com') {
  render(
    <MemoryRouter initialEntries={[`/auth/reset-password${search}`]}>
      <Routes>
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/masuk" element={<h1>Halaman Masuk</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mengisi otomatis email dan token dari URL search params', () => {
    renderPage('?token=my-secret-token&email=murid@example.com');

    expect(screen.getByLabelText('Alamat Email')).toHaveValue('murid@example.com');
    expect(screen.getByLabelText('Token Atur Ulang')).toHaveValue('my-secret-token');
  });

  it('memvalidasi kolom kosong dan konfirmasi kata sandi tidak cocok', async () => {
    renderPage('?token=&email=');

    await userEvent.click(screen.getByRole('button', { name: 'Atur Ulang Kata Sandi' }));

    expect(await screen.findByText('Email wajib diisi')).toBeInTheDocument();
    expect(await screen.findByText('Token atur ulang kata sandi wajib diisi')).toBeInTheDocument();
  });

  it('berhasil mengirim kata sandi baru dan menampilkan pesan sukses', async () => {
    api.post.mockResolvedValueOnce({
      data: { message: 'Kata sandi berhasil diatur ulang.' },
    });

    renderPage('?token=valid-token&email=test@example.com');

    await userEvent.type(screen.getByLabelText('Kata Sandi Baru'), 'KataSandi123');
    await userEvent.type(screen.getByLabelText('Konfirmasi Kata Sandi Baru'), 'KataSandi123');
    await userEvent.click(screen.getByRole('button', { name: 'Atur Ulang Kata Sandi' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
        email: 'test@example.com',
        token: 'valid-token',
        password: 'KataSandi123',
        password_confirmation: 'KataSandi123',
      });
    });

    expect(await screen.findByText('Kata Sandi Berhasil Diatur Ulang!')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Klik di sini untuk langsung masuk' })).toBeInTheDocument();
  });

  it('menampilkan pesan galat dari backend jika token tidak valid', async () => {
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Token atur ulang kata sandi tidak valid atau telah kedaluwarsa.',
          code: 'INVALID_TOKEN',
        },
      },
    });

    renderPage('?token=invalid-token&email=test@example.com');

    await userEvent.type(screen.getByLabelText('Kata Sandi Baru'), 'KataSandi123');
    await userEvent.type(screen.getByLabelText('Konfirmasi Kata Sandi Baru'), 'KataSandi123');
    await userEvent.click(screen.getByRole('button', { name: 'Atur Ulang Kata Sandi' }));

    expect(
      await screen.findByText('Token atur ulang kata sandi tidak valid atau telah kedaluwarsa.')
    ).toBeInTheDocument();
  });
});
