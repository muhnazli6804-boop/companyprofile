/**
 * Pengujian unit untuk MapEmbed.
 * US-L5: peta atau fallback tampil dengan benar.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MapEmbed } from '@/features/public/components/MapEmbed';

describe('MapEmbed', () => {
  it('US-L5: merender iframe untuk embedUrl Google Maps yang valid', () => {
    const embedUrl = 'https://www.google.com/maps/embed?pb=test123';
    render(<MapEmbed embedUrl={embedUrl} address="Jl. Contoh No. 1, Jakarta" />);
    const iframe = screen.getByTitle('Peta lokasi Yayasan Padindi');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', embedUrl);
  });

  it('US-L5: merender iframe untuk embedUrl OpenStreetMap yang valid', () => {
    const embedUrl = 'https://www.openstreetmap.org/export/embed.html?bbox=test';
    render(<MapEmbed embedUrl={embedUrl} address="Jl. Contoh No. 1" />);
    const iframe = screen.getByTitle('Peta lokasi Yayasan Padindi');
    expect(iframe).toBeInTheDocument();
  });

  it('US-L5: TIDAK merender iframe bila embedUrl kosong (fallback)', () => {
    render(<MapEmbed embedUrl="" address="Jl. Contoh No. 1, Jakarta" />);
    expect(screen.queryByTitle('Peta lokasi Yayasan Padindi')).not.toBeInTheDocument();
    // Fallback: tampilkan alamat
    expect(screen.getByText('Jl. Contoh No. 1, Jakarta')).toBeInTheDocument();
  });

  it('US-L5: TIDAK merender iframe bila embedUrl tidak diisi (undefined)', () => {
    render(<MapEmbed address="Jl. Contoh" />);
    expect(screen.queryByTitle('Peta lokasi Yayasan Padindi')).not.toBeInTheDocument();
  });

  it('US-L5: TIDAK merender iframe bila host asing (bukan Google/OSM)', () => {
    render(<MapEmbed embedUrl="https://evil.com/maps/embed" address="Jl. Contoh" />);
    expect(screen.queryByTitle('Peta lokasi Yayasan Padindi')).not.toBeInTheDocument();
  });

  it('US-L5: TIDAK merender iframe bila skema bukan https', () => {
    render(
      <MapEmbed
        embedUrl="http://www.google.com/maps/embed?pb=test"
        address="Jl. Contoh"
      />,
    );
    expect(screen.queryByTitle('Peta lokasi Yayasan Padindi')).not.toBeInTheDocument();
  });

  it('US-L5: tombol "Buka di Google Maps" selalu ada', () => {
    render(<MapEmbed address="Jl. Contoh No. 1, Jakarta" />);
    const btn = screen.getByRole('link', { name: /Buka di Google Maps/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('target', '_blank');
    expect(btn).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('US-L5: tombol "Buka di Google Maps" ada meski iframe valid', () => {
    render(
      <MapEmbed
        embedUrl="https://www.google.com/maps/embed?pb=test"
        address="Jl. Contoh No. 1, Jakarta"
      />,
    );
    expect(screen.getByRole('link', { name: /Buka di Google Maps/i })).toBeInTheDocument();
  });

  it('US-L5: href tombol "Buka di Google Maps" meng-encode alamat dengan benar', () => {
    render(<MapEmbed address="Jl. Contoh No. 1, Jakarta" />);
    const btn = screen.getByRole('link', { name: /Buka di Google Maps/i });
    expect(btn.getAttribute('href')).toContain(
      encodeURIComponent('Jl. Contoh No. 1, Jakarta'),
    );
  });

  it('US-L5: iframe punya atribut sandbox yang benar', () => {
    render(
      <MapEmbed
        embedUrl="https://www.google.com/maps/embed?pb=test"
        address="Jl. Contoh"
      />,
    );
    const iframe = screen.getByTitle('Peta lokasi Yayasan Padindi');
    expect(iframe).toHaveAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-popups',
    );
  });
});

