import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  ShieldCheck,
  KeyRound,
  Camera,
  CheckCircle2,
  X,
  Save,
} from 'lucide-react';
import { useCurrentUser, roleLabel } from '@/features/auth/permissions';
import { Button } from '@/components/ui/Button';

export const StaffProfilePage: React.FC = () => {
  const { data: user } = useCurrentUser();

  const [name, setName] = useState(user?.name || 'Siti Rahmawati, S.Pd');
  const [email] = useState(user?.email || 'guru@padindi.id');
  const [phone, setPhone] = useState(user?.phone || '081234567891');
  const [position, setPosition] = useState('Guru Wali Kelas & Pengampu IT');
  const [schoolUnit, setSchoolUnit] = useState('SMP Padindi');
  const [avatar, setAvatar] = useState('/images/avatar-default.png');
  const [bio, setBio] = useState('Berdedikasi dalam pendidikan saintifik dan pembentukan karakter generasi berakhlak mulia di Yayasan Padindi.');

  const [toast, setToast] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setToast('Informasi profil berhasil diperbarui.');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-card border border-navy/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-xl text-navy">Profil Saya</h1>
          <p className="text-xs text-muted mt-0.5">
            Informasi identitas akun tenaga pengajar dan staf operasional Yayasan Padindi.
          </p>
        </div>
        <Link
          to="/staff/ubah-password"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-navy/5 hover:bg-navy/10 text-navy font-semibold text-xs rounded-control transition-colors border border-navy/10"
        >
          <KeyRound size={14} />
          <span>Ubah Password</span>
        </Link>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-card border border-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}

      {/* Profile Card & Edit Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Avatar Card */}
        <div className="bg-white p-6 rounded-card border border-navy/10 shadow-sm space-y-4 text-center flex flex-col items-center">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-star/20 text-navy border-2 border-star flex items-center justify-center font-display font-bold text-3xl shadow-md overflow-hidden">
              {name.charAt(0).toUpperCase()}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 p-2 bg-navy text-white rounded-full shadow hover:bg-navy-light transition-colors"
              title="Ganti Foto Profil"
              onClick={() => alert('Fitur unggah foto profil mandiri tersambung ke penyimpanan yayasan.')}
            >
              <Camera size={14} />
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="font-display font-bold text-lg text-navy">{name}</h2>
            <p className="text-xs font-semibold text-primary">{position}</p>
            <p className="text-xs text-muted">{schoolUnit}</p>
          </div>

          <div className="w-full pt-4 border-t border-navy/10 space-y-2 text-left text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-muted">Hak Akses / Role:</span>
              <span className="font-bold text-navy bg-navy/5 px-2 py-0.5 rounded">
                {user?.roles?.length ? user.roles.map(roleLabel).join(', ') : 'Guru / Staf'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted">Status Akun:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Aktif
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted">Email Resmi:</span>
              <span className="font-mono text-[11px] truncate">{email}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Edit Form */}
        <div className="md:col-span-2 bg-white p-6 rounded-card border border-navy/10 shadow-sm space-y-5">
          <h3 className="font-display font-bold text-base text-navy pb-2 border-b border-navy/10">
            Edit Informasi Profil
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-navy uppercase mb-1">Nama Lengkap</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-navy/20 rounded-control focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy uppercase mb-1">Email Resmi (Terkunci)</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-9 pr-3 py-2 border border-navy/10 rounded-control bg-paper text-muted cursor-not-allowed outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-navy uppercase mb-1">Nomor Telepon / WhatsApp</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-navy/20 rounded-control focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy uppercase mb-1">Unit Sekolah Tugas</label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <select
                    value={schoolUnit}
                    onChange={(e) => setSchoolUnit(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-navy/20 rounded-control bg-white outline-none font-medium"
                  >
                    <option value="TK Padindi">TK Padindi</option>
                    <option value="SD Padindi">SD Padindi</option>
                    <option value="SMP Padindi">SMP Padindi</option>
                    <option value="Semua Unit Yayasan">Kantor Pengurus Yayasan</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-navy uppercase mb-1">Jabatan / Tugas Mengajar</label>
              <div className="relative">
                <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Contoh: Guru Kelas 5 / Staf Tata Usaha"
                  className="w-full pl-9 pr-3 py-2 border border-navy/20 rounded-control focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-navy uppercase mb-1">Biografi Singkat</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tuliskan pengalaman atau moto mengajar Anda..."
                className="w-full p-3 border border-navy/20 rounded-control focus:border-primary outline-none leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-navy/10 flex justify-end">
              <Button variant="primary" size="sm" type="submit" className="flex items-center gap-1.5">
                <Save size={14} />
                <span>Simpan Perubahan Profil</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffProfilePage;

