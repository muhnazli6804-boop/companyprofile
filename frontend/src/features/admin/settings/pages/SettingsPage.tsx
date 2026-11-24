import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Image as ImageIcon,
  Phone,
  Calendar,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
} from "lucide-react";
import { SeoHead } from "@/components/seo/SeoHead";
import { AdminPageHeader } from "@/components/admin";
import { getSettings, updateSettings, uploadLogo } from "../api";

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"identity" | "logo" | "contact" | "academic" | "security">("identity");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: settingsData, isLoading, error } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => getSettings(),
  });

  const [formData, setFormData] = useState<Record<string, string>>({
    site_name: "Yayasan Padindi",
    site_tagline: "Menuntun setiap anak ke arah yang tepat",
    about_description: "",
    vision: "",
    contact_email: "info@padindi.sch.id",
    contact_phone: "021-5550100",
    contact_whatsapp: "6281234567890",
    contact_address: "Jl. Padindi Raya No. 10–12, Jakarta Barat",
    contact_hours: "Senin – Jumat: 07.30 – 15.30 WIB",
    academic_year_active: "2026/2027",
    registration_student_test_info: "",
    registration_teacher_interview_info: "",
    security_session_timeout: "120",
    security_require_email_verification: "1",
    notification_admin_email_alert: "1",
  });

  useEffect(() => {
    if (settingsData?.flat) {
      setFormData((prev) => ({
        ...prev,
        ...settingsData.flat,
      }));
    }
  }, [settingsData]);

  const updateMutation = useMutation({
    mutationFn: (settings: Record<string, string>) => updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => uploadLogo(file),
    onSuccess: (res) => {
      setFormData((prev) => ({ ...prev, site_logo: res.data.path }));
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      alert("Logo berhasil diunggah!");
    },
  });

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadLogoMutation.mutate(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <SeoHead title="Pengaturan Sistem — Admin Yayasan" />

      <AdminPageHeader
        title="Pengaturan Sistem"
        subtitle="Kelola identitas resmi yayasan, logo institusi, kontak perwakilan, tahun ajaran aktif, dan kebijakan sistem."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Pengaturan" },
        ]}
      />

      {saveSuccess && (
        <div className="bg-leaf/10 border border-leaf/30 text-leaf p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">Pengaturan sistem berhasil disimpan.</span>
        </div>
      )}

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">Gagal memuat pengaturan sistem.</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border p-3 space-y-1 bg-surface/30 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("identity")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "identity"
                ? "bg-navy text-white shadow-sm"
                : "text-muted hover:bg-surface hover:text-navy"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Identitas Yayasan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("logo")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "logo"
                ? "bg-navy text-white shadow-sm"
                : "text-muted hover:bg-surface hover:text-navy"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Logo &amp; Visual</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("contact")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "contact"
                ? "bg-navy text-white shadow-sm"
                : "text-muted hover:bg-surface hover:text-navy"
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Informasi Kontak</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("academic")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "academic"
                ? "bg-navy text-white shadow-sm"
                : "text-muted hover:bg-surface hover:text-navy"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Tahun Ajaran &amp; PPDB</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "security"
                ? "bg-navy text-white shadow-sm"
                : "text-muted hover:bg-surface hover:text-navy"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Keamanan &amp; Notifikasi</span>
          </button>
        </div>

        {/* Content Form */}
        <div className="flex-1 p-6">
          {isLoading ? (
            <div className="p-12 text-center text-muted">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
              <p>Memuat formulir pengaturan...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {/* TAB 1: IDENTITAS YAYASAN */}
              {activeTab === "identity" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-navy text-base">Identitas &amp; Profil Yayasan</h3>
                    <p className="text-xs text-muted">
                      Informasi resmi nama institusi dan visi misi yang tampil pada landing page serta formulir pendaftaran.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Nama Yayasan *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.site_name || ""}
                      onChange={(e) => handleInputChange("site_name", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Slogan / Moto Yayasan
                    </label>
                    <input
                      type="text"
                      value={formData.site_tagline || ""}
                      onChange={(e) => handleInputChange("site_tagline", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Tentang Yayasan (Ringkasan Profil)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.about_description || ""}
                      onChange={(e) => handleInputChange("about_description", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Visi Yayasan
                    </label>
                    <textarea
                      rows={2}
                      value={formData.vision || ""}
                      onChange={(e) => handleInputChange("vision", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: LOGO YAYASAN */}
              {activeTab === "logo" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-navy text-base">Logo &amp; Citra Visual</h3>
                    <p className="text-xs text-muted">
                      Unggah logo resmi yayasan dalam format PNG atau SVG dengan latar belakang transparan.
                    </p>
                  </div>

                  <div className="p-6 bg-surface rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-center">
                    <Building2 className="w-16 h-16 text-primary mb-3" />
                    <p className="text-xs text-muted mb-4 max-w-sm">
                      Pilih berkas logo beresolusi tinggi (Maks. 2 MB). Logo akan diperbarui secara instan pada header dan kop surat.
                    </p>

                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy/90 transition shadow-sm cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span>{uploadLogoMutation.isPending ? "Mengunggah..." : "Pilih Berkas Logo"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        disabled={uploadLogoMutation.isPending}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 3: INFORMASI KONTAK */}
              {activeTab === "contact" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-navy text-base">Informasi Kontak &amp; Alamat</h3>
                    <p className="text-xs text-muted">
                      Kontak sekretariat yayasan untuk melayani pertanyaan dari calon wali murid dan pelamar kerja.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Email Kontak Resmi *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.contact_email || ""}
                        onChange={(e) => handleInputChange("contact_email", e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Nomor Telepon Kantor
                      </label>
                      <input
                        type="text"
                        value={formData.contact_phone || ""}
                        onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        WhatsApp Hotline PPDB
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 6281234567890"
                        value={formData.contact_whatsapp || ""}
                        onChange={(e) => handleInputChange("contact_whatsapp", e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Jam Layanan Kantor
                      </label>
                      <input
                        type="text"
                        placeholder="Senin – Jumat: 07.30 – 15.30 WIB"
                        value={formData.contact_hours || ""}
                        onChange={(e) => handleInputChange("contact_hours", e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Alamat Kantor Sekretariat
                    </label>
                    <textarea
                      rows={2}
                      value={formData.contact_address || ""}
                      onChange={(e) => handleInputChange("contact_address", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: TAHUN AJARAN & PPDB */}
              {activeTab === "academic" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-navy text-base">Tahun Ajaran &amp; Petunjuk Seleksi</h3>
                    <p className="text-xs text-muted">
                      Pengaturan default tahun ajaran dan instruksi tes/observasi yang akan dibaca calon pendaftar.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Tahun Ajaran Utama *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="2026/2027"
                      value={formData.academic_year_active || "2026/2027"}
                      onChange={(e) => handleInputChange("academic_year_active", e.target.value)}
                      className="w-full sm:w-60 px-3 py-2 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Instruksi Tes Observasi Murid (Tampil di Dasbor Calon Murid)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.registration_student_test_info || ""}
                      onChange={(e) => handleInputChange("registration_student_test_info", e.target.value)}
                      placeholder="Petunjuk kehadiran, pakaian, dan dokumen yang wajib dibawa saat tes observasi..."
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Instruksi Wawancara Guru (Tampil di Dasbor Pelamar Guru)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.registration_teacher_interview_info || ""}
                      onChange={(e) => handleInputChange("registration_teacher_interview_info", e.target.value)}
                      placeholder="Petunjuk jadwal wawancara daring / luring dan microteaching..."
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: KEAMANAN & NOTIFIKASI */}
              {activeTab === "security" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-navy text-base">Keamanan Sistem &amp; Notifikasi</h3>
                    <p className="text-xs text-muted">
                      Konfigurasi pembatasan sesi login dan pemberitahuan aktivitas pendaftaran baru.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.notification_admin_email_alert === "1"}
                        onChange={(e) =>
                          handleInputChange("notification_admin_email_alert", e.target.checked ? "1" : "0")
                        }
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="font-semibold text-navy text-xs block">
                          Pemberitahuan Pendaftaran Baru via Email
                        </span>
                        <span className="text-[11px] text-muted">
                          Kirim notifikasi email otomatis ke tim admin setiap kali ada calon murid baru yang mengirim berkas.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.security_require_email_verification === "1"}
                        onChange={(e) =>
                          handleInputChange("security_require_email_verification", e.target.checked ? "1" : "0")
                        }
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="font-semibold text-navy text-xs block">
                          Wajib Verifikasi Email Pendaftar
                        </span>
                        <span className="text-[11px] text-muted">
                          Pendaftar wajib memverifikasi tautan email sebelum dapat mengajukan formulir PPDB.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-6 border-t border-border flex items-center justify-end">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy text-white text-sm font-semibold rounded-lg hover:bg-navy/90 transition shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan Pengaturan"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
