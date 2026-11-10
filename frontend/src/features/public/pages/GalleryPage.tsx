import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Image as ImageIcon } from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';
import { apiClient } from '@/lib/api-client';

interface GalleryAlbum {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  cover_path?: string | null;
  event_date?: string | null;
  items_count?: number;
}

export const GalleryPage: React.FC = () => {
  const { data: albumsData, isLoading } = useQuery<{ data: GalleryAlbum[] }>({
    queryKey: ['public', 'galleries'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: GalleryAlbum[] }>('/public/galleries');
        return res.data;
      } catch {
        return { data: [] };
      }
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const albums = albumsData?.data || [];

  return (
    <div className="bg-paper min-h-screen py-12">
      <SeoHead
        title="Galeri Dokumentasi & Kegiatan - Yayasan Padindi"
        description="Dokumentasi foto dan rekaman kegiatan edukatif, pentas seni, dan kebersamaan di Yayasan Padindi."
      />

      <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-block px-3 py-1 bg-navy/10 text-navy font-bold text-xs rounded-full uppercase tracking-wider">
            Dokumentasi Media
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-navy">
            Galeri Kegiatan Sekolah
          </h1>
          <p className="text-muted text-sm md:text-base">
            Momen-momen inspiratif, keceriaan siswa, dan berbagai ragam aktivitas pembelajaran di lingkungan sekolah Yayasan Padindi.
          </p>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-card overflow-hidden border border-navy/10 animate-pulse">
                <div className="aspect-[4/3] bg-navy/10" />
                <div className="p-5 space-y-2">
                  <div className="h-5 bg-navy/10 rounded w-3/4" />
                  <div className="h-3 bg-navy/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : albums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <div
                key={album.id}
                className="bg-white rounded-card overflow-hidden border border-navy/10 shadow-sm hover:shadow-md transition-shadow group flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-navy/5 overflow-hidden">
                  <img
                    src={album.cover_path || '/images/news/ppdb-cover.jpg'}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/news/ppdb-cover.jpg';
                    }}
                  />
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-navy/80 text-white text-[11px] font-bold rounded-md flex items-center gap-1 backdrop-blur-xs">
                    <ImageIcon className="w-3.5 h-3.5 text-star" />
                    <span>Dokumentasi</span>
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    {album.event_date && (
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <Calendar className="w-3.5 h-3.5 text-navy/60" />
                        <span>
                          {new Intl.DateTimeFormat('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          }).format(new Date(album.event_date))}
                        </span>
                      </div>
                    )}
                    <h3 className="font-display font-bold text-base text-navy group-hover:text-primary transition-colors">
                      {album.title}
                    </h3>
                    {album.description && (
                      <p className="text-muted text-xs leading-relaxed line-clamp-2">
                        {album.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-card text-center border border-navy/10 space-y-3">
            <p className="text-navy font-display font-bold text-lg">Belum ada album galeri yang dipublikasikan.</p>
            <p className="text-muted text-xs">Admin dapat menambahkan album foto dan dokumentasi kegiatan melalui panel CMS.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;