import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import DashboardAdminPage from './DashboardAdminPage';
import type { DashboardData } from '../types';

vi.mock('@/lib/api-client', () => ({ apiClient: { get: vi.fn() } }));
const get = vi.mocked(apiClient.get) as unknown as ReturnType<typeof vi.fn>;

const DATA: DashboardData = {
  period: { id: 1, name: 'PPDB 2027 Gel. 1', academic_year: '2027/2028', wave: 1, is_active: true },
  periods: [
    { id: 1, name: 'PPDB 2027 Gel. 1', is_active: true },
    { id: 2, name: 'PPDB 2026 Gel. 2', is_active: false },
  ],
  totals: { students: 12, teachers: 5 },
  status_counts: {
    students: { submitted: 4, in_review: 0, revision_required: 0, verified: 3, accepted: 5, rejected: 0, waitlisted: 0 },
    teachers: { submitted: 2, administrative_review: 0, interview_test: 1, passed: 2, failed: 0, reserve: 0 },
  },
  per_unit: [{ education_unit_id: 1, name: 'SD Padindi', students: 8, teachers: 3 }],
  quota: [{ education_unit_id: 1, name: 'SD Padindi', quota: 100, filled: 5, remaining: 95 }],
  new_applicants: Array.from({ length: 7 }, (_, i) => ({ date: `2026-11-0${i + 1}`, students: i === 6 ? 3 : 0, teachers: 0 })),
  unread_contact_messages: 7,
  documents_pending: 9,
};

