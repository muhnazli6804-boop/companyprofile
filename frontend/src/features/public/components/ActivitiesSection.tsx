/**
 * ActivitiesSection — bagian "Kegiatan" dengan carousel buatan sendiri.
 * DILARANG memakai pustaka carousel (Swiper, Embla, Slick, dll.).
 * Sesuai prompt bagian 4 dan user story US-L3.
 *
 * Fitur:
 * - CSS scroll-snap horizontal, kartu lebar berbasis CSS
 * - Tombol "Sebelumnya" / "Berikutnya" (scrollBy satu kartu)
 * - Nonaktif di ujung (tanpa loop, tanpa autoplay)
 * - Penunjuk posisi "Kegiatan 2-3 dari 9" dengan aria-live
 * - Aksesibilitas: region, roledescription, keyboard, focus visible
 * - Keadaan: memuat (skeleton), kosong, galat
 * - Sembunyikan tombol bila semua kartu muat dalam satu layar
 */
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useId,
} from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { ActivityCard } from './ActivityCard';
import type { Activity } from '../types';

// ---------- Konstanta ----------
const GAP_MOBILE = 16; // px
const GAP_DESKTOP = 24; // px

// ---------- Skeleton ----------
const CardSkeleton: React.FC<{ index: number }> = ({ index }) => (
  <div
    aria-hidden="true"
    role="group"
    aria-roledescription="slide"
    className="flex-shrink-0 bg-white border border-line overflow-hidden"
    style={{ minWidth: 0, borderRadius: 0 }}
  >
    {/* Foto placeholder */}
    <div className="bg-tint-100" style={{ aspectRatio: '4/3', width: '100%' }} />
    <div className="p-4 flex flex-col gap-2">
      <div className="h-3 bg-tint-100 rounded w-1/3" style={{ opacity: 0.7 - index * 0.1 }} />
      <div className="h-4 bg-tint-100 rounded w-4/5" />
      <div className="h-3 bg-tint-100 rounded w-3/5" />
    </div>
  </div>
);

// ---------- Komponen Utama ----------

