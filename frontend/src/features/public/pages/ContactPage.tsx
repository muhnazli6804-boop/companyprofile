import React, { useState } from 'react';
import { SeoHead } from '@/components/seo/SeoHead';
import { usePublicSettings } from '@/features/public/hooks';
import { apiClient } from '@/lib/api-client';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { MapEmbed } from '../components/MapEmbed';

export const ContactPage: React.FC = () => {
  const { data: settings } = usePublicSettings();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setErrorMsg('Mohon lengkapi nama, email, dan isi pesan Anda.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      await apiClient.post('/public/contact', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject.trim() || 'Pertanyaan Umum',
        message: form.message.trim(),
      });
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Gagal mengirim pesan. Silakan periksa koneksi Anda dan coba lagi.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const phone = settings?.contact_phone || '02122435791';
  const email = settings?.contact_email || 'info@padindi.sch.id';
  const address = settings?.contact_address || 'Jl. Papanggo IID No.70, RT.13/RW.3, Papanggo, Kec. Tj. Priok, Jkt Utara, Daerah Khusus Ibukota Jakarta 14340';
  const hours = settings?.contact_hours || 'Senin – Jumat: 07.30 – 15.30 WIB';
  const mapEmbedUrl = settings?.contact_map_embed_url || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967.0428612140885!2d106.8741369758778!3d-6.124967393861961!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6a1e35a72df89b%3A0x6b876fc1eb7040f9!2sJl.%20Papanggo%20IID%20No.70%2C%20RT.13%2FRW.3%2C%20Papanggo%2C%20Kec.%20Tj.%20Priok%2C%20Jkt%20Utara%2C%20Daerah%20Khusus%20Ibukota%20Jakarta%2014340!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid';

  return (
    <div className="bg-paper min-h-screen py-12 md:py-16">
      <SeoHead
        title="Hubungi Kami - Yayasan Padindi"
        description="Informasi kontak, alamat kampus, layanan pertanyaan, dan jam operasional Yayasan Padindi."
      />

      <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-block px-3 py-1 bg-navy/10 text-navy font-bold text-xs rounded-full uppercase tracking-wider">
            Layanan Komunikasi
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-navy">
            Hubungi Yayasan Padindi
          </h1>
          <p className="text-muted text-sm md:text-base">
            Kami siap menyambut dan memberikan informasi terbaik untuk kebutuhan pendidikan putra-putri Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri: Informasi Kontak */}
          <div className="lg:col-span-5 bg-navy text-white p-8 rounded-card shadow-lg space-y-8">
            <div>
              <h2 className="font-display font-bold text-xl text-white mb-2">Informasi Kontak</h2>
              <p className="text-white/80 text-xs leading-relaxed">
                Silakan hubungi kami melalui saluran resmi berikut atau kunjungi kampus yayasan pada jam kerja.
              </p>
            </div>

            <div className="space-y-6 text-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-star" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider text-star">Alamat Yayasan</h3>
                  <p className="text-white/90 text-xs mt-1 leading-relaxed">{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-star" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider text-star">Telepon Kantor</h3>
                  <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="text-white/90 text-xs mt-1 block hover:underline">
                    {phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-star" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider text-star">Email Resmi</h3>
                  <a href={`mailto:${email}`} className="text-white/90 text-xs mt-1 block hover:underline">
                    {email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-star" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider text-star">Jam Operasional</h3>
                  <p className="text-white/90 text-xs mt-1">{hours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Formulir Kirim Pesan */}
          <div className="lg:col-span-7 bg-white p-8 rounded-card border border-navy/10 shadow-sm space-y-6">
            <div className="border-b border-navy/10 pb-4">
              <h2 className="font-display font-bold text-xl text-navy flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-navy" /> Kirim Pesan & Pertanyaan
              </h2>
              <p className="text-muted text-xs mt-1">
                Pesan yang Anda kirim akan langsung masuk ke panel Pesan & Pengaduan Admin Yayasan.
              </p>
            </div>

            {success ? (
              <div className="p-6 bg-navy/5 border border-navy/20 rounded-lg text-center space-y-3 animate-fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-display font-bold text-lg text-navy">Pesan Berhasil Terkirim!</h3>
                <p className="text-xs text-muted max-w-md mx-auto">
                  Terima kasih telah menghubungi Yayasan Padindi. Tim kami akan segera meninjau pesan Anda dan membalas melalui email atau nomor telepon yang Anda cantumkan.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-control hover:bg-navy-light"
                >
                  Kirim Pesan Lainnya
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-control text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-navy block mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Nama Anda"
                      className="w-full p-2.5 bg-paper border border-navy/20 rounded-control text-ink focus:outline-none focus:ring-2 focus:ring-navy/30"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-navy block mb-1">Email Aktif *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="contoh@email.com"
                      className="w-full p-2.5 bg-paper border border-navy/20 rounded-control text-ink focus:outline-none focus:ring-2 focus:ring-navy/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-navy block mb-1">Nomor Telepon / WhatsApp</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="081234567890"
                      className="w-full p-2.5 bg-paper border border-navy/20 rounded-control text-ink focus:outline-none focus:ring-2 focus:ring-navy/30"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-navy block mb-1">Subjek / Topik</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="Pertanyaan seputar PPDB / Sekolah"
                      className="w-full p-2.5 bg-paper border border-navy/20 rounded-control text-ink focus:outline-none focus:ring-2 focus:ring-navy/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-navy block mb-1">Isi Pesan atau Pertanyaan *</label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tuliskan pesan, pertanyaan, atau saran Anda secara rinci..."
                    className="w-full p-3 bg-paper border border-navy/20 rounded-control text-ink focus:outline-none focus:ring-2 focus:ring-navy/30 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-navy text-white text-xs font-bold rounded-control hover:bg-navy-light flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-star" />
                  <span>{submitting ? 'Sedang Mengirim Pesan...' : 'Kirim Pesan Sekarang'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Lokasi Peta Kampus Yayasan */}
        <div className="bg-white p-6 md:p-8 rounded-card border border-navy/10 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-navy/10 pb-4">
            <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center text-navy shrink-0">
              <MapPin className="w-5 h-5 text-navy" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg md:text-xl text-navy">Lokasi Kampus Yayasan</h2>
              <p className="text-xs text-muted">Petunjuk arah dan titik lokasi Google Maps Yayasan Padindi</p>
            </div>
          </div>
          <MapEmbed embedUrl={mapEmbedUrl} address={address} />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;