const ok = (data: DashboardData) => Promise.resolve({ data: { data } });

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DashboardAdminPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DashboardAdminPage', () => {
  it('menampilkan keadaan memuat lebih dulu', () => {
    get.mockReturnValue(new Promise(() => {}));
    renderPage();

    expect(screen.getByLabelText('Memuat dashboard')).toBeInTheDocument();
  });

  it('menampilkan kartu ringkas dengan angka, keterangan, dan tautan', async () => {
    get.mockReturnValue(ok(DATA));
    renderPage();

    const card = (name: string) => screen.getByText(name).closest('div')!;
    await screen.findByText('Pendaftar siswa');
    expect(within(card('Pendaftar siswa')).getByText('12')).toBeInTheDocument();
    expect(within(card('Pendaftar siswa')).getByRole('link', { name: 'Lihat status siswa' })).toHaveAttribute('href', '#status-siswa');
    expect(within(card('Pelamar guru')).getByText('Semua periode')).toBeInTheDocument();
    expect(within(card('Dokumen menunggu verifikasi')).getByText('9')).toBeInTheDocument();
    expect(within(card('Dokumen menunggu verifikasi')).getByText('Perlu tindakan')).toBeInTheDocument();
    expect(within(card('Pesan kontak baru')).getByText('7')).toBeInTheDocument();
    expect(within(card('Pesan kontak baru')).getByText('Belum dibaca')).toBeInTheDocument();
    expect(within(card('Pesan kontak baru')).getByRole('link', { name: 'Buka pesan masuk' })).toHaveAttribute('href', '/admin/pesan-kontak');
  });

  it('pesan nol: keterangan "Tidak ada pesan baru"', async () => {
    get.mockReturnValue(ok({ ...DATA, unread_contact_messages: 0 }));
    renderPage();

    expect(await screen.findByText('Tidak ada pesan baru')).toBeInTheDocument();
  });

  it('urutan heading: satu H1, panel memakai H2', async () => {
    get.mockReturnValue(ok(DATA));
    renderPage();
    await screen.findByText('Pendaftar siswa');

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Pendaftar baru 7 hari terakhir', 'Unit pendidikan', 'Status pendaftar siswa', 'Status pelamar guru',
    ]);
  });

  it('panel status: label baru lewat StatusBadge, urutan benar, semua status tampil', async () => {
    get.mockReturnValue(ok(DATA));
    renderPage();
    const panel = (await screen.findByRole('heading', { name: 'Status pendaftar siswa' })).closest('section')!;

    expect(within(panel).getAllByTestId('status-badge').map((b) => b.textContent)).toEqual([
      'Terkirim', 'Sedang diverifikasi', 'Perlu revisi', 'Lolos verifikasi', 'Diterima', 'Daftar tunggu', 'Tidak diterima',
    ]);
    const teacher = screen.getByRole('heading', { name: 'Status pelamar guru' }).closest('section')!;
    expect(within(teacher).getAllByTestId('status-badge').map((b) => b.textContent)).toEqual([
      'Terkirim', 'Seleksi administrasi', 'Wawancara atau tes', 'Lolos', 'Cadangan', 'Tidak lolos',
    ]);
    expect(panel).toHaveAttribute('id', 'status-siswa');
    expect(within(panel).getByText('Total 12')).toBeInTheDocument();
    expect(within(teacher).getByText('Total 5 · semua periode')).toBeInTheDocument();
  });

  it('hitungan 0 tampil redup, hitungan > 0 tebal', async () => {
    get.mockReturnValue(ok(DATA));
    renderPage();
    const panel = (await screen.findByRole('heading', { name: 'Status pendaftar siswa' })).closest('section')!;
    const rows = within(panel).getAllByRole('listitem');

    expect(rows[4].lastElementChild).toHaveTextContent('5');
    expect(rows[4].lastElementChild).toHaveClass('font-bold', 'text-ink');
    expect(rows[1].lastElementChild).toHaveTextContent('0');
    expect(rows[1].lastElementChild).toHaveClass('text-muted');
    expect(rows[1].lastElementChild).not.toHaveClass('font-bold');
  });

  it('unit: jumlah pendaftar, teks kuota, dan bilah progres beratribut aria', async () => {
    get.mockReturnValue(ok(DATA));
    renderPage();
    await screen.findByText('Siswa 8 · Guru 3');

    expect(screen.getByText('5 dari 100, sisa 95')).toBeInTheDocument();
    const bar = screen.getByRole('progressbar', { name: 'Kuota SD Padindi' });
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '5');
  });

  it('grafik beraria-label: hanya hari berisi data, batang 0 tanpa label angka', async () => {
    get.mockReturnValue(ok(DATA));
    renderPage();
    const chart = await screen.findByRole('img', { name: /Pendaftar baru 7 hari terakhir/ });

    expect(chart).toHaveAccessibleName('Pendaftar baru 7 hari terakhir. 07/11: 3 siswa, 0 guru');
    expect(within(chart).getAllByText('3')).toHaveLength(1);
    expect(within(chart).queryByText('1')).not.toBeInTheDocument();
    expect(within(chart).getByText('07/11')).toBeInTheDocument();
  });

  it('pemilih periode berisi semua periode dan memuat ulang dengan registration_period_id', async () => {
    get.mockReturnValue(ok(DATA));
    renderPage();
    const select = await screen.findByLabelText('Periode');
    expect(get).toHaveBeenCalledWith('/admin/dashboard', { params: undefined });
    expect(select).toHaveValue('1');

    await userEvent.setup().selectOptions(select, '2');

    expect(get).toHaveBeenLastCalledWith('/admin/dashboard', { params: { registration_period_id: 2 } });
  });

  it('tanpa periode: pemberitahuan tampil, angka siswa 0, data guru tetap tampil', async () => {
    get.mockReturnValue(ok({ ...DATA, period: null, periods: [], totals: { students: 0, teachers: 5 } }));
    renderPage();

    expect(await screen.findByText(/Belum ada periode pendaftaran/)).toBeInTheDocument();
    expect(screen.getByText('Total 5 · semua periode')).toBeInTheDocument();
    expect(screen.queryByLabelText('Periode')).not.toBeInTheDocument();
  });

  it('menampilkan galat dan tombol coba lagi yang memuat ulang', async () => {
    get.mockRejectedValueOnce({ response: { status: 500, data: { message: 'Server bermasalah.' } } });
    get.mockReturnValue(ok(DATA));
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Server bermasalah.');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Coba lagi' }));

    expect(await screen.findByText('Pendaftar siswa')).toBeInTheDocument();
  });
});
