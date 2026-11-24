import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from './LoginPage';

vi.mock('@/lib/api-client', () => ({
  apiClient: { post: vi.fn(), get: vi.fn() },
  ensureCsrfCookie: vi.fn().mockResolvedValue(true),
}));

function renderLoginPage(url: string = '/masuk') {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/masuk" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('LoginPage - Feedback Verifikasi Email', () => {
  it('menampilkan banner sukses jika param verified=1', () => {
    renderLoginPage('/masuk?verified=1');

    expect(screen.getByRole('status')).toHaveTextContent(/Email Anda berhasil diverifikasi!/i);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('menampilkan banner sukses jika returnTo mengandung verified=1', () => {
    renderLoginPage('/masuk?returnTo=%2Fakun%2Fpendaftaran%3Fverified%3D1');

    expect(screen.getByRole('status')).toHaveTextContent(/Email Anda berhasil diverifikasi!/i);
  });

  it('menampilkan banner gagal jika param verified=0', () => {
    renderLoginPage('/masuk?verified=0');

    expect(screen.getByRole('alert')).toHaveTextContent(/Tautan verifikasi tidak valid atau telah kedaluwarsa/i);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('menampilkan banner gagal jika returnTo mengandung verified=0', () => {
    renderLoginPage('/masuk?returnTo=%2Fakun%2Fpendaftaran%3Fverified%3D0');

    expect(screen.getByRole('alert')).toHaveTextContent(/Tautan verifikasi tidak valid atau telah kedaluwarsa/i);
  });

  it('tidak menampilkan banner status verifikasi pada kunjungan normal tanpa param', () => {
    renderLoginPage('/masuk');

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
