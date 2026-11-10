import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
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
  User,
} from 'lucide-react';
import { staffStore, type AchievementItem, type PublicationStatus } from '../services/staffContentStore';
import { Button } from '@/components/ui/Button';

export const StaffAchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<AchievementItem | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AchievementItem['category']>('Akademik');
  const [level, setLevel] = useState<AchievementItem['level']>('Kota');
  const [rank, setRank] = useState('Juara 1');
  const [recipient, setRecipient] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('/images/gallery/classroom-sd.jpg');
  const [status, setStatus] = useState<PublicationStatus>('published');

  const [previewItem, setPreviewItem] = useState<AchievementItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AchievementItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = () => {
    setAchievements(staffStore.getAchievements());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = achievements.filter((a) => {
    return selectedLevel === 'all' || a.level === selectedLevel;
  });

  const handleOpenCreate = () => {
    setEditItem(null);
    setTitle('');
    setCategory('Akademik');
    setLevel('Kota');
    setRank('Juara 1');
    setRecipient('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setPhotoUrl('/images/gallery/classroom-sd.jpg');
    setStatus('published');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: AchievementItem) => {
    setEditItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setLevel(item.level);
    setRank(item.rank);
    setRecipient(item.recipient);
    setDate(item.date);
    setDescription(item.description);
    setPhotoUrl(item.photoUrl);
    setStatus(item.status);
    setModalOpen(true);
  };

  const handleSave = (targetStatus?: PublicationStatus) => {
    if (!title.trim() || !recipient.trim()) {
      alert('Nama prestasi dan nama peraih prestasi tidak boleh kosong.');
      return;
    }

    const payload: Partial<AchievementItem> & { title: string } = {
      ...(editItem ? { id: editItem.id } : {}),
      title: title.trim(),
      category,
      level,
      rank,
      recipient: recipient.trim(),
      date,
      description: description.trim(),
      photoUrl,
      status: targetStatus || status,
    };

    staffStore.saveAchievement(payload);
    loadData();
    setModalOpen(false);
    setToast(`Prestasi "${title}" berhasil disimpan.`);
    setTimeout(() => setToast(null), 4000);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    staffStore.deleteAchievement(deleteTarget.id);
    loadData();
    setDeleteTarget(null);
    setToast('Data prestasi berhasil dihapus.');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-card border border-navy/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-xl text-navy">Manajemen Prestasi Siswa & Guru</h1>
          <p className="text-xs text-muted mt-0.5">
            Dokumentasikan piagam, piala kejuaraan sains, olahraga, dan seni yang diraih oleh warga yayasan.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="flex items-center gap-1.5 shrink-0">
          <Plus size={16} />
          <span>Tambah Prestasi Baru</span>
        </Button>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-card border border-emerald-200 text-xs flex items-center justify-between">
          <span>{toast}</span>
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      {/* Filter Level Toolbar */}
      <div className="bg-white p-3.5 rounded-card border border-navy/10 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-muted">Tingkat Prestasi:</span>
          {['all', 'Kecamatan', 'Kota', 'Provinsi', 'Nasional', 'Internasional'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedLevel === lvl
                  ? 'bg-navy text-white shadow-2xs'
                  : 'bg-navy/5 text-ink-muted hover:bg-navy/10'
              }`}
            >
              {lvl === 'all' ? 'Semua Tingkat' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-card border border-navy/10 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            <div className="relative h-44 bg-navy/10 overflow-hidden">
              <img
                src={item.photoUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/gallery/classroom-sd.jpg';
                }}
              />
              <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-star text-navy font-bold text-[10px] shadow-sm flex items-center gap-1">
                <Trophy size={11} />
                {item.rank}
              </span>
              <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-navy/80 text-white font-semibold text-[10px]">
                Tingkat {item.level}
              </span>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] text-muted">
                  <span className="font-semibold text-primary">{item.category}</span>
                  <span>•</span>
                  <span>{item.date}</span>
                </div>

                <h3 className="font-display font-bold text-sm text-navy line-clamp-2 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs font-semibold text-ink-muted flex items-center gap-1">
                  <User size={12} className="text-muted" />
                  <span className="truncate">{item.recipient}</span>
                </p>

                <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-navy/10 flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted">{item.status === 'published' ? 'Live di Website' : item.status}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="p-1.5 text-muted hover:text-navy hover:bg-navy/5 rounded"
                    title="Lihat Detail"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-primary hover:text-navy hover:bg-primary/5 rounded"
                    title="Edit Prestasi"
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

      {/* MODAL FORM PRESTASI */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-2xl border border-navy/20 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-navy/10">
              <h3 className="font-display font-bold text-base text-navy">
                {editItem ? 'Sunting Data Prestasi' : 'Tambah Prestasi Baru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted"><X size={18} /></button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-navy uppercase mb-1">Nama Prestasi / Kejuaraan</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Juara 1 Olimpiade Matematika..."
                  className="w-full px-3 py-2 border border-navy/20 rounded-control focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy uppercase mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-navy/20 rounded-control bg-white font-medium"
                  >
                    <option value="Akademik">Akademik</option>
                    <option value="Non-Akademik">Non-Akademik</option>
                    <option value="Seni & Budaya">Seni & Budaya</option>
                    <option value="Olahraga">Olahraga</option>
                    <option value="Teknologi">Teknologi / Robotika</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase mb-1">Tingkat</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full px-3 py-2 border border-navy/20 rounded-control bg-white font-medium"
                  >
                    <option value="Kecamatan">Kecamatan</option>
                    <option value="Kota">Kota</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy uppercase mb-1">Peringkat / Juara</label>
                  <input
                    type="text"
                    required
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    placeholder="Contoh: Juara 1, Medali Emas"
                    className="w-full px-3 py-2 border border-navy/20 rounded-control outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase mb-1">Nama Peraih / Tim</label>
                  <input
                    type="text"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Nama siswa atau tim..."
                    className="w-full px-3 py-2 border border-navy/20 rounded-control outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy uppercase mb-1">Tanggal Pencapaian</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-navy/20 rounded-control outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase mb-1">Foto Dokumentasi</label>
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-navy/20 rounded-control outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy uppercase mb-1">Deskripsi Prestasi</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan kompetisi, penyelenggara, atau catatan perolehan juara..."
                  className="w-full p-2.5 border border-navy/20 rounded-control outline-none"
                />
              </div>

              <div className="pt-2 border-t border-navy/10 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>Batal</Button>
                <Button variant="primary" size="sm" type="submit">Simpan Prestasi</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW PRESTASI */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-navy/10">
              <span className="text-xs font-bold text-star bg-navy px-2.5 py-0.5 rounded-full">
                {previewItem.rank}
              </span>
              <button onClick={() => setPreviewItem(null)} className="text-muted"><X size={18} /></button>
            </div>
            <img src={previewItem.photoUrl} alt="" className="w-full h-52 object-cover rounded-card" />
            <h3 className="font-display font-bold text-base text-navy">{previewItem.title}</h3>
            <p className="text-xs font-semibold text-primary">Peraih: {previewItem.recipient} • Tingkat {previewItem.level}</p>
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
            <h4 className="font-display font-bold text-base text-navy">Hapus Prestasi?</h4>
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

export default StaffAchievementsPage;
