import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import FinancePage from './FinancePage';

vi.mock('@/lib/api-client', () => ({ apiClient: { get: vi.fn() } }));
const get = vi.mocked(apiClient.get) as unknown as ReturnType<typeof vi.fn>;

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
  beforeEach(() => get.mockReset());

  it('menampilkan iframe ber-sandbox dan no-referrer saat URL tersedia', async () => {
    const url = 'https://lookerstudio.google.com/embed/reporting/abc';
    get.mockResolvedValue({ data: { data: { enabled: true, title: 'Dashboard Keuangan', url } } });
    renderPage();

    const frame = await screen.findByTitle('Dashboard Keuangan');
    expect(frame).toHaveAttribute('src', url);
    expect(frame.getAttribute('sandbox')).toContain('allow-scripts');
    expect(frame).toHaveAttribute('referrerpolicy', 'no-referrer');
    expect(screen.getByText('Buka di tab baru')).toBeInTheDocument();
  });

  it('menampilkan pesan belum dikonfigurasi saat URL kosong', async () => {
    get.mockResolvedValue({ data: { data: { enabled: false, title: 'Dashboard Keuangan', url: null } } });
    renderPage();

    expect(await screen.findByText(/belum dikonfigurasi/i)).toBeInTheDocument();
    expect(screen.queryByTitle('Dashboard Keuangan')).not.toBeInTheDocument();
  });
});
