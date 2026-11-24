import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { VerifyEmailPage } from './VerifyEmailPage';

function renderVerifyEmailPage(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/verifikasi-email" element={<VerifyEmailPage />} />
        <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('VerifyEmailPage', () => {
  it('merender status sukses jika verified=1', () => {
    renderVerifyEmailPage('/verifikasi-email?verified=1');

    expect(screen.getByTestId('verification-success')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /Email Berhasil Diverifikasi/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Masuk ke Akun/i })).toBeInTheDocument();
  });

  it('merender status gagal jika verified=0', () => {
    renderVerifyEmailPage('/verifikasi-email?verified=0');

    expect(screen.getByTestId('verification-failed')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /Verifikasi Email Gagal/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Masuk untuk Kirim Ulang/i })).toBeInTheDocument();
  });

  it('merender panduan umum verifikasi jika tidak ada parameter verified', () => {
    renderVerifyEmailPage('/verifikasi-email');

    expect(screen.getByTestId('verification-info')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /Verifikasi Alamat Email/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sudah Verifikasi\? Masuk/i })).toBeInTheDocument();
  });
});
