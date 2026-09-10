import React, { useState } from 'react';
import { User, SchoolSettings, AttendanceRecord, Student } from '../types';
import { storage } from '../services/storage';
import { downloadExcel, downloadAoaExcel } from '../utils/excelExport';
import { 
  Printer, 
  FileSpreadsheet, 
  FileText, 
  CalendarCheck, 
  BookOpen, 
  Award, 
  HeartHandshake, 
  Eye, 
  Settings2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CetakProps {
  user: User;
  settings: SchoolSettings;
}

type CetakType = 'absen_bulanan' | 'absen_semester' | 'nilai' | 'jurnal' | 'bimbingan';

export const Cetak: React.FC<CetakProps> = ({ user, settings }) => {
  const classes = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];
  const months = [
    { num: '07', name: 'Juli' },
    { num: '08', name: 'Agustus' },
    { num: '09', name: 'September' },
    { num: '10', name: 'Oktober' },
    { num: '11', name: 'November' },
    { num: '12', name: 'Desember' },
    { num: '01', name: 'Januari' },
    { num: '02', name: 'Februari' },
    { num: '03', name: 'Maret' },
    { num: '04', name: 'April' },
    { num: '05', name: 'Mei' },
    { num: '06', name: 'Juni' },
  ];

  const defaultClass = (user.role === 'guru' && user.tanggungJawab.startsWith('Kelas'))
    ? user.tanggungJawab
    : 'Kelas 1';

  // Config states
  const [docType, setDocType] = useState<CetakType>('absen_bulanan');
  const [selectedClass, setSelectedClass] = useState<string>(defaultClass);
  const [selectedMonth, setSelectedMonth] = useState<string>('09');
  const [selectedSemester, setSelectedSemester] = useState<'1' | '2'>(settings.activeSemester);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [selectedSubject, setSelectedSubject] = useState<string>('Matematika');

  // Teacher signature override/check
  const [teacherSignatureMode, setTeacherSignatureMode] = useState<'auto' | 'manual'>('auto');
  const [headmasterSignatureMode, setHeadmasterSignatureMode] = useState<'auto' | 'manual'>('auto');

  // Class selection permission
  const canSelectClass = user.role === 'admin' || 
    user.tanggungJawab === 'Pendidikan Agama Islam' || 
    user.tanggungJawab === 'PJOK';

  // Active teacher info for signature
  const targetTeacher = user.role === 'admin' 
    ? (storage.getUsers().find(u => u.tanggungJawab === selectedClass) || user)
    : user;

  // Retrieve data
  const students = storage.getStudents().filter(s => s.kelas === selectedClass);
  const allAttendances = storage.getAttendances().filter(a => a.kelas === selectedClass);
  const allGrades = storage.getGrades().filter(g => g.kelas === selectedClass);
  const allJournals = storage.getScopedJournals(user, selectedClass);
  const allCounselings = storage.getScopedCounselings(user, selectedClass);

  // Month days calculation (e.g., September has 30 days)
  const getDaysInMonth = (monthStr: string, year: string) => {
    const m = parseInt(monthStr, 10);
    const y = parseInt(year.split('/')[0], 10);
    const date = new Date(y, m, 0);
    return date.getDate();
  };

  const currentYear = settings.academicYear;
  const daysInCurrentMonth = getDaysInMonth(selectedMonth, currentYear);
  const daysArray = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);

  // Check if day is weekend
  const isWeekendDay = (day: number) => {
    const y = parseInt(currentYear.split('/')[0], 10);
    const m = parseInt(selectedMonth, 10) - 1;
    const d = new Date(y, m, day);
    const dayOfWeek = d.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 Sunday, 6 Saturday
  };

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  // Export to Excel according to active tab
  const handleExportExcel = () => {
    if (docType === 'absen_bulanan') {
      const monthObj = months.find(m => m.num === selectedMonth);
      const headers = ['No', 'Nama Siswa', 'NIS', ...daysArray.map(d => `${d}`), 'H', 'S', 'I', 'A'];
      const rows: any[][] = [headers];

      students.forEach((s, idx) => {
        let h = 0, sc = 0, ic = 0, ac = 0;
        const dayVals = daysArray.map(d => {
          const dayStr = String(d).padStart(2, '0');
          const rec = allAttendances.find(a => 
            a.studentId === s.id && 
            a.tanggal.endsWith(`-${selectedMonth}-${dayStr}`)
          );
          if (rec) {
            if (rec.status === 'H') h++;
            if (rec.status === 'S') sc++;
            if (rec.status === 'I') ic++;
            if (rec.status === 'A') ac++;
            return rec.status;
          }
          return isWeekendDay(d) ? 'L' : '-';
        });

        rows.push([idx + 1, s.nama, s.nis, ...dayVals, h, sc, ic, ac]);
      });

      downloadAoaExcel(rows, `Rekap_Absen_Bulan_${monthObj?.name}_${selectedClass.replace(' ', '_')}`);
    } 
    else if (docType === 'absen_semester') {
      const headers = ['No', 'Nama Siswa', 'NIS', 'Kelas', 'Semester', 'Total Hadir (H)', 'Total Sakit (S)', 'Total Izin (I)', 'Total Alpa (A)', 'Persentase'];
      const rows: any[][] = [headers];

      students.forEach((s, idx) => {
        const studentRecs = allAttendances.filter(a => a.studentId === s.id && a.semester === selectedSemester);
        const h = studentRecs.filter(a => a.status === 'H').length;
        const sc = studentRecs.filter(a => a.status === 'S').length;
        const ic = studentRecs.filter(a => a.status === 'I').length;
        const ac = studentRecs.filter(a => a.status === 'A').length;
        const totalHari = h + sc + ic + ac;
        const persentase = totalHari > 0 ? `${Math.round((h / totalHari) * 100)}%` : '0%';

        rows.push([idx + 1, s.nama, s.nis, s.kelas, `Semester ${selectedSemester}`, h, sc, ic, ac, persentase]);
      });

      downloadAoaExcel(rows, `Rekap_Absen_Semester_${selectedSemester}_${selectedClass.replace(' ', '_')}`);
    } 
    else if (docType === 'nilai') {
      const filtered = allGrades.filter(g => g.mataPelajaran === selectedSubject);
      const data = filtered.map((g, idx) => ({
        'No': idx + 1,
        'Nama Siswa': g.studentName,
        'Kelas': g.kelas,
        'Mata Pelajaran': g.mataPelajaran,
        'Bab': g.bab,
        'Penilaian Ke': g.penilaianKe,
        'Nilai Murni': g.nilai
      }));
      downloadExcel(data, `Rekap_Nilai_${selectedSubject}_${selectedClass.replace(' ', '_')}`);
    } 
    else if (docType === 'jurnal') {
      const filtered = allJournals.filter(j => selectedMonth === 'semua' || j.bulan === selectedMonth);
      const data = filtered.map((j, idx) => ({
        'No': idx + 1,
        'Tanggal': j.tanggal,
        'Jam Ke': j.jamKe,
        'Kelas': j.kelas,
        'Mata Pelajaran': j.mataPelajaran,
        'Bab': j.bab,
        'Materi Pokok': j.materi,
        'Kegiatan Pembelajaran': j.kegiatan,
        'Refleksi': j.refleksi,
        'Guru Pengampu': j.guruNama
      }));
      downloadExcel(data, `Cetak_Jurnal_${selectedClass.replace(' ', '_')}_Bulan_${selectedMonth}`);
    } 
    else if (docType === 'bimbingan') {
      const filtered = allCounselings.filter(c => c.semester === selectedSemester);
      const data = filtered.map((c, idx) => ({
        'No': idx + 1,
        'Tanggal': c.tanggal,
        'Nama Siswa': c.studentName,
        'Kelas': c.kelas,
        'Kategori Masalah': c.kategori,
        'Uraian Permasalahan': c.permasalahan,
        'Bimbingan Diberikan': c.penanganan,
        'Tindak Lanjut': c.tindakLanjut
      }));
      downloadExcel(data, `Cetak_Bimbingan_Semester_${selectedSemester}_${selectedClass.replace(' ', '_')}`);
    }
  };

  // Signatures placement:
  // "Pilihan tempat tanda tangan mau di kiri atau kanan"
  const isHeadmasterLeft = settings.signaturePosition === 'left';

  return (
    <div className="space-y-5">
      {/* Configuration Box (Hidden when printing) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-700" />
            <h2 className="text-sm font-bold text-slate-900">Panel Konfigurasi Cetak Dokumen</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-cetak-excel"
              onClick={handleExportExcel}
              type="button"
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Unduh Excel</span>
            </button>
            <button
              id="btn-cetak-print"
              onClick={handlePrint}
              type="button"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (PDF / Kertas)</span>
            </button>
          </div>
        </div>

        {/* Document Selector Pills */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">
            Pilih Jenis Dokumen yang Akan Dicetak:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs font-semibold">
            {[
              { id: 'absen_bulanan', label: 'Absensi Bulanan', icon: CalendarCheck },
              { id: 'absen_semester', label: 'Rekap Absen Semester', icon: CalendarCheck },
              { id: 'nilai', label: 'Daftar Nilai Siswa', icon: Award },
              { id: 'jurnal', label: 'Jurnal Mengajar Guru', icon: BookOpen },
              { id: 'bimbingan', label: 'Bimbingan Siswa (BK)', icon: HeartHandshake },
            ].map(tab => {
              const Icon = tab.icon;
              const active = docType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setDocType(tab.id as CetakType);
                    if (tab.id === 'absen_bulanan') setOrientation('landscape');
                    else setOrientation('portrait');
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 transition ${
                    active 
                      ? 'bg-blue-700 text-white border-blue-700 shadow-xs' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Filters depending on selected docType */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Kelas */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Kelas
            </label>
            {canSelectClass ? (
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : (
              <div className="px-3 py-2 bg-blue-50 border border-blue-200 text-blue-800 font-bold rounded-xl text-xs">
                {selectedClass}
              </div>
            )}
          </div>

          {/* Month option (for Absen Bulanan or Jurnal) */}
          {(docType === 'absen_bulanan' || docType === 'jurnal') && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Bulan Pelaporan
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {months.map(m => (
                  <option key={m.num} value={m.num}>{m.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Semester option (for Absen Semester or Bimbingan) */}
          {(docType === 'absen_semester' || docType === 'bimbingan') && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="1">Semester 1 (Ganjil)</option>
                <option value="2">Semester 2 (Genap)</option>
              </select>
            </div>
          )}

          {/* Subject option (for Nilai) */}
          {docType === 'nilai' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Mata Pelajaran
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {[
                  'Pendidikan Agama Islam',
                  'Pendidikan Pancasila',
                  'Bahasa Indonesia',
                  'Matematika',
                  'IPAS (Ilmu Pengetahuan Alam & Sosial)',
                  'PJOK',
                  'Seni Rupa / Musik',
                  'Bahasa Jawa'
                ].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Orientation Selector: Portrait or Landscape */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Orientasi Kertas
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                  orientation === 'portrait'
                    ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Portrait
              </button>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                  orientation === 'landscape'
                    ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Landscape
              </button>
            </div>
          </div>

          {/* TTD Option: Otomatis Gambar atau Manual (Kosongkan) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Tanda Tangan Dokumen
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setTeacherSignatureMode('auto');
                  setHeadmasterSignatureMode('auto');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                  teacherSignatureMode === 'auto'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Otomatis
              </button>
              <button
                type="button"
                onClick={() => {
                  setTeacherSignatureMode('manual');
                  setHeadmasterSignatureMode('manual');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                  teacherSignatureMode === 'manual'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Manual (Kosong)
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
          <span>
            Letak Tanda Tangan Kepala Satuan Pendidikan: <strong>{settings.signaturePosition === 'left' ? 'KIRI' : 'KANAN'}</strong> (Dapat diubah di menu Pengaturan).
          </span>
          {docType === 'absen_bulanan' && (
            <span className="text-rose-600 font-bold">
              Kolom hari Sabtu & Minggu otomatis berwarna merah.
            </span>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* PRINTABLE SHEET CONTAINER (Visual Sheet + Printable CSS) */}
      {/* ========================================================= */}
      <div 
        id="print-sheet-area"
        className={`bg-white rounded-2xl border border-slate-200 shadow-lg mx-auto p-8 text-slate-900 transition-all ${
          orientation === 'landscape' ? 'max-w-[1200px]' : 'max-w-[850px]'
        }`}
      >
        {/* KOP SURAT RESMI */}
        <div className="border-b-4 border-double border-slate-900 pb-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Daerah (Kabupaten Pasuruan) */}
            <div className="w-20 h-20 shrink-0 flex items-center justify-center">
              {settings.cityLogoUrl ? (
                <img 
                  src={settings.cityLogoUrl} 
                  alt="Logo Daerah" 
                  className="max-h-20 max-w-20 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/icon.svg'; }}
                />
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold">
                  LOGO
                </div>
              )}
            </div>

            {/* Teks Kop Surat */}
            <div className="text-center flex-1 space-y-0.5">
              <h4 className="text-xs md:text-sm font-bold tracking-wider uppercase">
                {settings.governmentHeader}
              </h4>
              <h3 className="text-sm md:text-base font-black tracking-wide uppercase">
                {settings.educationDepartment}
              </h3>
              <h2 className="text-base md:text-xl font-black tracking-tight text-blue-950 uppercase">
                {settings.schoolName}
              </h2>
              <p className="text-[11px] text-slate-700">
                {settings.schoolAddress}
              </p>
              <p className="text-[10px] text-slate-600">
                Email: {settings.schoolEmail} • Telepon: {settings.schoolPhone}
              </p>
            </div>

            {/* Logo Sekolah */}
            <div className="w-20 h-20 shrink-0 flex items-center justify-center">
              {settings.schoolLogoUrl ? (
                <img 
                  src={settings.schoolLogoUrl} 
                  alt="Logo Sekolah" 
                  className="max-h-20 max-w-20 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/icon.svg'; }}
                />
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold">
                  LOGO
                </div>
              )}
            </div>
          </div>
        </div>

        {/* JUDUL DOKUMEN CETAK */}
        <div className="text-center mb-6">
          <h2 className="text-base md:text-lg font-black tracking-wide uppercase underline">
            {docType === 'absen_bulanan' && `DAFTAR HADIR SISWA BULANAN`}
            {docType === 'absen_semester' && `REKAPITULASI DAFTAR HADIR SEMESTER ${selectedSemester}`}
            {docType === 'nilai' && `DAFTAR NILAI PENILAIAN HARIAN`}
            {docType === 'jurnal' && `JURNAL AGENDA MENGAJAR GURU`}
            {docType === 'bimbingan' && `BUKU CATATAN BIMBINGAN & KONSELING SISWA`}
          </h2>
          <div className="text-xs font-semibold text-slate-700 mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span>Kelas: <strong>{selectedClass}</strong></span>
            {docType === 'absen_bulanan' && (
              <span>Bulan: <strong>{months.find(m => m.num === selectedMonth)?.name}</strong></span>
            )}
            {docType === 'nilai' && (
              <span>Mata Pelajaran: <strong>{selectedSubject}</strong></span>
            )}
            <span>Tahun Ajaran: <strong>{settings.academicYear}</strong></span>
            <span>Semester: <strong>{selectedSemester}</strong></span>
          </div>
        </div>

        {/* CONTENT BASED ON DOCTYPE */}

        {/* 1. ABSEN BULANAN (With Saturday/Sunday red highlighted) */}
        {docType === 'absen_bulanan' && (
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-[10px] border-collapse border border-slate-900 text-center">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-slate-900">
                  <th rowSpan={2} className="border border-slate-900 px-1 py-1 w-7">No</th>
                  <th rowSpan={2} className="border border-slate-900 px-2 py-1 text-left min-w-[140px]">Nama Siswa</th>
                  <th rowSpan={2} className="border border-slate-900 px-1 py-1 w-12">NIS</th>
                  <th colSpan={daysInCurrentMonth} className="border border-slate-900 py-1">
                    Tanggal ({months.find(m => m.num === selectedMonth)?.name})
                  </th>
                  <th colSpan={4} className="border border-slate-900 py-1">Rekap</th>
                </tr>
                <tr className="border-b border-slate-900 font-bold text-[9px]">
                  {daysArray.map(d => {
                    const isRed = isWeekendDay(d);
                    return (
                      <th 
                        key={d} 
                        className={`border border-slate-900 w-5 py-0.5 ${
                          isRed ? 'bg-red-500 text-white font-black' : 'bg-slate-50'
                        }`}
                      >
                        {d}
                      </th>
                    );
                  })}
                  <th className="border border-slate-900 w-6 bg-emerald-100 text-emerald-900">H</th>
                  <th className="border border-slate-900 w-6 bg-amber-100 text-amber-900">S</th>
                  <th className="border border-slate-900 w-6 bg-blue-100 text-blue-900">I</th>
                  <th className="border border-slate-900 w-6 bg-rose-100 text-rose-900">A</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  let hadir = 0, sakit = 0, izin = 0, alpa = 0;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="border border-slate-900 py-1 font-medium">{idx + 1}</td>
                      <td className="border border-slate-900 px-2 py-1 text-left font-bold truncate max-w-[160px]">
                        {student.nama}
                      </td>
                      <td className="border border-slate-900 py-1 font-mono text-[9px]">{student.nis}</td>
                      {daysArray.map(d => {
                        const isRed = isWeekendDay(d);
                        const dayStr = String(d).padStart(2, '0');
                        const record = allAttendances.find(a => 
                          a.studentId === student.id && 
                          a.tanggal.endsWith(`-${selectedMonth}-${dayStr}`)
                        );

                        if (record) {
                          if (record.status === 'H') hadir++;
                          if (record.status === 'S') sakit++;
                          if (record.status === 'I') izin++;
                          if (record.status === 'A') alpa++;
                        }

                        return (
                          <td 
                            key={d} 
                            className={`border border-slate-900 py-0.5 font-bold ${
                              isRed 
                                ? 'bg-red-100 text-red-600 font-extrabold' 
                                : record?.status === 'H' ? 'text-emerald-700'
                                : record?.status === 'S' ? 'text-amber-700'
                                : record?.status === 'I' ? 'text-blue-700'
                                : record?.status === 'A' ? 'text-rose-700 font-black' : 'text-slate-300'
                            }`}
                          >
                            {isRed ? 'L' : record ? record.status : '•'}
                          </td>
                        );
                      })}
                      <td className="border border-slate-900 py-1 font-bold bg-emerald-50 text-emerald-900">{hadir}</td>
                      <td className="border border-slate-900 py-1 font-bold bg-amber-50 text-amber-900">{sakit}</td>
                      <td className="border border-slate-900 py-1 font-bold bg-blue-50 text-blue-900">{izin}</td>
                      <td className="border border-slate-900 py-1 font-bold bg-rose-50 text-rose-900">{alpa}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. REKAP ABSEN SEMESTER */}
        {docType === 'absen_semester' && (
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-xs border-collapse border border-slate-900 text-center">
              <thead className="bg-slate-100 font-bold border-b border-slate-900">
                <tr>
                  <th className="border border-slate-900 px-2 py-2 w-10">No</th>
                  <th className="border border-slate-900 px-3 py-2 text-left">Nama Siswa</th>
                  <th className="border border-slate-900 px-2 py-2 w-28">NIS</th>
                  <th className="border border-slate-900 px-2 py-2 w-16">L/P</th>
                  <th className="border border-slate-900 px-2 py-2 w-20 bg-emerald-50 text-emerald-950">Hadir (H)</th>
                  <th className="border border-slate-900 px-2 py-2 w-20 bg-amber-50 text-amber-950">Sakit (S)</th>
                  <th className="border border-slate-900 px-2 py-2 w-20 bg-blue-50 text-blue-950">Izin (I)</th>
                  <th className="border border-slate-900 px-2 py-2 w-20 bg-rose-50 text-rose-950">Alpa (A)</th>
                  <th className="border border-slate-900 px-2 py-2 w-28">Persentase</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const studentRecs = allAttendances.filter(a => a.studentId === student.id && a.semester === selectedSemester);
                  const h = studentRecs.filter(a => a.status === 'H').length;
                  const s = studentRecs.filter(a => a.status === 'S').length;
                  const i = studentRecs.filter(a => a.status === 'I').length;
                  const a = studentRecs.filter(a => a.status === 'A').length;
                  const total = h + s + i + a;
                  const percent = total > 0 ? Math.round((h / total) * 100) : 100;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="border border-slate-900 py-1.5 font-medium">{idx + 1}</td>
                      <td className="border border-slate-900 px-3 py-1.5 text-left font-bold">{student.nama}</td>
                      <td className="border border-slate-900 py-1.5 font-mono">{student.nis}</td>
                      <td className="border border-slate-900 py-1.5">{student.jenisKelamin}</td>
                      <td className="border border-slate-900 py-1.5 font-bold bg-emerald-50/50">{h}</td>
                      <td className="border border-slate-900 py-1.5 font-bold bg-amber-50/50">{s}</td>
                      <td className="border border-slate-900 py-1.5 font-bold bg-blue-50/50">{i}</td>
                      <td className="border border-slate-900 py-1.5 font-bold bg-rose-50/50">{a}</td>
                      <td className="border border-slate-900 py-1.5 font-bold text-slate-800">{percent}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. NILAI SISWA (Pure numbers, no categories / competencies) */}
        {docType === 'nilai' && (
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-xs border-collapse border border-slate-900 text-center">
              <thead className="bg-slate-100 font-bold border-b border-slate-900">
                <tr>
                  <th className="border border-slate-900 px-2 py-2 w-10">No</th>
                  <th className="border border-slate-900 px-3 py-2 text-left">Nama Siswa</th>
                  <th className="border border-slate-900 px-2 py-2 w-28">NIS</th>
                  <th className="border border-slate-900 px-2 py-2 w-16">L/P</th>
                  <th className="border border-slate-900 px-2 py-2 w-24">PH 1</th>
                  <th className="border border-slate-900 px-2 py-2 w-24">PH 2</th>
                  <th className="border border-slate-900 px-2 py-2 w-24">PH 3</th>
                  <th className="border border-slate-900 px-2 py-2 w-28 bg-blue-50">Rata-rata Nilai</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => {
                  const studentGrades = allGrades.filter(
                    g => g.studentId === student.id && g.mataPelajaran === selectedSubject
                  );
                  const ph1 = studentGrades.find(g => g.penilaianKe === 1)?.nilai ?? '-';
                  const ph2 = studentGrades.find(g => g.penilaianKe === 2)?.nilai ?? '-';
                  const ph3 = studentGrades.find(g => g.penilaianKe === 3)?.nilai ?? '-';

                  const numericVals = [ph1, ph2, ph3].filter(v => typeof v === 'number') as number[];
                  const avg = numericVals.length > 0 
                    ? Math.round(numericVals.reduce((a, b) => a + b, 0) / numericVals.length) 
                    : '-';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="border border-slate-900 py-1.5 font-medium">{idx + 1}</td>
                      <td className="border border-slate-900 px-3 py-1.5 text-left font-bold">{student.nama}</td>
                      <td className="border border-slate-900 py-1.5 font-mono">{student.nis}</td>
                      <td className="border border-slate-900 py-1.5">{student.jenisKelamin}</td>
                      <td className="border border-slate-900 py-1.5 font-mono font-semibold">{ph1}</td>
                      <td className="border border-slate-900 py-1.5 font-mono font-semibold">{ph2}</td>
                      <td className="border border-slate-900 py-1.5 font-mono font-semibold">{ph3}</td>
                      <td className="border border-slate-900 py-1.5 font-mono font-black bg-blue-50/50 text-blue-900">{avg}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. JURNAL MENGAJAR GURU */}
        {docType === 'jurnal' && (
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-xs border-collapse border border-slate-900 text-left">
              <thead className="bg-slate-100 font-bold border-b border-slate-900 text-center">
                <tr>
                  <th className="border border-slate-900 px-2 py-2 w-8">No</th>
                  <th className="border border-slate-900 px-2 py-2 w-24">Tanggal</th>
                  <th className="border border-slate-900 px-2 py-2 w-16">Jam</th>
                  <th className="border border-slate-900 px-2 py-2 w-28">Mapel / Bab</th>
                  <th className="border border-slate-900 px-3 py-2">Materi Pokok & Kegiatan</th>
                  <th className="border border-slate-900 px-3 py-2 w-48">Refleksi / Catatan</th>
                </tr>
              </thead>
              <tbody>
                {allJournals.filter(j => selectedMonth === 'semua' || j.bulan === selectedMonth).map((j, idx) => (
                  <tr key={j.id} className="hover:bg-slate-50">
                    <td className="border border-slate-900 py-2 px-1 text-center font-medium">{idx + 1}</td>
                    <td className="border border-slate-900 py-2 px-2 text-center whitespace-nowrap">{j.tanggal}</td>
                    <td className="border border-slate-900 py-2 px-2 text-center font-medium">{j.jamKe}</td>
                    <td className="border border-slate-900 py-2 px-2 font-semibold">
                      <div>{j.mataPelajaran}</div>
                      {j.bab && <div className="text-[10px] text-slate-600 font-normal">{j.bab}</div>}
                    </td>
                    <td className="border border-slate-900 py-2 px-3">
                      <p className="font-bold text-slate-800">{j.materi}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">{j.kegiatan}</p>
                    </td>
                    <td className="border border-slate-900 py-2 px-3 text-[11px] italic text-slate-700">
                      {j.refleksi || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. BIMBINGAN SISWA */}
        {docType === 'bimbingan' && (
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-xs border-collapse border border-slate-900 text-left">
              <thead className="bg-slate-100 font-bold border-b border-slate-900 text-center">
                <tr>
                  <th className="border border-slate-900 px-2 py-2 w-8">No</th>
                  <th className="border border-slate-900 px-2 py-2 w-24">Tanggal</th>
                  <th className="border border-slate-900 px-3 py-2 w-36">Nama Siswa</th>
                  <th className="border border-slate-900 px-2 py-2 w-24">Kategori</th>
                  <th className="border border-slate-900 px-3 py-2">Permasalahan</th>
                  <th className="border border-slate-900 px-3 py-2">Bimbingan Diberikan</th>
                  <th className="border border-slate-900 px-3 py-2 w-40">Tindak Lanjut</th>
                </tr>
              </thead>
              <tbody>
                {allCounselings.filter(c => c.semester === selectedSemester).map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="border border-slate-900 py-2 px-1 text-center font-medium">{idx + 1}</td>
                    <td className="border border-slate-900 py-2 px-2 text-center whitespace-nowrap">{c.tanggal}</td>
                    <td className="border border-slate-900 py-2 px-3 font-bold">{c.studentName}</td>
                    <td className="border border-slate-900 py-2 px-2 text-center">{c.kategori}</td>
                    <td className="border border-slate-900 py-2 px-3">{c.permasalahan}</td>
                    <td className="border border-slate-900 py-2 px-3">{c.penanganan}</td>
                    <td className="border border-slate-900 py-2 px-3 text-[11px] text-emerald-800">{c.tindakLanjut || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================= */}
        {/* SIGNATURE SECTION (TANDA TANGAN) */}
        {/* ========================================================= */}
        {/* User explicitly specified: 
            "bisa di tandatangani kepala satuan pendidikan"
            "pilihan tempat tanda tangan mau di kiri atau kanan"
            "pilihan tanda tangan otomatis menggunakan url gambar atau tanda tangan manual (kosingkan)"
        */}
        <div className="pt-6 mt-6 border-t border-slate-300 text-xs">
          <div className="flex justify-between items-start gap-8">
            {/* Signature Block 1: Left */}
            <div className={`text-center w-72 ${isHeadmasterLeft ? 'order-1' : 'order-2'}`}>
              <p className="text-slate-600 mb-1">Mengetahui,</p>
              <p className="font-bold text-slate-900 uppercase">
                {isHeadmasterLeft ? 'Kepala Satuan Pendidikan' : 'Guru Kelas / Pengampu'}
              </p>
              <p className="text-[11px] text-slate-500">{settings.schoolName}</p>

              {/* Signature Image or Manual Spacing */}
              <div className="h-24 flex items-center justify-center my-1">
                {isHeadmasterLeft ? (
                  headmasterSignatureMode === 'auto' && settings.headmasterSignatureUrl ? (
                    <img 
                      src={settings.headmasterSignatureUrl} 
                      alt="Tanda Tangan Kepala Satuan Pendidikan" 
                      className="max-h-20 max-w-full object-contain" 
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="h-16" /> /* Blank for manual wet signature */
                  )
                ) : (
                  teacherSignatureMode === 'auto' && targetTeacher.signatureUrl ? (
                    <img 
                      src={targetTeacher.signatureUrl} 
                      alt="Tanda Tangan Guru" 
                      className="max-h-20 max-w-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="h-16" /> /* Blank for manual signature */
                  )
                )}
              </div>

              {/* Name & NIP */}
              <p className="font-bold text-slate-900 underline uppercase tracking-wide">
                {isHeadmasterLeft ? settings.headmasterName : targetTeacher.nama}
              </p>
              <p className="text-[11px] text-slate-600 font-mono">
                NIP. {isHeadmasterLeft ? settings.headmasterNip : (targetTeacher.nip || '..............................')}
              </p>
            </div>

            {/* Signature Block 2: Right */}
            <div className={`text-center w-72 ${isHeadmasterLeft ? 'order-2' : 'order-1'}`}>
              <p className="text-slate-600 mb-1">
                Kraton, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="font-bold text-slate-900 uppercase">
                {!isHeadmasterLeft ? 'Kepala Satuan Pendidikan' : 'Guru Kelas / Pengampu'}
              </p>
              <p className="text-[11px] text-slate-500">{settings.schoolName}</p>

              {/* Signature Image or Manual Spacing */}
              <div className="h-24 flex items-center justify-center my-1">
                {!isHeadmasterLeft ? (
                  headmasterSignatureMode === 'auto' && settings.headmasterSignatureUrl ? (
                    <img 
                      src={settings.headmasterSignatureUrl} 
                      alt="Tanda Tangan Kepala Satuan Pendidikan" 
                      className="max-h-20 max-w-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="h-16" />
                  )
                ) : (
                  teacherSignatureMode === 'auto' && targetTeacher.signatureUrl ? (
                    <img 
                      src={targetTeacher.signatureUrl} 
                      alt="Tanda Tangan Guru" 
                      className="max-h-20 max-w-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="h-16" />
                  )
                )}
              </div>

              {/* Name & NIP */}
              <p className="font-bold text-slate-900 underline uppercase tracking-wide">
                {!isHeadmasterLeft ? settings.headmasterName : targetTeacher.nama}
              </p>
              <p className="text-[11px] text-slate-600 font-mono">
                NIP. {!isHeadmasterLeft ? settings.headmasterNip : (targetTeacher.nip || '..............................')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
