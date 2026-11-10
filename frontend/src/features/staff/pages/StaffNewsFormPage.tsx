import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  Globe,
  Eye,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Tag,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { staffStore, type StaffNewsItem, type PublicationStatus } from '../services/staffContentStore';
import { RichTextEditor } from '../components/RichTextEditor';
import { Button } from '@/components/ui/Button';
import { useCurrentUser } from '@/features/auth/permissions';

export const StaffNewsFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Akademik');
  const [thumbnail, setThumbnail] = useState('/images/news/ppdb-cover.jpg');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Yayasan Padindi']);
  const [author, setAuthor] = useState('');
  const [publishedAt, setPublishedAt] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [status, setStatus] = useState<PublicationStatus>('draft');
  const [revisionNotes, setRevisionNotes] = useState<string | undefined>(undefined);

  // Preview Modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Set default author from current logged in user
  useEffect(() => {
    if (user?.name && !author) {
      setAuthor(user.name);
    }
  }, [user, author]);

  // Load existing data if editing
  useEffect(() => {
    if (isEdit && id) {
      const item = staffStore.getNewsById(Number(id));
      if (item) {
        setTitle(item.title);
        setSlug(item.slug);
        setCategory(item.category);
        setThumbnail(item.thumbnail);
        setExcerpt(item.excerpt);
        setContent(item.content);
        setTags(item.tags || []);
        setAuthor(item.author);
        setPublishedAt(item.publishedAt ? item.publishedAt.split('T')[0] : '');
        setMetaTitle(item.metaTitle || '');
        setMetaDescription(item.metaDescription || '');
        setStatus(item.status);
        setRevisionNotes(item.revisionNotes);
      }
    }
  }, [isEdit, id]);

  // Auto generate slug from title if not manually customized
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit || !slug) {
      const auto = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(auto);
    }
    if (!metaTitle) {
      setMetaTitle(val);
    }
  };

  // Tag chip add / remove
  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((x) => x !== t));
  };

  // Submit Handler with specific status
  const handleSave = (targetStatus: PublicationStatus) => {
    if (!title.trim()) {
      alert('Judul berita tidak boleh kosong.');
      return;
    }

    const payload: Partial<StaffNewsItem> & { title: string } = {
      ...(isEdit && id ? { id: Number(id) } : {}),
      title: title.trim(),
      slug: slug.trim() || 'berita-' + Date.now(),
      category,
      thumbnail: thumbnail || '/images/news/ppdb-cover.jpg',
      excerpt: excerpt || title,
      content: content || '<p>Isi artikel...</p>',
      tags,
      author: author || 'Staf Yayasan',
      status: targetStatus,
      publishedAt: targetStatus === 'published' ? new Date().toISOString() : publishedAt ? new Date(publishedAt).toISOString() : null,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
    };

    const saved = staffStore.saveNews(payload);
    if (saved) {
      setSaveSuccess(true);
      setTimeout(() => {
        navigate('/staff/berita');
      }, 800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 md:p-5 rounded-card border border-navy/10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/staff/berita"
            className="p-2 rounded-lg text-ink-muted hover:text-navy hover:bg-navy/5 transition-colors border border-navy/10"
            title="Kembali ke Daftar Berita"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-display font-bold text-lg text-navy">
              {isEdit ? 'Sunting Artikel Berita' : 'Tambah Artikel Berita Baru'}
            </h1>
            <p className="text-xs text-muted">
              {isEdit ? `ID: #${id} • Status saat ini: ${status}` : 'Tulis dan susun artikel untuk publikasi website'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
            className="text-xs flex items-center gap-1.5"
          >
            <Eye size={14} />
            <span>Pratinjau</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSave('draft')}
            className="text-xs flex items-center gap-1.5"
          >
            <Save size={14} />
            <span>Simpan Draft</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSave('pending')}
            className="text-xs flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Send size={14} />
            <span>Ajukan Publikasi</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSave('published')}
            className="text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Globe size={14} />
            <span>Publikasikan</span>
          </Button>
        </div>
      </div>

      {/* Revision notes banner if status is revision */}
      {status === 'revision' && revisionNotes && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-card text-rose-800 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Catatan Perbaikan dari Administrator:</p>
            <p className="leading-relaxed">{revisionNotes}</p>
            <p className="text-[11px] text-rose-600 font-medium pt-1">
              Silakan sesuaikan isi berita sesuai catatan di atas, kemudian klik <strong>"Ajukan Publikasi"</strong> untuk ditinjau ulang.
            </p>
          </div>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Judul Berita */}
          <div className="bg-white p-5 rounded-card border border-navy/10 shadow-2xs space-y-3">
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                Judul Berita <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Masukkan judul berita yang menarik dan informatif..."
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-semibold border border-navy/20 rounded-control focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            {/* Slug URL Otomatis */}
            <div>
              <label className="block text-[11px] font-semibold text-muted mb-1 flex items-center justify-between">
                <span>Slug URL Web (Permalink):</span>
                <span className="text-[10px]">Otomatis dihasilkan dari judul</span>
              </label>
              <div className="flex items-center text-xs border border-navy/20 rounded-control overflow-hidden bg-paper/50">
                <span className="px-3 text-muted bg-navy/5 border-r border-navy/10 font-mono text-[11px]">
                  https://padindi.sch.id/berita/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-transparent focus:outline-none font-mono"
                  placeholder="judul-artikel-berita"
                />
              </div>
            </div>
          </div>

          {/* Isi Konten dengan Rich Text Editor */}
          <div className="bg-white p-5 rounded-card border border-navy/10 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-navy uppercase tracking-wider">
                Isi Lengkap Artikel Berita <span className="text-danger">*</span>
              </label>
              <span className="text-xs text-muted">Format WYSIWYG Editor</span>
            </div>
            <RichTextEditor value={content} onChange={setContent} minHeight="min-h-[320px]" />
          </div>

          {/* Ringkasan Berita (Excerpt) */}
          <div className="bg-white p-5 rounded-card border border-navy/10 shadow-2xs space-y-2">
            <label className="block text-xs font-bold text-navy uppercase tracking-wider">
              Ringkasan Singkat (Excerpt)
            </label>
            <p className="text-[11px] text-muted">
              Ringkasan 1-2 kalimat untuk ditampilkan pada kartu preview kegiatan dan kartu berita di Landing Page.
            </p>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Tulis ringkasan singkat artikel di sini..."
              className="w-full p-3 text-xs border border-navy/20 rounded-control focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          {/* SEO Meta Information */}
          <div className="bg-white p-5 rounded-card border border-navy/10 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-navy/10">
              <h3 className="font-display font-bold text-sm text-navy flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Optimasi Mesin Pencari (SEO Google)
              </h3>
              <span className="text-[11px] text-muted">SERP Snippet</span>
            </div>

            {/* Google SERP Live Preview Box */}
            <div className="bg-paper p-3.5 rounded-card border border-navy/10 space-y-1">
              <p className="text-[11px] text-emerald-800 font-mono">https://padindi.sch.id › berita › {slug || '...'}</p>
              <h4 className="text-sm font-semibold text-[#1a0dab] line-clamp-1">
                {metaTitle || title || 'Judul Halaman Berita Yayasan Padindi'}
              </h4>
              <p className="text-xs text-ink-muted line-clamp-2">
                {metaDescription || excerpt || 'Ringkasan artikel berita dan kegiatan terbaru di Yayasan Padindi.'}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Meta Title Tag</label>
                <input
                  type="text"
                  placeholder="Judul untuk hasil pencarian Google"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-navy/20 rounded-control focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Meta Description Tag</label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi singkat yang tampil di bawah judul pada hasil pencarian"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-navy/20 rounded-control focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Metadata & Settings */}
        <div className="space-y-5">
          {/* Thumbnail / Gambar Utama */}
          <div className="bg-white p-5 rounded-card border border-navy/10 shadow-2xs space-y-3">
            <label className="block text-xs font-bold text-navy uppercase tracking-wider">
              Thumbnail / Gambar Utama <span className="text-danger">*</span>
            </label>

            <div className="w-full h-44 rounded-card overflow-hidden bg-navy/5 border border-navy/10 relative group">
              <img
                src={thumbnail}
                alt="Thumbnail Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/news/ppdb-cover.jpg';
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-ink">URL Gambar atau Jalur Media:</label>
              <input
                type="text"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="/images/news/... atau https://..."
                className="w-full px-3 py-2 text-xs border border-navy/20 rounded-control focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono"
              />
            </div>

            {/* Quick choices */}
            <div className="pt-1">
              <span className="block text-[10px] text-muted mb-1.5 font-medium">Pilih Contoh Media:</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  '/images/news/ppdb-cover.jpg',
                  '/images/gallery/classroom-sd.jpg',
                  '/images/gallery/lab-komputer.jpg',
                  '/images/gallery/lapangan-olahraga.jpg',
                ].map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setThumbnail(src)}
                    className={`h-10 rounded border overflow-hidden transition-all ${
                      thumbnail === src ? 'ring-2 ring-primary border-primary' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Kategori Berita */}
          <div className="bg-white p-5 rounded-card border border-navy/10 shadow-2xs space-y-2">
            <label className="block text-xs font-bold text-navy uppercase tracking-wider">
              Kategori Berita <span className="text-danger">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-navy/20 rounded-control focus:border-primary outline-none bg-white font-medium"
            >
              <option value="Akademik">Akademik & Kurikulum</option>
              <option value="Kegiatan">Kegiatan & Acara Siswa</option>
              <option value="Prestasi">Prestasi & Penghargaan</option>
              <option value="Pengumuman">Pengumuman Resmi Yayasan</option>
              <option value="Artikel Guru">Artikel & Opini Guru</option>
              <option value="Pendidikan Karakter">Pendidikan Karakter</option>
            </select>
          </div>

          {/* Tag Berita */}
          <div className="bg-white p-5 rounded-card border border-navy/10 shadow-2xs space-y-3">
            <label className="block text-xs font-bold text-navy uppercase tracking-wider">
              Tag / Label Berita
            </label>
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-control border border-navy/20 bg-paper/30">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-navy/10 text-navy font-semibold text-xs"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-danger text-muted ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Ketik tag & Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="text-xs bg-transparent focus:outline-none flex-1 min-w-[100px] p-0.5"
              />
            </div>
            <p className="text-[10px] text-muted">Tekan Enter atau tanda koma (,) untuk menambahkan tag baru.</p>
          </div>

          {/* Penulis & Jadwal Publikasi */}
          <div className="bg-white p-5 rounded-card border border-navy/10 shadow-2xs space-y-3">
            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                Nama Penulis
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Nama penulis / guru..."
                className="w-full px-3 py-2 text-xs border border-navy/20 rounded-control focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                Jadwal Tanggal Publikasi
              </label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-navy/20 rounded-control focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PRATINJAU LENGKAP */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-card max-w-3xl w-full my-8 p-6 shadow-2xl border border-navy/20 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-navy/10">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Pratinjau Artikel Berita
              </span>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1 rounded-lg hover:bg-navy/5 text-muted hover:text-navy"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                  {category}
                </span>
                <span>•</span>
                <span>{author || 'Staf Yayasan'}</span>
              </div>

              <h2 className="font-display font-bold text-2xl text-navy leading-snug">
                {title || 'Judul Berita Belum Ditulis'}
              </h2>

              <img
                src={thumbnail}
                alt={title}
                className="w-full h-72 object-cover rounded-card border border-navy/10"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/news/ppdb-cover.jpg';
                }}
              />

              <div
                className="prose prose-sm max-w-none text-ink leading-relaxed font-sans"
                dangerouslySetInnerHTML={{ __html: content || '<p>Belum ada isi konten...</p>' }}
              />

              {tags.length > 0 && (
                <div className="pt-3 border-t border-navy/10 flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-navy/5 text-navy rounded text-[11px]">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-navy/10 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setPreviewOpen(false)}>
                Tutup Pratinjau
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffNewsFormPage;

