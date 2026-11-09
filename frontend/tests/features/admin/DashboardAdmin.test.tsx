import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { DashboardAdminPage } from '@/features/admin/dashboard/pages/DashboardAdminPage';

vi.mock('@/lib/api-client', () => ({
  apiClient: { get: vi.fn() },
}));

const mockApi = vi.mocked(apiClient);

const mockDashboardData = {
  data: {
    stats: {
      total_students: 45,
      total_teachers: 12,
      pending_students: 8,
      pending_teachers: 3,
      accepted_students: 25,
      accepted_teachers: 5,
    },
    student_monthly: [
      { month: 'Jun', count: 5 },
      { month: 'Jul', count: 12 },
      { month: 'Agu', count: 18 },
      { month: 'Sep', count: 6 },
      { month: 'Okt', count: 4 },
      { month: 'Nov', count: 0 },
    ],
    teacher_monthly: [
      { month: 'Jun', count: 2 },
      { month: 'Jul', count: 4 },
      { month: 'Agu', count: 3 },
      { month: 'Sep', count: 2 },
      { month: 'Okt', count: 1 },
      { month: 'Nov', count: 0 },
    ],
    student_status_distribution: [
      { status: 'submitted', label: 'Terkirim', count: 8 },
      { status: 'accepted', label: 'Diterima', count: 25 },
      { status: 'rejected', label: 'Ditolak', count: 12 },
    ],
    recent_activities: [
      {
        id: 1,
        type: 'student' as const,
        name: 'Ahmad Fauzi',
        from_status: 'submitted',
        to_status: 'accepted',
        note: 'Berkas lengkap dan sesuai',
        changed_by: 'Budi Admin',
        created_at: new Date().toISOString(),
      },
    ],
    recent_registrations: [
      {
        id: 1,
        type: 'student' as const,
        registration_number: 'PPDB-2026-00001',
        name: 'Ahmad Fauzi',
        date: '2026-11-09',
        status: 'accepted',
        status_label: 'Diterima',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        type: 'teacher' as const,
        registration_number: 'TCH-2026-00001',
        name: 'Siti Rahma',
        date: '2026-11-09',
        status: 'submitted',
        status_label: 'Terkirim',
        created_at: new Date().toISOString(),
      },
    ],
  },
};

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DashboardAdminPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('DashboardAdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('menampilkan statistik utama di dashboard', async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockDashboardData });
    renderComponent();

    expect(await screen.findByText('Dashboard Administrator')).toBeInTheDocument();
    expect(screen.getByText('Total Pendaftar Murid')).toBeInTheDocument();
    expect(screen.getAllByText('45').length).toBeGreaterThan(0);
    expect(screen.getByText('Total Pelamar Guru')).toBeInTheDocument();
    expect(screen.getAllByText('12').length).toBeGreaterThan(0);
    expect(screen.getByText('Murid Perlu Verifikasi')).toBeInTheDocument();
    expect(screen.getByText('Guru Menunggu Seleksi')).toBeInTheDocument();
  });

  it('menampilkan tabel pendaftaran dan lamaran terbaru', async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockDashboardData });
    renderComponent();

    expect(await screen.findByText('PPDB-2026-00001')).toBeInTheDocument();
    expect(screen.getAllByText('Ahmad Fauzi').length).toBeGreaterThan(0);
    expect(screen.getByText('TCH-2026-00001')).toBeInTheDocument();
    expect(screen.getAllByText('Siti Rahma').length).toBeGreaterThan(0);
  });

  it('menampilkan penanganan kesalahan saat API gagal', async () => {
    mockApi.get.mockRejectedValueOnce(new Error('Network error'));
    renderComponent();

    expect(await screen.findByText('Gagal Memuat Dashboard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Coba Lagi' })).toBeInTheDocument();
  });
});
