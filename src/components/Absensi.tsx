import React, { useState, useEffect } from 'react';
import { User, Student, AttendanceRecord, AttendanceStatus, SchoolSettings } from '../types';
import { storage } from '../services/storage';
import { downloadExcel } from '../utils/excelExport';
import { 
  Calendar, 
  Check, 
  AlertTriangle, 
  Download, 
  Save, 
  CheckCircle2, 
  FileSpreadsheet,
  Info
} from 'lucide-react';

interface AbsensiProps {
  user: User;
  settings: SchoolSettings;
}

export const Absensi: React.FC<AbsensiProps> = ({ user, settings }) => {
  const classes = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];

  // Selected class
  const defaultClass = (user.role === 'guru' && user.tanggungJawab.startsWith('Kelas'))
    ? user.tanggungJawab
    : 'Kelas 1';

  const [selectedClass, setSelectedClass] = useState<string>(defaultClass);

  // Date selection (default today YYYY-MM-DD)
  const getTodayFormatted = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(getTodayFormatted());

  // Check if chosen date is Saturday or Sunday
  const isWeekend = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const day = d.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  const isSelectedDateWeekend = isWeekend(selectedDate);

  // Students in selected class
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; catatan: string }>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load students and existing attendances whenever class or date changes
  useEffect(() => {
    const allStudents = storage.getStudents().filter(s => s.kelas === selectedClass);
    setStudents(allStudents);

    // Load existing records for this date and class
    const existing = storage.getAttendances().filter(
      a => a.kelas === selectedClass && a.tanggal === selectedDate
    );

    const map: Record<string, { status: AttendanceStatus; catatan: string }> = {};
    allStudents.forEach(s => {
      const found = existing.find(e => e.studentId === s.id);
      if (found) {
        map[s.id] = { status: found.status, catatan: found.catatan || '' };
      } else {
        // Default to Hadir if not yet recorded
        map[s.id] = { status: 'H', catatan: '' };
      }
    });

    setAttendanceMap(map);
    setSaveSuccess(false);
  }, [selectedClass, selectedDate]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (isSelectedDateWeekend) return;
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
    setSaveSuccess(false);
  };

  const handleCatatanChange = (studentId: string, catatan: string) => {
    if (isSelectedDateWeekend) return;
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        catatan
      }
    }));
    setSaveSuccess(false);
  };

  const handleSetAllHadir = () => {
    if (isSelectedDateWeekend) return;
    setAttendanceMap(prev => {
      const next = { ...prev };
      students.forEach(s => {
        next[s.id] = { ...next[s.id], status: 'H' };
      });
      return next;
    });
    setSaveSuccess(false);
  };

  const handleSave = () => {
    if (isSelectedDateWeekend) {
      alert('Hari Sabtu dan Minggu adalah hari libur sekolah. Absensi tidak dapat disimpan pada akhir pekan.');
      return;
    }

    const records: AttendanceRecord[] = students.map(s => {
      const d = new Date(selectedDate + 'T00:00:00');
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const yearStr = String(d.getFullYear());

      return {
        id: `att_${s.id}_${selectedDate}`,
        studentId: s.id,
        studentName: s.nama,
        kelas: selectedClass,
        tanggal: selectedDate,
        status: attendanceMap[s.id]?.status || 'H',
        catatan: attendanceMap[s.id]?.catatan || '',
        semester: settings.activeSemester,
        bulan: monthStr,
        tahun: yearStr,
        guruId: user.id
      };
    });

    storage.saveDailyAttendance(records);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Export Daily Attendance to Excel
  const handleExportDailyExcel = () => {
    const data = students.map((s, idx) => ({
      'No': idx + 1,
      'Nama Siswa': s.nama,
      'NIS': s.nis,
      'Kelas': selectedClass,
      'Tanggal': selectedDate,
      'Status': attendanceMap[s.id]?.status || 'H',
      'Keterangan': attendanceMap[s.id]?.catatan || ''
    }));

    downloadExcel(data, `Absensi_${selectedClass.replace(' ', '_')}_${selectedDate}`);
  };

  // Can change class?
  const canChangeClass = user.role === 'admin' || 
    user.tanggungJawab === 'Pendidikan Agama Islam' || 
    user.tanggungJawab === 'PJOK';

  return (
    <div className="space-y-5">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Kelas
            </label>
            {canChangeClass ? (
              <select
                id="select-absen-kelas"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Tanggal Absensi
            </label>
            <div className="relative">
              <input
                id="input-absen-tanggal"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 ${
                  isSelectedDateWeekend 
                    ? 'border-rose-300 bg-rose-50 text-rose-800 focus:ring-rose-400' 
                    : 'border-slate-300 bg-slate-50 text-slate-800 focus:ring-blue-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {!isSelectedDateWeekend && (
            <button
              onClick={handleSetAllHadir}
              type="button"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Set Semua Hadir
            </button>
          )}

          <button
            onClick={handleExportDailyExcel}
            type="button"
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Unduh Excel</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSelectedDateWeekend}
            type="button"
            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 ${
              isSelectedDateWeekend 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-blue-700 hover:bg-blue-800 active:scale-95 text-white'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Simpan Absen</span>
          </button>
        </div>
      </div>

      {/* Weekend Alert Warning */}
      {isSelectedDateWeekend && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900 leading-relaxed">
            <p className="font-bold text-rose-950">
              Hari Libur Akhir Pekan (Sabtu / Minggu):
            </p>
            <p className="mt-0.5">
              Sesuai aturan operasional 5 hari kerja di SD Negeri Kraton 2, hari Sabtu dan Minggu tidak dapat diisi absensi karena kegiatan belajar mengajar libur.
            </p>
          </div>
        </div>
      )}

      {/* Save Success Toast */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">Daftar hadir {selectedClass} tanggal {selectedDate} berhasil disimpan!</span>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Daftar Siswa {selectedClass} ({students.length} Siswa)
            </h3>
            <p className="text-xs text-slate-500">
              Pilih status kehadiran: H (Hadir), S (Sakit), I (Izin), A (Alpa)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> H: Hadir
            </span>
            <span className="inline-flex items-center gap-1 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> S: Sakit
            </span>
            <span className="inline-flex items-center gap-1 text-blue-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> I: Izin
            </span>
            <span className="inline-flex items-center gap-1 text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> A: Alpa
            </span>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Belum ada data siswa di {selectedClass}. Silakan tambahkan data siswa di menu <strong>Data Siswa</strong>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4 w-28">NIS / NISN</th>
                  <th className="py-3 px-4 w-16 text-center">L/P</th>
                  <th className="py-3 px-4 w-64 text-center">Status Kehadiran</th>
                  <th className="py-3 px-4">Keterangan / Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student, idx) => {
                  const currentStatus = attendanceMap[student.id]?.status || 'H';
                  const currentCatatan = attendanceMap[student.id]?.catatan || '';

                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-slate-50 transition ${
                        currentStatus === 'S' ? 'bg-amber-50/30' :
                        currentStatus === 'I' ? 'bg-blue-50/30' :
                        currentStatus === 'A' ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-medium text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{student.nama}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{student.nis}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          student.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {student.jenisKelamin}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex rounded-xl p-1 bg-slate-100 gap-1 border border-slate-200">
                          {(['H', 'S', 'I', 'A'] as AttendanceStatus[]).map((st) => {
                            const isSelected = currentStatus === st;
                            let activeClass = 'bg-white text-slate-700 shadow-xs font-bold';
                            if (isSelected) {
                              if (st === 'H') activeClass = 'bg-emerald-600 text-white shadow-xs font-black';
                              if (st === 'S') activeClass = 'bg-amber-500 text-white shadow-xs font-black';
                              if (st === 'I') activeClass = 'bg-blue-600 text-white shadow-xs font-black';
                              if (st === 'A') activeClass = 'bg-rose-600 text-white shadow-xs font-black';
                            }

                            return (
                              <button
                                key={st}
                                type="button"
                                disabled={isSelectedDateWeekend}
                                onClick={() => handleStatusChange(student.id, st)}
                                className={`w-8 h-8 rounded-lg text-xs transition flex items-center justify-center ${activeClass} ${
                                  isSelectedDateWeekend ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                                }`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          disabled={isSelectedDateWeekend}
                          value={currentCatatan}
                          onChange={(e) => handleCatatanChange(student.id, e.target.value)}
                          placeholder="Keterangan izin/sakit (opsional)..."
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
