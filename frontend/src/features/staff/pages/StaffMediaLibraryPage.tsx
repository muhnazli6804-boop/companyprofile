import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Upload,
  Search,
  Filter,
  Image as ImageIcon,
  Video,
  FileText,
  Copy,
  Check,
  Trash2,
  Edit2,
  Eye,
  X,
  ExternalLink,
} from 'lucide-react';
import { staffStore, type MediaFileItem } from '../services/staffContentStore';
import { Button } from '@/components/ui/Button';

export const StaffMediaLibraryPage: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaFileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newFilename, setNewFilename] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<'image' | 'video' | 'document'>('image');
  const [newSize, setNewSize] = useState('1.5 MB');

  const [renameTarget, setRenameTarget] = useState<MediaFileItem | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<MediaFileItem | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaFileItem | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = () => {
    setMediaList(staffStore.getMedia());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMedia = mediaList.filter((m) => {
    const matchType = selectedType === 'all' || m.type === selectedType;
    const matchQuery = m.filename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchQuery;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilename.trim() || !newUrl.trim()) {
      alert('Nama file dan URL media tidak boleh kosong.');
      return;
    }

    staffStore.uploadMedia({
      filename: newFilename.trim(),
      url: newUrl.trim(),
      type: newType,
      size: newSize || '1.2 MB',
      dimensions: newType === 'image' ? '1920x1080' : undefined,
    });

    loadData();
    setUploadModalOpen(false);
    setNewFilename('');
    setNewUrl('');
    setToast('Media baru berhasil ditambahkan ke pustaka media.');
    setTimeout(() => setToast(null), 4000);
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget || !renameValue.trim()) return;
    staffStore.renameMedia(renameTarget.id, renameValue.trim());
    loadData();
    setRenameTarget(null);
    setToast('Nama media berhasil diperbarui.');
    setTimeout(() => setToast(null), 4000);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    staffStore.deleteMedia(deleteTarget.id);
    loadData();
    setDeleteTarget(null);
    setToast('Media berhasil dihapus.');
    setTimeout(() => setToast(null), 4000);
  };

  const handleCopyUrl = (item: MediaFileItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-card border border-navy/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-xl text-navy">Pustaka Media (Media Library)</h1>
          <p className="text-xs text-muted mt-0.5">
            Pusat penyimpanan gambar, video dokumentasi, dan materi publikasi website Yayasan Padindi.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setUploadModalOpen(true)} className="flex items-center gap-1.5 shrink-0">
          <Upload size={16} />
          <span>Unggah Media Baru</span>
        </Button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-card border border-emerald-200 text-xs flex items-center justify-between">
          <span>{toast}</span>
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      {/* Toolbar: Search & Type Filter */}
      <div className="bg-white p-4 rounded-card border border-navy/10 shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Cari file media berdasarkan nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-navy/20 rounded-control focus:border-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-muted">Filter:</span>
          <button
            type="button"
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${selectedType === 'all' ? 'bg-navy text-white shadow-2xs' : 'bg-navy/5 text-ink-muted hover:bg-navy/10'}`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('image')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${selectedType === 'image' ? 'bg-navy text-white shadow-2xs' : 'bg-navy/5 text-ink-muted hover:bg-navy/10'}`}
          >
            <ImageIcon size={13} />
            Gambar
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('video')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${selectedType === 'video' ? 'bg-navy text-white shadow-2xs' : 'bg-navy/5 text-ink-muted hover:bg-navy/10'}`}
          >
            <Video size={13} />
            Video
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('document')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${selectedType === 'document' ? 'bg-navy text-white shadow-2xs' : 'bg-navy/5 text-ink-muted hover:bg-navy/10'}`}
          >
            <FileText size={13} />
            Dokumen
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredMedia.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-muted rounded-card border border-navy/10 text-xs">
            Tidak ada media yang ditemukan.
          </div>
        ) : (
          filteredMedia.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-card border border-navy/10 shadow-2xs overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
            >
              {/* Media Preview Box */}
              <div
                className="relative aspect-square bg-navy/5 overflow-hidden flex items-center justify-center cursor-pointer"
                onClick={() => setPreviewMedia(item)}
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/news/ppdb-cover.jpg';
                    }}
                  />
                ) : item.type === 'video' ? (
                  <div className="flex flex-col items-center gap-1 text-primary p-4 text-center">
                    <Video size={36} />
                    <span className="text-[10px] font-bold">Video File</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-ink-muted p-4 text-center">
                    <FileText size={36} />
                    <span className="text-[10px] font-bold">Document</span>
                  </div>
                )}

                <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] uppercase font-bold">
                  {item.type}
                </span>
              </div>

              {/* Filename & Info */}
              <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-navy truncate" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                    <span>{item.size}</span>
                    {item.dimensions && (
                      <>
                        <span>•</span>
                        <span>{item.dimensions}</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-navy/10 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(item)}
                    className="p-1 rounded text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                    title="Salin URL Gambar"
                  >
                    {copiedId === item.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copiedId === item.id ? 'Tersalin' : 'Salin'}</span>
                  </button>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRenameTarget(item);
                        setRenameValue(item.filename);
                      }}
                      className="p-1 text-muted hover:text-navy rounded hover:bg-navy/5"
                      title="Ganti Nama File"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                      title="Hapus Media"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL UPLOAD MEDIA */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 shadow-2xl border border-navy/20 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-navy/10">
              <h3 className="font-display font-bold text-base text-navy">Unggah File Media Baru</h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-muted"><X size={18} /></button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-navy uppercase mb-1">Nama File</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: foto-kegiatan-lab.jpg"
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  className="w-full px-3 py-2 border border-navy/20 rounded-control focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy uppercase mb-1">Jenis Media</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-navy/20 rounded-control bg-white outline-none font-medium"
                  >
                    <option value="image">Gambar (Foto)</option>
                    <option value="video">Video</option>
                    <option value="document">Dokumen / PDF</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-navy uppercase mb-1">Estimasi Ukuran</label>
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    className="w-full px-3 py-2 border border-navy/20 rounded-control outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy uppercase mb-1">URL File Media</label>
                <input
                  type="text"
                  required
                  placeholder="/images/... atau tautan penyimpanan online"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-navy/20 rounded-control focus:border-primary outline-none font-mono"
                />
              </div>

              {/* Quick Preset Choice */}
              <div>
                <span className="block text-[11px] text-muted mb-1 font-semibold">Gunakan Gambar Contoh:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'ppdb-cover.jpg', url: '/images/news/ppdb-cover.jpg' },
                    { name: 'classroom-sd.jpg', url: '/images/gallery/classroom-sd.jpg' },
                    { name: 'lab-komputer.jpg', url: '/images/gallery/lab-komputer.jpg' },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setNewFilename(preset.name);
                        setNewUrl(preset.url);
                        setNewType('image');
                      }}
                      className="p-1.5 text-center border rounded bg-navy/5 hover:bg-navy/10 text-[10px] truncate"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-navy/10 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setUploadModalOpen(false)}>Batal</Button>
                <Button variant="primary" size="sm" type="submit">Simpan ke Pustaka</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GANTI NAMA */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-sm w-full p-5 space-y-4">
            <h3 className="font-display font-bold text-base text-navy">Ganti Nama File</h3>
            <form onSubmit={handleRename} className="space-y-3 text-xs">
              <input
                type="text"
                required
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full px-3 py-2 border border-navy/20 rounded-control focus:border-primary outline-none"
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" type="button" onClick={() => setRenameTarget(null)}>Batal</Button>
                <Button variant="primary" size="sm" type="submit">Simpan Nama</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW DETAIL MEDIA */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-navy/10">
              <span className="text-xs font-bold text-navy truncate max-w-[360px]">{previewMedia.filename}</span>
              <button onClick={() => setPreviewMedia(null)} className="text-muted"><X size={18} /></button>
            </div>

            {previewMedia.type === 'image' && (
              <img src={previewMedia.url} alt="" className="w-full max-h-80 object-contain rounded-card bg-navy/5" />
            )}

            <div className="p-3 bg-paper rounded-card border border-navy/10 text-xs space-y-1 font-mono">
              <p><span className="text-muted">URL:</span> {previewMedia.url}</p>
              <p><span className="text-muted">Ukuran:</span> {previewMedia.size}</p>
              <p><span className="text-muted">Diupload Oleh:</span> {previewMedia.uploadedBy}</p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => handleCopyUrl(previewMedia)}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1.5"
              >
                <Copy size={13} />
                <span>Salin Tautan Media</span>
              </button>
              <Button variant="outline" size="sm" onClick={() => setPreviewMedia(null)}>Tutup</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HAPUS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-sm w-full p-5 space-y-4 text-center">
            <Trash2 size={28} className="text-danger mx-auto" />
            <h4 className="font-display font-bold text-base text-navy">Hapus File Media?</h4>
            <p className="text-xs text-muted">"{deleteTarget.filename}" akan dihapus permanen.</p>
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

export default StaffMediaLibraryPage;

