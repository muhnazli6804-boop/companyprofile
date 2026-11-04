/**
 * ContactSection — bagian "Kontak" paling bawah halaman.
 * Sesuai prompt bagian 3.6, 5, dan user story US-L4, US-L5.
 *
 * - Latar Biru Dalam (navy), teks putih
 * - Dua kolom desktop: kiri daftar kontak, kanan peta
 * - Hanya tampilkan baris yang datanya ada (tanpa baris kosong)
 * - Tautan tel:, mailto:, wa.me
 * - Peta dengan MapEmbed (iframe atau fallback)
 * - Media sosial dengan ikon + teks
 */
import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
} from 'lucide-react';
import { MapEmbed } from './MapEmbed';
import type { SiteSettings } from '../types';

interface ContactSectionProps {
  settings: SiteSettings;
}

// Ikon media sosial SVG garis 1.75px serasi dengan lucide-react
const InstagramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    width={20}
    height={20}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    width={20}
    height={20}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    width={20}
    height={20}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
  </svg>
);

/** Format nomor telepon untuk href tel: (hapus spasi dan tanda baca) */
function toTelHref(phone: string): string {
  return 'tel:' + phone.replace(/[\s\-().]/g, '');
}

/** Format nomor WhatsApp untuk wa.me (nomor internasional tanpa +) */
function toWaHref(wa: string): string {
  // Hapus semua non-digit
  const num = wa.replace(/\D/g, '');
  return `https://wa.me/${num}`;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings }) => {
  const {
    contact_phone,
    contact_whatsapp,
    contact_email,
    contact_address,
    contact_hours,
    contact_map_embed_url,
    social_instagram,
    social_facebook,
    social_youtube,
  } = settings;

  const hasMap = true; // MapEmbed menangani fallback sendiri

  return (
    <section
      id="kontak"
      aria-labelledby="kontak-heading"
      className="bg-navy on-blue py-16 md:py-24"
      style={{ scrollMarginTop: '4rem' }}
    >
      <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">

          {/* Kolom kiri: info kontak */}
          <div className="flex flex-col gap-6">
            <div>
              <h2
                id="kontak-heading"
                className="font-display font-semibold text-2xl text-white mb-2"
              >
                Hubungi kami
              </h2>
              <p className="font-sans text-base text-white/80">
                Kami siap membantu menjawab pertanyaan Anda.
              </p>
            </div>

            <ul className="flex flex-col gap-4" aria-label="Daftar kontak">
              {/* Telepon */}
              {contact_phone && (
                <li className="flex items-start gap-3">
                  <Phone
                    size={20}
                    strokeWidth={1.75}
                    className="text-star flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <a
                    href={toTelHref(contact_phone)}
                    className="font-sans text-base text-white hover:text-star underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-star focus-visible:ring-offset-1"
                  >
                    {contact_phone}
                  </a>
                </li>
              )}

              {/* WhatsApp */}
              {contact_whatsapp && (
                <li className="flex items-start gap-3">
                  <MessageCircle
                    size={20}
                    strokeWidth={1.75}
                    className="text-star flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <a
                    href={toWaHref(contact_whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-base text-white hover:text-star underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-star focus-visible:ring-offset-1"
                  >
                    Chat WhatsApp
                  </a>
                </li>
              )}

              {/* Email */}
              {contact_email && (
                <li className="flex items-start gap-3">
                  <Mail
                    size={20}
                    strokeWidth={1.75}
                    className="text-star flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <a
                    href={`mailto:${contact_email}`}
                    className="font-sans text-base text-white hover:text-star underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-star focus-visible:ring-offset-1"
                  >
                    {contact_email}
                  </a>
                </li>
              )}

              {/* Alamat */}
              {contact_address && (
                <li className="flex items-start gap-3">
                  <MapPin
                    size={20}
                    strokeWidth={1.75}
                    className="text-star flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <address className="not-italic font-sans text-base text-white/90 leading-relaxed">
                    {contact_address}
                  </address>
                </li>
              )}

              {/* Jam layanan */}
              {contact_hours && (
                <li className="flex items-start gap-3">
                  <Clock
                    size={20}
                    strokeWidth={1.75}
                    className="text-star flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="font-sans text-base text-white/90">
                    {contact_hours}
                  </span>
                </li>
              )}
            </ul>

            {/* Media sosial */}
            {(social_instagram || social_facebook || social_youtube) && (
              <div className="flex flex-col gap-3">
                <p className="font-sans font-bold text-base text-white">
                  Media sosial
                </p>
                <div className="flex flex-wrap gap-4">
                  {social_instagram && (
                    <a
                      href={social_instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram Yayasan Padindi (membuka di tab baru)"
                      className="flex items-center gap-2 text-white hover:text-star underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-star focus-visible:ring-offset-1"
                    >
                      <InstagramIcon aria-hidden="true" />
                      <span className="font-sans text-base">Instagram</span>
                    </a>
                  )}
                  {social_facebook && (
                    <a
                      href={social_facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook Yayasan Padindi (membuka di tab baru)"
                      className="flex items-center gap-2 text-white hover:text-star underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-star focus-visible:ring-offset-1"
                    >
                      <FacebookIcon aria-hidden="true" />
                      <span className="font-sans text-base">Facebook</span>
                    </a>
                  )}
                  {social_youtube && (
                    <a
                      href={social_youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="YouTube Yayasan Padindi (membuka di tab baru)"
                      className="flex items-center gap-2 text-white hover:text-star underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-star focus-visible:ring-offset-1"
                    >
                      <YoutubeIcon aria-hidden="true" />
                      <span className="font-sans text-base">YouTube</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Kolom kanan: peta */}
          {hasMap && (
            <div>
              <MapEmbed
                embedUrl={contact_map_embed_url}
                address={contact_address}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