interface ActivitiesSectionProps {
  activities: Activity[];
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

export const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({
  activities,
  isLoading,
  isError,
  onRetry,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [positionLabel, setPositionLabel] = useState('');

  const regionId = useId();
  const liveRegionId = useId();

  // ---- Hitung posisi scroll dan keadaan tombol ----
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, clientWidth, scrollWidth } = el;
    const tolerance = 2;

    setCanScrollPrev(scrollLeft > tolerance);
    setCanScrollNext(scrollLeft < scrollWidth - clientWidth - tolerance);
    setShowButtons(scrollWidth > clientWidth + tolerance);

    // Hitung kartu yang sedang terlihat
    if (activities.length > 0) {
      // Estimasi lebar kartu dari elemen pertama
      const firstCard = el.querySelector('[role="group"]') as HTMLElement | null;
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth;
        const gap =
          window.innerWidth >= 1024
            ? GAP_DESKTOP
            : window.innerWidth >= 768
              ? GAP_DESKTOP
              : GAP_MOBILE;
        const stride = cardWidth + gap;
        const visibleCount = Math.round(clientWidth / stride);
        const firstVisible = Math.round(scrollLeft / stride) + 1;
        const lastVisible = Math.min(firstVisible + visibleCount - 1, activities.length);
        setPositionLabel(
          `Kegiatan ${firstVisible}${lastVisible > firstVisible ? '–' + lastVisible : ''} dari ${activities.length}`,
        );
      }
    }
  }, [activities.length]);

  // Throttle via rAF untuk event scroll
  const handleScroll = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateScrollState);
  }, [updateScrollState]);

  // Debounce update aria-live setelah scroll berhenti (~150ms)
  const handleScrollDebounced = useCallback(() => {
    handleScroll();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(updateScrollState, 150);
  }, [handleScroll, updateScrollState]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScrollDebounced, { passive: true });
    updateScrollState();

    resizeObserverRef.current = new ResizeObserver(updateScrollState);
    resizeObserverRef.current.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScrollDebounced);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      resizeObserverRef.current?.disconnect();
    };
  }, [handleScrollDebounced, updateScrollState, activities]);

  // ---- Scroll satu kartu ----
  const scroll = useCallback((direction: 'prev' | 'next') => {
    const el = scrollRef.current;
    if (!el) return;

    const firstCard = el.querySelector('[role="group"]') as HTMLElement | null;
    if (!firstCard) return;

    const gap =
      window.innerWidth >= 1024
        ? GAP_DESKTOP
        : window.innerWidth >= 768
          ? GAP_DESKTOP
          : GAP_MOBILE;
    const stride = firstCard.offsetWidth + gap;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    el.scrollBy({
      left: direction === 'next' ? stride : -stride,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  }, []);

  // ---- Navigasi keyboard pada wadah ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scroll('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scroll('next');
      }
    },
    [scroll],
  );

  // ---------- Render ----------
  const sectionTitle = 'Kegiatan';

  return (
    <section
      aria-labelledby="activities-heading"
      className="bg-paper py-16 md:py-24"
    >
      <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8">
        {/* Header baris: judul + tombol panah */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <h2
            id="activities-heading"
            className="font-display font-semibold text-2xl text-ink"
          >
            {sectionTitle}
          </h2>

          {/* Tombol panah + penunjuk posisi — hanya tampil bila perlu */}
          {!isLoading && !isError && activities.length > 0 && showButtons && (
            <div className="flex items-center gap-3">
              {/* Penunjuk posisi — diumumkan lewat aria-live */}
              <span
                id={liveRegionId}
                aria-live="polite"
                aria-atomic="true"
                className="text-xs text-muted font-sans hidden sm:block"
              >
                {positionLabel}
              </span>

              {/* Tombol Sebelumnya */}
              <button
                type="button"
                aria-label="Kegiatan sebelumnya"
                aria-controls={regionId}
                aria-disabled={!canScrollPrev}
                disabled={!canScrollPrev}
                onClick={() => scroll('prev')}
                className="
                  w-12 h-12 rounded-full flex items-center justify-center
                  bg-primary text-white
                  disabled:bg-line disabled:text-muted disabled:cursor-not-allowed
                  hover:enabled:bg-primary-hover
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-star focus-visible:ring-offset-2 focus-visible:ring-offset-paper
                  transition-colors
                  on-blue
                "
                style={{ minWidth: 48, minHeight: 48 }}
              >
                <ChevronLeft size={20} strokeWidth={1.75} aria-hidden="true" />
              </button>

              {/* Tombol Berikutnya */}
              <button
                type="button"
                aria-label="Kegiatan berikutnya"
                aria-controls={regionId}
                aria-disabled={!canScrollNext}
                disabled={!canScrollNext}
                onClick={() => scroll('next')}
                className="
                  w-12 h-12 rounded-full flex items-center justify-center
                  bg-primary text-white
                  disabled:bg-line disabled:text-muted disabled:cursor-not-allowed
                  hover:enabled:bg-primary-hover
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-star focus-visible:ring-offset-2 focus-visible:ring-offset-paper
                  transition-colors
                  on-blue
                "
                style={{ minWidth: 48, minHeight: 48 }}
              >
                <ChevronRight size={20} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* Keadaan: memuat */}
        {isLoading && (
          <div
            role="status"
            aria-label="Memuat kegiatan"
            className="flex gap-4 overflow-hidden"
          >
            <span className="sr-only">Memuat kegiatan</span>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 min-w-0">
                <CardSkeleton index={i} />
              </div>
            ))}
          </div>
        )}

        {/* Keadaan: galat */}
        {isError && !isLoading && (
          <div className="flex flex-col items-start gap-4 py-8">
            <p className="text-ink font-sans">
              Kegiatan belum dapat dimuat. Coba lagi.
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="
                  inline-flex items-center gap-2 px-5 py-3 rounded-control
                  bg-primary text-white font-sans font-bold text-base
                  hover:bg-primary-hover
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                "
                style={{ minHeight: 44 }}
              >
                <RefreshCw size={16} aria-hidden="true" />
                Coba lagi
              </button>
            )}
          </div>
        )}

        {/* Keadaan: kosong */}
        {!isLoading && !isError && activities.length === 0 && (
          <p className="text-muted font-sans py-8">
            Belum ada kegiatan yang dipublikasikan.
          </p>
        )}

        {/* Carousel */}
        {!isLoading && !isError && activities.length > 0 && (
          <div
            id={regionId}
            ref={scrollRef}
            role="region"
            aria-roledescription="carousel"
            aria-label="Kegiatan yayasan"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="
              flex overflow-x-auto
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
            "
            style={{
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'auto', // Diatur per-klik di scroll()
              gap: GAP_MOBILE,
              /* Sembunyikan scrollbar secara visual; gulir tetap bisa */
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <style>{`
              #${CSS.escape(regionId)}::-webkit-scrollbar { display: none; }
            `}</style>

            {activities.map((activity, i) => (
              <div
                key={activity.id}
                style={{
                  scrollSnapAlign: 'start',
                  flexShrink: 0,
                  // Lebar kartu via CSS, bukan JS:
                  // 1 kartu (ponsel): 88% (12% mengintip)
                  // 2 kartu (md): calc(50% - gap/2)
                  // 3 kartu (lg): calc(33.33% - gap*2/3)
                  width: 'clamp(220px, 88%, 340px)',
                }}
                className="md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
              >
                <ActivityCard
                  title={activity.title}
                  excerpt={activity.excerpt}
                  coverUrl={activity.cover_url}
                  coverAlt={activity.cover_alt}
                  publishedAt={activity.published_at}
                  href={activity.href}
                  index={i}
                  cardNumber={i + 1}
                  total={activities.length}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

