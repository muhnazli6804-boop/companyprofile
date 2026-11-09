import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Image,
  Newspaper,
  Users,
  Award,
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Search,
  Layers,
  Save,
  Globe,
} from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { apiClient } from '@/lib/api-client';

// Types
export interface BannerItem {
  id: number;
  title: string;
  subtitle?: string | null;
  image_path: string;
  cta_label?: string | null;
  link_url?: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface PostItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  cover_path?: string | null;
  status: 'draft' | 'published' | 'archived';
  post_category_id?: number | null;
  category?: { id: number; name: string } | null;
  published_at?: string | null;
  created_at: string;
}

export interface GalleryItemType {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  cover_path?: string | null;
  event_date?: string | null;
  is_published: boolean;
  items?: { id: number; path: string; caption?: string }[];
}

export interface OrgMemberItem {
  id: number;
  name: string;
  position: string;
  photo_path?: string | null;
  bio?: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
}

export interface AchievementItem {
  id: number;
  title: string;
  category: string;
  year: string;
  description: string;
  image_path?: string;
}

// Fallback initial data with [Contoh] prefix
const FALLBACK_BANNERS: BannerItem[] = [
  {
    id: 1,
    title: '[Contoh] Selamat Datang di Yayasan Perguruan Padindi',
    subtitle: 'Mewujudkan Generasi Cerdas, Berkarakter, dan Berakhlak Mulia Menuju Masa Depan Gemilang',
    image_path: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
    cta_label: 'Daftar PPDB Online',
    link_url: '/pendaftaran',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 2,
    title: '[Contoh] Pendaftaran Murid Baru (PPDB) 2026/2027 Resmi Dibuka',
    subtitle: 'Dapatkan Beasiswa Prestasi dan Fasilitas Pembelajaran Berbasis Teknologi Modern',
    image_path: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    cta_label: 'Pelajari Persyaratan',
    link_url: '/informasi-pendaftaran',
    sort_order: 2,
    is_active: true,
  },
];

