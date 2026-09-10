import React, { useState } from 'react';
import { User, SchoolSettings, UserRole } from '../types';
import { storage } from '../services/storage';
import { PWAInstallButton } from './PWAInstallButton';
import { 
  GraduationCap, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  School
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  settings: SchoolSettings;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, settings }) => {
  const [activeRole, setActiveRole] = useState<UserRole>('guru');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const teachers = storage.getUsers().filter(u => u.role === 'guru');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Silakan pilih atau masukkan Nama Pengguna / NIP');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Silakan masukkan Kata Sandi');
      return;
    }

    const allUsers = storage.getUsers();
    // Find matching user
    const matched = allUsers.find(
      u => u.role === activeRole && 
      (u.username.toLowerCase() === username.trim().toLowerCase() || u.nip === username.trim())
    );

    if (!matched) {
      setErrorMsg(
        activeRole === 'admin'
          ? 'Akun admin tidak ditemukan. Coba username: admin'
          : 'Akun guru tidak ditemukan. Coba pilih guru dari daftar atau masukkan username yang valid.'
      );
      return;
    }

    const expectedPassword = matched.password || (activeRole === 'admin' ? 'admin123' : 'sdnsuratmajan2');
    if (password.trim() !== expectedPassword) {
      setErrorMsg(
        `Kata sandi salah. Password bawaan ${
          activeRole === 'admin' ? 'admin: admin123' : 'guru: sdnsuratmajan2'
        }`
      );
      return;
    }

    // Success!
    storage.setCurrentUser(matched);
    onLoginSuccess(matched);
  };

  const handleQuickSelectTeacher = (teacherUsername: string) => {
    setUsername(teacherUsername);
    setPassword('sdnsuratmajan2');
    setErrorMsg('');
  };

  const handleQuickSelectAdmin = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col justify-between relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top bar with PWA button */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-wide">SD NEGERI KRATON 2</h1>
            <p className="text-slate-400 text-xs">Sistem Administrasi Guru Terpadu</p>
          </div>
        </div>
        <div>
          <PWAInstallButton compact />
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* Card Header with School Logo and Name */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 text-center relative">
            <div className="flex items-center justify-center gap-4 mb-3">
              {settings.schoolLogoUrl && (
                <img 
                  src={settings.schoolLogoUrl} 
                  alt="Logo Sekolah" 
                  className="w-12 h-12 object-contain bg-white/10 rounded-lg p-1"
                  onError={(e) => {
                    // Fallback to icon if remote URL fails
                    (e.target as HTMLImageElement).src = '/icon.svg';
                  }}
                />
              )}
              {settings.cityLogoUrl && (
                <img 
                  src={settings.cityLogoUrl} 
                  alt="Logo Daerah" 
                  className="w-10 h-10 object-contain bg-white/10 rounded-lg p-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
            <h2 className="text-lg font-extrabold tracking-wide uppercase">{settings.schoolName}</h2>
            <p className="text-blue-200 text-xs mt-0.5">Kecamatan Kraton, Kabupaten Pasuruan</p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-sm font-semibold">
            <button
              id="tab-login-guru"
              type="button"
              onClick={() => {
                setActiveRole('guru');
                setUsername('');
                setPassword('');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                activeRole === 'guru'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Sebagai Guru</span>
            </button>
            <button
              id="tab-login-admin"
              type="button"
              onClick={() => {
                setActiveRole('admin');
                setUsername('admin');
                setPassword('admin123');
                setErrorMsg('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
                activeRole === 'admin'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sebagai Admin</span>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Picker for Teachers */}
            {activeRole === 'guru' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pilih Guru / Tanggung Jawab
                </label>
                <div className="space-y-1.5">
                  <select
                    id="select-teacher-username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setPassword('sdnsuratmajan2');
                      setErrorMsg('');
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800 font-medium"
                  >
                    <option value="">-- Pilih Guru / Kelas --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.username}>
                        {t.nama} ({t.tanggungJawab})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-[11px] text-slate-400">Atau ketik username/NIP manual di bawah jika ada</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Pengguna (Admin)
                </label>
                <input
                  id="input-admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username admin"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* Manual Username input for Guru if wanted */}
            {activeRole === 'guru' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Username / NIP Guru
                </label>
                <input
                  id="input-teacher-username-manual"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: guru1 atau 19850314..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Kata Sandi</label>
                <span className="text-[11px] text-blue-600 font-medium">
                  Default: {activeRole === 'admin' ? 'admin123' : 'sdnsuratmajan2'}
                </span>
              </div>
              <div className="relative">
                <input
                  id="input-login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-submit-login"
              type="submit"
              className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 active:scale-98 text-white text-sm font-bold rounded-xl shadow-md transition duration-150 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Masuk Aplikasi</span>
            </button>
          </form>

          {/* Quick preset buttons for instant demo */}
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              Akses Cepat (Klik untuk Mengisi):
            </p>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                type="button"
                onClick={handleQuickSelectAdmin}
                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 rounded-md text-slate-800 font-medium transition"
              >
                🔑 Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelectTeacher('guru1')}
                className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 rounded-md text-blue-800 font-medium transition"
              >
                👩‍🏫 Guru Kelas 1
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelectTeacher('gurupai')}
                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 rounded-md text-emerald-800 font-medium transition"
              >
                📖 Guru Agama (Semua Kelas)
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelectTeacher('gurupjok')}
                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 rounded-md text-amber-800 font-medium transition"
              >
                ⚽ Guru PJOK (Semua Kelas)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} SD Negeri Kraton 2. Hak Cipta Dilindungi.</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Dibuat untuk Administrasi Guru Kelas & Mata Pelajaran</p>
      </footer>
    </div>
  );
};
