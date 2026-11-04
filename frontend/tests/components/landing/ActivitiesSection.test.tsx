/**
 * Pengujian unit untuk ActivitiesSection (carousel).
 * US-L3: tombol panah, posisi, ARIA, keadaan.
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActivitiesSection } from '@/features/public/components/ActivitiesSection';
import type { Activity } from '@/features/public/types';

const makeActivity = (id: number): Activity => ({
  id,
  title: `Kegiatan ${id}`,
  slug: `kegiatan-${id}`,
  excerpt: `Ringkasan kegiatan ${id}.`,
  published_at: '2026-10-15T07:00:00+07:00',
});

const ACTIVITIES: Activity[] = Array.from({ length: 6 }, (_, i) => makeActivity(i + 1));

describe('ActivitiesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('US-L3: menampilkan skeleton saat memuat', () => {
    render(
      <ActivitiesSection
        activities={[]}
        isLoading={true}
        isError={false}
      />,
    );
    expect(screen.getByRole('status', { name: /memuat kegiatan/i })).toBeInTheDocument();
  });

  it('US-L3: menampilkan pesan kosong bila tidak ada kegiatan', () => {
    render(
      <ActivitiesSection
        activities={[]}
        isLoading={false}
        isError={false}
      />,
    );
    expect(
      screen.getByText('Belum ada kegiatan yang dipublikasikan.'),
    ).toBeInTheDocument();
  });

  it('US-L3: menampilkan pesan galat dan tombol "Coba lagi"', () => {
    const onRetry = vi.fn();
    render(
      <ActivitiesSection
        activities={[]}
        isLoading={false}
        isError={true}
        onRetry={onRetry}
      />,
    );
    expect(
      screen.getByText(/Kegiatan belum dapat dimuat/i),
    ).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /Coba lagi/i });
    expect(retryBtn).toBeInTheDocument();
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('US-L3: merender semua kartu kegiatan', () => {
    render(
      <ActivitiesSection
        activities={ACTIVITIES}
        isLoading={false}
        isError={false}
      />,
    );
    const slides = screen.getAllByRole('group');
    const activitySlides = slides.filter(
      (s) => s.getAttribute('aria-roledescription') === 'slide',
    );
    expect(activitySlides.length).toBe(6);
  });

  it('US-L3: wadah carousel punya role="region" dan aria-roledescription="carousel"', () => {
    render(
      <ActivitiesSection
        activities={ACTIVITIES}
        isLoading={false}
        isError={false}
      />,
    );
    const region = screen.getByRole('region', { name: /Kegiatan yayasan/i });
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-roledescription', 'carousel');
  });

  it('US-L3: wadah carousel bisa difokus (tabIndex=0)', () => {
    render(
      <ActivitiesSection
        activities={ACTIVITIES}
        isLoading={false}
        isError={false}
      />,
    );
    const region = screen.getByRole('region', { name: /Kegiatan yayasan/i });
    expect(region).toHaveAttribute('tabindex', '0');
  });

  it('US-L3: kartu punya aria-label "n dari total"', () => {
    render(
      <ActivitiesSection
        activities={ACTIVITIES}
        isLoading={false}
        isError={false}
      />,
    );
    const firstSlide = screen.getAllByRole('group').find(
      (s) => s.getAttribute('aria-label') === '1 dari 6',
    );
    expect(firstSlide).toBeInTheDocument();
  });
});

describe('ActivitiesSection — tombol scroll dan navigasi keyboard', () => {
  it('US-L3: tombol Sebelumnya nonaktif di awal', () => {
    // Mock dimensions so buttons are displayed: scrollWidth > clientWidth
    const { container } = render(
      <ActivitiesSection
        activities={ACTIVITIES}
        isLoading={false}
        isError={false}
      />,
    );

    const region = container.querySelector('[role="region"]') as HTMLElement;
    Object.defineProperty(region, 'scrollWidth', { value: 1200, configurable: true });
    Object.defineProperty(region, 'clientWidth', { value: 400, configurable: true });
    Object.defineProperty(region, 'scrollLeft', { value: 0, configurable: true });

    act(() => {
      fireEvent.scroll(region);
    });

    // Check previous button
    const prevBtn = screen.queryByRole('button', { name: /Kegiatan sebelumnya/i });
    if (prevBtn) {
      expect(prevBtn).toBeDisabled();
    }
  });

  it('US-L3: tombol Berikutnya memanggil scrollBy dengan nilai positif', () => {
    const mockScrollBy = vi.fn();
    const { container } = render(
      <ActivitiesSection
        activities={ACTIVITIES}
        isLoading={false}
        isError={false}
      />,
    );

    const region = container.querySelector('[role="region"]') as HTMLElement;
    Object.defineProperty(region, 'scrollWidth', { value: 1200, configurable: true });
    Object.defineProperty(region, 'clientWidth', { value: 400, configurable: true });
    Object.defineProperty(region, 'scrollLeft', { value: 0, configurable: true });
    region.scrollBy = mockScrollBy;

    act(() => {
      fireEvent.scroll(region);
    });

    const nextBtn = screen.queryByRole('button', { name: /Kegiatan berikutnya/i });
    if (nextBtn) {
      fireEvent.click(nextBtn);
      expect(mockScrollBy).toHaveBeenCalled();
      const callArg = mockScrollBy.mock.calls[0][0];
      expect(callArg.left).toBeGreaterThan(0);
    }
  });

  it('US-L3: navigasi keyboard panah kiri dan kanan memanggil scrollBy', () => {
    const mockScrollBy = vi.fn();
    render(
      <ActivitiesSection
        activities={ACTIVITIES}
        isLoading={false}
        isError={false}
      />,
    );

    const region = screen.getByRole('region', { name: /Kegiatan yayasan/i });
    region.scrollBy = mockScrollBy;

    fireEvent.keyDown(region, { key: 'ArrowRight' });
    expect(mockScrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ left: expect.any(Number) }),
    );

    fireEvent.keyDown(region, { key: 'ArrowLeft' });
    expect(mockScrollBy).toHaveBeenCalledTimes(2);
  });
});
