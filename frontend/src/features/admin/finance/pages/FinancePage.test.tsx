import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import FinancePage from './FinancePage';

vi.mock('@/lib/api-client', () => ({ apiClient: { get: vi.fn(), put: vi.fn() } }));
const get = vi.mocked(apiClient.get) as unknown as ReturnType<typeof vi.fn>;
const put = vi.mocked(apiClient.put) as unknown as ReturnType<typeof vi.fn>;

const OK = 'https://datastudio.google.com/embed/reporting/71e72570-2c98-4d99-8b73-37d81e89d975/page/p_u56p73jk9d';
const SETTINGS_HEADING = /Pengaturan Dashboard/;

const dashboard = (over: object = {}) => ({ enabled: true, title: 'Dashboard Keuangan', url: OK, config: null, ...over });

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <FinancePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('FinancePage', () => {
  beforeEach(() => {
    get.mockReset();
    put.mockReset();
  });

  it('menampilkan skeleton saat memuat', async () => {
    let resolve!: (v: unknown) => void;
    get.mockReturnValue(new Promise((r) => (resolve = r)));
    renderPage();

    expect(screen.getByTestId('finance-skeleton')).toBeInTheDocument();
    resolve({ data: { data: dashboard() } });
    await screen.findByTitle('Dashboard Keuangan SD Padindi');
  });

  it('role keuangan: iframe aman tampil, tanpa form edit dan tanpa tautan pengaturan', async () => {
    get.mockResolvedValue({ data: { data: dashboard() } });
    renderPage();

    const frame = await screen.findByTitle('Dashboard Keuangan SD Padindi');
    expect(frame).toHaveAttribute('src', OK);
    expect(frame).toHaveAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    expect(frame).toHaveAttribute('loading', 'lazy');
    expect(frame).toHaveAttribute('allowfullscreen');
    const sandbox = frame.getAttribute('sandbox') ?? '';
    expect(sandbox).toContain('allow-scripts');
    expect(sandbox).toContain('allow-popups-to-escape-sandbox');
    expect(sandbox).not.toContain('allow-top-navigation');
    expect(screen.getByText('Buka di tab baru')).toBeInTheDocument();
    expect(screen.queryByText(SETTINGS_HEADING)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Pengaturan/ })).not.toBeInTheDocument();
  });

  it('state kosong tanpa form untuk yang bukan Super Admin', async () => {
    get.mockResolvedValue({ data: { data: dashboard({ enabled: false, url: null }) } });
    renderPage();

    expect(await screen.findByText(/belum dikonfigurasi/i)).toBeInTheDocument();
    expect(screen.queryByText(SETTINGS_HEADING)).not.toBeInTheDocument();
    expect(screen.queryByTitle('Dashboard Keuangan SD Padindi')).not.toBeInTheDocument();
  });

  it('tidak merender iframe bila URL dari server tidak valid', async () => {
    get.mockResolvedValue({ data: { data: dashboard({ url: 'https://evil.example.com/embed/reporting/x' }) } });
    renderPage();

    expect(await screen.findByText(/belum dikonfigurasi/i)).toBeInTheDocument();
    expect(screen.queryByTitle('Dashboard Keuangan SD Padindi')).not.toBeInTheDocument();
  });

  describe('Super Admin (API mengirim config)', () => {
    const config = { enabled: false, title: 'Dashboard Keuangan', url: '' };
    beforeEach(() => get.mockResolvedValue({ data: { data: dashboard({ enabled: false, url: null, config }) } }));

    it('menampilkan form dan menyimpan URL dari tag iframe sebagai src saja', async () => {
      put.mockResolvedValue({ data: { message: 'ok' } });
      renderPage();
      await screen.findByText(SETTINGS_HEADING);

      await userEvent.click(screen.getByLabelText(/Aktifkan dashboard/));
      await userEvent.click(screen.getByLabelText(/URL Embed/));
      await userEvent.paste(`<iframe width="600" height="1500" src="${OK}" frameborder="0"></iframe>`);
      await userEvent.click(screen.getByRole('button', { name: /Simpan Pengaturan/ }));

      await waitFor(() =>
        expect(put).toHaveBeenCalledWith('/admin/finance-dashboard', { enabled: true, title: 'Dashboard Keuangan', url: OK }),
      );
    });

    it('menolak URL tidak valid tanpa memanggil API', async () => {
      renderPage();
      await screen.findByText(SETTINGS_HEADING);

      await userEvent.click(screen.getByLabelText(/URL Embed/));
      await userEvent.paste('https://evil.example.com/embed/reporting/abc');
      await userEvent.click(screen.getByRole('button', { name: /Simpan Pengaturan/ }));

      expect(await screen.findByRole('alert')).toHaveTextContent(/URL embed tidak valid/);
      expect(put).not.toHaveBeenCalled();
    });
  });
});
