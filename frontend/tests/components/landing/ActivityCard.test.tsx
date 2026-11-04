/**
 * Pengujian unit untuk ActivityCard.
 * US-L3: kartu kegiatan menampilkan data dengan benar.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ActivityCard } from '@/features/public/components/ActivityCard';

describe('ActivityCard', () => {
  const baseProps = {
    title: 'Kegiatan belajar bersama',
    excerpt: 'Ringkasan kegiatan.',
    publishedAt: '2026-10-15T07:00:00+07:00',
    index: 0,
    cardNumber: 1,
    total: 6,
  };

  it('US-L3: menampilkan judul kartu', () => {
    render(<ActivityCard {...baseProps} />);
    expect(screen.getByText('Kegiatan belajar bersama')).toBeInTheDocument();
  });

  it('US-L3: format tanggal Indonesia tampil dengan benar', () => {
    render(<ActivityCard {...baseProps} />);
    // "15 Oktober 2026" dalam format id-ID
    const timeEl = screen.getByRole('time') as HTMLTimeElement;
    expect(timeEl).toBeInTheDocument();
    // Nilai dateTime harus cocok dengan ISO asli
    expect(timeEl.getAttribute('dateTime')).toBe('2026-10-15T07:00:00+07:00');
    // Teks tampilan berisi nama bulan Indonesia
    expect(timeEl.textContent).toMatch(/Oktober/i);
  });

  it('US-L3: menampilkan ringkasan bila ada', () => {
    render(<ActivityCard {...baseProps} />);
    expect(screen.getByText('Ringkasan kegiatan.')).toBeInTheDocument();
  });

  it('US-L3: TIDAK merender tautan bila href kosong', () => {
    render(<ActivityCard {...baseProps} href={undefined} />);
    // Tidak ada elemen <a> yang membungkus kartu
    const links = screen.queryAllByRole('link');
    expect(links).toHaveLength(0);
  });

  it('US-L3: merender tautan bila href ada', () => {
    render(<ActivityCard {...baseProps} href="/kegiatan/test" />);
    const link = screen.getByRole('link', { name: 'Kegiatan belajar bersama' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/kegiatan/test');
  });

  it('US-L3: kartu punya aria-label yang benar (n dari total)', () => {
    render(<ActivityCard {...baseProps} cardNumber={2} total={6} />);
    const card = screen.getByRole('group');
    expect(card).toHaveAttribute('aria-label', '2 dari 6');
  });

  it('US-L3: dua kartu pertama tidak lazy-load', () => {
    const { container } = render(
      <ActivityCard {...baseProps} index={0} coverUrl="https://example.com/img.jpg" coverAlt="Foto" />,
    );
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).not.toHaveAttribute('loading', 'lazy');
  });

  it('US-L3: kartu ketiga dan seterusnya lazy-load', () => {
    const { container } = render(
      <ActivityCard {...baseProps} index={2} coverUrl="https://example.com/img.jpg" coverAlt="Foto" />,
    );
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('US-L3: slide role dan roledescription sudah benar', () => {
    render(<ActivityCard {...baseProps} />);
    const card = screen.getByRole('group');
    expect(card).toHaveAttribute('aria-roledescription', 'slide');
  });
});

