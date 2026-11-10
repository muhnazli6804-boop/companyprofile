import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Tag, ArrowLeft, Share2 } from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';
import { apiClient } from '@/lib/api-client';

interface PostDetail {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  cover_path?: string | null;
  published_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  author?: {
    id: number;
    name: string;
  };
}

export const PostDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, isError } = useQuery<PostDetail>({
    queryKey: ['public', 'post', slug],
    queryFn: async () => {
      const res = await apiClient.get<{ data: PostDetail }>(`/public/posts/${slug}`);
      return res.data.data;
    },
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <div className="bg-paper min-h-[60vh] py-16">
        <div className="max-w-3xl mx-auto px-4 space-y-6 animate-pulse">
          <div className="h-4 bg-navy/10 rounded w-24" />
          <div className="h-10 bg-navy/10 rounded w-4/5" />
          <div className="h-64 bg-navy/10 rounded" />
          <div className="space-y-3">
            <div className="h-4 bg-navy/10 rounded w-full" />
            <div className="h-4 bg-navy/10 rounded w-full" />
            <div className="h-4 bg-navy/10 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="bg-paper min-h-[60vh] py-16 flex items-center justify-center">
        <div className="bg-white p-8 rounded-card border border-navy/10 text-center max-w-md space-y-4">
          <h1 className="font-display font-bold text-xl text-navy">Berita Tidak Ditemukan</h1>
          <p className="text-muted text-xs">
            Artikel atau kegiatan yang Anda tuju mungkin sudah dipindahkan atau dinonaktifkan oleh administrator.
          </p>
          <Link
            to="/berita"
            className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white text-xs font-bold rounded-control hover:bg-navy-light"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Berita
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-paper min-h-screen py-12">
      <SeoHead
        title={`${post.title} - Yayasan Padindi`}
        description={post.excerpt || post.title}
      />

      <div className="max-w-3xl mx-auto px-4 md:px-6 space-y-8">
        <Link
          to="/berita"
          className="inline-flex items-center gap-2 text-xs font-bold text-navy hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Berita & Kegiatan
        </Link>

        {/* Title & Metadata */}
        <div className="space-y-4">
          {post.category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-navy/10 text-navy text-xs font-bold rounded-full">
              <Tag className="w-3 h-3 text-star" />
              {post.category.name}
            </span>
          )}

          <h1 className="font-display font-bold text-2xl md:text-3xl text-navy leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted border-y border-navy/10 py-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-navy/70" />
              <time dateTime={post.published_at}>
                {new Intl.DateTimeFormat('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }).format(new Date(post.published_at))}
              </time>
            </span>
            {post.author && (
              <span>Oleh: <strong className="text-navy">{post.author.name}</strong></span>
            )}
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: post.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Tautan berhasil disalin ke clipboard.');
                }
              }}
              className="ml-auto inline-flex items-center gap-1 text-navy hover:text-primary font-semibold"
            >
              <Share2 className="w-3.5 h-3.5" /> Bagikan
            </button>
          </div>
        </div>

        {/* Cover Image */}
        {post.cover_path && (
          <div className="rounded-card overflow-hidden border border-navy/10 shadow-sm bg-navy/5 max-h-[480px]">
            <img
              src={post.cover_path}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.endsWith('/images/news/ppdb-cover.jpg')) {
                  target.src = '/images/news/ppdb-cover.jpg';
                }
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="bg-white p-6 md:p-8 rounded-card border border-navy/10 shadow-sm prose prose-navy max-w-none">
          {post.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-ink text-sm md:text-base leading-relaxed mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
};

export default PostDetailPage;