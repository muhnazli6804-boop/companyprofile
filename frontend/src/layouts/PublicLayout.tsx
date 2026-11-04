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
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ApiResponse, User } from '@/types';

// Navigasi halaman beranda & publik
const NAV_LINKS = [
  { label: 'Tentang', anchor: 'tentang' },
  { label: 'Visi dan misi', anchor: 'visi-misi' },
  { label: 'Kegiatan', anchor: 'kegiatan' },
  { label: 'Pendaftaran', path: '/pendaftaran' },
  { label: 'Kontak', anchor: 'kontak' },
] as const;

const SECTION_IDS = ['tentang', 'visi-misi', 'kegiatan', 'kontak'] as const;

export const PublicLayout: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isHomePage = location.pathname === '/';

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<ApiResponse<User>>('/auth/me');
        return res.data.data;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 60 * 1000,
  });

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Continue cleanup
    }
    localStorage.removeItem('auth_token');
    queryClient.setQueryData(['currentUser'], null);
    queryClient.invalidateQueries();
    navigate('/');
  };

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
        { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
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
    (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
      if (isHomePage) {
        e.preventDefault();
        const el = document.getElementById(anchor);
        if (el) {
          const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
        }
      }
      handleNavLinkClick();
    },
    [isHomePage, handleNavLinkClick]
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

  const navLinkClass = (isActive: boolean) => `
    font-sans text-base px-1 py-2
    ${isActive ? 'text-primary font-bold' : 'text-ink hover:text-primary'}
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
    transition-colors
  `;

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
          <Link
            to="/"
            className="font-display font-semibold text-xl text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
            aria-label="Yayasan Padindi — Beranda"
          >
            <img
              src="/images/logo.png"
              alt="Logo Yayasan Padindi"
              width={40}
              height={40}
              className="inline-block mr-2 align-middle"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            Yayasan Padindi
          </Link>

          {/* Tautan desktop */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((item) => {
              if ('path' in item) {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={isActive ? 'page' : undefined}
                    className={navLinkClass(isActive)}
                  >
                    {item.label}
                  </Link>
                );
              }

              const href = isHomePage ? `#${item.anchor}` : `/#${item.anchor}`;
              const isActive = isHomePage && activeSection === item.anchor;
              return (
                <a
                  key={item.anchor}
                  href={href}
                  onClick={(e) => handleAnchorClick(e, item.anchor)}
                  aria-current={isActive ? 'true' : undefined}
                  className={navLinkClass(isActive)}
                >
                  {item.label}
                </a>
              );
            })}

            {/* Menu Akun / Masuk */}
            {currentUser ? (
              <div className="flex items-center gap-3 pl-2 border-l border-line">
                <Link
                  to="/akun/pendaftaran"
                  className="inline-flex items-center gap-1.5 font-sans font-bold text-sm text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-control px-2 py-1"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Pendaftaran Saya</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 font-sans text-sm text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger rounded-control p-1"
                  title="Keluar dari akun"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="sr-only">Keluar</span>
                </button>
              </div>
            ) : (
              <Link
                to="/masuk"
                className="inline-flex items-center justify-center px-4 py-2 rounded-control bg-primary text-white font-sans font-bold text-sm hover:bg-primary-hover active:bg-primary-active transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                style={{ minHeight: 40 }}
              >
                Masuk
              </Link>
            )}
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
            {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </nav>

        {/* Menu mobile */}
        {menuOpen && (
          <div id="mobile-menu" ref={mobileMenuRef} className="md:hidden bg-white border-t border-line">
            <nav aria-label="Menu navigasi mobile" className="flex flex-col py-2">
              {NAV_LINKS.map((item) => {
                if ('path' in item) {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleNavLinkClick}
                      aria-current={isActive ? 'page' : undefined}
                      className={`
                        px-6 py-4 font-sans text-base
                        ${isActive ? 'text-primary font-bold bg-tint-100' : 'text-ink hover:text-primary hover:bg-tint-100'}
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary
                      `}
                      style={{ minHeight: 44 }}
                    >
                      {item.label}
                    </Link>
                  );
                }

                const href = isHomePage ? `#${item.anchor}` : `/#${item.anchor}`;
                const isActive = isHomePage && activeSection === item.anchor;
                return (
                  <a
                    key={item.anchor}
                    href={href}
                    onClick={(e) => handleAnchorClick(e, item.anchor)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`
                      px-6 py-4 font-sans text-base
                      ${isActive ? 'text-primary font-bold bg-tint-100' : 'text-ink hover:text-primary hover:bg-tint-100'}
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary
                    `}
                    style={{ minHeight: 44 }}
                  >
                    {item.label}
                  </a>
                );
              })}

              <div className="pt-2 mt-2 border-t border-line px-6 py-3">
                {currentUser ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/akun/pendaftaran"
                      onClick={handleNavLinkClick}
                      className="font-sans font-bold text-base text-primary py-2"
                    >
                      Pendaftaran Saya
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        handleNavLinkClick();
                        handleLogout();
                      }}
                      className="font-sans text-base text-danger text-left py-2"
                    >
                      Keluar
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/masuk"
                    onClick={handleNavLinkClick}
                    className="inline-flex items-center justify-center w-full px-4 py-3 rounded-control bg-primary text-white font-sans font-bold text-base"
                  >
                    Masuk
                  </Link>
                )}
              </div>
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
          <p className="font-sans text-sm text-white/80">&copy; {new Date().getFullYear()} Yayasan Padindi</p>
        </div>
      </footer>
    </div>
  );
};
