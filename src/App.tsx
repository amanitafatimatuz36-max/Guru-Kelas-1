import React, { useState, useEffect } from 'react';
import { User, SchoolSettings, ActiveMenu } from './types';
import { storage } from './services/storage';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Absensi } from './components/Absensi';
import { Nilai } from './components/Nilai';
import { Jurnal } from './components/Jurnal';
import { Bimbingan } from './components/Bimbingan';
import { DataSiswa } from './components/DataSiswa';
import { DataGuru } from './components/DataGuru';
import { Cetak } from './components/Cetak';
import { Pengaturan } from './components/Pengaturan';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());
  const [settings, setSettings] = useState<SchoolSettings>(() => storage.getSettings());
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('dashboard');

  // Sidebar responsiveness
  const [isMobile, setIsMobile] = useState<boolean>(() => window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveMenu('dashboard');
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    setCurrentUser(null);
    setActiveMenu('dashboard');
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // If user is not logged in, render fullscreen login page
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} settings={settings} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-800 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar: Fixed / Sticky, does not scroll with page content */}
      <Sidebar
        user={currentUser}
        settings={settings}
        activeMenu={activeMenu}
        onSelectMenu={(menu) => setActiveMenu(menu)}
        isOpen={isSidebarOpen}
        onToggle={handleToggleSidebar}
        onLogout={handleLogout}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Sticky Top Navbar */}
        <Navbar
          user={currentUser}
          settings={settings}
          activeMenu={activeMenu}
          onToggleSidebar={handleToggleSidebar}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {activeMenu === 'dashboard' && (
            <Dashboard
              user={currentUser}
              settings={settings}
              onNavigate={(menu) => setActiveMenu(menu)}
            />
          )}

          {activeMenu === 'absen' && (
            <Absensi user={currentUser} settings={settings} />
          )}

          {activeMenu === 'nilai' && (
            <Nilai user={currentUser} settings={settings} />
          )}

          {activeMenu === 'jurnal' && (
            <Jurnal user={currentUser} settings={settings} />
          )}

          {activeMenu === 'bimbingan' && (
            <Bimbingan user={currentUser} settings={settings} />
          )}

          {activeMenu === 'siswa' && (
            <DataSiswa user={currentUser} settings={settings} />
          )}

          {activeMenu === 'guru' && currentUser.role === 'admin' && (
            <DataGuru currentUser={currentUser} settings={settings} />
          )}

          {activeMenu === 'cetak' && (
            <Cetak user={currentUser} settings={settings} />
          )}

          {activeMenu === 'pengaturan' && (
            <Pengaturan
              currentUser={currentUser}
              settings={settings}
              onSettingsUpdate={(newSettings) => setSettings(newSettings)}
              onUserUpdate={(updatedUser) => setCurrentUser(updatedUser)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
