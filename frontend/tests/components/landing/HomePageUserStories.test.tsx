/**
 * Pengujian User Story US-L1, US-L2, dan US-L7 pada HomePage.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomePage } from '@/features/public/pages/HomePage';
import { mockSettings } from '@/features/public/mocks/settings.mock';

function renderHomePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('HomePage — User Stories Acceptance', () => {
  it('US-L1: Hero dan bagian "Tentang yayasan" tampil di halaman "/" tanpa login dan tanpa klik tambahan', async () => {
    renderHomePage();

    // Hero: h1 tampil langsung
    const heroHeading = screen.getByRole('heading', { level: 1 });
    expect(heroHeading).toBeInTheDocument();

    // Bagian "Tentang yayasan": h2 tampil langsung
    await waitFor(() => {
      const aboutHeading = screen.getByRole('heading', {
        level: 2,
        name: 'Tentang yayasan',
      });
      expect(aboutHeading).toBeInTheDocument();
    });

    // Konten tentang yayasan tampil dari data mock
    expect(
      screen.getByText(/Yayasan Padindi adalah lembaga pendidikan swasta/i),
    ).toBeInTheDocument();
  });

  it('US-L2: Visi dan misi tampil dengan misi sebagai daftar berurutan (ol) dan visi sebagai paragraf', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 2, name: 'Visi dan misi' }),
      ).toBeInTheDocument();
    });

    // Visi
    expect(screen.getByRole('heading', { level: 3, name: 'Visi' })).toBeInTheDocument();
    expect(screen.getByText(mockSettings.vision!)).toBeInTheDocument();

    // Misi sebagai daftar berurutan (ol)
    expect(screen.getByRole('heading', { level: 3, name: 'Misi' })).toBeInTheDocument();
    const lists = screen.getAllByRole('list');
    const olList = lists.find((l) => l.tagName.toLowerCase() === 'ol');
    expect(olList).toBeDefined();
    expect(olList?.tagName.toLowerCase()).toBe('ol');

    // Setiap butir misi tampil
    mockSettings.mission!.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('US-L7: Konten profil, visi, misi, dan kontak berasal dari data mock (bukan hardcoded fakta)', async () => {
    renderHomePage();

    await waitFor(() => {
      // Data bertanda [Contoh] sesuai aturan batas data faktual
      expect(screen.getByText(mockSettings.vision!)).toBeInTheDocument();
      expect(screen.getByText(mockSettings.contact_phone!)).toBeInTheDocument();
      expect(screen.getByText(mockSettings.contact_email!)).toBeInTheDocument();
    });
  });
});