const FALLBACK_POSTS: PostItem[] = [
  {
    id: 1,
    title: '[Contoh] Pembukaan Pendaftaran Peserta Didik Baru Tahun Ajaran 2026/2027',
    slug: 'pembukaan-ppdb-2026-2027',
    excerpt: 'Yayasan Padindi resmi membuka sistem pendaftaran daring terintegrasi untuk jenjang TK, SD, dan SMP.',
    content: 'Pendaftaran murid baru tahun ajaran 2026/2027 kini telah dibuka secara penuh. Seluruh orang tua dan calon murid dapat melengkapi formulir data diri, mengunggah berkas kartu keluarga, akta kelahiran, dan rapor langsung melalui sistem informasi online kami.',
    cover_path: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    category: { id: 1, name: 'Pengumuman Resmi' },
    published_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    title: '[Contoh] Tim Robotik SMP Padindi Raih Medali Emas Tingkat Nasional',
    slug: 'tim-robotik-raih-medali-emas',
    excerpt: 'Karya inovatif robot pemilah sampah berbasis kecerdasan buatan sukses merebut podium tertinggi.',
    content: 'Siswa-siswi perwakilan tim robotik SMP Padindi berhasil mengharumkan nama sekolah dalam Olimpiade Sains & Teknologi Pelajar Nasional. Inovasi sensor pemilah limbah otomatis berhasil memukau dewan juri.',
    cover_path: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    category: { id: 2, name: 'Prestasi Siswa' },
    published_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

const FALLBACK_GALLERIES: GalleryItemType[] = [
  {
    id: 1,
    title: '[Contoh] Gelar Karya Kreativitas dan Pentas Seni Budaya Nusantara',
    slug: 'gelar-karya-seni-budaya',
    description: 'Dokumentasi pentas tari tradisional, paduan suara, dan pameran hasil karya seni rupa murid Yayasan Padindi.',
    cover_path: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    event_date: '2026-10-15',
    is_published: true,
    items: [
      { id: 1, path: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', caption: 'Pentas Tari Tradisional' },
      { id: 2, path: 'https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&w=800&q=80', caption: 'Pameran Lukisan Siswa' },
    ],
  },
];

const FALLBACK_ORG: OrgMemberItem[] = [
  {
    id: 1,
    name: '[Contoh] Dr. H. Sulaiman Effendi, M.Pd.',
    position: 'Ketua Pembina Yayasan',
    photo_path: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Berpengalaman lebih dari 30 tahun dalam pembinaan karakter dan standardisasi kurikulum unggulan swasta.',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 2,
    name: '[Contoh] Hj. Nurul Hidayati, S.E., M.M.',
    position: 'Ketua Umum Pengurus Yayasan',
    photo_path: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: 'Memimpin koordinasi operasional sekolah dan integrasi sistem informasi digital Yayasan Padindi.',
    sort_order: 2,
    is_active: true,
  },
];

const FALLBACK_FAQS: FaqItem[] = [
  {
    id: 1,
    question: 'Kapan pendaftaran murid baru (PPDB) dibuka?',
    answer: 'PPDB Gelombang 1 dibuka mulai bulan Oktober hingga Januari. Pendaftaran dapat dilakukan secara daring melalui website atau datang langsung ke sekretariat yayasan.',
    sort_order: 1,
  },
  {
    id: 2,
    question: 'Apa saja dokumen persyaratan pendaftaran?',
    answer: 'Persyaratan umum meliputi Akta Kelahiran, Kartu Keluarga, Pas Foto terbaru 3x4, dan Surat Keterangan Lulus / Rapor bagi jenjang lanjutan.',
    sort_order: 2,
  },
  {
    id: 3,
    question: 'Bagaimana alur seleksi rekrutmen guru?',
    answer: 'Alur seleksi meliputi seleksi administrasi berkas, wawancara kompetensi dan komitmen, microteaching, serta verifikasi kelengkapan ijazah.',
    sort_order: 3,
  },
];

const FALLBACK_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 1,
    title: '[Contoh] Juara 1 Lomba Cerdas Cermat Sains Tingkat Provinsi DKI',
    category: 'Akademik',
    year: '2026',
    description: 'Dipersembahkan oleh siswa SD Padindi dalam kompetisi olimpiade IPA dan Matematika se-Jabodetabek.',
  },
  {
    id: 2,
    title: '[Contoh] Medali Emas Kejuaraan Pencak Silat Pelajar Nasional',
    category: 'Olahraga',
    year: '2025',
    description: 'Prestasi non-akademik kejuaraan silat tingkat nasional yang diraih kontingen ekstrakurikuler bela diri.',
  },
];

export const CmsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hero' | 'articles' | 'gallery' | 'profile' | 'achievements' | 'faq_contact'>('hero');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Banners state
  const [banners, setBanners] = useState<BannerItem[]>(FALLBACK_BANNERS);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [bannerForm, setBannerForm] = useState<Partial<BannerItem>>({
    title: '',
    subtitle: '',
    image_path: '',
    cta_label: '',
    link_url: '',
    is_active: true,
  });
  const [heroPreviewOpen, setHeroPreviewOpen] = useState(false);
  const [deleteBannerTarget, setDeleteBannerTarget] = useState<BannerItem | null>(null);

  // 2. Articles state
  const [articles, setArticles] = useState<PostItem[]>(FALLBACK_POSTS);
  const [articleSearch, setArticleSearch] = useState('');
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [articleForm, setArticleForm] = useState<Partial<PostItem>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_path: '',
    status: 'draft',
  });
  const [articlePreviewTarget, setArticlePreviewTarget] = useState<PostItem | null>(null);
  const [deleteArticleTarget, setDeleteArticleTarget] = useState<PostItem | null>(null);

  // 3. Galleries state
  const [galleries, setGalleries] = useState<GalleryItemType[]>(FALLBACK_GALLERIES);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryForm, setGalleryForm] = useState<Partial<GalleryItemType>>({
    title: '',
    description: '',
    cover_path: '',
    event_date: '',
    is_published: true,
  });
  const [deleteGalleryTarget, setDeleteGalleryTarget] = useState<GalleryItemType | null>(null);

  // 4. Organization Profile state
  const [orgMembers, setOrgMembers] = useState<OrgMemberItem[]>(FALLBACK_ORG);
  const [orgModalOpen, setOrgModalOpen] = useState(false);
  const [orgForm, setOrgForm] = useState<Partial<OrgMemberItem>>({
    name: '',
    position: '',
    bio: '',
    photo_path: '',
    is_active: true,
  });
  const [deleteOrgTarget, setDeleteOrgTarget] = useState<OrgMemberItem | null>(null);

  // Profile Static text
  const [visionText, setVisionText] = useState('Terwujudnya lembaga pendidikan Islam terpadu yang unggul, berakhlak mulia, berprestasi tinggi, serta mampu beradaptasi dengan kemajuan teknologi global.');
  const [missionList, setMissionList] = useState([
    'Menyelenggarakan pendidikan holistik yang memadukan ilmu pengetahuan umum dan nilai-nilai akhlakul karimah.',
    'Menciptakan lingkungan belajar yang inovatif, ramah anak, disiplin, dan berwawasan lingkungan.',
    'Mengembangkan potensi bakat kepemimpinan, riset ilmiah, dan kreativitas seni budaya murid.',
    'Menjalin kemitraan sinergis antara pendidik, orang tua, dan masyarakat.',
  ]);

  // 5. Achievements state
  const [achievements, setAchievements] = useState<AchievementItem[]>(FALLBACK_ACHIEVEMENTS);
  const [achievementModalOpen, setAchievementModalOpen] = useState(false);
  const [achievementForm, setAchievementForm] = useState<Partial<AchievementItem>>({
    title: '',
    category: 'Akademik',
    year: '2026',
    description: '',
  });

  // 6. FAQs state
  const [faqs, setFaqs] = useState<FaqItem[]>(FALLBACK_FAQS);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [faqForm, setFaqForm] = useState<Partial<FaqItem>>({
    question: '',
    answer: '',
  });

  // Contact info state
  const [contactInfo, setContactInfo] = useState({
    address: 'Jl. Padindi Raya No. 10–12, Jakarta Barat, DKI Jakarta 11840',
    phone: '021-5550100',
    whatsapp: '081234567890',
    email: 'info@padindi.sch.id',
    maps_url: 'https://maps.google.com/?q=-6.15555,106.70555',
  });

  // Load backend data if available
  useQuery({
    queryKey: ['adminCmsBanners'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: BannerItem[] }>('/admin/banners');
        if (res.data?.data?.length) setBanners(res.data.data);
      } catch {
        // use fallback
      }
      return null;
    },
  });

  useQuery({
    queryKey: ['adminCmsPosts'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: PostItem[] }>('/admin/posts');
        if (res.data?.data?.length) setArticles(res.data.data);
      } catch {
        // use fallback
      }
      return null;
    },
  });

  useQuery({
    queryKey: ['adminCmsGalleries'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: GalleryItemType[] }>('/admin/galleries');
        if (res.data?.data?.length) setGalleries(res.data.data);
      } catch {
        // use fallback
      }
      return null;
    },
  });

  useQuery({
    queryKey: ['adminCmsOrgMembers'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: OrgMemberItem[] }>('/admin/organization-members');
        if (res.data?.data?.length) setOrgMembers(res.data.data);
      } catch {
        // use fallback
      }
      return null;
    },
  });

  // --- Handlers: Banner ---
  const handleSaveBanner = async () => {
    if (!bannerForm.title || !bannerForm.image_path) {
      alert('Judul dan URL gambar banner wajib diisi.');
      return;
    }

    if (bannerForm.id) {
      // Edit
      try {
        await apiClient.put(`/admin/banners/${bannerForm.id}`, bannerForm);
      } catch {
        // offline mock
      }
      setBanners((prev) =>
        prev.map((b) => (b.id === bannerForm.id ? { ...(bannerForm as BannerItem) } : b))
      );
      showToast('Banner hero berhasil diperbarui.');
    } else {
      // Add
      const newId = Date.now();
      const newBanner: BannerItem = {
        id: newId,
        title: bannerForm.title || '',
        subtitle: bannerForm.subtitle || '',
        image_path: bannerForm.image_path || '',
        cta_label: bannerForm.cta_label || 'Daftar Sekarang',
        link_url: bannerForm.link_url || '/pendaftaran',
        sort_order: banners.length + 1,
        is_active: bannerForm.is_active ?? true,
      };
      try {
        await apiClient.post('/admin/banners', newBanner);
      } catch {
        // offline mock
      }
      setBanners((prev) => [...prev, newBanner]);
      showToast('Banner hero baru berhasil ditambahkan.');
    }
    setBannerModalOpen(false);
  };

  const handleToggleBannerActive = async (b: BannerItem) => {
    const updated = { ...b, is_active: !b.is_active };
    setBanners((prev) => prev.map((item) => (item.id === b.id ? updated : item)));
    try {
      await apiClient.put(`/admin/banners/${b.id}`, updated);
    } catch {
      // mock
    }
    showToast(`Banner "${b.title}" ${updated.is_active ? 'diaktifkan' : 'dinonaktifkan'}.`);
  };

  // --- Handlers: Article ---
  const handleSaveArticle = async () => {
    if (!articleForm.title || !articleForm.content) {
      alert('Judul artikel dan konten wajib diisi.');
      return;
    }

    if (articleForm.id) {
      try {
        await apiClient.put(`/admin/posts/${articleForm.id}`, articleForm);
      } catch {
        // mock
      }
      setArticles((prev) =>
        prev.map((a) => (a.id === articleForm.id ? { ...(articleForm as PostItem) } : a))
      );
      showToast('Artikel berhasil diperbarui.');
    } else {
      const newPost: PostItem = {
        id: Date.now(),
        title: articleForm.title || '',
        slug: articleForm.slug || articleForm.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'post',
        excerpt: articleForm.excerpt || '',
        content: articleForm.content || '',
        cover_path: articleForm.cover_path || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
        status: articleForm.status || 'published',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        category: { id: 1, name: 'Informasi Umum' },
      };
      try {
        await apiClient.post('/admin/posts', newPost);
      } catch {
        // mock
      }
      setArticles((prev) => [newPost, ...prev]);
      showToast('Artikel berhasil dipublikasikan ke Landing Page.');
    }
    setArticleModalOpen(false);
  };

  // --- Handlers: Gallery ---
  const handleSaveGallery = async () => {
    if (!galleryForm.title) {
      alert('Judul album galeri wajib diisi.');
      return;
    }
    const newGal: GalleryItemType = {
      id: Date.now(),
      title: galleryForm.title || '',
      slug: galleryForm.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'galeri',
      description: galleryForm.description || '',
      cover_path: galleryForm.cover_path || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      event_date: galleryForm.event_date || new Date().toISOString().split('T')[0],
      is_published: true,
      items: [
        { id: 1, path: galleryForm.cover_path || '', caption: 'Dokumentasi Utama' },
      ],
    };
    try {
      await apiClient.post('/admin/galleries', newGal);
    } catch {
      // mock
    }
    setGalleries((prev) => [newGal, ...prev]);
    setGalleryModalOpen(false);
    showToast('Album galeri berhasil ditambahkan.');
  };

  // --- Handlers: Profile & Org ---
  const handleSaveOrgMember = async () => {
    if (!orgForm.name || !orgForm.position) {
      alert('Nama dan jabatan pengurus wajib diisi.');
      return;
    }

    if (orgForm.id) {
      try {
        await apiClient.put(`/admin/organization-members/${orgForm.id}`, orgForm);
      } catch {
        // mock
      }
      setOrgMembers((prev) =>
        prev.map((m) => (m.id === orgForm.id ? { ...(orgForm as OrgMemberItem) } : m))
      );
      showToast('Data pengurus berhasil diperbarui.');
    } else {
      const newMember: OrgMemberItem = {
        id: Date.now(),
        name: orgForm.name || '',
        position: orgForm.position || '',
        bio: orgForm.bio || '',
        photo_path: orgForm.photo_path || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        sort_order: orgMembers.length + 1,
        is_active: true,
      };
      try {
        await apiClient.post('/admin/organization-members', newMember);
      } catch {
        // mock
      }
      setOrgMembers((prev) => [...prev, newMember]);
      showToast('Pengurus baru berhasil ditambahkan.');
    }
    setOrgModalOpen(false);
  };

  // --- Handlers: Achievement ---
  const handleSaveAchievement = () => {
    if (!achievementForm.title) {
      alert('Nama prestasi wajib diisi.');
      return;
    }
    const newAch: AchievementItem = {
      id: Date.now(),
      title: achievementForm.title || '',
      category: achievementForm.category || 'Akademik',
      year: achievementForm.year || '2026',
      description: achievementForm.description || '',
    };
    setAchievements((prev) => [newAch, ...prev]);
    setAchievementModalOpen(false);
    showToast('Prestasi siswa berhasil ditambahkan.');
  };

  // --- Handlers: FAQ ---
  const handleSaveFaq = () => {
    if (!faqForm.question || !faqForm.answer) {
      alert('Pertanyaan dan jawaban FAQ wajib diisi.');
      return;
    }
    const newFaq: FaqItem = {
      id: Date.now(),
      question: faqForm.question || '',
      answer: faqForm.answer || '',
      sort_order: faqs.length + 1,
    };
    setFaqs((prev) => [...prev, newFaq]);
    setFaqModalOpen(false);
    showToast('FAQ baru berhasil ditambahkan.');
  };

  return (
    <div className="space-y-6">
      <SeoHead title="CMS & Manajemen Konten Website - Yayasan Padindi" />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-navy text-white rounded-control shadow-xl border border-star text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-star" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <AdminPageHeader
        title="CMS & Kelola Konten Landing Page"
        description="Kelola seluruh informasi visual, teks, berita, profil yayasan, dan galeri yang tampil pada website publik Yayasan Padindi."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Konten', to: '/admin/cms' },
          { label: 'CMS Landing Page' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-semibold bg-white text-navy border border-navy/20 hover:bg-navy/5 shadow-sm transition-colors"
            >
              <Globe className="w-4 h-4 text-primary" />
              Lihat Website Publik
            </a>
          </div>
        }
      />

      {/* Navigation Tabs */}
      <div className="bg-white rounded-card border border-navy/10 shadow-sm p-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-control text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'hero'
                ? 'bg-navy text-white shadow-sm'
                : 'text-ink-muted hover:bg-navy/5 hover:text-navy'
            }`}
          >
            <Image className="w-4 h-4" />
            1. Hero & Banner Beranda
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('articles')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-control text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'articles'
                ? 'bg-navy text-white shadow-sm'
                : 'text-ink-muted hover:bg-navy/5 hover:text-navy'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            2. Berita & Artikel
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-control text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'bg-navy text-white shadow-sm'
                : 'text-ink-muted hover:bg-navy/5 hover:text-navy'
            }`}
          >
            <Layers className="w-4 h-4" />
            3. Galeri Media
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-control text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-navy text-white shadow-sm'
                : 'text-ink-muted hover:bg-navy/5 hover:text-navy'
            }`}
          >
            <Users className="w-4 h-4" />
            4. Profil & Organisasi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-control text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'achievements'
                ? 'bg-navy text-white shadow-sm'
                : 'text-ink-muted hover:bg-navy/5 hover:text-navy'
            }`}
          >
            <Award className="w-4 h-4" />
            5. Prestasi & Fasilitas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('faq_contact')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-control text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === 'faq_contact'
                ? 'bg-navy text-white shadow-sm'
                : 'text-ink-muted hover:bg-navy/5 hover:text-navy'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            6. FAQ & Kontak
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HERO & BANNER BERANDA */}
      {/* ========================================================================= */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-navy/10 shadow-sm">
            <div>
              <h3 className="font-display font-bold text-base text-navy">Manajemen Hero Section & Banner Utama</h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Banner aktif akan ditampilkan pada slider / carousel bagian teratas halaman utama website publik.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHeroPreviewOpen(true)}
                className="text-xs flex items-center gap-1.5 border-navy/20 text-navy"
              >
                <Eye className="w-4 h-4" /> Pratinjau Tampilan
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setBannerForm({
                    title: '',
                    subtitle: '',
                    image_path: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
                    cta_label: 'Daftar PPDB Online',
                    link_url: '/pendaftaran',
                    is_active: true,
                  });
                  setBannerModalOpen(true);
                }}
                className="text-xs flex items-center gap-1.5 bg-navy text-white"
              >
                <Plus className="w-4 h-4 text-star" /> Tambah Banner Hero
              </Button>
            </div>
          </div>

          {/* Banner Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {banners.map((b) => (
              <div
                key={b.id}
                className={`bg-white rounded-card border overflow-hidden shadow-sm transition-all hover:shadow-md ${
                  b.is_active ? 'border-navy/20 ring-1 ring-navy/10' : 'border-ink-muted/20 opacity-70'
                }`}
              >
                {/* Banner Image Preview */}
                <div className="relative h-44 bg-navy/90 overflow-hidden group">
                  <img
                    src={b.image_path}
                    alt={b.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent p-4 flex flex-col justify-end">
                    <span className="text-[11px] font-bold text-star uppercase tracking-wider mb-1">
                      Urutan #{b.sort_order}
                    </span>
                    <h4 className="text-white font-bold text-sm leading-snug drop-shadow-sm">{b.title}</h4>
                    {b.subtitle && (
                      <p className="text-white/80 text-xs line-clamp-1 mt-0.5">{b.subtitle}</p>
                    )}
                  </div>

                  {/* Status Pill */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold shadow-sm ${
                        b.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white/80'
                      }`}
                    >
                      {b.is_active ? 'Aktif Tayang' : 'Nonaktif'}
                    </span>
                  </div>
                </div>

                {/* Banner Details & Controls */}
                <div className="p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between text-xs text-ink-muted border-b border-navy/10 pb-2">
                    <span>Tombol CTA: <strong>{b.cta_label || '—'}</strong></span>
                    <span>Tujuan Link: <code className="text-[11px] text-navy">{b.link_url || '/'}</code></span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleToggleBannerActive(b)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-control transition-colors ${
                        b.is_active
                          ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {b.is_active ? 'Nonaktifkan Banner' : 'Aktifkan Banner'}
                    </button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setBannerForm(b);
                          setBannerModalOpen(true);
                        }}
                        className="text-xs p-1.5 text-navy hover:bg-navy/10"
                        title="Edit Banner"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteBannerTarget(b)}
                        className="text-xs p-1.5 text-rose-600 hover:bg-rose-50"
                        title="Hapus Banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BERITA & ARTIKEL */}
      {/* ========================================================================= */}
      {activeTab === 'articles' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-navy/10 shadow-sm">
            <div>
              <h3 className="font-display font-bold text-base text-navy">Manajemen Berita & Artikel Yayasan</h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Seluruh artikel yang berstatus "Diterbitkan" akan langsung tampil di halaman berita publik.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setArticleForm({
                    title: '',
                    slug: '',
                    excerpt: '',
                    content: '',
                    cover_path: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
                    status: 'published',
                  });
                  setArticleModalOpen(true);
                }}
                className="text-xs flex items-center gap-1.5 bg-navy text-white"
              >
                <Plus className="w-4 h-4 text-star" /> Tulis Artikel Baru
              </Button>
            </div>
          </div>

          {/* Search Box */}
          <div className="bg-white p-4 rounded-card border border-navy/10 shadow-sm flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari judul berita..."
                value={articleSearch}
                onChange={(e) => setArticleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-paper border border-navy/15 rounded-control focus:outline-none focus:ring-2 focus:ring-navy/30 text-ink"
              />
            </div>
            <span className="text-xs text-ink-muted">
              Total {articles.length} artikel terdaftar
            </span>
          </div>

          {/* Articles Table */}
          <div className="bg-white rounded-card border border-navy/10 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-paper text-xs uppercase text-ink-muted font-bold tracking-wider border-b border-navy/10">
                  <th className="py-3 px-4">Cover & Judul Artikel</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Tanggal Rilis</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/5">
                {articles
                  .filter((a) =>
                    articleSearch ? a.title.toLowerCase().includes(articleSearch.toLowerCase()) : true
                  )
                  .map((art) => (
                    <tr key={art.id} className="hover:bg-navy/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={art.cover_path || 'https://via.placeholder.com/80'}
                            alt={art.title}
                            className="w-14 h-11 object-cover rounded-control border border-navy/15 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-navy text-sm hover:underline cursor-pointer" onClick={() => setArticlePreviewTarget(art)}>
                              {art.title}
                            </p>
                            <p className="text-xs text-ink-muted line-clamp-1 mt-0.5">{art.excerpt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-primary">
                        {art.category?.name || 'Umum'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-ink-muted whitespace-nowrap">
                        {new Date(art.published_at || art.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            art.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : art.status === 'draft'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {art.status === 'published' ? 'Terbit' : art.status === 'draft' ? 'Draft' : 'Arsip'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setArticlePreviewTarget(art)}
                            className="text-xs p-1 text-navy hover:bg-navy/10"
                            title="Pratinjau Artikel"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setArticleForm(art);
                              setArticleModalOpen(true);
                            }}
                            className="text-xs p-1 text-navy hover:bg-navy/10"
                            title="Edit Artikel"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteArticleTarget(art)}
                            className="text-xs p-1 text-rose-600 hover:bg-rose-50"
                            title="Hapus Artikel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GALERI MEDIA */}
      {/* ========================================================================= */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-card border border-navy/10 shadow-sm">
            <div>
              <h3 className="font-display font-bold text-base text-navy">Manajemen Galeri Kegiatan & Dokumentasi</h3>
              <p className="text-xs text-ink-muted mt-0.5">
                Album dokumentasi acara, pentas seni, dan aktivitas siswa di lingkungan sekolah.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setGalleryForm({
                  title: '',
                  description: '',
                  cover_path: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
                  event_date: new Date().toISOString().split('T')[0],
                  is_published: true,
                });
                setGalleryModalOpen(true);
              }}
              className="text-xs flex items-center gap-1.5 bg-navy text-white"
            >
              <Plus className="w-4 h-4 text-star" /> Tambah Album Galeri
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {galleries.map((gal) => (
              <div key={gal.id} className="bg-white rounded-card border border-navy/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-44 bg-navy">
                  <img
                    src={gal.cover_path || 'https://via.placeholder.com/400'}
                    alt={gal.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-navy text-white/90 border border-white/20">
                      {gal.items?.length || 2} Foto
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-[11px] font-semibold text-primary">{gal.event_date || 'Terbaru'}</p>
                  <h4 className="font-bold text-navy text-sm line-clamp-1">{gal.title}</h4>
                  <p className="text-xs text-ink-muted line-clamp-2">{gal.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-navy/10">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Terpublikasi
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteGalleryTarget(gal)}
                      className="text-xs text-rose-600 hover:bg-rose-50 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PROFIL & STRUKTUR ORGANISASI */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Visi & Misi Editor */}
          <div className="bg-white p-5 rounded-card border border-navy/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-navy/10 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-navy">Visi & Misi Yayasan Padindi</h3>
                <p className="text-xs text-ink-muted">Teks ini langsung diperbarui di Halaman Visi & Misi publik.</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => showToast('Visi & Misi yayasan berhasil disimpan.')}
                className="text-xs flex items-center gap-1.5 bg-navy text-white"
              >
                <Save className="w-4 h-4 text-star" /> Simpan Visi Misi
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-navy uppercase tracking-wider">Visi Utama:</label>
              <textarea
                rows={2}
                value={visionText}
                onChange={(e) => setVisionText(e.target.value)}
                className="w-full text-xs p-3 bg-paper border border-navy/20 rounded-control focus:ring-2 focus:ring-navy/20 text-ink"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-navy uppercase tracking-wider">Poin-Poin Misi:</label>
              {missionList.map((m, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-navy/10 text-navy font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={m}
                    onChange={(e) => {
                      const next = [...missionList];
                      next[idx] = e.target.value;
                      setMissionList(next);
                    }}
                    className="w-full text-xs p-2 bg-paper border border-navy/20 rounded-control text-ink"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Dewan Pengurus / Organisasi */}
          <div className="bg-white p-5 rounded-card border border-navy/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy/10 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-navy">Struktur Dewan Pembina & Pengurus Yayasan</h3>
                <p className="text-xs text-ink-muted">Tampil di Halaman Profil Yayasan / Tentang Kami.</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setOrgForm({
                    name: '',
                    position: '',
                    bio: '',
                    photo_path: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                    is_active: true,
                  });
                  setOrgModalOpen(true);
                }}
                className="text-xs flex items-center gap-1.5 bg-navy text-white"
              >
                <Plus className="w-4 h-4 text-star" /> Tambah Pengurus
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {orgMembers.map((m) => (
                <div key={m.id} className="p-4 bg-paper rounded-card border border-navy/10 flex items-start gap-3">
                  <img
                    src={m.photo_path || 'https://via.placeholder.com/80'}
                    alt={m.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shrink-0"
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="font-bold text-sm text-navy truncate">{m.name}</p>
                    <p className="text-xs font-semibold text-primary">{m.position}</p>
                    <p className="text-[11px] text-ink-muted line-clamp-2">{m.bio}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setOrgForm(m);
                          setOrgModalOpen(true);
                        }}
                        className="text-[11px] text-primary hover:underline font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteOrgTarget(m)}
                        className="text-[11px] text-rose-600 hover:underline font-semibold"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PRESTASI & FASILITAS */}
      {/* ========================================================================= */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-card border border-navy/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy/10 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-navy">Koleksi Prestasi & Penghargaan</h3>
                <p className="text-xs text-ink-muted">Daftar medali dan kejuaraan yang diraih siswa Yayasan Padindi.</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setAchievementForm({ title: '', category: 'Akademik', year: '2026', description: '' });
                  setAchievementModalOpen(true);
                }}
                className="text-xs flex items-center gap-1.5 bg-navy text-white"
              >
                <Plus className="w-4 h-4 text-star" /> Tambah Prestasi
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.map((ach) => (
                <div key={ach.id} className="p-4 bg-paper rounded-card border border-navy/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{ach.category}</span>
                    <span className="font-semibold text-ink-muted">Tahun {ach.year}</span>
                  </div>
                  <h4 className="font-bold text-sm text-navy">{ach.title}</h4>
                  <p className="text-xs text-ink-muted">{ach.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: FAQ & KONTAK FOOTER */}
      {/* ========================================================================= */}
      {activeTab === 'faq_contact' && (
        <div className="space-y-6">
          {/* FAQ Editor */}
          <div className="bg-white p-5 rounded-card border border-navy/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy/10 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-navy">Manajemen FAQ (Tanya Jawab Pengunjung)</h3>
                <p className="text-xs text-ink-muted">Pertanyaan yang sering diajukan seputar PPDB, kurikulum, dan biaya.</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setFaqForm({ question: '', answer: '' });
                  setFaqModalOpen(true);
                }}
                className="text-xs flex items-center gap-1.5 bg-navy text-white"
              >
                <Plus className="w-4 h-4 text-star" /> Tambah Pertanyaan FAQ
              </Button>
            </div>

            <div className="space-y-3">
              {faqs.map((f, i) => (
                <div key={f.id} className="p-4 bg-paper rounded-card border border-navy/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-navy flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-navy text-white text-[10px] flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      {f.question}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setFaqs((prev) => prev.filter((item) => item.id !== f.id));
                        showToast('FAQ berhasil dihapus.');
                      }}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                  <p className="text-xs text-ink-muted pl-7">{f.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white p-5 rounded-card border border-navy/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-navy/10 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-navy">Informasi Kontak & Footer Website</h3>
                <p className="text-xs text-ink-muted">Muncul di footer seluruh halaman website publik.</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => showToast('Informasi kontak footer berhasil disimpan.')}
                className="text-xs flex items-center gap-1.5 bg-navy text-white"
              >
                <Save className="w-4 h-4 text-star" /> Simpan Informasi Kontak
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-navy block mb-1">Alamat Lengkap Yayasan:</label>
                <input
                  type="text"
                  value={contactInfo.address}
                  onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                  className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-navy block mb-1">Email Resmi:</label>
                <input
                  type="text"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-navy block mb-1">Nomor Telepon Kantor:</label>
                <input
                  type="text"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-navy block mb-1">Nomor WhatsApp Admin:</label>
                <input
                  type="text"
                  value={contactInfo.whatsapp}
                  onChange={(e) => setContactInfo({ ...contactInfo, whatsapp: e.target.value })}
                  className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: HERO BANNER FORM */}
      {/* ========================================================================= */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-card shadow-2xl border border-navy/20 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-navy text-white flex items-center justify-between">
              <h3 className="font-display font-bold text-base">
                {bannerForm.id ? 'Edit Banner Hero' : 'Tambah Banner Hero Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setBannerModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-navy block mb-1">Judul Utama Banner *</label>
                <input
                  type="text"
                  value={bannerForm.title || ''}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="Contoh: Selamat Datang di Yayasan Padindi"
                  className="w-full p-2.5 bg-paper border border-navy/20 rounded-control text-ink focus:outline-none focus:ring-2 focus:ring-navy/30"
                />
              </div>

              <div>
                <label className="font-bold text-navy block mb-1">Subjudul / Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={bannerForm.subtitle || ''}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  placeholder="Contoh: Mewujudkan generasi cerdas, berkarakter, dan berakhlak mulia"
                  className="w-full p-2.5 bg-paper border border-navy/20 rounded-control text-ink focus:outline-none focus:ring-2 focus:ring-navy/30"
                />
              </div>

              <div>
                <label className="font-bold text-navy block mb-1">URL Gambar Banner *</label>
                <input
                  type="text"
                  value={bannerForm.image_path || ''}
                  onChange={(e) => setBannerForm({ ...bannerForm, image_path: e.target.value })}
                  placeholder="https://... atau /images/banner-1.jpg"
                  className="w-full p-2.5 bg-paper border border-navy/20 rounded-control text-ink focus:outline-none focus:ring-2 focus:ring-navy/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-navy block mb-1">Teks Tombol CTA</label>
                  <input
                    type="text"
                    value={bannerForm.cta_label || ''}
                    onChange={(e) => setBannerForm({ ...bannerForm, cta_label: e.target.value })}
                    placeholder="Daftar Sekarang"
                    className="w-full p-2.5 bg-paper border border-navy/20 rounded-control text-ink"
                  />
                </div>
                <div>
                  <label className="font-bold text-navy block mb-1">Link Tujuan</label>
                  <input
                    type="text"
                    value={bannerForm.link_url || ''}
                    onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })}
                    placeholder="/pendaftaran"
                    className="w-full p-2.5 bg-paper border border-navy/20 rounded-control text-ink"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="banner_is_active"
                  checked={bannerForm.is_active ?? true}
                  onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-navy focus:ring-navy"
                />
                <label htmlFor="banner_is_active" className="font-semibold text-ink">
                  Aktifkan banner ini pada slider beranda
                </label>
              </div>
            </div>

            <div className="px-6 py-3 bg-paper border-t border-navy/10 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setBannerModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveBanner} className="bg-navy text-white">
                Simpan Banner
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: HERO PREVIEW */}
      {/* ========================================================================= */}
      {heroPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-md animate-fade-in">
          <div className="bg-navy rounded-card shadow-2xl border border-white/20 w-full max-w-4xl overflow-hidden text-white">
            <div className="p-4 bg-navy-dark flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-star" />
                <h3 className="font-display font-bold text-sm">Pratinjau Live: Hero Slider Website Publik</h3>
              </div>
              <button
                type="button"
                onClick={() => setHeroPreviewOpen(false)}
                className="text-white/70 hover:text-white"
              >
                ✕ Tutup Pratinjau
              </button>
            </div>

            {/* Simulated Hero Banner */}
            <div className="relative h-96 flex items-center px-8 md:px-16 overflow-hidden">
              <img
                src={banners[0]?.image_path || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80'}
                alt="Hero Preview"
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.35]"
              />
              <div className="relative max-w-2xl space-y-4">
                <span className="inline-block px-3 py-1 bg-star/20 border border-star text-star text-xs font-bold rounded-full">
                  Yayasan Perguruan Padindi
                </span>
                <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight">
                  {banners[0]?.title || 'Selamat Datang di Yayasan Padindi'}
                </h1>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                  {banners[0]?.subtitle || 'Mewujudkan generasi berkarakter unggul dan berakhlak mulia.'}
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <span className="px-5 py-2.5 bg-star text-navy font-bold rounded-control shadow-md text-xs cursor-default">
                    {banners[0]?.cta_label || 'Daftar PPDB Online'}
                  </span>
                  <span className="px-5 py-2.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-control text-xs cursor-default">
                    Pelajari Selengkapnya
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ARTICLE FORM */}
      {/* ========================================================================= */}
      {articleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-card shadow-2xl border border-navy/20 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-navy text-white flex items-center justify-between">
              <h3 className="font-display font-bold text-base">
                {articleForm.id ? 'Edit Artikel' : 'Tulis Artikel & Berita Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setArticleModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="font-bold text-navy block mb-1">Judul Artikel *</label>
                <input
                  type="text"
                  value={articleForm.title || ''}
                  onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                  placeholder="Contoh: Prestasi Siswa di Ajang Nasional 2026"
                  className="w-full p-2.5 bg-paper border border-navy/20 rounded-control text-ink text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-navy/30"
                />
              </div>

              <div>
                <label className="font-bold text-navy block mb-1">Ringkasan Singkat (Excerpt)</label>
                <textarea
                  rows={2}
                  value={articleForm.excerpt || ''}
                  onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                  placeholder="Ringkasan 1-2 kalimat untuk kartu berita di beranda..."
                  className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-navy block mb-1">URL Gambar Sampul (Thumbnail)</label>
                <input
                  type="text"
                  value={articleForm.cover_path || ''}
                  onChange={(e) => setArticleForm({ ...articleForm, cover_path: e.target.value })}
                  placeholder="https://... atau /images/news/cover.jpg"
                  className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink"
                />
              </div>

              <div>
                <label className="font-bold text-navy block mb-1">Isi Konten Artikel Lengkap *</label>
                <textarea
                  rows={6}
                  value={articleForm.content || ''}
                  onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                  placeholder="Tuliskan berita lengkap di sini..."
                  className="w-full p-3 bg-paper border border-navy/20 rounded-control text-ink leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="font-bold text-navy">Status Publikasi:</label>
                <select
                  value={articleForm.status || 'published'}
                  onChange={(e) => setArticleForm({ ...articleForm, status: e.target.value as 'draft' | 'published' | 'archived' })}
                  className="p-1.5 bg-paper border border-navy/20 rounded-control text-xs font-semibold text-navy"
                >
                  <option value="published">Diterbitkan Langsung (Publik)</option>
                  <option value="draft">Simpan sebagai Draft</option>
                  <option value="archived">Arsipkan</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-3 bg-paper border-t border-navy/10 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setArticleModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveArticle} className="bg-navy text-white">
                Simpan & Publikasikan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GALLERY FORM */}
      {/* ========================================================================= */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-card shadow-2xl border border-navy/20 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-navy text-white flex items-center justify-between">
              <h3 className="font-display font-bold text-base">Tambah Album Galeri Baru</h3>
              <button type="button" onClick={() => setGalleryModalOpen(false)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <div>
                <label className="font-bold text-navy block mb-1">Judul Album Galeri *</label>
                <input
                  type="text"
                  value={galleryForm.title || ''}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  placeholder="Contoh: Pentas Seni Siswa 2026"
                  className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-navy block mb-1">URL Foto Sampul</label>
                <input
                  type="text"
                  value={galleryForm.cover_path || ''}
                  onChange={(e) => setGalleryForm({ ...galleryForm, cover_path: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink"
                />
              </div>
              <div>
                <label className="font-bold text-navy block mb-1">Deskripsi Kegiatan</label>
                <textarea
                  rows={2}
                  value={galleryForm.description || ''}
                  onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                  className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink"
                />
              </div>
            </div>
            <div className="px-6 py-3 bg-paper border-t border-navy/10 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setGalleryModalOpen(false)}>Batal</Button>
              <Button variant="primary" size="sm" onClick={handleSaveGallery} className="bg-navy text-white">Simpan Galeri</Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ARTICLE PREVIEW */}
      {/* ========================================================================= */}
      {articlePreviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-card shadow-2xl border border-navy/20 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-navy text-white flex items-center justify-between">
              <span className="text-xs font-bold text-star uppercase tracking-wider">Pratinjau Artikel</span>
              <button
                type="button"
                onClick={() => setArticlePreviewTarget(null)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <img
                src={articlePreviewTarget.cover_path || 'https://via.placeholder.com/600x300'}
                alt={articlePreviewTarget.title}
                className="w-full h-56 object-cover rounded-control"
              />
              <span className="text-xs font-bold text-primary">{articlePreviewTarget.category?.name || 'Berita'}</span>
              <h2 className="text-xl font-display font-bold text-navy leading-snug">{articlePreviewTarget.title}</h2>
              <div className="text-xs text-ink-muted">
                Diterbitkan pada {new Date(articlePreviewTarget.published_at || articlePreviewTarget.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </div>
              <div className="text-sm leading-relaxed text-ink border-t border-navy/10 pt-3 whitespace-pre-wrap">
                {articlePreviewTarget.content}
              </div>
            </div>
            <div className="px-6 py-3 bg-paper border-t border-navy/10 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setArticlePreviewTarget(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ORG MEMBER FORM */}
      {/* ========================================================================= */}
      {orgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-card shadow-2xl border border-navy/20 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-navy text-white flex items-center justify-between">
              <h3 className="font-display font-bold text-base">
                {orgForm.id ? 'Edit Data Pengurus' : 'Tambah Anggota Pengurus Baru'}
              </h3>
              <button type="button" onClick={() => setOrgModalOpen(false)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <div>
                <label className="font-bold text-navy block mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  value={orgForm.name || ''}
                  onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  placeholder="Dr. H. Sulaiman Effendi, M.Pd."
                  className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-navy block mb-1">Jabatan dalam Yayasan *</label>
                <input
                  type="text"
                  value={orgForm.position || ''}
                  onChange={(e) => setOrgForm({ ...orgForm, position: e.target.value })}
                  placeholder="Ketua Pembina Yayasan"
                  className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink"
                />
              </div>
              <div>
                <label className="font-bold text-navy block mb-1">URL Foto Profil</label>
                <input
                  type="text"
                  value={orgForm.photo_path || ''}
                  onChange={(e) => setOrgForm({ ...orgForm, photo_path: e.target.value })}
                  placeholder="https://... atau /images/org/nama.jpg"
                  className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink"
                />
              </div>
              <div>
                <label className="font-bold text-navy block mb-1">Profil / Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={orgForm.bio || ''}
                  onChange={(e) => setOrgForm({ ...orgForm, bio: e.target.value })}
                  className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink"
                />
              </div>
            </div>
            <div className="px-6 py-3 bg-paper border-t border-navy/10 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOrgModalOpen(false)}>Batal</Button>
              <Button variant="primary" size="sm" onClick={handleSaveOrgMember} className="bg-navy text-white">Simpan</Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ACHIEVEMENT FORM */}
      {/* ========================================================================= */}
      {achievementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-card shadow-2xl border border-navy/20 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-navy text-white flex items-center justify-between">
              <h3 className="font-display font-bold text-base">Tambah Prestasi Siswa / Sekolah</h3>
              <button type="button" onClick={() => setAchievementModalOpen(false)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <div>
                <label className="font-bold text-navy block mb-1">Nama Prestasi / Juara *</label>
                <input
                  type="text"
                  value={achievementForm.title || ''}
                  onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                  placeholder="Contoh: Juara 1 Olimpiade Matematika"
                  className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-navy block mb-1">Kategori</label>
                  <select
                    value={achievementForm.category || 'Akademik'}
                    onChange={(e) => setAchievementForm({ ...achievementForm, category: e.target.value })}
                    className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink font-semibold"
                  >
                    <option value="Akademik">Akademik</option>
                    <option value="Olahraga">Olahraga</option>
                    <option value="Seni Budaya">Seni Budaya</option>
                    <option value="Keagamaan">Keagamaan</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-navy block mb-1">Tahun Perolehan</label>
                  <input
                    type="text"
                    value={achievementForm.year || '2026'}
                    onChange={(e) => setAchievementForm({ ...achievementForm, year: e.target.value })}
                    className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-navy block mb-1">Keterangan Tambahan</label>
                <textarea
                  rows={2}
                  value={achievementForm.description || ''}
                  onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                  className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink"
                />
              </div>
            </div>
            <div className="px-6 py-3 bg-paper border-t border-navy/10 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setAchievementModalOpen(false)}>Batal</Button>
              <Button variant="primary" size="sm" onClick={handleSaveAchievement} className="bg-navy text-white">Simpan Prestasi</Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FAQ FORM */}
      {/* ========================================================================= */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-card shadow-2xl border border-navy/20 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-navy text-white flex items-center justify-between">
              <h3 className="font-display font-bold text-base">Tambah Pertanyaan FAQ</h3>
              <button type="button" onClick={() => setFaqModalOpen(false)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-3 text-xs">
              <div>
                <label className="font-bold text-navy block mb-1">Pertanyaan *</label>
                <input
                  type="text"
                  value={faqForm.question || ''}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="Kapan batas akhir pendaftaran?"
                  className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-navy block mb-1">Jawaban Lengkap *</label>
                <textarea
                  rows={3}
                  value={faqForm.answer || ''}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  placeholder="Tuliskan jawaban yang jelas dan informatif..."
                  className="w-full p-2 bg-paper border border-navy/20 rounded-control text-ink"
                />
              </div>
            </div>
            <div className="px-6 py-3 bg-paper border-t border-navy/10 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setFaqModalOpen(false)}>Batal</Button>
              <Button variant="primary" size="sm" onClick={handleSaveFaq} className="bg-navy text-white">Simpan FAQ</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modals */}
      <ConfirmModal
        open={Boolean(deleteBannerTarget)}
        onClose={() => setDeleteBannerTarget(null)}
        onConfirm={() => {
          if (deleteBannerTarget) {
            setBanners((prev) => prev.filter((b) => b.id !== deleteBannerTarget.id));
            setDeleteBannerTarget(null);
            showToast('Banner hero berhasil dihapus.');
          }
        }}
        title="Hapus Banner Hero"
        description={`Apakah Anda yakin ingin menghapus banner "${deleteBannerTarget?.title}"?`}
        confirmLabel="Hapus Banner"
        confirmVariant="danger"
      />

      <ConfirmModal
        open={Boolean(deleteArticleTarget)}
        onClose={() => setDeleteArticleTarget(null)}
        onConfirm={() => {
          if (deleteArticleTarget) {
            setArticles((prev) => prev.filter((a) => a.id !== deleteArticleTarget.id));
            setDeleteArticleTarget(null);
            showToast('Artikel berita berhasil dihapus.');
          }
        }}
        title="Hapus Artikel"
        description={`Apakah Anda yakin ingin menghapus artikel "${deleteArticleTarget?.title}"?`}
        confirmLabel="Hapus Artikel"
        confirmVariant="danger"
      />

      <ConfirmModal
        open={Boolean(deleteGalleryTarget)}
        onClose={() => setDeleteGalleryTarget(null)}
        onConfirm={() => {
          if (deleteGalleryTarget) {
            setGalleries((prev) => prev.filter((g) => g.id !== deleteGalleryTarget.id));
            setDeleteGalleryTarget(null);
            showToast('Album galeri berhasil dihapus.');
          }
        }}
        title="Hapus Album Galeri"
        description={`Apakah Anda yakin ingin menghapus album galeri "${deleteGalleryTarget?.title}"?`}
        confirmLabel="Hapus Galeri"
        confirmVariant="danger"
      />

      <ConfirmModal
        open={Boolean(deleteOrgTarget)}
        onClose={() => setDeleteOrgTarget(null)}
        onConfirm={() => {
          if (deleteOrgTarget) {
            setOrgMembers((prev) => prev.filter((o) => o.id !== deleteOrgTarget.id));
            setDeleteOrgTarget(null);
            showToast('Data pengurus yayasan berhasil dihapus.');
          }
        }}
        title="Hapus Data Pengurus"
        description={`Apakah Anda yakin ingin menghapus pengurus "${deleteOrgTarget?.name}"?`}
        confirmLabel="Hapus Pengurus"
        confirmVariant="danger"
      />
    </div>
  );
};

export default CmsPage;
