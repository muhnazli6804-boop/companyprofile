import React from 'react';
import { Link } from 'react-router-dom';
import { SeoHead } from '@/components/seo/SeoHead';
import { usePublicPage, usePublicSettings } from '@/features/public/hooks';
import {
  ShieldCheck,
  Lock,
  FileText,
  UserCheck,
  Eye,
  Server,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  const { data: pageData, isLoading } = usePublicPage('kebijakan-privasi');
  const { data: settings } = usePublicSettings();

  const lastUpdated = pageData?.updated_at
    ? new Date(pageData.updated_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '24 November 2026';

  return (
    <div className="bg-paper min-h-screen py-10 md:py-16">
      <SeoHead
        title={pageData?.meta_title || 'Kebijakan Privasi — Yayasan Padindi'}
        description={
          pageData?.meta_description ||
          'Kebijakan perlindungan data pribadi dan privasi pengguna portal informasi serta pendaftaran Yayasan Padindi.'
        }
      />

      <div className="max-w-content mx-auto px-4 md:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-ink-muted flex items-center gap-1.5">
          <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-navy">Kebijakan Privasi</span>
        </nav>

        {/* Header Section */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
            <ShieldCheck className="w-4 h-4" />
            <span>Kepatuhan UU No. 27 Tahun 2022 (UU PDP)</span>
          </div>

          <h1 className="font-display font-bold text-3xl md:text-5xl text-navy tracking-tight">
            {pageData?.title || 'Kebijakan Privasi'}
          </h1>
          <p className="text-xs text-ink-muted">
            Terakhir diperbarui: <strong className="text-navy">{lastUpdated}</strong>
          </p>
        </div>

        {/* Dynamic Content if provided by backend CMS */}
        {pageData?.content ? (
          <div className="bg-white rounded-card border border-navy/10 p-6 md:p-10 shadow-sm prose prose-navy max-w-none text-ink text-sm leading-relaxed space-y-4">
            <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
          </div>
        ) : (
          /* Official Comprehensive Privacy Policy Content */
          <div className="bg-white rounded-card border border-navy/10 p-6 md:p-10 shadow-sm space-y-8 text-sm text-ink leading-relaxed">
            {/* 1. Pengantar */}
            <section className="space-y-3">
              <h2 className="font-display font-bold text-xl text-navy flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Pendahuluan & Komitmen Yayasan
              </h2>
              <p>
                Yayasan Perguruan Padindi (&quot;Yayasan&quot;, &quot;kami&quot;) berkomitmen penuh untuk melindungi privasi, kerahasiaan, dan keamanan data pribadi seluruh pihak yang berinteraksi dengan sistem informasi dan portal online kami. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, mengelola, menyimpan, memproses, dan melindungi data pribadi calon peserta didik, orang tua/wali murid, pelamar guru, serta pengunjung situs resmi kami.
              </p>
              <p>
                Kebijakan ini disusun berdasarkan ketentuan hukum yang berlaku di Republik Indonesia, khususnya <strong>Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong> serta regulasi terkait di bidang pendidikan dan teknologi informasi.
              </p>
            </section>

            {/* 2. Data Pribadi yang Kami Kumpulkan */}
            <section className="space-y-3">
              <h2 className="font-display font-bold text-xl text-navy flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Data Pribadi yang Kami Kumpulkan
              </h2>
              <p>
                Kami hanya mengumpulkan data pribadi yang relevan, wajar, dan diperlukan untuk tujuan penyelenggaraan administrasi pendidikan dan rekrutmen tenaga kependidikan:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-paper rounded-control border border-navy/10 space-y-2">
                  <h3 className="font-bold text-sm text-navy flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-primary" />
                    Calon Murid & Orang Tua / Wali
                  </h3>
                  <ul className="text-xs text-ink-muted space-y-1 list-disc list-inside">
                    <li>Nama lengkap, NIK anak, NISN, tempat dan tanggal lahir, jenis kelamin.</li>
                    <li>Nama orang tua/wali, NIK, pekerjaan, nomor telepon/WhatsApp, dan alamat domisili.</li>
                    <li>Dokumen resmi: Kartu Keluarga (KK), Akta Kelahiran, dan Pas Foto.</li>
                    <li>Riwayat pendidikan sebelumnya dan rekam jejak kesehatan umum.</li>
                  </ul>
                </div>

                <div className="p-4 bg-paper rounded-control border border-navy/10 space-y-2">
                  <h3 className="font-bold text-sm text-navy flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Pelamar Guru & Tenaga Kependidikan
                  </h3>
                  <ul className="text-xs text-ink-muted space-y-1 list-disc list-inside">
                    <li>Identitas diri: Nama lengkap dengan gelar, NIK, tempat/tanggal lahir, kontak.</li>
                    <li>Riwayat akademik: Salinan Ijazah, Transkrip Nilai, dan Sertifikat Pendidik.</li>
                    <li>Riwayat profesional: Curriculum Vitae (CV) dan pengalaman mengajar.</li>
                    <li>Surat referensi kerja dan portofolio pembelajaran.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. Tujuan Pemrosesan Data */}
            <section className="space-y-3">
              <h2 className="font-display font-bold text-xl text-navy flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                  3
                </span>
                Tujuan Penggunaan & Pemrosesan Data
              </h2>
              <p>Data pribadi yang dikumpulkan digunakan semata-mata untuk keperluan:</p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-ink-muted pl-2">
                <li>Memproses verifikasi administrasi pendaftaran murid baru (PPDB) pada jenjang TK, SD, dan SMP.</li>
                <li>Menyelenggarakan observasi kesiapan belajar dan tes pemetaan potensi murid secara objektif.</li>
                <li>Melakukan penilaian kualifikasi dan pelaksanaan tahapan wawancara rekrutmen calon guru.</li>
                <li>Menyampaikan notifikasi resmi, status verifikasi berkas, dan pengumuman hasil seleksi kepada pendaftar.</li>
                <li>Sinkronisasi data pokok pendidikan dengan instansi resmi (Dapodik / Kementerian Pendidikan Dasar dan Menengah).</li>
                <li>Merespons pertanyaan, pengaduan, atau saran yang dikirimkan melalui formulir kontak kami.</li>
              </ul>
            </section>

            {/* 4. Keamanan dan Penyimpanan Data */}
            <section className="space-y-3">
              <h2 className="font-display font-bold text-xl text-navy flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                  4
                </span>
                Keamanan dan Penyimpanan Data
              </h2>
              <p>
                Kami menerapkan standar pengamanan teknis dan organisasi yang ketat untuk mencegah kebocoran, perusakan, atau akses tanpa wewenang:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-paper rounded-control border border-navy/10 space-y-1.5">
                  <Lock className="w-5 h-5 text-primary" />
                  <h4 className="font-bold text-xs text-navy">Enkripsi Data Sensitif</h4>
                  <p className="text-xs text-ink-muted">
                    Nomor Induk Kependudukan (NIK) dienkripsi secara aman menggunakan protokol enkripsi simetris dan hashing kriptografis.
                  </p>
                </div>
                <div className="p-4 bg-paper rounded-control border border-navy/10 space-y-1.5">
                  <Server className="w-5 h-5 text-primary" />
                  <h4 className="font-bold text-xs text-navy">Kontrol Akses Berbasis Peran</h4>
                  <p className="text-xs text-ink-muted">
                    Hanya staf yang memiliki izin resmi (RBAC) yang dapat melihat berkas pendaftaran sesuai batas kewenangan tugasnya.
                  </p>
                </div>
                <div className="p-4 bg-paper rounded-control border border-navy/10 space-y-1.5">
                  <Eye className="w-5 h-5 text-primary" />
                  <h4 className="font-bold text-xs text-navy">Audit Trail Terpusat</h4>
                  <p className="text-xs text-ink-muted">
                    Setiap tindakan verifikasi, pembaruan status, dan unduhan berkas terekam secara otomatis dalam log sistem.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Hak-Hak Pemilik Data Pribadi */}
            <section className="space-y-3">
              <h2 className="font-display font-bold text-xl text-navy flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                  5
                </span>
                Hak-Hak Pemilik Data Pribadi
              </h2>
              <p>
                Sesuai dengan ketentuan UU Pelindungan Data Pribadi, Anda memiliki hak-hak berikut:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-ink-muted pl-2">
                <li><strong>Hak Mengakses:</strong> Anda berhak melihat dan memperoleh salinan berkas pendaftaran yang telah diunggah.</li>
                <li><strong>Hak Memperbaiki:</strong> Anda berhak meminta pembetulan atau pembaruan data jika ditemukan kesalahan administrasi.</li>
                <li><strong>Hak Menarik Persetujuan:</strong> Anda dapat membatalkan pendaftaran sebelum berkas diverifikasi secara final.</li>
                <li><strong>Hak Menghapus:</strong> Anda berhak mengajukan permohonan penghapusan akun dan berkas pribadi sesuai ketentuan perundangan.</li>
              </ul>
            </section>

            {/* 6. Pembagian Data kepada Pihak Ketiga */}
            <section className="space-y-3">
              <h2 className="font-display font-bold text-xl text-navy flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                  6
                </span>
                Kerahasiaan & Keterlibatan Pihak Ketiga
              </h2>
              <p>
                Yayasan Padindi <strong>tidak pernah menjual, menyewakan, atau memperdagangkan data pribadi Anda</strong> kepada pihak ketiga mana pun untuk tujuan periklanan atau komersial. Data hanya dapat diteruskan kepada pihak eksternal dalam kondisi berikut:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-ink-muted pl-2">
                <li>Instansi pemerintah dan kedinasan pendidikan resmi dalam rangka pelaporan data pokok pendidikan (Dapodik / EMIS).</li>
                <li>Lembaga penegak hukum yang sah jika diwajibkan oleh putusan pengadilan atau peraturan perundang-undangan.</li>
              </ul>
            </section>

            {/* 7. Kontak Petugas Pelindungan Data */}
            <section className="bg-paper p-6 rounded-control border border-navy/10 space-y-3">
              <h3 className="font-display font-bold text-base text-navy">
                Hubungi Petugas Pelindungan Data (DPO) Kami
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Apabila Anda memiliki pertanyaan, keberatan, atau ingin menggunakan hak-hak perlindungan data pribadi Anda, silakan hubungi tim sekretariat kami melalui saluran resmi berikut:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-navy font-semibold pt-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>{settings?.contact_address || 'Jl. Padindi Raya No. 10–12, Jakarta Barat'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>{settings?.contact_phone || '021-5550100'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span>{settings?.contact_email || 'info@padindi.sch.id'}</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Footer Navigation CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-navy/10 text-xs text-ink-muted">
          <span>&copy; {new Date().getFullYear()} Yayasan Padindi. Seluruh hak cipta dilindungi.</span>
          <div className="flex items-center gap-4">
            <Link to="/informasi-pendaftaran" className="hover:text-primary transition-colors">
              Informasi PPDB
            </Link>
            <Link to="/lowongan-guru" className="hover:text-primary transition-colors">
              Karir Guru
            </Link>
            <Link to="/kontak" className="hover:text-primary transition-colors">
              Hubungi Kami
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
