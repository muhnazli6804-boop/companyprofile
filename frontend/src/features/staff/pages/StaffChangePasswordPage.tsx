import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const StaffChangePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password Strength Calculation
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const isMatch = newPassword && newPassword === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentPassword) {
      setError('Password saat ini wajib diisi.');
      return;
    }
    if (!hasMinLength) {
      setError('Password baru minimal terdiri dari 8 karakter.');
      return;
    }
    if (!hasNumber || !hasLetter) {
      setError('Password baru harus memuat kombinasi huruf dan angka.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 600);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-card border border-navy/10 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/staff/profil"
            className="p-2 rounded-lg text-ink-muted hover:text-navy hover:bg-navy/5 border border-navy/10"
            title="Kembali ke Profil"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-display font-bold text-lg text-navy">Ubah Password Akun</h1>
            <p className="text-xs text-muted">Amankan akun Anda dengan kata sandi yang kuat dan unik</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 rounded-card border border-navy/10 shadow-sm space-y-5">
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-card text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Password akun Anda berhasil diubah! Gunakan password baru untuk sesi login berikutnya.</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-card text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Password Saat Ini */}
          <div>
            <label className="block font-bold text-navy uppercase mb-1">
              Password Saat Ini <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan kata sandi lama Anda"
                className="w-full pl-3 pr-10 py-2 border border-navy/20 rounded-control focus:border-primary outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Password Baru */}
          <div>
            <label className="block font-bold text-navy uppercase mb-1">
              Password Baru <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter (huruf & angka)"
                className="w-full pl-3 pr-10 py-2 border border-navy/20 rounded-control focus:border-primary outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password Baru */}
          <div>
            <label className="block font-bold text-navy uppercase mb-1">
              Konfirmasi Password Baru <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full pl-3 pr-10 py-2 border border-navy/20 rounded-control focus:border-primary outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-navy"
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Checklist Indikator Kekuatan Password */}
          <div className="bg-paper p-3.5 rounded-card border border-navy/10 space-y-1.5 text-[11px]">
            <span className="font-bold text-navy block mb-1">Kriteria Keamanan Kata Sandi:</span>
            <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700' : 'text-muted'}`}>
              <CheckCircle2 size={13} className={hasMinLength ? 'text-emerald-600' : 'text-muted/40'} />
              <span>Minimal 8 karakter</span>
            </div>
            <div className={`flex items-center gap-1.5 ${hasLetter && hasNumber ? 'text-emerald-700' : 'text-muted'}`}>
              <CheckCircle2 size={13} className={hasLetter && hasNumber ? 'text-emerald-600' : 'text-muted/40'} />
              <span>Kombinasi huruf dan angka</span>
            </div>
            <div className={`flex items-center gap-1.5 ${isMatch ? 'text-emerald-700' : 'text-muted'}`}>
              <CheckCircle2 size={13} className={isMatch ? 'text-emerald-600' : 'text-muted/40'} />
              <span>Konfirmasi password sesuai</span>
            </div>
          </div>

          <div className="pt-3 border-t border-navy/10 flex justify-end gap-2">
            <Link to="/staff/profil">
              <Button variant="outline" size="sm" type="button">
                Batal
              </Button>
            </Link>
            <Button variant="primary" size="sm" type="submit" isLoading={loading} className="flex items-center gap-1.5">
              <Save size={14} />
              <span>Simpan Kata Sandi</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffChangePasswordPage;
