import React from 'react';
import { User, ActiveMenu, SchoolSettings } from '../types';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Award, 
  BookOpen, 
  HeartHandshake, 
  Users, 
  UserCog, 
  Printer, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  School,
  X
} from 'lucide-react';

interface SidebarProps {
  user: User;
  settings: SchoolSettings;
  activeMenu: ActiveMenu;
  onSelectMenu: (menu: ActiveMenu) => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
  isMobile: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  settings,
  activeMenu,
  onSelectMenu,
  isOpen,
  onToggle,
  onLogout,
  isMobile
}) => {
  const menuItems: { id: ActiveMenu; label: string; icon: React.ComponentType<{ className?: string }>; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'absen', label: 'Daftar Hadir (Absen)', icon: CalendarCheck },
    { id: 'nilai', label: 'Penilaian Harian (Nilai)', icon: Award },
    { id: 'jurnal', label: 'Jurnal Mengajar', icon: BookOpen },
    { id: 'bimbingan', label: 'Bimbingan Siswa', icon: HeartHandshake },
    { id: 'siswa', label: 'Data Siswa', icon: Users },
    { id: 'guru', label: 'Manajemen Guru', icon: UserCog, adminOnly: true },
    { id: 'cetak', label: 'Cetak Dokumen & Excel', icon: Printer },
    { id: 'pengaturan', label: 'Pengaturan & Profil', icon: Settings },
  ];

  const filteredItems = menuItems.filter(item => {
    if (item.adminOnly && user.role !== 'admin') return false;
    return true;
  });

  const handleItemClick = (id: ActiveMenu) => {
    onSelectMenu(id);
    if (isMobile) {
      onToggle(); // Auto-close on mobile
    }
  };

  // On mobile: overlay drawer
  if (isMobile) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={onToggle}
        />
        
        {/* Drawer Content */}
        <aside className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 p-1 flex items-center justify-center">
                <School className="w-6 h-6 text-amber-300" />
              </div>
              <div className="overflow-hidden">
                <h2 className="font-bold text-sm tracking-wide truncate">SDN KRATON 2</h2>
                <p className="text-[11px] text-blue-200 truncate">Administrasi Terpadu</p>
              </div>
            </div>
            <button 
              onClick={onToggle}
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Badge */}
          <div className="p-3 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-sm">
              {user.nama.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{user.nama}</p>
              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-200 text-blue-800 truncate">
                {user.tanggungJawab}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {filteredItems.map(item => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-mobile-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-slate-200">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar Akun</span>
            </button>
          </div>
        </aside>
      </div>
    );
  }

  // On Desktop: fixed sidebar that stays fixed while page scrolls
  return (
    <aside 
      className={`sticky top-0 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-30 select-none shadow-xs ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-200 px-4 flex items-center justify-between bg-blue-900 text-white">
        {isOpen ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-white/15 p-1.5 flex items-center justify-center shrink-0">
              <School className="w-5 h-5 text-amber-300" />
            </div>
            <div className="truncate">
              <h1 className="font-extrabold text-sm tracking-tight truncate">SDN KRATON 2</h1>
              <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Administrasi Guru</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
            <School className="w-5 h-5 text-amber-300" />
          </div>
        )}
        <button
          onClick={onToggle}
          title={isOpen ? 'Tutup Panel' : 'Buka Panel'}
          className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* User Info Bar */}
      {isOpen ? (
        <div className="p-3 bg-blue-50/70 border-b border-blue-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
            {user.nama.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">{user.nama}</p>
            <p className="text-[10px] text-blue-700 font-semibold truncate">{user.tanggungJawab}</p>
          </div>
        </div>
      ) : (
        <div className="p-2 border-b border-slate-200 flex justify-center" title={`${user.nama} (${user.tanggungJawab})`}>
          <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-xs">
            {user.nama.charAt(0)}
          </div>
        </div>
      )}

      {/* Menu List - independent scroll */}
      <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
        {filteredItems.map(item => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              id={`nav-desktop-${item.id}`}
              onClick={() => onSelectMenu(item.id)}
              title={!isOpen ? item.label : undefined}
              className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all ${
                isOpen ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5'
              } ${
                isActive
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              {isOpen && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Logout */}
      <div className="p-2.5 border-t border-slate-200">
        <button
          onClick={onLogout}
          title={!isOpen ? 'Keluar Akun' : undefined}
          className={`w-full flex items-center rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition ${
            isOpen ? 'justify-center gap-2 py-2 px-3' : 'justify-center p-2'
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {isOpen && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
};
