/**
 * Pengujian aksesibilitas otomatis (axe) pada HomePage.
 * US-L6: Tidak boleh ada pelanggaran axe serius atau kritis.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axe from 'axe-core';
import { HomePage } from '@/features/public/pages/HomePage';

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

describe('HomePage Accessibility (axe)', () => {
  it('US-L6: tidak ada pelanggaran axe serius atau kritis pada HomePage', async () => {
    const { container } = renderHomePage();

    // Jalankan axe pada container yang dirender
    const results = await axe.run(container, {
      rules: {
        // Abaikan rule region/landmark pada potongan komponen bila tidak dibungkus <main> di luar
        region: { enabled: false },
      },
    });

    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );

    if (seriousOrCritical.length > 0) {
      console.error(
        'Pelanggaran axe serius/kritis ditemukan:',
        JSON.stringify(seriousOrCritical, null, 2),
      );
    }

    expect(seriousOrCritical).toEqual([]);
  });
});
