import React from 'react';
import { User, SchoolSettings, ActiveMenu } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { Menu, Calendar, ShieldCheck, UserCheck } from 'lucide-react';

interface NavbarProps {
  user: User;
  settings: SchoolSettings;
  activeMenu: ActiveMenu;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  settings,
  activeMenu,
  onToggleSidebar,
}) => {
  const titles: Record<ActiveMenu, string> = {
    dashboard: 'Dashboard Utama',
    absen: 'Kelola Daftar Hadir (Absensi)',
    nilai: 'Penilaian Harian (Nilai)',
    jurnal: 'Jurnal Mengajar Guru',
    bimbingan: 'Bimbingan & Konseling Siswa',
    siswa: 'Data Siswa',
    guru: 'Manajemen Akun Guru',
    cetak: 'Cetak Dokumen Resmi & Unduh Excel',
    pengaturan: 'Pengaturan Sistem & Profil',
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm md:text-base font-bold text-slate-900 tracking-tight">
            {titles[activeMenu]}
          </h1>
          <p className="hidden sm:block text-[11px] text-slate-500 font-medium">
            {settings.schoolName} • TA {settings.academicYear} (Semester {settings.activeSemester})
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* PWA Install Button */}
        <PWAInstallButton compact />

        {/* User Role Badge */}
        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs">
          <div className="text-right">
            <p className="font-bold text-slate-800 leading-tight">{user.nama}</p>
            <p className="text-[11px] text-slate-500">{user.tanggungJawab}</p>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
            user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {user.role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          </div>
        </div>
      </div>
    </header>
  );
};
