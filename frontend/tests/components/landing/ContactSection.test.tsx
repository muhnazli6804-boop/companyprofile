/**
 * Pengujian unit untuk ContactSection.
 * US-L4: baris kosong tidak dirender; href tel:, mailto:, wa.me benar.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ContactSection } from '@/features/public/components/ContactSection';
import type { SiteSettings } from '@/features/public/types';

const fullSettings: SiteSettings = {
  site_name: 'Yayasan Padindi',
  contact_phone: '+6221 1234567',
  contact_whatsapp: '6281234567890',
  contact_email: 'info@padindi.sch.id',
  contact_address: 'Jl. Contoh No. 1, Jakarta',
  contact_hours: 'Senin–Jumat, 07.30–15.00 WIB',
  social_instagram: 'https://instagram.com/padindi',
};

describe('ContactSection', () => {
  it('US-L4: merender nomor telepon', () => {
    render(<ContactSection settings={fullSettings} />);
    expect(screen.getByText('+6221 1234567')).toBeInTheDocument();
  });

  it('US-L4: href telepon menggunakan skema tel:', () => {
    render(<ContactSection settings={fullSettings} />);
    const telLink = screen.getByRole('link', { name: '+6221 1234567' });
    // Hapus spasi dan tanda baca
    expect(telLink.getAttribute('href')).toBe('tel:+62211234567');
  });

  it('US-L4: href email menggunakan skema mailto:', () => {
    render(<ContactSection settings={fullSettings} />);
    const emailLink = screen.getByRole('link', { name: 'info@padindi.sch.id' });
    expect(emailLink.getAttribute('href')).toBe('mailto:info@padindi.sch.id');
  });

  it('US-L4: href WhatsApp menggunakan wa.me', () => {
    render(<ContactSection settings={fullSettings} />);
    const waLink = screen.getByRole('link', { name: /Chat WhatsApp/i });
    expect(waLink.getAttribute('href')).toBe('https://wa.me/6281234567890');
  });

  it('US-L4: TIDAK merender baris telepon bila kosong', () => {
    render(
      <ContactSection
        settings={{ ...fullSettings, contact_phone: undefined }}
      />,
    );
    expect(screen.queryByRole('link', { name: /\+6221/i })).not.toBeInTheDocument();
  });

  it('US-L4: TIDAK merender baris WhatsApp bila kosong', () => {
    render(
      <ContactSection
        settings={{ ...fullSettings, contact_whatsapp: undefined }}
      />,
    );
    expect(screen.queryByRole('link', { name: /Chat WhatsApp/i })).not.toBeInTheDocument();
  });

  it('US-L4: TIDAK merender baris email bila kosong', () => {
    render(
      <ContactSection
        settings={{ ...fullSettings, contact_email: undefined }}
      />,
    );
    expect(screen.queryByRole('link', { name: /info@/i })).not.toBeInTheDocument();
  });

  it('US-L4: merender Instagram bila ada', () => {
    render(<ContactSection settings={fullSettings} />);
    expect(screen.getByRole('link', { name: /Instagram/i })).toBeInTheDocument();
  });

  it('US-L4: TIDAK merender Instagram bila kosong', () => {
    render(
      <ContactSection
        settings={{ ...fullSettings, social_instagram: undefined }}
      />,
    );
    expect(screen.queryByRole('link', { name: /Instagram/i })).not.toBeInTheDocument();
  });

  it('US-L4: tautan eksternal media sosial punya rel="noopener noreferrer"', () => {
    render(<ContactSection settings={fullSettings} />);
    const igLink = screen.getByRole('link', { name: /Instagram/i });
    expect(igLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(igLink).toHaveAttribute('target', '_blank');
  });

  it('US-L4: menampilkan jam layanan', () => {
    render(<ContactSection settings={fullSettings} />);
    expect(screen.getByText('Senin–Jumat, 07.30–15.00 WIB')).toBeInTheDocument();
  });

  it('US-L4: menampilkan alamat', () => {
    render(<ContactSection settings={fullSettings} />);
    const addresses = screen.getAllByText('Jl. Contoh No. 1, Jakarta');
    expect(addresses.length).toBeGreaterThanOrEqual(1);
    expect(addresses[0]).toBeInTheDocument();
  });
});

