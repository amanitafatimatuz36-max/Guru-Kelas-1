import React, { useState, useEffect, useRef } from 'react';
import { User, Student, SchoolSettings } from '../types';
import { storage } from '../services/storage';
import { downloadExcel, downloadCSVTemplate } from '../utils/excelExport';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Search,
  FileText
} from 'lucide-react';

interface DataSiswaProps {
  user: User;
  settings: SchoolSettings;
}

export const DataSiswa: React.FC<DataSiswaProps> = ({ user, settings }) => {
  const classes = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];

  const defaultClass = (user.role === 'guru' && user.tanggungJawab.startsWith('Kelas'))
    ? user.tanggungJawab
    : 'Semua Kelas';

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(defaultClass);
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form states
  const [nama, setNama] = useState('');
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [kelas, setKelas] = useState(
    user.role === 'guru' && user.tanggungJawab.startsWith('Kelas')
      ? user.tanggungJawab
      : 'Kelas 1'
  );
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');

  // CSV Massal Modal
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvParsedCount, setCsvParsedCount] = useState<number | null>(null);
  const [csvPreview, setCsvPreview] = useState<Student[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete all confirmation
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [alertSuccess, setAlertSuccess] = useState('');

  const loadStudents = () => {
    setStudents(storage.getScopedStudents(user));
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setNama('');
    setNis('');
    setNisn('');
    setKelas(
      user.role === 'guru' && user.tanggungJawab.startsWith('Kelas')
        ? user.tanggungJawab
        : 'Kelas 1'
    );
    setJenisKelamin('L');
    setShowModal(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditId(student.id);
    setNama(student.nama);
    setNis(student.nis);
    setNisn(student.nisn || '');
    setKelas(student.kelas);
    setJenisKelamin(student.jenisKelamin);
    setShowModal(true);
  };

  const handleDelete = (id: string, studentName: string) => {
    if (window.confirm(`Hapus data siswa "${studentName}"?`)) {
      storage.deleteStudent(id);
      loadStudents();
      setAlertSuccess(`Siswa ${studentName} berhasil dihapus`);
      setTimeout(() => setAlertSuccess(''), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !nis.trim()) {
      alert('Nama dan NIS siswa wajib diisi');
      return;
    }

    if (editId) {
      const updated: Student = {
        id: editId,
        nama: nama.trim(),
        nis: nis.trim(),
        nisn: nisn.trim() || undefined,
        kelas,
        jenisKelamin
      };
      storage.updateStudent(updated);
      setAlertSuccess(`Data ${updated.nama} berhasil diperbarui`);
    } else {
      const newStudent: Student = {
        id: `std_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        nama: nama.trim(),
        nis: nis.trim(),
        nisn: nisn.trim() || undefined,
        kelas,
        jenisKelamin
      };
      storage.addStudent(newStudent);
      setAlertSuccess(`Siswa ${newStudent.nama} berhasil ditambahkan`);
    }

    setShowModal(false);
    loadStudents();
    setTimeout(() => setAlertSuccess(''), 3000);
  };

  // CSV parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        alert('File CSV kosong atau hanya berisi baris header.');
        return;
      }

      // Format: nama,nis,nisn,kelas,jenisKelamin
      const parsed: Student[] = [];
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        // Handle quoted CSV cells
        const row = lines[i].split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
        if (row[0] && row[1]) {
          parsed.push({
            id: `std_csv_${Date.now()}_${i}`,
            nama: row[0],
            nis: row[1],
            nisn: row[2] || undefined,
            kelas: row[3] || (user.tanggungJawab.startsWith('Kelas') ? user.tanggungJawab : 'Kelas 1'),
            jenisKelamin: (row[4] && row[4].toUpperCase() === 'P') ? 'P' : 'L'
          });
        }
      }

      setCsvPreview(parsed);
      setCsvParsedCount(parsed.length);
    };

    reader.readAsText(file);
  };

  const handleApplyCSVImport = () => {
    if (csvPreview.length === 0) return;
    const current = storage.getStudents();
    storage.saveStudents([...current, ...csvPreview]);
    loadStudents();
    setShowCSVModal(false);
    setCsvPreview([]);
    setCsvParsedCount(null);
    setAlertSuccess(`Berhasil mengimpor ${csvPreview.length} siswa baru!`);
    setTimeout(() => setAlertSuccess(''), 3000);
  };

  const handleDeleteAllStudents = () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'HAPUS SEMUA SISWA') {
      alert('Teks konfirmasi tidak cocok. Ketik: HAPUS SEMUA SISWA');
      return;
    }
    storage.deleteAllStudents();
    loadStudents();
    setShowDeleteAllConfirm(false);
    setDeleteConfirmText('');
    setAlertSuccess('Semua data siswa berhasil dihapus');
    setTimeout(() => setAlertSuccess(''), 3000);
  };

  const canFilterAllClasses = user.role === 'admin' || 
    user.tanggungJawab === 'Pendidikan Agama Islam' || 
    user.tanggungJawab === 'PJOK';

  const filteredStudents = students.filter(s => {
    const matchClass = selectedClassFilter === 'Semua Kelas' || s.kelas === selectedClassFilter;
    const matchSearch = s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery) ||
      (s.nisn && s.nisn.includes(searchQuery));
    return matchClass && matchSearch;
  });

  const handleExportExcel = () => {
    const data = filteredStudents.map((s, idx) => ({
      'No': idx + 1,
      'Nama Siswa': s.nama,
      'NIS': s.nis,
      'NISN': s.nisn || '-',
      'Kelas': s.kelas,
      'Jenis Kelamin': s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'
    }));

    downloadExcel(data, `Data_Siswa_${selectedClassFilter.replace(' ', '_')}`);
  };

  return (
    <div className="space-y-5">
      {/* Top Filter and Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Filter */}
          {canFilterAllClasses ? (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Filter Kelas
              </label>
              <select
                id="select-siswa-kelas"
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Semua Kelas">Semua Kelas (1-6)</option>
                {classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="px-3 py-2 bg-blue-50 border border-blue-200 text-blue-800 font-bold rounded-xl text-xs">
              {user.tanggungJawab}
            </div>
          )}

          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Pencarian
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-siswa-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, NIS, atau NISN..."
                className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none w-56"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            type="button"
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Unduh Excel</span>
          </button>

          <button
            onClick={() => setShowCSVModal(true)}
            type="button"
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV Massal</span>
          </button>

          <button
            onClick={handleOpenAdd}
            type="button"
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>

          {user.role === 'admin' && (
            <button
              onClick={() => setShowDeleteAllConfirm(true)}
              type="button"
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              title="Hapus seluruh data siswa dengan 2-step verifikasi"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua Siswa</span>
            </button>
          )}
        </div>
      </div>

      {alertSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{alertSuccess}</span>
        </div>
      )}

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Daftar Siswa Terdaftar ({filteredStudents.length} Siswa)
          </h3>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Tidak ada siswa yang sesuai dengan filter atau pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Lengkap Siswa</th>
                  <th className="py-3 px-4 w-28">NIS</th>
                  <th className="py-3 px-4 w-32">NISN</th>
                  <th className="py-3 px-4 w-24">Kelas</th>
                  <th className="py-3 px-4 w-20 text-center">L/P</th>
                  <th className="py-3 px-4 w-28 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-center text-slate-500 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{student.nama}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{student.nis}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{student.nisn || '-'}</td>
                    <td className="py-3 px-4 font-semibold text-blue-700">{student.kelas}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        student.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {student.jenisKelamin}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Siswa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id, student.nama)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add/Edit Student */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-blue-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-300" />
                <span>{editId ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Ahmad Rizky Ramadhan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIS (Nomor Induk)</label>
                  <input
                    type="text"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    placeholder="Contoh: 240101"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NISN (Opsional)</label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="Contoh: 0148729101"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition shadow-xs"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mass CSV Upload */}
      {showCSVModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-indigo-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-300" />
                <span>Upload Massal Siswa via File CSV</span>
              </h3>
              <button onClick={() => setShowCSVModal(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1.5">
                <p className="font-bold">Format Kolom File CSV:</p>
                <p className="font-mono text-[11px] bg-white p-1.5 rounded border border-blue-200 text-blue-800">
                  nama,nis,nisn,kelas,jenisKelamin
                </p>
                <p className="text-[11px] text-slate-600">
                  Contoh kolom kelas: <code>Kelas 1</code>, jenis kelamin: <code>L</code> atau <code>P</code>.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => downloadCSVTemplate('siswa')}
                    className="inline-flex items-center gap-1 font-bold text-blue-700 underline text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Template CSV Siswa
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih File CSV dari Komputer / HP:
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              {csvParsedCount !== null && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                  <p className="font-bold">Ditemukan {csvParsedCount} data siswa valid!</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Klik tombol "Terapkan Impor" di bawah untuk memasukkan ke database.
                  </p>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCSVModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!csvParsedCount || csvParsedCount === 0}
                  onClick={handleApplyCSVImport}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition shadow-xs"
                >
                  Terapkan Impor ({csvParsedCount || 0} Siswa)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2-step Delete All Students */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
                <span>Konfirmasi Hapus Semua Siswa</span>
              </h3>
              <button onClick={() => setShowDeleteAllConfirm(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <p className="text-xs text-rose-900 font-semibold leading-relaxed">
                Tindakan ini akan menghapus <strong>SELURUH</strong> data siswa di SD Negeri Kraton 2. Tindakan ini tidak dapat dibatalkan!
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ketik <span className="font-mono text-rose-600">HAPUS SEMUA SISWA</span> untuk melanjutkan:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Ketik teks konfirmasi persis..."
                  className="w-full px-3 py-2 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowDeleteAllConfirm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAllStudents}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs"
                >
                  Ya, Hapus Semua Siswa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
