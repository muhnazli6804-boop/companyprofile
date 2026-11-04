/**
 * PublicLayout — tata letak halaman publik.
 * Sesuai prompt bagian 3.1, 3.7 dan DESIGN.md.
 *
 * - Navbar putih dengan logo, tautan jangkar, tombol menu mobile
 * - Tautan "Lompat ke konten utama" di paling awal
 * - Footer minimal: hak cipta di latar Biru Dalam
 * - Navbar lengket (sticky) dengan scroll-margin-top pada tiap bagian
 * - Mobile: tombol disclosure (aria-expanded, aria-controls, Escape menutup)
 * - Tautan aktif (aria-current) berdasarkan intersection observer
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

// Navigasi halaman beranda
const NAV_LINKS = [
  { label: 'Tentang', href: '#tentang' },
  { label: 'Visi dan misi', href: '#visi-misi' },
  { label: 'Kegiatan', href: '#kegiatan' },
  { label: 'Kontak', href: '#kontak' },
] as const;

const SECTION_IDS = ['tentang', 'visi-misi', 'kegiatan', 'kontak'] as const;

export const PublicLayout: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Intersection observer untuk menentukan bagian aktif
  useEffect(() => {
    if (!isHomePage) return;

    const observers: IntersectionObserver[] = [];

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [isHomePage, location.pathname]);

  // Tutup menu saat tautan diklik
  const handleNavLinkClick = useCallback(() => {
    setMenuOpen(false);
  }, []);

  // Gulir halus ke target (hormati prefers-reduced-motion)
  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (!href.startsWith('#')) return;
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (!el) return;

      e.preventDefault();
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
      handleNavLinkClick();
    },
    [handleNavLinkClick],
  );

  // Tutup menu saat Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

  // Tutup menu saat klik di luar
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        !menuButtonRef.current?.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const navLinkClass = (sectionId: string) => {
    const isActive = isHomePage && activeSection === sectionId;
    return `
      font-sans text-base px-1 py-2
      ${isActive ? 'text-primary font-bold' : 'text-ink hover:text-primary'}
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
      transition-colors
    `;
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink overflow-x-hidden">
      {/* Tautan "Lompat ke konten utama" */}
      <a
        href="#main-content"
        className="
          sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
          focus:z-[100] focus:px-4 focus:py-2 focus:rounded-control
          focus:bg-primary focus:text-white focus:font-bold
          focus:outline-none focus:ring-2 focus:ring-white
        "
      >
        Lompat ke konten utama
      </a>

      {/* Navbar */}
      <header className="bg-white border-b border-line sticky top-0 z-50">
        <nav
          aria-label="Navigasi utama"
          className="max-w-content mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between"
        >
          {/* Logo / wordmark */}
          <a
            href="/"
            className="font-display font-semibold text-xl text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
            aria-label="Yayasan Padindi — Beranda"
          >
            {/* Logo bila ada, fallback wordmark teks */}
            <img
              src="/images/logo.png"
              alt="Logo Yayasan Padindi"
              width={40}
              height={40}
              className="inline-block mr-2 align-middle"
              onError={(e) => {
                // Logo tidak ada: sembunyikan gambar, tampilkan teks
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            Yayasan Padindi
          </a>

          {/* Tautan desktop */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ label, href }) => {
              const sectionId = href.slice(1);
              const isActive = isHomePage && activeSection === sectionId;
              return (
                <a
                  key={href}
                  href={href}
                  onClick={(e) => handleAnchorClick(e, href)}
                  aria-current={isActive ? 'true' : undefined}
                  className={navLinkClass(sectionId)}
                >
                  {label}
                </a>
              );
            })}
          </div>

          {/* Tombol menu mobile */}
          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            onClick={() => setMenuOpen((v) => !v)}
            className="
              md:hidden flex items-center justify-center
              w-11 h-11 rounded-control
              text-ink hover:text-primary hover:bg-tint-100
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
            "
            style={{ minWidth: 44, minHeight: 44 }}
          >
            {menuOpen ? (
              <X size={24} aria-hidden="true" />
            ) : (
              <Menu size={24} aria-hidden="true" />
            )}
          </button>
        </nav>

        {/* Menu mobile */}
        {menuOpen && (
          <div
            id="mobile-menu"
            ref={mobileMenuRef}
            className="md:hidden bg-white border-t border-line"
          >
            <nav aria-label="Menu navigasi mobile" className="flex flex-col py-2">
              {NAV_LINKS.map(({ label, href }) => {
                const sectionId = href.slice(1);
                const isActive = isHomePage && activeSection === sectionId;
                return (
                  <a
                    key={href}
                    href={href}
                    onClick={(e) => {
                      handleAnchorClick(e, href);
                    }}
                    aria-current={isActive ? 'true' : undefined}
                    className={`
                      px-6 py-4 font-sans text-base
                      ${isActive ? 'text-primary font-bold bg-tint-100' : 'text-ink hover:text-primary hover:bg-tint-100'}
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary
                    `}
                    style={{ minHeight: 44 }}
                  >
                    {label}
                  </a>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Konten utama */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* Footer minimal */}
      <footer className="bg-navy text-white py-6">
        <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8 text-center">
          <p className="font-sans text-sm text-white/80">
            &copy; {new Date().getFullYear()} Yayasan Padindi
          </p>
        </div>
      </footer>
    </div>
  );
};
