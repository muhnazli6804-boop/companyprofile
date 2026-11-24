import { describe, it, expect, vi, beforeEach } from 'vitest';
import { staffStore } from '@/features/staff/services/staffContentStore';
import { apiClient } from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: { id: 101, data: { id: 101 } } }),
    put: vi.fn().mockResolvedValue({ data: { success: true } }),
    patch: vi.fn().mockResolvedValue({ data: { success: true } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

describe('StaffContentStore — Pemetaan Status Berita & Galeri', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('mempertahankan status moderasi (pending, revision, rejected) pada saveNews payload', async () => {
    // 1. Simpan berita dengan status pending
    staffStore.saveNews({
      title: 'Artikel Uji Status Pending',
      slug: 'artikel-uji-status-pending',
      category: 'Pengumuman',
      excerpt: 'Ringkasan artikel',
      content: '<p>Konten artikel</p>',
      status: 'pending',
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/admin/posts',
      expect.objectContaining({
        title: 'Artikel Uji Status Pending',
        status: 'pending',
      })
    );

    // 2. Simpan pembaruan berita dengan status revision (menggunakan id: 1 dari data awal)
    staffStore.saveNews({
      id: 1,
      title: 'Artikel Uji Status Revisi',
      status: 'revision',
    });

    expect(apiClient.put).toHaveBeenCalledWith(
      '/admin/posts/1',
      expect.objectContaining({
        title: 'Artikel Uji Status Revisi',
        status: 'revision',
      })
    );

    // 3. Simpan pembaruan berita dengan status rejected (menggunakan id: 2 dari data awal)
    staffStore.saveNews({
      id: 2,
      title: 'Artikel Uji Status Ditolak',
      status: 'rejected',
    });

    expect(apiClient.put).toHaveBeenCalledWith(
      '/admin/posts/2',
      expect.objectContaining({
        status: 'rejected',
      })
    );
  });

  it('mengirimkan PUT /admin/posts/{id} saat updateNewsStatus diubah ke pending, revision, atau rejected', () => {
    // Buat berita awal
    const news = staffStore.saveNews({
      title: 'Berita Untuk Review',
      status: 'draft',
    });

    // Update status ke pending
    staffStore.updateNewsStatus(news.id, 'pending');
    expect(apiClient.put).toHaveBeenCalledWith(
      `/admin/posts/${news.id}`,
      { status: 'pending' }
    );

    // Update status ke revision dengan catatan
    staffStore.updateNewsStatus(news.id, 'revision', 'Perbaiki tata bahasa');
    expect(apiClient.put).toHaveBeenCalledWith(
      `/admin/posts/${news.id}`,
      { status: 'revision' }
    );

    // Update status ke rejected
    staffStore.updateNewsStatus(news.id, 'rejected');
    expect(apiClient.put).toHaveBeenCalledWith(
      `/admin/posts/${news.id}`,
      { status: 'rejected' }
    );
  });

  it('mengirimkan PATCH untuk status published, draft, dan archived pada updateNewsStatus', () => {
    const news = staffStore.saveNews({
      title: 'Berita Workflow Standar',
      status: 'draft',
    });

    staffStore.updateNewsStatus(news.id, 'published');
    expect(apiClient.patch).toHaveBeenCalledWith(`/admin/posts/${news.id}/publish`);

    staffStore.updateNewsStatus(news.id, 'draft');
    expect(apiClient.patch).toHaveBeenCalledWith(`/admin/posts/${news.id}/unpublish`);

    staffStore.updateNewsStatus(news.id, 'archived');
    expect(apiClient.patch).toHaveBeenCalledWith(`/admin/posts/${news.id}/archive`);
  });

  it('mengirimkan status pada saveGallery payload', () => {
    staffStore.saveGallery({
      title: 'Foto Kegiatan Siswa',
      status: 'pending',
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/admin/galleries',
      expect.objectContaining({
        title: 'Foto Kegiatan Siswa',
        status: 'pending',
        is_published: false,
      })
    );
  });
});
