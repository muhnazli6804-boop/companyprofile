import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, Search, ArrowRight, Tag } from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';
import { apiClient } from '@/lib/api-client';

interface PostItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  cover_path?: string | null;
  published_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
}

export const PostListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { data: categories } = useQuery<CategoryItem[]>({
    queryKey: ['public', 'post-categories'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: CategoryItem[] }>('/public/post-categories');
        return res.data.data;
      } catch {
        return [];
      }
    },
    staleTime: 60000,
  });

  const { data: postsData, isLoading } = useQuery<{ data: PostItem[] }>({
    queryKey: ['public', 'posts', search, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams({ per_page: '24' });
      if (search) params.set('search', search);
      if (selectedCategory) params.set('category', selectedCategory);
      const res = await apiClient.get<{ data: PostItem[] }>(`/public/posts?${params.toString()}`);
      return res.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const posts = postsData?.data || [];

  return (
    <div className="bg-paper min-h-screen py-12">
      <SeoHead
        title="Berita & Kegiatan - Yayasan Padindi"
        description="Informasi terbaru, kegiatan pembelajaran, dan prestasi siswa di lingkungan Yayasan Padindi."
      />

      <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-block px-3 py-1 bg-navy/10 text-navy font-bold text-xs rounded-full uppercase tracking-wider">
            Kabar & Informasi Terpadu
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-navy">
            Berita & Kegiatan Yayasan
          </h1>
          <p className="text-muted text-sm md:text-base">
            Ikuti berbagai perkembangan kegiatan belajar mengajar, pengumuman resmi, dan prestasi keluarga besar Yayasan Padindi.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-card border border-navy/10 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berita atau kegiatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-paper border border-navy/15 rounded-control text-sm text-ink focus:outline-none focus:ring-2 focus:ring-navy/30"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === ''
                  ? 'bg-navy text-white'
                  : 'bg-navy/5 text-navy hover:bg-navy/10'
              }`}
            >
              Semua Kategori
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.slug
                    ? 'bg-navy text-white'
                    : 'bg-navy/5 text-navy hover:bg-navy/10'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-card overflow-hidden border border-navy/10 animate-pulse">
                <div className="h-48 bg-navy/10" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-navy/10 rounded w-1/3" />
                  <div className="h-6 bg-navy/10 rounded w-4/5" />
                  <div className="h-3 bg-navy/10 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-card overflow-hidden border border-navy/10 shadow-sm hover:shadow-md transition-shadow flex flex-col group"
              >
                <div className="relative aspect-[4/3] bg-navy/5 overflow-hidden">
                  <img
                    src={post.cover_path || '/images/news/ppdb-cover.jpg'}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.endsWith('/images/news/ppdb-cover.jpg')) {
                        target.src = '/images/news/ppdb-cover.jpg';
                      }
                    }}
                  />
                  {post.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-navy/90 text-white text-[11px] font-bold rounded-md flex items-center gap-1 shadow-sm">
                      <Tag className="w-3 h-3 text-star" />
                      {post.category.name}
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted">
                      <Calendar className="w-3.5 h-3.5 text-navy/60" />
                      <time dateTime={post.published_at}>
                        {new Intl.DateTimeFormat('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }).format(new Date(post.published_at))}
                      </time>
                    </div>

                    <h2 className="font-display font-semibold text-lg text-ink group-hover:text-primary transition-colors line-clamp-2">
                      <Link to={`/berita/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    {post.excerpt && (
                      <p className="text-muted text-xs leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  <Link
                    to={`/berita/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-navy hover:text-primary pt-2 group/btn"
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-card text-center border border-navy/10 space-y-3">
            <p className="text-navy font-display font-bold text-lg">Tidak ada berita atau kegiatan yang sesuai.</p>
            <p className="text-muted text-xs">Coba sesuaikan kata kunci pencarian atau pilih kategori lain.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostListPage;