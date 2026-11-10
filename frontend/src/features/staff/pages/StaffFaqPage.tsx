import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileEdit,
  X,
  Search,
} from 'lucide-react';
import { staffStore, type FaqItem, type PublicationStatus } from '../services/staffContentStore';
import { Button } from '@/components/ui/Button';

export const StaffFaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openAccordionId, setOpenAccordionId] = useState<number | null>(1);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FaqItem | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState<FaqItem['category']>('Umum');
  const [order, setOrder] = useState<number>(1);
  const [status, setStatus] = useState<PublicationStatus>('published');

  const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const loadData = () => {
    setFaqs(staffStore.getFaqs());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredFaqs = faqs.filter((f) => {
    const matchCategory = selectedCategory === 'all' || f.category === selectedCategory;
    const matchQuery =
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  const handleOpenCreate = () => {
    setEditItem(null);
    setQuestion('');
    setAnswer('');
    setCategory('Umum');
    setOrder(faqs.length + 1);
    setStatus('published');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: FaqItem) => {
    setEditItem(item);
    setQuestion(item.question);
    setAnswer(item.answer);
    setCategory(item.category);
    setOrder(item.order);
    setStatus(item.status);
    setModalOpen(true);
  };

  const handleSave = (targetStatus?: PublicationStatus) => {
    if (!question.trim() || !answer.trim()) {
      alert('Pertanyaan dan jawaban tidak boleh kosong.');
      return;
    }

    const payload: Partial<FaqItem> & { question: string; answer: string } = {
      ...(editItem ? { id: editItem.id } : {}),
      question: question.trim(),
      answer: answer.trim(),
      category,
      order,
      status: targetStatus || status,
    };

    staffStore.saveFaq(payload);
    loadData();
    setModalOpen(false);
    setToast('Pertanyaan FAQ berhasil disimpan.');
    setTimeout(() => setToast(null), 4000);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    staffStore.deleteFaq(deleteTarget.id);
    loadData();
    setDeleteTarget(null);
    setToast('Pertanyaan FAQ berhasil dihapus.');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-card border border-navy/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-xl text-navy">Manajemen FAQ (Tanya Jawab)</h1>
          <p className="text-xs text-muted mt-0.5">
            Kelola daftar pertanyaan yang sering diajukan calon wali murid dan siswa mengenai yayasan.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="flex items-center gap-1.5 shrink-0">
          <Plus size={16} />
          <span>Tambah Pertanyaan Baru</span>
        </Button>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-card border border-emerald-200 text-xs flex items-center justify-between">
          <span>{toast}</span>
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-card border border-navy/10 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Cari pertanyaan atau jawaban..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-navy/20 rounded-control focus:border-primary outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['all', 'Umum', 'Akademik', 'Pendaftaran PPDB', 'Fasilitas', 'Biaya'].map((cat) => (
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
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white p-12 text-center text-muted rounded-card border border-navy/10 text-xs">
            Tidak ada pertanyaan FAQ yang cocok dengan pencarian.
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openAccordionId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-card border border-navy/10 shadow-2xs overflow-hidden transition-all"
              >
                <div
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-navy/2"
                  onClick={() => setOpenAccordionId(isOpen ? null : faq.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {faq.order}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-navy/5 text-navy">
                          {faq.category}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {faq.status}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-sm text-navy">{faq.question}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(faq)}
                        className="p-1.5 text-primary hover:text-navy hover:bg-navy/5 rounded"
                        title="Edit FAQ"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(faq)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                        title="Hapus FAQ"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="p-4 pt-1 bg-paper/30 border-t border-navy/5 text-xs text-ink leading-relaxed whitespace-pre-line">
                    <p className="font-medium">{faq.answer}</p>
                    <div className="mt-3 pt-2 border-t border-navy/5 text-[10px] text-muted flex items-center justify-between">
                      <span>Ditulis oleh: {faq.author}</span>
                      <span>Urutan Tampil: #{faq.order}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL FORM FAQ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-2xl border border-navy/20 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-navy/10">
              <h3 className="font-display font-bold text-base text-navy">
                {editItem ? 'Sunting Pertanyaan FAQ' : 'Tambah Pertanyaan FAQ'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-muted"><X size={18} /></button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy uppercase mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-navy/20 rounded-control bg-white font-medium outline-none"
                  >
                    <option value="Umum">Umum</option>
                    <option value="Akademik">Akademik</option>
                    <option value="Pendaftaran PPDB">Pendaftaran PPDB</option>
                    <option value="Fasilitas">Fasilitas</option>
                    <option value="Biaya">Biaya Pendidikan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-navy uppercase mb-1">Urutan Tampil</label>
                  <input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-navy/20 rounded-control outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy uppercase mb-1">Pertanyaan (FAQ)</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Contoh: Kapan pendaftaran gelombang kedua dibuka?"
                  className="w-full px-3 py-2 border border-navy/20 rounded-control focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-navy uppercase mb-1">Jawaban Lengkap</label>
                <textarea
                  rows={4}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Tuliskan jawaban yang ramah dan jelas..."
                  className="w-full p-2.5 border border-navy/20 rounded-control focus:border-primary outline-none leading-relaxed"
                />
              </div>

              <div className="pt-2 border-t border-navy/10 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>Batal</Button>
                <Button variant="primary" size="sm" type="submit">Simpan FAQ</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HAPUS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-card max-w-sm w-full p-5 space-y-4 text-center">
            <Trash2 size={28} className="text-danger mx-auto" />
            <h4 className="font-display font-bold text-base text-navy">Hapus Pertanyaan?</h4>
            <p className="text-xs text-muted">"{deleteTarget.question}"</p>
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

export default StaffFaqPage;

