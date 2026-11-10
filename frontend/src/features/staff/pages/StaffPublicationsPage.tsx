import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Send,
  FileEdit,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit,
  RotateCcw,
  ExternalLink,
  MessageSquare,
  Eye,
  X,
  History,
} from 'lucide-react';
import { staffStore, type StaffNewsItem, type PublicationStatus } from '../services/staffContentStore';
import { Button } from '@/components/ui/Button';

export const StaffPublicationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeStatusFilter = searchParams.get('status') || 'all';

  const [newsList, setNewsList] = useState<StaffNewsItem[]>([]);
  const [selectedItemForResubmit, setSelectedItemForResubmit] = useState<StaffNewsItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = () => {
    setNewsList(staffStore.getNews());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = newsList.filter((item) => {
    if (activeStatusFilter === 'all') return true;
    return item.status === activeStatusFilter;
  });

  const counts = {
    all: newsList.length,
    draft: newsList.filter((n) => n.status === 'draft').length,
    pending: newsList.filter((n) => n.status === 'pending').length,
    revision: newsList.filter((n) => n.status === 'revision').length,
    published: newsList.filter((n) => n.status === 'published').length,
    rejected: newsList.filter((n) => n.status === 'rejected').length,
  };

  const handleResubmit = (id: number) => {
    staffStore.updateNewsStatus(id, 'pending');
    loadData();
    setSelectedItemForResubmit(null);
    setToast('Konten berhasil diajukan ulang ke Administrator untuk peninjauan.');
    setTimeout(() => setToast(null), 4000);
  };

  const getStatusBadge = (status: PublicationStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 size={13} />
            Dipublikasikan
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock size={13} />
            Menunggu Persetujuan
          </span>
        );
      case 'revision':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertTriangle size={13} />
            Perlu Revisi
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">
            <XCircle size={13} />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <FileEdit size={13} />
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-card border border-navy/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-xl text-navy">Manajemen Alur & Status Publikasi</h1>
          <p className="text-xs text-muted mt-0.5">
            Pantau proses verifikasi konten Anda mulai dari pengajuan draft, catatan revisi admin, hingga status live di website.
          </p>
        </div>
        <Link
          to="/staff/berita/tambah"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-control font-semibold text-xs hover:bg-primary-hover shadow-sm"
        >
          <Send size={15} />
          <span>Ajukan Konten Baru</span>
        </Link>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-card border border-emerald-200 text-xs flex items-center justify-between">
          <span>{toast}</span>
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex border-b border-navy/10 gap-2 bg-white px-4 pt-3 rounded-t-card border-t border-x overflow-x-auto text-xs font-bold">
        {[
          { key: 'all', label: 'Semua Konten Saya', count: counts.all },
          { key: 'draft', label: 'Draft', count: counts.draft },
          { key: 'pending', label: 'Menunggu Persetujuan', count: counts.pending },
          { key: 'revision', label: 'Perlu Revisi', count: counts.revision },
          { key: 'published', label: 'Dipublikasikan', count: counts.published },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSearchParams(tab.key === 'all' ? {} : { status: tab.key })}
            className={`flex items-center gap-2 pb-3 px-3 border-b-2 transition-all whitespace-nowrap ${
              activeStatusFilter === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-ink-muted hover:text-navy'
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-navy/5">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Publications Cards List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white p-12 text-center text-muted rounded-card border border-navy/10 text-xs">
            Tidak ada konten dalam status ini.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-card border p-5 shadow-2xs space-y-4 transition-all ${
                item.status === 'revision'
                  ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/10'
                  : 'border-navy/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-navy/10 text-navy font-bold text-xs">
                    {item.category}
                  </span>
                  <span className="text-xs text-muted">ID: #{item.id}</span>
                </div>
                <div>{getStatusBadge(item.status)}</div>
              </div>

              <div className="flex flex-col md:flex-row items-start gap-4">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full md:w-44 h-28 object-cover rounded-lg border border-navy/10 shrink-0 bg-navy/5"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/news/ppdb-cover.jpg';
                  }}
                />

                <div className="flex-1 min-w-0 space-y-2">
                  <h3 className="font-display font-bold text-base text-navy leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                    {item.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-muted pt-1">
                    <span>Penulis: <strong>{item.author}</strong></span>
                    <span>•</span>
                    <span>Dibuat: {new Date(item.createdAt).toLocaleDateString('id-ID')}</span>
                    {item.publishedAt && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">
                          Terbit: {new Date(item.publishedAt).toLocaleDateString('id-ID')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Catatan Revisi Admin */}
              {item.status === 'revision' && item.revisionNotes && (
                <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-lg text-xs space-y-1 text-rose-900">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700">
                    <MessageSquare size={14} />
                    <span>Catatan Revisi dari Administrator:</span>
                  </div>
                  <p className="pl-5 leading-relaxed">{item.revisionNotes}</p>
                </div>
              )}

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-navy/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1 text-muted text-[11px]">
                  <History size={13} />
                  <span>
                    {item.status === 'published'
                      ? 'Artikel aktif di halaman Berita publik'
                      : item.status === 'pending'
                      ? 'Sedang dalam antrean evaluasi Admin'
                      : 'Draft lokal Anda'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/staff/berita/edit/${item.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy/5 hover:bg-navy/10 text-navy font-semibold rounded-control transition-colors"
                  >
                    <Edit size={13} />
                    <span>{item.status === 'revision' ? 'Perbaiki Konten' : 'Edit Artikel'}</span>
                  </Link>

                  {item.status === 'revision' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleResubmit(item.id)}
                      className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1"
                    >
                      <RotateCcw size={13} />
                      <span>Ajukan Ulang</span>
                    </Button>
                  )}

                  {item.status === 'draft' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleResubmit(item.id)}
                      className="flex items-center gap-1"
                    >
                      <Send size={13} />
                      <span>Ajukan Sekarang</span>
                    </Button>
                  )}

                  {item.status === 'published' && (
                    <a
                      href={`/berita/${item.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-primary hover:underline font-semibold"
                    >
                      <span>Lihat Live</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffPublicationsPage;

