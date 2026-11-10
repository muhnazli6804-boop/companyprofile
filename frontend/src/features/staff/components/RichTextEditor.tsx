import React, { useRef, useState, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  RotateCcw,
  Eye,
  Edit3,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tulis isi artikel berita atau konten di sini...',
  minHeight = 'min-h-[280px]',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  // Sinkronisasi value awal ke contentEditable
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, val: string | undefined = undefined) => {
    document.execCommand(command, false, val);
    handleInput();
    editorRef.current?.focus();
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl) {
      execCommand('createLink', linkUrl);
      setLinkUrl('');
      setLinkModalOpen(false);
    }
  };

  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl) {
      execCommand('insertImage', imageUrl);
      setImageUrl('');
      setImageModalOpen(false);
    }
  };

  // Hitung jumlah kata dan karakter
  const textContent = value.replace(/<[^>]*>/g, '').trim();
  const wordCount = textContent ? textContent.split(/\s+/).length : 0;
  const charCount = textContent.length;

  return (
    <div className="border border-navy/20 rounded-card overflow-hidden bg-white shadow-2xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      {/* Header Toolbar */}
      <div className="bg-navy/5 border-b border-navy/10 p-2 flex flex-wrap items-center justify-between gap-2">
        {/* Formatting Controls */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            title="Tebal (Bold)"
            onClick={() => execCommand('bold')}
            className="p-1.5 rounded-md text-ink hover:bg-navy/10 hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            title="Miring (Italic)"
            onClick={() => execCommand('italic')}
            className="p-1.5 rounded-md text-ink hover:bg-navy/10 hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            title="Garis Bawah (Underline)"
            onClick={() => execCommand('underline')}
            className="p-1.5 rounded-md text-ink hover:bg-navy/10 hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <Underline size={16} />
          </button>
          <button
            type="button"
            title="Coret (Strikethrough)"
            onClick={() => execCommand('strikeThrough')}
            className="p-1.5 rounded-md text-ink hover:bg-navy/10 hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <Strikethrough size={16} />
          </button>

          <span className="w-px h-5 bg-navy/15 mx-1" aria-hidden="true" />

          <button
            type="button"
            title="Sub Judul H2"
            onClick={() => execCommand('formatBlock', '<h2>')}
            className="p-1.5 rounded-md text-ink hover:bg-navy/10 hover:text-navy transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <Heading2 size={16} />
          </button>
          <button
            type="button"
            title="Bagian H3"
            onClick={() => execCommand('formatBlock', '<h3>')}
            className="p-1.5 rounded-md text-ink hover:bg-navy/10 hover:text-navy transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <Heading3 size={16} />
          </button>

          <span className="w-px h-5 bg-navy/15 mx-1" aria-hidden="true" />

          <button
            type="button"
            title="Daftar Poin (Bullet List)"
            onClick={() => execCommand('insertUnorderedList')}
            className="p-1.5 rounded-md text-ink hover:bg-navy/10 hover:text-navy transition-colors"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            title="Daftar Nomor (Numbered List)"
            onClick={() => execCommand('insertOrderedList')}
            className="p-1.5 rounded-md text-ink hover:bg-navy/10 hover:text-navy transition-colors"
          >
            <ListOrdered size={16} />
          </button>
          <button
            type="button"
            title="Kutipan (Blockquote)"
            onClick={() => execCommand('formatBlock', '<blockquote>')}
            className="p-1.5 rounded-md text-ink hover:bg-navy/10 hover:text-navy transition-colors"
          >
            <Quote size={16} />
          </button>
          <button
            type="button"
            title="Blok Kode (Code)"
            onClick={() => execCommand('formatBlock', '<pre>')}
            className="p-1.5 rounded-md text-ink hover:bg-navy/10 hover:text-navy transition-colors"
          >
            <Code size={16} />
          </button>

          <span className="w-px h-5 bg-navy/15 mx-1" aria-hidden="true" />

          <button
            type="button"
            title="Sisipkan Tautan (Link)"
            onClick={() => setLinkModalOpen(true)}
            className="p-1.5 rounded-md text-ink hover:bg-navy/10 hover:text-navy transition-colors"
          >
            <LinkIcon size={16} />
          </button>
          <button
            type="button"
            title="Sisipkan Gambar"
            onClick={() => setImageModalOpen(true)}
            className="p-1.5 rounded-md text-ink hover:bg-navy/10 hover:text-navy transition-colors"
          >
            <ImageIcon size={16} />
          </button>
          <button
            type="button"
            title="Hapus Pemformatan"
            onClick={() => execCommand('removeFormat')}
            className="p-1.5 rounded-md text-ink hover:bg-navy/10 hover:text-navy transition-colors text-xs"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Tab Preview Toggle */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-md border border-navy/10">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded ${
              activeTab === 'edit'
                ? 'bg-navy text-white shadow-2xs'
                : 'text-ink-muted hover:text-navy'
            }`}
          >
            <Edit3 size={13} />
            Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded ${
              activeTab === 'preview'
                ? 'bg-navy text-white shadow-2xs'
                : 'text-ink-muted hover:text-navy'
            }`}
          >
            <Eye size={13} />
            Pratinjau
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {activeTab === 'edit' ? (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          data-placeholder={placeholder}
          className={`p-4 font-sans text-sm text-ink focus:outline-none ${minHeight} prose prose-sm max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted`}
          style={{ minHeight: '220px' }}
        />
      ) : (
        <div
          className={`p-4 font-sans text-sm text-ink bg-paper/50 ${minHeight} prose prose-sm max-w-none border-t border-navy/5`}
        >
          {value ? (
            <div dangerouslySetInnerHTML={{ __html: value }} />
          ) : (
            <p className="text-muted italic">Belum ada konten yang ditulis.</p>
          )}
        </div>
      )}

      {/* Footer Word & Character Count */}
      <div className="bg-paper border-t border-navy/10 px-4 py-2 flex items-center justify-between text-xs text-muted">
        <span>Gunakan format paragraf, list, atau kutipan untuk tampilan artikel yang rapi.</span>
        <div className="flex items-center gap-4">
          <span>{wordCount} kata</span>
          <span>{charCount} karakter</span>
        </div>
      </div>

      {/* Modal Sisipkan Link */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card p-5 max-w-sm w-full space-y-4 shadow-lg border border-navy/10">
            <h4 className="font-display font-bold text-navy text-base">Sisipkan Tautan</h4>
            <form onSubmit={handleAddLink} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">URL Tautan (https://...)</label>
                <input
                  type="url"
                  required
                  placeholder="https://padindi.sch.id/..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-navy/20 rounded-control focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-ink-muted hover:bg-navy/5 rounded-control"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-navy text-white rounded-control font-semibold hover:bg-navy-light"
                >
                  Sisipkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sisipkan Gambar */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-card p-5 max-w-sm w-full space-y-4 shadow-lg border border-navy/10">
            <h4 className="font-display font-bold text-navy text-base">Sisipkan Gambar ke Artikel</h4>
            <form onSubmit={handleAddImage} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">URL Gambar</label>
                <input
                  type="text"
                  required
                  placeholder="/images/... atau https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-navy/20 rounded-control focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setImageModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-ink-muted hover:bg-navy/5 rounded-control"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-navy text-white rounded-control font-semibold hover:bg-navy-light"
                >
                  Sisipkan Gambar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
