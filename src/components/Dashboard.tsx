import React from 'react';
import { User, SchoolSettings, ActiveMenu } from '../types';
import { storage } from '../services/storage';
import { 
  Users, 
  UserCheck, 
  CalendarCheck, 
  Award, 
  BookOpen, 
  HeartHandshake, 
  Printer, 
  ArrowRight,
  Shield,
  Info,
  CalendarDays
} from 'lucide-react';

interface DashboardProps {
  user: User;
  settings: SchoolSettings;
  onNavigate: (menu: ActiveMenu) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, settings, onNavigate }) => {
  const allStudents = storage.getStudents();
  const scopedStudents = storage.getScopedStudents(user);
  const teachers = storage.getUsers().filter(u => u.role === 'guru');
  const scopedAttendances = storage.getScopedAttendances(user);
  const scopedGrades = storage.getScopedGrades(user);
  const scopedJournals = storage.getScopedJournals(user);
  const scopedCounselings = storage.getScopedCounselings(user);

  // Today string YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const todayAttendances = scopedAttendances.filter(a => a.tanggal === today);

  const hadirCount = todayAttendances.filter(a => a.status === 'H').length;
  const sakitCount = todayAttendances.filter(a => a.status === 'S').length;
  const izinCount = todayAttendances.filter(a => a.status === 'I').length;
  const alpaCount = todayAttendances.filter(a => a.status === 'A').length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-blue-200 text-xs font-semibold mb-2 backdrop-blur-xs">
              <Shield className="w-3.5 h-3.5 text-amber-300" />
              <span>{user.role === 'admin' ? 'Akses Penuh: Administrator' : `Guru Pengampu: ${user.tanggungJawab}`}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              Selamat Datang, {user.nama}
            </h2>
            <p className="text-blue-200 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
              Sistem Administrasi Guru {settings.schoolName}. Kelola absensi harian, nilai harian per bab, jurnal pembelajaran, serta bimbingan siswa secara terstruktur dan siap cetak.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => onNavigate('absen')}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Isi Absen Hari Ini</span>
            </button>
            <button
              onClick={() => onNavigate('cetak')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl backdrop-blur-xs transition active:scale-95 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Menu Cetak</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scope and Read Quota Notice */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <p className="font-bold text-emerald-950">
            Optimasi Kuota Baca Database & Otorisasi Akses:
          </p>
          <p className="mt-0.5">
            {user.role === 'admin' ? (
              <>Sebagai <strong>Administrator</strong>, Anda memiliki hak akses penuh untuk mengelola semua data kelas, siswa, guru, serta kop dan tanda tangan Kepala Satuan Pendidikan.</>
            ) : user.tanggungJawab === 'Pendidikan Agama Islam' || user.tanggungJawab === 'PJOK' ? (
              <>Sebagai <strong>Guru {user.tanggungJawab}</strong>, Anda berwenang mengakses data siswa di <strong>semua kelas (Kelas 1 - Kelas 6)</strong> karena Anda mengampu seluruh jenjang kelas di {settings.schoolName}.</>
            ) : (
              <>Sebagai <strong>Guru {user.tanggungJawab}</strong>, data dibatasi secara otomatis hanya untuk siswa di kelas binaan Anda demi menjaga integritas data dan menghemat kuota baca database.</>
            )}
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Siswa Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {user.role === 'admin' || user.tanggungJawab === 'Pendidikan Agama Islam' || user.tanggungJawab === 'PJOK' ? 'Total Seluruh Siswa' : `Siswa ${user.tanggungJawab}`}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{scopedStudents.length}</p>
          <button 
            onClick={() => onNavigate('siswa')}
            className="mt-3 text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Kelola Siswa</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Guru / Kehadiran Card */}
        {user.role === 'admin' ? (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Guru Terdaftar</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{teachers.length}</p>
            <button 
              onClick={() => onNavigate('guru')}
              className="mt-3 text-[11px] font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              <span>Manajemen Guru</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Absen Hari Ini</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {todayAttendances.length} <span className="text-xs font-normal text-slate-400">/ {scopedStudents.length}</span>
            </p>
            <button 
              onClick={() => onNavigate('absen')}
              className="mt-3 text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>{todayAttendances.length === 0 ? 'Belum Diisi' : 'Lihat Rekap'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Jurnal Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Catatan Jurnal</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{scopedJournals.length}</p>
          <button 
            onClick={() => onNavigate('jurnal')}
            className="mt-3 text-[11px] font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1"
          >
            <span>Buka Jurnal</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Bimbingan Siswa Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-rose-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bimbingan Siswa</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{scopedCounselings.length}</p>
          <button 
            onClick={() => onNavigate('bimbingan')}
            className="mt-3 text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
          >
            <span>Bimbingan Siswa</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Info Kalender Kerja & Aturan Libur */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Aturan Kalender Libur */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <span>Ketentuan Hari Kerja & Libur</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sesuai regulasi kedinasan 5 hari kerja di SD Negeri Kraton 2:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span><strong>Senin - Jumat:</strong> Hari belajar efektif</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span><strong>Sabtu & Minggu:</strong> Libur akhir pekan (otomatis dikunci)</span>
            </li>
          </ul>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            Pada lembar cetak absensi bulanan, kolom Sabtu & Minggu otomatis diberi highlight warna merah.
          </div>
        </div>

        {/* Ringkasan Kehadiran Terakhir */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <span>Status Absensi Hari Ini ({today})</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {todayAttendances.length} Terdata
            </span>
          </div>

          {todayAttendances.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              Belum ada data absensi untuk hari ini.
              <div className="mt-2">
                <button
                  onClick={() => onNavigate('absen')}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold"
                >
                  Mulai Input Absen
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 pt-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                <span className="text-xs text-emerald-700 font-semibold block">Hadir (H)</span>
                <span className="text-xl font-black text-emerald-900">{hadirCount}</span>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <span className="text-xs text-amber-700 font-semibold block">Sakit (S)</span>
                <span className="text-xl font-black text-amber-900">{sakitCount}</span>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <span className="text-xs text-blue-700 font-semibold block">Izin (I)</span>
                <span className="text-xl font-black text-blue-900">{izinCount}</span>
              </div>
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-center">
                <span className="text-xs text-rose-700 font-semibold block">Alpa (A)</span>
                <span className="text-xl font-black text-rose-900">{alpaCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
