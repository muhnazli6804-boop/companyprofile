import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { RequirePermission } from './RequirePermission';

vi.mock('@/lib/api-client', () => ({ apiClient: { get: vi.fn() } }));
const api = vi.mocked(apiClient);

function renderGuard() {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={['/admin/pengguna']}>
        <Routes>
          <Route element={<RequirePermission permission="users.manage" />}>
            <Route path="/admin/pengguna" element={<h1>Halaman Pengguna</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const me = (permissions: string[]) =>
  api.get.mockResolvedValue({ data: { data: { user_type: 'admin', permissions } } });

beforeEach(() => vi.clearAllMocks());

describe('RequirePermission', () => {
  it('izin ada: menampilkan halaman', async () => {
    me(['users.manage']);
    renderGuard();
    expect(await screen.findByRole('heading', { name: 'Halaman Pengguna' })).toBeInTheDocument();
  });

  it('izin tidak ada: "Tidak ada akses" dengan tautan ke dashboard, halaman tidak dirender', async () => {
    me(['content.manage']);
    renderGuard();
    expect(await screen.findByRole('heading', { name: 'Tidak ada akses' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Kembali ke dashboard' })).toHaveAttribute('href', '/admin/dashboard');
    expect(screen.queryByText('Halaman Pengguna')).not.toBeInTheDocument();
  });

  it('selagi memuat tidak menampilkan halaman maupun "Tidak ada akses"', () => {
    api.get.mockReturnValue(new Promise(() => {}));
    renderGuard();
    expect(screen.queryByText('Halaman Pengguna')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Tidak ada akses' })).not.toBeInTheDocument();
  });
});
