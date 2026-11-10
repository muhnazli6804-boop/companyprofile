import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Video,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileEdit,
  X,
  ExternalLink,
} from 'lucide-react';
import { staffStore, type GalleryItem, type PublicationStatus } from '../services/staffContentStore';
import { Button } from '@/components/ui/Button';

export const StaffGalleryPage: React.FC = () => {
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GalleryItem['category']>('Kegiatan Sekolah');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<PublicationStatus>('published');

  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = () => {
    setGalleries(staffStore.getGallery());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = galleries.filter((g) => {
    const matchCategory = selectedCategory === 'all' || g.category === selectedCategory;
    const matchType = selectedType === 'all' || g.type === selectedType;
    return matchCategory && matchType;
  });

  const handleOpenCreate = () => {
    setEditItem(null);
    setTitle('');
    setCategory('Kegiatan Sekolah');
    setType('image');
    setMediaUrl('/images/gallery/classroom-sd.jpg');
    setEventDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setStatus('published');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setType(item.type);
    setMediaUrl(item.mediaUrl);
    setEventDate(item.eventDate);
    setDescription(item.description);
    setStatus(item.status);
    setModalOpen(true);
  };

  const handleSave = (targetStatus?: PublicationStatus) => {
    if (!title.trim() || !mediaUrl.trim()) {
      alert('Judul dan URL Media tidak boleh kosong.');
      return;
    }

    const payload: Partial<GalleryItem> & { title: string } = {
      ...(editItem ? { id: editItem.id } : {}),
      title: title.trim(),
      category,
      type,
      mediaUrl: mediaUrl.trim(),
      thumbnailUrl: type === 'image' ? mediaUrl.trim() : '/images/banner-hero-1.jpg',
      eventDate,
      description: description.trim(),
      status: targetStatus || status,
    };

    staffStore.saveGallery(payload);
    loadData();
    setModalOpen(false);
    setToast(`Item galeri "${title}" berhasil disimpan.`);
    setTimeout(() => setToast(null), 4000);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    staffStore.deleteGallery(deleteTarget.id);
    loadData();
    setDeleteTarget(null);
    setToast('Item galeri berhasil dihapus.');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-card border border-navy/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-xl text-navy">Manajemen Galeri Foto & Video</h1>
          <p className="text-xs text-muted mt-0.5">
            Dokumentasikan foto fasilitas, kegiatan upacara, dan rekaman video aktivitas yayasan.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="flex items-center gap-1.5 shrink-0">
          <Plus size={16} />
          <span>Unggah Galeri Baru</span>
        </Button>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-card border border-emerald-200 text-xs flex items-center justify-between">
          <span>{toast}</span>
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-card border border-navy/10 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-muted">Kategori:</span>
          {['all', 'Kegiatan Sekolah', 'Fasilitas', 'Prestasi', 'Upacara'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-navy text-white shadow-2xs'
                  : 'bg-navy/5 text-ink-muted hover:bg-navy/10'
              }`}
            >
              {cat === 'all' ? 'Semua' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-muted">Jenis:</span>
          <button
            type="button"
            onClick={() => setSelectedType('all')}
            className={`px-2.5 py-1 rounded text-xs ${selectedType === 'all' ? 'bg-primary text-white font-bold' : 'bg-navy/5'}`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('image')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs ${selectedType === 'image' ? 'bg-primary text-white font-bold' : 'bg-navy/5'}`}
          >
            <ImageIcon size={13} />
            Foto
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('video')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs ${selectedType === 'video' ? 'bg-primary text-white font-bold' : 'bg-navy/5'}`}
          >
            <Video size={13} />
            Video
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-card border border-navy/10 shadow-2xs overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
          >
            <div className="relative aspect-video bg-navy/10 overflow-hidden">
              <img
                src={item.thumbnailUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/gallery/classroom-sd.jpg';
                }}
              />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-navy/80 backdrop-blur-xs text-white text-[10px] font-bold">
                {item.category}
              </span>
              <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] flex items-center gap-1">
                {item.type === 'video' ? <Video size={11} /> : <ImageIcon size={11} />}
                {item.type === 'video' ? 'Video' : 'Foto'}
              </span>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[11px] text-muted">
                  <Calendar size={12} />
                  <span>{item.eventDate}</span>
                </div>
                <h3 className="font-display font-bold text-sm text-navy line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-muted line-clamp-2">{item.description}</p>
              </div>

              <div className="pt-3 border-t border-navy/10 flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted">Oleh: {item.author}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="p-1.5 text-muted hover:text-navy hover:bg-navy/5 rounded"
                    title="Pratinjau"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-primary hover:text-navy hover:bg-primary/5 rounded"
                    title="Edit"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                    title="Hapus"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL FORM GALERI */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-2xl border border-navy/20 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-navy/10">
              <h3 className="font-display font-bold text-base text-navy">
                {editItem ? 'Sunting Item Galeri' : 'Unggah Galeri Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted hover:text-navy"><X size={18} /></button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-navy uppercase mb-1">Judul Dokumentasi</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Upacara Bendera HUT RI ke-81..."
                  className="w-full px-3 py-2 border border-navy/20 rounded-control focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy uppercase mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-navy/20 rounded-control bg-white outline-none font-medium"
                  >
                    <option value="Kegiatan Sekolah">Kegiatan Sekolah</option>
                    <option value="Fasilitas">Fasilitas Sekolah</option>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Eskul">Ekstrakurikuler</option>
                    <option value="Upacara">Upacara & Seremonial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase mb-1">Jenis Media</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-navy/20 rounded-control bg-white outline-none font-medium"
                  >
                    <option value="image">Foto (Gambar)</option>
                    <option value="video">Video (URL / Embed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy uppercase mb-1">URL Media / Foto / Video</label>
                <input
                  type="text"
                  required
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="/images/gallery/... atau link YouTube"
                  className="w-full px-3 py-2 border border-navy/20 rounded-control focus:border-primary outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-navy uppercase mb-1">Tanggal Kegiatan</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 border border-navy/20 rounded-control outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-navy uppercase mb-1">Deskripsi Kegiatan</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ceritakan momen kegiatan yang berlangsung..."
                  className="w-full p-2.5 border border-navy/20 rounded-control outline-none"
                />
              </div>

              <div className="pt-2 border-t border-navy/10 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>Batal</Button>
                <Button variant="secondary" size="sm" type="button" onClick={() => handleSave('draft')}>Draft</Button>
                <Button variant="primary" size="sm" type="button" onClick={() => handleSave('pending')} className="bg-amber-600 hover:bg-amber-700 text-white">Ajukan</Button>
                <Button variant="primary" size="sm" type="submit">Simpan & Publikasikan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-navy/10">
              <span className="text-xs font-bold text-primary uppercase">{previewItem.category}</span>
              <button onClick={() => setPreviewItem(null)} className="text-muted"><X size={18} /></button>
            </div>
            <img src={previewItem.thumbnailUrl} alt="" className="w-full h-64 object-cover rounded-card" />
            <h3 className="font-display font-bold text-lg text-navy">{previewItem.title}</h3>
            <p className="text-xs text-muted leading-relaxed">{previewItem.description}</p>
            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setPreviewItem(null)}>Tutup</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HAPUS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-sm w-full p-5 space-y-4 text-center">
            <Trash2 size={28} className="text-danger mx-auto" />
            <h4 className="font-display font-bold text-base text-navy">Hapus Galeri?</h4>
            <p className="text-xs text-muted">"{deleteTarget.title}" akan dihapus.</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>Batal</Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>Hapus</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffGalleryPage;
