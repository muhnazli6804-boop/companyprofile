import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { RegistrationInfoPage } from '@/features/public/pages/RegistrationInfoPage';
import { VacancyListPage } from '@/features/public/pages/VacancyListPage';
import { PrivacyPolicyPage } from '@/features/public/pages/PrivacyPolicyPage';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Halaman Informasi Publik', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { apiClient } = await import('@/lib/api-client');

    vi.mocked(apiClient.get).mockImplementation((url: string) => {
      if (url === '/public/registration-info') {
        return Promise.resolve({
          data: {
            data: {
              active_period: {
                id: 1,
                name: 'PPDB 2027/2028 Gelombang 1',
                academic_year: '2027/2028',
                wave: 1,
                opens_at: '2027-01-01T08:00:00Z',
                closes_at: '2027-02-28T23:59:00Z',
                announcement_at: '2027-03-10T09:00:00Z',
                registration_fee: 150000,
                is_open: true,
              },
              units: [
                {
                  id: 1,
                  code: 'SD-PADINDI',
                  name: 'SD Padindi',
                  slug: 'sd-padindi',
                  level: 'sd',
                  quota: 60,
                  filled: 25,
                  is_full: false,
                  required_documents: [
                    {
                      document_type: 'family_card',
                      label: 'Kartu Keluarga',
                      description: 'Salinan KK terbaru',
                      is_required: true,
                      max_size_kb: 2048,
                      allowed_mimes: 'pdf,jpg',
                    },
                  ],
                },
              ],
              next_steps: {
                student_test_info: 'Observasi pemetaan potensi dilakukan di sekolah.',
                teacher_interview_info: 'Wawancara via online.',
              },
            },
          },
        });
      }

      if (url === '/public/vacancies') {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 1,
                title: 'Guru Matematika SMP',
                slug: 'guru-matematika-smp',
                subject: 'Matematika',
                employment_type: 'full_time',
                description: 'Mengajar matematika tingkat kelas 7-9.',
                requirements: 'S1 Pendidikan Matematika, IPK min 3.25',
                quota: 2,
                opens_at: '2026-11-01T00:00:00Z',
                closes_at: '2026-12-31T23:59:00Z',
                education_unit: {
                  id: 2,
                  name: 'SMP Padindi',
                  level: 'smp',
                  slug: 'smp-padindi',
                },
              },
            ],
          },
        });
      }

      if (url === '/public/pages/kebijakan-privasi') {
        return Promise.reject(new Error('Not found'));
      }

      if (url === '/public/settings') {
        return Promise.resolve({
          data: {
            data: {
              site_name: 'Yayasan Padindi',
              contact_phone: '021-5550100',
              contact_email: 'info@padindi.sch.id',
            },
          },
        });
      }

      return Promise.resolve({ data: { data: [] } });
    });
  });

  it('RegistrationInfoPage menampilkan periode aktif, kuota, persyaratan berkas, dan jadwal', async () => {
    renderWithClient(<RegistrationInfoPage />);

    // Header & Hero
    expect(screen.getByText('Penerimaan Peserta Didik Baru (PPDB)')).toBeInTheDocument();
    expect(await screen.findByText('PPDB 2027/2028 Gelombang 1')).toBeInTheDocument();

    // Kuota Unit (tampil di kartu unit dan tab selector)
    expect((await screen.findAllByText('SD Padindi')).length).toBeGreaterThan(0);
    expect(screen.getByText(/Terisi:/)).toBeInTheDocument();

    // Persyaratan berkas
    expect(await screen.findByText('Kartu Keluarga')).toBeInTheDocument();
    expect(screen.getByText('Salinan KK terbaru')).toBeInTheDocument();

    // CTA
    expect(screen.getByText('Daftar PPDB Sekarang')).toBeInTheDocument();
  });

  it('VacancyListPage menampilkan daftar lowongan guru dan alur rekrutmen', async () => {
    renderWithClient(<VacancyListPage />);

    expect(screen.getByText('Bergabung Bersama Yayasan Padindi')).toBeInTheDocument();
    expect(await screen.findByText('Guru Matematika SMP')).toBeInTheDocument();
    expect(screen.getByText(/Penuh Waktu/)).toBeInTheDocument();
    expect(screen.getByText(/S1 Pendidikan Matematika/)).toBeInTheDocument();
    expect(screen.getByText('Lamar Sekarang')).toBeInTheDocument();
    expect(screen.getByText('Alur & Tahapan Rekrutmen Guru')).toBeInTheDocument();
  });

  it('PrivacyPolicyPage menampilkan kebijakan privasi resmi yang lengkap dan informatif', async () => {
    renderWithClient(<PrivacyPolicyPage />);

    expect(screen.getByRole('heading', { name: 'Kebijakan Privasi', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Kepatuhan UU No. 27 Tahun 2022/)).toBeInTheDocument();
    expect(screen.getByText(/Data Pribadi yang Kami Kumpulkan/)).toBeInTheDocument();
    expect(screen.getByText(/Tujuan Penggunaan & Pemrosesan Data/)).toBeInTheDocument();
    expect(screen.getByText(/Keamanan dan Penyimpanan Data/)).toBeInTheDocument();
    expect(screen.getByText(/Hubungi Petugas Pelindungan Data/)).toBeInTheDocument();
  });
});
