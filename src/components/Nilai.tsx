import React, { useState, useEffect } from 'react';
import { User, Student, GradeRecord, SchoolSettings } from '../types';
import { storage } from '../services/storage';
import { downloadExcel } from '../utils/excelExport';
import { 
  Award, 
  Plus, 
  Save, 
  Trash2, 
  Download, 
  CheckCircle2, 
  FileSpreadsheet,
  BookOpen
} from 'lucide-react';

interface NilaiProps {
  user: User;
  settings: SchoolSettings;
}

export const Nilai: React.FC<NilaiProps> = ({ user, settings }) => {
  const classes = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];
  const subjects = [
    'Pendidikan Agama Islam',
    'Pendidikan Pancasila',
    'Bahasa Indonesia',
    'Matematika',
    'IPAS (Ilmu Pengetahuan Alam & Sosial)',
    'PJOK',
    'Seni Rupa / Musik',
    'Bahasa Jawa'
  ];

  // Default class based on user
  const defaultClass = (user.role === 'guru' && user.tanggungJawab.startsWith('Kelas'))
    ? user.tanggungJawab
    : 'Kelas 1';

  // Default subject based on responsibility
  const defaultSubject = user.tanggungJawab === 'Pendidikan Agama Islam' 
    ? 'Pendidikan Agama Islam' 
    : user.tanggungJawab === 'PJOK' 
      ? 'PJOK' 
      : 'Matematika';

  const [selectedClass, setSelectedClass] = useState<string>(defaultClass);
  const [selectedSubject, setSelectedSubject] = useState<string>(defaultSubject);
  const [selectedBab, setSelectedBab] = useState<string>('Bab 1');
  const [penilaianKe, setPenilaianKe] = useState<number>(1);
  const [judulPenilaian, setJudulPenilaian] = useState<string>('Penilaian Harian 1');

  const [students, setStudents] = useState<Student[]>([]);
  const [gradeInputMap, setGradeInputMap] = useState<Record<string, number>>({});
  const [savedRecords, setSavedRecords] = useState<GradeRecord[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load students and saved grades
  useEffect(() => {
    const allStudents = storage.getStudents().filter(s => s.kelas === selectedClass);
    setStudents(allStudents);

    // Existing grades for this class, subject, bab, penilaianKe
    const allGrades = storage.getGrades().filter(
      g => g.kelas === selectedClass && 
           g.mataPelajaran === selectedSubject &&
           g.bab === selectedBab &&
           g.penilaianKe === penilaianKe
    );

    const map: Record<string, number> = {};
    allStudents.forEach(s => {
      const found = allGrades.find(g => g.studentId === s.id);
      map[s.id] = found ? found.nilai : 0;
    });

    setGradeInputMap(map);
    setSavedRecords(storage.getScopedGrades(user, selectedClass));
    setSaveSuccess(false);
  }, [selectedClass, selectedSubject, selectedBab, penilaianKe]);

  const handleGradeChange = (studentId: string, valStr: string) => {
    const num = Math.min(100, Math.max(0, Number(valStr) || 0));
    setGradeInputMap(prev => ({
      ...prev,
      [studentId]: num
    }));
    setSaveSuccess(false);
  };

  const handleSaveGrades = () => {
    const today = new Date().toISOString().split('T')[0];
    const recordsToSave: GradeRecord[] = students.map(s => {
      const id = `grd_${s.id}_${selectedSubject.replace(/\s+/g, '')}_${selectedBab.replace(/\s+/g, '')}_PH${penilaianKe}`;
      return {
        id,
        studentId: s.id,
        studentName: s.nama,
        kelas: selectedClass,
        mataPelajaran: selectedSubject,
        bab: selectedBab,
        penilaianKe,
        judulPenilaian: judulPenilaian.trim() || `PH ${penilaianKe} ${selectedBab}`,
        nilai: gradeInputMap[s.id] ?? 0,
        semester: settings.activeSemester,
        tahun: settings.academicYear,
        guruId: user.id,
        updatedAt: today
      };
    });

    storage.upsertGrades(recordsToSave);
    setSavedRecords(storage.getScopedGrades(user, selectedClass));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Export Assessment to Excel
  const handleExportExcel = () => {
    const data = students.map((s, idx) => ({
      'No': idx + 1,
      'Nama Siswa': s.nama,
      'NIS': s.nis,
      'Kelas': selectedClass,
      'Mata Pelajaran': selectedSubject,
      'Bab': selectedBab,
      'Penilaian Ke': penilaianKe,
      'Judul Penilaian': judulPenilaian,
      'Nilai': gradeInputMap[s.id] ?? 0
    }));

    downloadExcel(data, `Nilai_${selectedSubject}_${selectedClass}_${selectedBab}_PH${penilaianKe}`);
  };

  const canChangeClass = user.role === 'admin' || 
    user.tanggungJawab === 'Pendidikan Agama Islam' || 
    user.tanggungJawab === 'PJOK';

  return (
    <div className="space-y-5">
      {/* Configuration & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Kelas */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Kelas
            </label>
            {canChangeClass ? (
              <select
                id="select-nilai-kelas"
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

          {/* Mata Pelajaran */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Mata Pelajaran
            </label>
            <select
              id="select-nilai-mapel"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none truncate"
            >
              {subjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Bab */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Bab Pembelajaran
            </label>
            <input
              id="input-nilai-bab"
              type="text"
              value={selectedBab}
              onChange={(e) => setSelectedBab(e.target.value)}
              placeholder="Contoh: Bab 1 Bilangan"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Penilaian Ke (Bisa lebih dari 1 per bab) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Penilaian Harian Ke-
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setPenilaianKe(num);
                    setJudulPenilaian(`Penilaian Harian ${num}`);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                    penilaianKe === num
                      ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  PH {num}
                </button>
              ))}
            </div>
          </div>

          {/* Judul Penilaian */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Judul / Topik Tes
            </label>
            <input
              id="input-nilai-judul"
              type="text"
              value={judulPenilaian}
              onChange={(e) => setJudulPenilaian(e.target.value)}
              placeholder="Contoh: PH 1 Penjumlahan"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <div className="text-xs text-slate-500 font-medium">
            Nilai berupa angka murni (0–100). Sesuai permintaan, kategori predikat & catatan capaian telah dihilangkan.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              type="button"
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Unduh Excel</span>
            </button>
            <button
              onClick={handleSaveGrades}
              type="button"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Nilai</span>
            </button>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">
            Data {judulPenilaian} ({selectedSubject} - {selectedBab}) berhasil disimpan!
          </span>
        </div>
      )}

      {/* Input Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Form Penilaian Harian: {selectedClass} • {selectedSubject} • {selectedBab} (PH-{penilaianKe})
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            Total Siswa: {students.length}
          </span>
        </div>

        {students.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Belum ada data siswa di {selectedClass}. Tambahkan data siswa terlebih dahulu.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4 w-28">NIS</th>
                  <th className="py-3 px-4 w-20 text-center">L/P</th>
                  <th className="py-3 px-4 w-40 text-center">Nilai Angka (0-100)</th>
                  <th className="py-3 px-4 text-center w-36">Status Ketuntasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student, idx) => {
                  const currentGrade = gradeInputMap[student.id] ?? 0;
                  const isTuntas = currentGrade >= 75; // KKM / KKTP Sekolah 75

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition">
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
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={currentGrade}
                          onChange={(e) => handleGradeChange(student.id, e.target.value)}
                          className="w-24 px-3 py-1.5 text-center font-black text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isTuntas ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isTuntas ? 'Tuntas' : 'Perlu Remedial'}
                        </span>
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
