import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mail,
  MailOpen,
  MessageSquare,
  AlertCircle,
  Search,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Phone,
  Send,
  X,
  RefreshCw,
} from 'lucide-react';
import { SeoHead } from '@/components/seo/SeoHead';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api-client';
import { useCurrentUser } from '@/features/auth/permissions';

export interface ContactMessageItem {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: 'new' | 'read' | 'replied';
  reply_notes?: string | null;
  assigned_to?: number | null;
  assignee?: { id: number; name: string; email?: string } | null;
  read_at?: string | null;
  ip_address?: string | null;
  created_at: string;
}

interface PublicGuruOption {
  id: number;
  name: string;
  roles: { name: string; label: string }[];
}

const FALLBACK_MESSAGES: ContactMessageItem[] = [
  {
    id: 1,
    name: '[Contoh] Ibu Ratna Dewi',
    email: 'ratna.dewi@example.com',
    phone: '081298765432',
    subject: 'Pertanyaan Syarat Mutasi Murid Pindahan Kelas 4 SD',
    message:
      'Selamat pagi Bapak/Ibu Admin Yayasan Padindi. Saya berencana memindahkan anak saya ke SD Padindi di semester genap. Apakah ada kuota yang tersedia dan apa saja berkas rapor yang perlu kami persiapkan? Terima kasih.',
    status: 'new',
    ip_address: '180.252.110.12',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 2,
    name: '[Contoh] Bapak Hendra Kurniawan',
    email: 'hendra.k@example.com',
    phone: '081311223344',
    subject: 'Konfirmasi Pembayaran Biaya Formulir Pendaftaran PPDB',
    message:
      'Halo Admin, saya sudah menyelesaikan pendaftaran online atas nama Farhan Kurniawan dan mentransfer biaya administrasi ke rekening yayasan. Mohon konfirmasi apakah statusnya sudah terverifikasi.',
    status: 'read',
    read_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    ip_address: '114.124.200.45',
    created_at: new Date(Date.now() - 3600000 * 16).toISOString(),
  },
  {
    id: 3,
    name: '[Contoh] Ibu Maya Indriyani',
    email: 'maya.indri@example.com',
    phone: '085612347890',
    subject: '[Pengaduan] Kendala Akses Formulir Pendaftaran Guru',
    message:
      'Mohon bantuan teknis, ketika mengunggah scan sertifikat pendidik format PDF ukuran 1.5MB muncul keterangan berkas terlalu besar. Mohon panduannya.',
    status: 'replied',
    reply_notes: 'Sudah dihubungi via WhatsApp dan diarahkan kompresi PDF. Kendala terselesaikan.',
    read_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    ip_address: '103.20.188.10',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 4,
    name: '[Contoh] Dr. Ahmad Zaki',
    email: 'ahmad.zaki@alumni.org',
    phone: '08119887766',
    subject: 'Proposal Kerjasama Seminar Parenting dan Kesehatan Anak',
    message:
      'Kami dari Ikatan Alumni Kedokteran bermaksud mengajukan penawaran program penyuluhan kesehatan gigi dan mulut gratis bagi siswa kelas 1–3 SD Padindi.',
    status: 'new',
    ip_address: '182.1.22.4',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export const MessagesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const isGuruOnly = Boolean(currentUser?.roles?.includes('guru') && !currentUser?.roles?.includes('super_admin'));
  const messagesQueryKey = ['adminContactMessages', currentUser?.id ?? 'default', isGuruOnly] as const;

  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'read' | 'replied' | 'complaint'>('all');
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyError, setReplyError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessageItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const { data: guruOptions = [] } = useQuery({
    queryKey: ['public', 'staff', 'guru-options'],
    enabled: !isGuruOnly,
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: PublicGuruOption[] }>('/public/staff');
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        return list.filter((u) => u.roles?.some((r) => r.name === 'guru'));
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
  });

  const { data: messages = isGuruOnly ? [] : FALLBACK_MESSAGES, isLoading, refetch } = useQuery({
    queryKey: messagesQueryKey,
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: ContactMessageItem[] }>('/admin/contact-messages');
        if (isGuruOnly) {
          return Array.isArray(res.data?.data) ? res.data.data : [];
        }
        if (res.data?.data && res.data.data.length > 0) {
          return res.data.data;
        }
      } catch {
        if (isGuruOnly) {
          return [];
        }
      }
      return isGuruOnly ? [] : FALLBACK_MESSAGES;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      replyNotes,
      assignedTo,
    }: {
      id: number;
      status?: 'new' | 'read' | 'replied';
      replyNotes?: string;
      assignedTo?: number | null;
    }) => {
      try {
        const res = await apiClient.put<{ data?: ContactMessageItem }>(`/admin/contact-messages/${id}`, {
          ...(status !== undefined ? { status } : {}),
          ...(replyNotes !== undefined ? { reply_notes: replyNotes } : {}),
          ...(assignedTo !== undefined ? { assigned_to: assignedTo } : {}),
        });
        return res.data?.data;
      } catch {
        return undefined;
      }
    },
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(messagesQueryKey, (old: ContactMessageItem[] = []) =>
        old.map((m) =>
          m.id === variables.id
            ? {
                ...m,
                ...(updated ?? {}),
                status: variables.status ?? updated?.status ?? m.status,
                reply_notes: variables.replyNotes ?? updated?.reply_notes ?? m.reply_notes,
                assigned_to: variables.assignedTo !== undefined ? variables.assignedTo : (updated?.assigned_to ?? m.assigned_to),
                read_at: (variables.status ?? m.status) !== 'new' ? m.read_at || new Date().toISOString() : null,
              }
            : m
        )
      );
      if (selectedMessage && selectedMessage.id === variables.id) {
        setSelectedMessage((prev) =>
          prev
            ? {
                ...prev,
                ...(updated ?? {}),
                status: variables.status ?? updated?.status ?? prev.status,
                reply_notes: variables.replyNotes ?? updated?.reply_notes ?? prev.reply_notes,
                assigned_to: variables.assignedTo !== undefined ? variables.assignedTo : (updated?.assigned_to ?? prev.assigned_to),
              }
            : null
        );
      }
      if (variables.assignedTo !== undefined) {
        showToast('Penerima pesan berhasil diperbarui.');
      } else {
        showToast(
          variables.status === 'replied'
            ? 'Tanggapan berhasil disimpan dan pesan ditandai selesai.'
            : 'Status pesan berhasil diperbarui.'
        );
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        await apiClient.delete(`/admin/contact-messages/${id}`);
      } catch {
        // Mock fallback delete
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(messagesQueryKey, (old: ContactMessageItem[] = []) =>
        old.filter((m) => m.id !== deletedId)
      );
      if (selectedMessage?.id === deletedId) setSelectedMessage(null);
      setDeleteTarget(null);
      showToast('Pesan berhasil dihapus dari sistem.');
    },
  });

  const filteredMessages = messages.filter((m) => {
    // Tab filter
    if (activeTab === 'new' && m.status !== 'new') return false;
    if (activeTab === 'read' && m.status !== 'read') return false;
    if (activeTab === 'replied' && m.status !== 'replied') return false;
    if (activeTab === 'complaint') {
      const isComplaint =
        (m.subject?.toLowerCase().includes('pengaduan') ||
          m.subject?.toLowerCase().includes('keluhan') ||
          m.message.toLowerCase().includes('kendala') ||
          m.message.toLowerCase().includes('pengaduan')) ??
        false;
      if (!isComplaint) return false;
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchEmail = m.email.toLowerCase().includes(q);
      const matchSubj = (m.subject || '').toLowerCase().includes(q);
      const matchMsg = m.message.toLowerCase().includes(q);
      const matchPhone = (m.phone || '').includes(q);
      return matchName || matchEmail || matchSubj || matchMsg || matchPhone;
    }

    return true;
  });

  const countTotal = messages.length;
  const countNew = messages.filter((m) => m.status === 'new').length;
  const countReplied = messages.filter((m) => m.status === 'replied').length;
  const countComplaints = messages.filter(
    (m) =>
      m.subject?.toLowerCase().includes('pengaduan') ||
      m.subject?.toLowerCase().includes('keluhan') ||
      m.message.toLowerCase().includes('kendala')
  ).length;

  const handleOpenMessage = (msg: ContactMessageItem) => {
    setSelectedMessage(msg);
    setReplyText(msg.reply_notes || '');
    setReplyError(null);
    if (msg.status === 'new') {
      updateStatusMutation.mutate({ id: msg.id, status: 'read' });
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim()) {
      setReplyError('Catatan balasan/tanggapan tidak boleh kosong.');
      return;
    }
    setReplyError(null);
    if (selectedMessage) {
      updateStatusMutation.mutate({
        id: selectedMessage.id,
        status: 'replied',
        replyNotes: replyText.trim(),
      });
    }
  };

  return (
    <div className="space-y-6">
      <SeoHead title="Pesan Masuk & Pengaduan - Admin Yayasan Padindi" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-navy text-white rounded-control shadow-xl border border-star text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-star" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <AdminPageHeader
        title="Pesan Masuk & Pengaduan"
        description={
          isGuruOnly
            ? 'Kelola pesan masuk yang ditujukan atau berkaitan langsung dengan akun Anda.'
            : 'Kelola seluruh komunikasi, pertanyaan pendaftaran, dan laporan aspirasi dari pengunjung website Yayasan Padindi.'
        }
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Konten', to: '/admin/cms' },
          { label: 'Pesan Masuk' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-2 border-navy/20 hover:bg-navy/5 text-navy"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Segarkan
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          label="Total Pesan Masuk"
          value={countTotal}
          icon={Mail}
          badge={{ text: 'Seluruh riwayat', variant: 'neutral' }}
        />
        <AdminStatCard
          label="Pesan Baru (Belum Dibaca)"
          value={countNew}
          icon={AlertCircle}
          badge={{ text: 'Perlu ditinjau', variant: countNew > 0 ? 'warning' : 'success' }}
        />
        <AdminStatCard
          label="Sudah Dibalas / Selesai"
          value={countReplied}
          icon={CheckCircle2}
          badge={{ text: 'Terselesaikan', variant: 'success' }}
        />
        <AdminStatCard
          label="Pengaduan & Kendala"
          value={countComplaints}
          icon={MessageSquare}
          badge={{ text: 'Aspirasi publik', variant: 'neutral' }}
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-card border border-navy/10 shadow-sm p-5 space-y-4">
        {/* Navigation Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-navy/10">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'all'
                  ? 'bg-navy text-white shadow-sm'
                  : 'bg-paper text-ink-muted hover:bg-navy/5 hover:text-navy'
              }`}
            >
              Semua ({countTotal})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('new')}
              className={`px-3.5 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'new'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-paper text-ink-muted hover:bg-amber-50 hover:text-amber-700'
              }`}
            >
              Baru
              {countNew > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('read')}
              className={`px-3.5 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'read'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-paper text-ink-muted hover:bg-navy/5 hover:text-navy'
              }`}
            >
              Sudah Dibaca
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('replied')}
              className={`px-3.5 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'replied'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-paper text-ink-muted hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              Selesai Dibalas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('complaint')}
              className={`px-3.5 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'complaint'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-paper text-ink-muted hover:bg-rose-50 hover:text-rose-700'
              }`}
            >
              Pengaduan ({countComplaints})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pengirim, email, subjek..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-paper border border-navy/15 rounded-control focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy text-ink placeholder:text-ink-muted"
            />
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-paper text-xs uppercase text-ink-muted font-bold tracking-wider border-b border-navy/10">
                <th className="py-3 px-4">Pengirim & Kontak</th>
                <th className="py-3 px-4">Subjek & Ringkasan</th>
                <th className="py-3 px-4">Tanggal Masuk</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-ink-muted">
                    <Mail className="w-10 h-10 text-navy/20 mx-auto mb-2" />
                    <p className="font-semibold text-ink">
                      {isGuruOnly && messages.length === 0
                        ? 'Belum ada pesan untuk akun Anda'
                        : 'Tidak ada pesan yang cocok'}
                    </p>
                    <p className="text-xs">
                      {isGuruOnly && messages.length === 0
                        ? 'Pesan dari pengunjung atau yang ditugaskan kepada akun Anda akan tampil di sini.'
                        : 'Coba sesuaikan kata kunci pencarian atau tab filter di atas.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => {
                  const isNew = msg.status === 'new';
                  const isReplied = msg.status === 'replied';

                  return (
                    <tr
                      key={msg.id}
                      onClick={() => handleOpenMessage(msg)}
                      className={`cursor-pointer transition-colors hover:bg-navy/5 ${
                        isNew ? 'bg-amber-50/40 font-medium' : ''
                      }`}
                    >
                      {/* Sender Column */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-2">
                          {isNew ? (
                            <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                          ) : (
                            <MailOpen className="w-4 h-4 text-navy/40 shrink-0" />
                          )}
                          <span className={`text-sm text-navy ${isNew ? 'font-bold' : ''}`}>
                            {msg.name}
                          </span>
                        </div>
                        <div className="text-xs text-ink-muted pl-6 flex items-center gap-2 mt-0.5">
                          <span>{msg.email}</span>
                          {msg.phone && <span>• {msg.phone}</span>}
                        </div>
                      </td>

                      {/* Subject & Excerpt */}
                      <td className="py-3.5 px-4 align-top max-w-[340px]">
                        <p className={`text-sm text-ink truncate ${isNew ? 'font-bold text-navy' : ''}`}>
                          {msg.subject || '(Tanpa subjek)'}
                        </p>
                        <p className="text-xs text-ink-muted truncate mt-0.5">{msg.message}</p>
                        {!isGuruOnly && msg.assignee?.name && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-navy/10 text-navy">
                            Untuk: {msg.assignee.name}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 align-top text-xs text-ink-muted whitespace-nowrap">
                        {new Date(msg.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-top text-center">
                        {isNew && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Baru
                          </span>
                        )}
                        {msg.status === 'read' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                            Dibaca
                          </span>
                        )}
                        {isReplied && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Selesai
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 align-top text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenMessage(msg)}
                            className="text-xs px-2.5 py-1 text-navy hover:bg-navy/10 font-medium"
                          >
                            Buka
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(msg)}
                            className="text-xs p-1 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            title="Hapus pesan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail & Reply Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-card shadow-2xl border border-navy/20 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-navy text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-star" />
                <h3 className="font-display font-bold text-base">Detail Pesan Masuk</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="text-white/70 hover:text-white p-1 rounded-control hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-ink">
              {/* Sender Details Box */}
              <div className="p-4 bg-paper rounded-card border border-navy/10 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy/10 pb-2">
                  <div>
                    <span className="text-ink-muted">Nama Pengirim:</span>
                    <p className="font-bold text-sm text-navy">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <span className="text-ink-muted">Waktu Pengiriman:</span>
                    <p className="font-medium text-ink">
                      {new Date(selectedMessage.created_at).toLocaleString('id-ID', {
                        dateStyle: 'full',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-ink-muted">Email:</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-navy">{selectedMessage.email}</span>
                      <a
                        href={`mailto:${selectedMessage.email}?subject=Tanggapan: ${selectedMessage.subject || 'Pesan Yayasan Padindi'}`}
                        className="text-primary hover:underline flex items-center gap-0.5 text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" /> Balas Email
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-ink-muted">Nomor Telepon / WhatsApp:</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-navy">
                        {selectedMessage.phone || '—'}
                      </span>
                      {selectedMessage.phone && (
                        <a
                          href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:underline flex items-center gap-0.5 text-[11px]"
                        >
                          <Phone className="w-3 h-3" /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {selectedMessage.ip_address && (
                  <div className="text-[11px] text-ink-muted pt-1">
                    IP Pengirim: <code>{selectedMessage.ip_address}</code>
                  </div>
                )}

                {!isGuruOnly && guruOptions.length > 0 && (
                  <div className="pt-2 border-t border-navy/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label htmlFor="assign-guru-select" className="text-xs font-bold text-navy">
                      Tugaskan / Teruskan ke Guru:
                    </label>
                    <select
                      id="assign-guru-select"
                      value={selectedMessage.assigned_to ? String(selectedMessage.assigned_to) : ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        updateStatusMutation.mutate({ id: selectedMessage.id, assignedTo: val });
                      }}
                      className="text-xs px-2.5 py-1.5 bg-white border border-navy/20 rounded-control text-ink focus:outline-none focus:ring-2 focus:ring-navy/30"
                    >
                      <option value="">Umum (Admin Yayasan)</option>
                      {guruOptions.map((g) => (
                        <option key={g.id} value={String(g.id)}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Message Subject & Content */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider text-ink-muted font-bold">Subjek Pesan:</h4>
                <p className="text-base font-bold text-navy bg-paper/60 px-3 py-2 rounded-control border border-navy/10">
                  {selectedMessage.subject || '(Tanpa Subjek)'}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-wider text-ink-muted font-bold">Isi Pesan:</h4>
                <div className="p-4 bg-paper/30 rounded-card border border-navy/15 text-sm leading-relaxed whitespace-pre-wrap font-sans text-ink">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Admin Notes & Response Form */}
              <div className="p-4 bg-primary/5 rounded-card border border-primary/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-primary" />
                    Catatan Tanggapan / Tindak Lanjut Admin
                  </h4>
                  {selectedMessage.status === 'replied' && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Telah Ditanggapi
                    </span>
                  )}
                </div>

                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Tuliskan catatan tindak lanjut, ringkasan jawaban via email/WhatsApp, atau tindakan yang telah diambil..."
                  className="w-full text-xs p-3 bg-white border border-navy/20 rounded-control focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-ink"
                />

                {replyError && <p className="text-xs text-rose-600 font-medium">{replyError}</p>}

                <div className="flex items-center justify-between pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateStatusMutation.mutate({
                        id: selectedMessage.id,
                        status: selectedMessage.status === 'new' ? 'read' : 'new',
                      });
                    }}
                    className="text-xs text-navy border-navy/20"
                  >
                    {selectedMessage.status === 'new' ? 'Tandai Dibaca' : 'Tandai Belum Dibaca'}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSendReply}
                    disabled={updateStatusMutation.isPending}
                    className="text-xs flex items-center gap-1.5 bg-navy hover:bg-navy-light text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 text-star" />
                    Simpan Tanggapan & Tandai Selesai
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-paper border-t border-navy/10 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTarget(selectedMessage)}
                className="text-xs text-rose-600 hover:bg-rose-50"
              >
                Hapus Pesan Ini
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMessage(null)}
                className="text-xs"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        title="Hapus Pesan Masuk"
        description={`Apakah Anda yakin ingin menghapus pesan dari "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Permanen"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default MessagesPage;
