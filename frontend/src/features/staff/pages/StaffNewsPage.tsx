import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileEdit,
  Calendar,
  User,
  Tag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { staffStore, type StaffNewsItem, type PublicationStatus } from '../services/staffContentStore';
import { Button } from '@/components/ui/Button';

export const StaffNewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<StaffNewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [previewItem, setPreviewItem] = useState<StaffNewsItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffNewsItem | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const loadData = () => {
    setNews(staffStore.getNews());
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    news.forEach((n) => set.add(n.category));
    return ['all', ...Array.from(set)];
  }, [news]);

  // Filter & Search
  const filteredNews = useMemo(() => {
    return news
      .filter((item) => {
        const matchQuery =
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          item.author.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
        return matchQuery && matchCategory && matchStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [news, searchQuery, selectedCategory, selectedStatus, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage) || 1;
  const paginatedNews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNews.slice(start, start + itemsPerPage);
  }, [filteredNews, currentPage]);

  const handleDelete = () => {
    if (!deleteTarget) return;
    const success = staffStore.deleteNews(deleteTarget.id);
    if (success) {
      loadData();
      setActionSuccessMessage(`Berita "${deleteTarget.title}" berhasil dihapus.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }
    setDeleteTarget(null);
  };

  const getStatusBadge = (status: PublicationStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} />
            Dipublikasikan
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} />
            Menunggu Persetujuan
          </span>
        );
      case 'revision':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle size={12} />
            Perlu Revisi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <FileEdit size={12} />
            Draft
          </span>
        );
    }
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-navy/10 shadow-sm">
        <div>
          <h1 className="font-display font-bold text-xl text-navy">Manajemen Berita & Artikel</h1>
          <p className="text-xs text-muted mt-0.5">
            Buat, sunting, dan ajukan publikasi artikel berita untuk ditampilkan pada website utama yayasan.
          </p>
        </div>
        <Link
          to="/staff/berita/tambah"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-control font-semibold text-xs hover:bg-primary-hover shadow-sm active:scale-95 transition-all shrink-0"
        >
          <Plus size={16} />
          <span>Tambah Berita Baru</span>
        </Link>
      </div>

      {/* Success Alert Banner */}
      {actionSuccessMessage && (
        <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-card border border-emerald-200 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-card border border-navy/10 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul, penulis, atau tag..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs border border-navy/20 rounded-control focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        {/* Filter Category & Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Filter size={14} />
            <span>Kategori:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs border border-navy/20 rounded-control px-2.5 py-1.5 bg-white text-ink focus:border-primary outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'Semua Kategori' : c}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-xs text-muted ml-2">
            <span>Status:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs border border-navy/20 rounded-control px-2.5 py-1.5 bg-white text-ink focus:border-primary outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="published">Dipublikasikan</option>
            <option value="pending">Menunggu Persetujuan</option>
            <option value="revision">Perlu Revisi</option>
            <option value="draft">Draft</option>
          </select>

          {/* Sort button */}
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 border border-navy/20 rounded-control hover:bg-navy/5 text-ink ml-1"
            title="Ubah Urutan Tanggal"
          >
            <ArrowUpDown size={13} />
            <span>{sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
          </button>
        </div>
      </div>

      {/* Tabel Berita */}
      <div className="bg-white rounded-card border border-navy/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-navy/5 border-b border-navy/10 text-navy font-bold">
                <th className="py-3 px-4 w-16">Foto</th>
                <th className="py-3 px-4">Judul Berita & Slug</th>
                <th className="py-3 px-4 w-28">Kategori</th>
                <th className="py-3 px-4 w-36">Penulis</th>
                <th className="py-3 px-4 w-28">Tgl Dibuat</th>
                <th className="py-3 px-4 w-28">Tgl Terbit</th>
                <th className="py-3 px-4 w-36">Status</th>
                <th className="py-3 px-4 w-28 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {paginatedNews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted">
                    Tidak ada artikel berita yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                paginatedNews.map((item) => (
                  <tr key={item.id} className="hover:bg-navy/2 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-12 h-10 object-cover rounded border border-navy/10 bg-navy/5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/news/ppdb-cover.jpg';
                        }}
                      />
                    </td>

                    {/* Judul & Slug */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-navy line-clamp-1 hover:text-primary cursor-pointer" onClick={() => setPreviewItem(item)}>
                        {item.title}
                      </p>
                      <p className="text-[10px] text-muted line-clamp-1 font-mono mt-0.5">
                        /{item.slug}
                      </p>
                      {item.status === 'revision' && item.revisionNotes && (
                        <div className="mt-1 p-1 px-2 rounded bg-rose-50 text-rose-700 text-[10px] border border-rose-200">
                          <strong>Catatan Admin:</strong> {item.revisionNotes}
                        </div>
                      )}
                    </td>

                    {/* Kategori */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-navy/5 text-navy font-semibold text-[11px]">
                        {item.category}
                      </span>
                    </td>

                    {/* Penulis */}
                    <td className="py-3 px-4 text-ink-muted">
                      <span className="truncate block max-w-[130px]">{item.author}</span>
                    </td>

                    {/* Tgl Dibuat */}
                    <td className="py-3 px-4 text-muted whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>

                    {/* Tgl Terbit */}
                    <td className="py-3 px-4 text-muted whitespace-nowrap">
                      {formatDate(item.publishedAt)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="p-1.5 text-muted hover:text-navy hover:bg-navy/5 rounded transition-colors"
                          title="Pratinjau Berita"
                        >
                          <Eye size={15} />
                        </button>
                        <Link
                          to={`/staff/berita/edit/${item.id}`}
                          className="p-1.5 text-primary hover:text-navy hover:bg-primary/5 rounded transition-colors"
                          title="Edit Berita"
                        >
                          <Edit size={15} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                          title="Hapus Berita"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-paper/50 border-t border-navy/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <div>
            Menampilkan {filteredNews.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} sampai{' '}
            {Math.min(currentPage * itemsPerPage, filteredNews.length)} dari {filteredNews.length} artikel
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-1.5 rounded border border-navy/20 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 font-medium">
              Hal {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded border border-navy/20 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL PREVIEW BERITA */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-card max-w-2xl w-full my-8 p-6 shadow-2xl border border-navy/20 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy/10">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Pratinjau Tampilan Berita
              </span>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded-lg hover:bg-navy/5 text-muted hover:text-navy"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Preview Body */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  {previewItem.category}
                </span>
                <span className="text-muted">•</span>
                <span className="flex items-center gap-1 text-muted">
                  <Calendar size={13} />
                  {formatDate(previewItem.createdAt)}
                </span>
                <span className="text-muted">•</span>
                <span className="flex items-center gap-1 text-muted">
                  <User size={13} />
                  {previewItem.author}
                </span>
              </div>

              <h2 className="font-display font-bold text-xl md:text-2xl text-navy leading-snug">
                {previewItem.title}
              </h2>

              <img
                src={previewItem.thumbnail}
                alt={previewItem.title}
                className="w-full h-64 object-cover rounded-card border border-navy/10 shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/news/ppdb-cover.jpg';
                }}
              />

              <div
                className="prose prose-sm max-w-none text-ink leading-relaxed font-sans"
                dangerouslySetInnerHTML={{ __html: previewItem.content }}
              />

              {previewItem.tags && previewItem.tags.length > 0 && (
                <div className="pt-3 border-t border-navy/10 flex flex-wrap items-center gap-1.5">
                  <Tag size={13} className="text-muted" />
                  {previewItem.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-navy/5 text-navy rounded text-[11px]">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-navy/10 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewItem(null)}>
                Tutup Pratinjau
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const id = previewItem.id;
                  setPreviewItem(null);
                  navigate(`/staff/berita/edit/${id}`);
                }}
              >
                Edit Berita Ini
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-xl border border-navy/15 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-display font-bold text-lg text-navy">Hapus Artikel Berita?</h3>
              <p className="text-xs text-muted leading-relaxed">
                Apakah Anda yakin ingin menghapus artikel berita berikut? Tindakan ini tidak dapat dibatalkan.
              </p>
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-card border border-rose-100 mt-2">
                "{deleteTarget.title}"
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
              >
                Ya, Hapus Artikel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffNewsPage;
