import React, { useState, useEffect } from 'react';
import {
  Home,
  Building,
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileEdit,
  Save,
  Send,
  X,
  Sparkles,
} from 'lucide-react';
import { staffStore, type WebsiteContentItem, type PublicationStatus } from '../services/staffContentStore';
import { Button } from '@/components/ui/Button';

type ContentSection = 'beranda' | 'profil' | 'sekolah';

export const StaffWebsiteContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ContentSection>('beranda');
  const [contentList, setContentList] = useState<WebsiteContentItem[]>([]);

  // Modal Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<WebsiteContentItem | null>(null);
  const [subCategory, setSubCategory] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<PublicationStatus>('draft');

  // Preview Modal
  const [previewItem, setPreviewItem] = useState<WebsiteContentItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WebsiteContentItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    setContentList(staffStore.getWebsiteContent());
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentTabItems = contentList.filter((c) => c.section === activeTab);

  const subCategoryOptions: Record<ContentSection, string[]> = {
    beranda: [
      'Informasi Singkat Yayasan',
      'Konten Pengenalan Yayasan',
      'Keunggulan Yayasan',
      'Informasi Pendidikan',
      'Konten Promosi & Informasi PPDB',
    ],
    profil: [
      'Sejarah Yayasan',
      'Visi dan Misi',
      'Tujuan Yayasan',
      'Sambutan Ketua Yayasan',
    ],
    sekolah: [
      'Deskripsi Sekolah',
      'Informasi Program Pendidikan',
      'Keunggulan Sekolah',
      'Informasi Fasilitas',
      'Informasi Kegiatan Sekolah',
    ],
  };

  const handleOpenCreate = () => {
    setEditItem(null);
    setSubCategory(subCategoryOptions[activeTab][0]);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setStatus('draft');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: WebsiteContentItem) => {
    setEditItem(item);
    setSubCategory(item.subCategory);
    setTitle(item.title);
    setSubtitle(item.subtitle || '');
    setDescription(item.description);
    setStatus(item.status);
    setModalOpen(true);
  };

  const handleSaveModal = (targetStatus?: PublicationStatus) => {
    if (!title.trim()) {
      alert('Judul konten tidak boleh kosong.');
      return;
    }

    const payload: Partial<WebsiteContentItem> & { title: string; section: ContentSection; subCategory: string } = {
      ...(editItem ? { id: editItem.id } : {}),
      section: activeTab,
      subCategory,
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      status: targetStatus || status,
    };

    staffStore.saveWebsiteContent(payload);
    loadData();
    setModalOpen(false);
    setToastMessage(`Konten "${title}" berhasil disimpan.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    staffStore.deleteWebsiteContent(deleteTarget.id);
    loadData();
    setDeleteTarget(null);
    setToastMessage('Konten berhasil dihapus.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getStatusBadge = (s: PublicationStatus) => {
    switch (s) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-card border border-navy/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-xl text-navy">Manajemen Konten Website Landing Page</h1>
          <p className="text-xs text-muted mt-0.5">
            Kelola teks pengenalan, visi misi, fasilitas, dan informasi utama yang tampil pada halaman Beranda publik.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="flex items-center gap-1.5 shrink-0">
          <Plus size={16} />
          <span>Tambah Konten Baru</span>
        </Button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-card border border-emerald-200 text-xs flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex border-b border-navy/10 gap-2 bg-white px-4 pt-3 rounded-t-card border-t border-x overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('beranda')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'beranda'
              ? 'border-primary text-primary'
              : 'border-transparent text-ink-muted hover:text-navy'
          }`}
        >
          <Home size={15} />
          <span>1. Konten Beranda</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-navy/5">
            {contentList.filter((c) => c.section === 'beranda').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profil')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'profil'
              ? 'border-primary text-primary'
              : 'border-transparent text-ink-muted hover:text-navy'
          }`}
        >
          <Building size={15} />
          <span>2. Konten Profil Yayasan</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-navy/5">
            {contentList.filter((c) => c.section === 'profil').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sekolah')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'sekolah'
              ? 'border-primary text-primary'
              : 'border-transparent text-ink-muted hover:text-navy'
          }`}
        >
          <GraduationCap size={15} />
          <span>3. Konten Informasi Sekolah</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-navy/5">
            {contentList.filter((c) => c.section === 'sekolah').length}
          </span>
        </button>
      </div>

      {/* List of Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentTabItems.length === 0 ? (
          <div className="col-span-2 bg-white p-12 text-center text-muted rounded-card border border-navy/10 text-xs">
            Belum ada item konten pada kategori ini. Klik "+ Tambah Konten Baru" untuk membuat konten pertama.
          </div>
        ) : (
          currentTabItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-card border border-navy/10 shadow-2xs hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                    {item.subCategory}
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                <h3 className="font-display font-bold text-base text-navy leading-snug">
                  {item.title}
                </h3>

                {item.subtitle && (
                  <p className="text-xs font-semibold text-ink-muted">{item.subtitle}</p>
                )}

                <p className="text-xs text-muted leading-relaxed whitespace-pre-line line-clamp-4">
                  {item.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-navy/10 flex items-center justify-between text-xs text-muted">
                <span>Diperbarui oleh: {item.author}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="p-1.5 text-muted hover:text-navy hover:bg-navy/5 rounded"
                    title="Pratinjau Konten"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-primary hover:text-navy hover:bg-primary/5 rounded"
                    title="Edit Konten"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                    title="Hapus Konten"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL FORM TAMBAH / EDIT KONTEN */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-card max-w-xl w-full my-8 p-6 shadow-2xl border border-navy/20 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-navy/10">
              <h3 className="font-display font-bold text-base text-navy">
                {editItem ? 'Sunting Konten Website' : 'Tambah Konten Website Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-navy">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveModal();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Sub-Kategori Konten <span className="text-danger">*</span>
                </label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-navy/20 rounded-control focus:border-primary outline-none bg-white font-medium"
                >
                  {subCategoryOptions[activeTab].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Judul Konten <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: 5 Pilar Keunggulan Padindi..."
                  className="w-full px-3 py-2 border border-navy/20 rounded-control focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Sub-Judul / Tagline (Opsional)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Keterangan singkat pendukung..."
                  className="w-full px-3 py-2 border border-navy/20 rounded-control focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-navy uppercase tracking-wider mb-1">
                  Isi Deskripsi / Teks Konten <span className="text-danger">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tuliskan isi informasi yang akan ditampilkan pada website..."
                  className="w-full p-3 border border-navy/20 rounded-control focus:border-primary outline-none leading-relaxed"
                />
              </div>

              <div className="pt-2 border-t border-navy/10 flex flex-wrap items-center justify-between gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
                  Batal
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => handleSaveModal('draft')}
                  >
                    Simpan Draft
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    onClick={() => handleSaveModal('pending')}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Ajukan Publikasi
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    onClick={() => handleSaveModal('published')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Publikasikan
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRATINJAU KONTEN */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-2xl border border-navy/20 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-navy/10">
              <span className="text-xs font-bold text-primary uppercase">
                Pratinjau {previewItem.subCategory}
              </span>
              <button onClick={() => setPreviewItem(null)} className="text-muted hover:text-navy">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-bold text-xl text-navy">{previewItem.title}</h2>
              {previewItem.subtitle && (
                <p className="text-xs font-semibold text-primary">{previewItem.subtitle}</p>
              )}
              <div className="p-4 rounded-card bg-paper border border-navy/10 text-xs text-ink leading-relaxed whitespace-pre-line">
                {previewItem.description}
              </div>
            </div>

            <div className="pt-3 border-t border-navy/10 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setPreviewItem(null)}>
                Tutup Pratinjau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HAPUS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-xl border border-navy/15 space-y-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <h3 className="font-display font-bold text-lg text-navy">Hapus Konten Ini?</h3>
              <p className="text-xs text-muted">
                Konten "{deleteTarget.title}" akan dihapus dari website.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                Batal
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Ya, Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffWebsiteContentPage;

