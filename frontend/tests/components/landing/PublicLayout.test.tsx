/**
 * Pengujian unit untuk PublicLayout (Navbar).
 * US-L6: menu mobile membuka/menutup, Escape menutup.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PublicLayout } from '@/layouts/PublicLayout';

// Mock Outlet
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Konten halaman</div>,
  };
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderLayout(path = '/') {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <PublicLayout />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('PublicLayout — Navbar', () => {
  it('US-L6: tautan "Lompat ke konten utama" ada di awal', () => {
    renderLayout();
    expect(
      screen.getByRole('link', { name: /Lompat ke konten utama/i }),
    ).toBeInTheDocument();
  });

  it('US-L6: tombol menu mobile ada', () => {
    renderLayout();
    const menuBtn = screen.getByRole('button', { name: /Buka menu navigasi/i });
    expect(menuBtn).toBeInTheDocument();
  });

  it('US-L6: menu mobile membuka saat tombol diklik', () => {
    renderLayout();
    const menuBtn = screen.getByRole('button', { name: /Buka menu navigasi/i });
    fireEvent.click(menuBtn);
    // aria-expanded seharusnya true
    expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
    // Menu tampil
    expect(
      screen.getByRole('navigation', { name: /Menu navigasi mobile/i }),
    ).toBeInTheDocument();
  });

  it('US-L6: menu mobile menutup saat tombol diklik lagi', () => {
    renderLayout();
    const menuBtn = screen.getByRole('button', { name: /Buka menu navigasi/i });
    fireEvent.click(menuBtn); // buka
    expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('navigation', { name: /Menu navigasi mobile/i }),
    ).toBeInTheDocument();

    fireEvent.click(menuBtn); // tutup
    expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('navigation', { name: /Menu navigasi mobile/i }),
    ).not.toBeInTheDocument();
  });

  it('US-L6: Escape menutup menu mobile', () => {
    renderLayout();
    const menuBtn = screen.getByRole('button', { name: /Buka menu navigasi/i });
    fireEvent.click(menuBtn); // buka
    expect(
      screen.getByRole('navigation', { name: /Menu navigasi mobile/i }),
    ).toBeInTheDocument();

    // Tekan Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(
      screen.queryByRole('navigation', { name: /Menu navigasi mobile/i }),
    ).not.toBeInTheDocument();
  });

  it('US-L6: wordmark "Yayasan Padindi" ada di navbar', () => {
    renderLayout();
    expect(
      screen.getByRole('link', { name: /Yayasan Padindi/i }),
    ).toBeInTheDocument();
  });

  it('US-L6: footer berisi hak cipta', () => {
    renderLayout();
    const footer = screen.getByRole('contentinfo');
    expect(footer.textContent).toContain('Yayasan Padindi');
  });
});
