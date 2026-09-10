import React, { useState, useEffect } from 'react';
import { User, Student, CounselingRecord, SchoolSettings } from '../types';
import { storage } from '../services/storage';
import { downloadExcel } from '../utils/excelExport';
import { 
  HeartHandshake, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  FileSpreadsheet, 
  X, 
  CheckCircle2, 
  User as UserIcon,
  Tag
} from 'lucide-react';

interface BimbinganProps {
  user: User;
  settings: SchoolSettings;
}

export const Bimbingan: React.FC<BimbinganProps> = ({ user, settings }) => {
  const [counselings, setCounselings] = useState<CounselingRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filterSemester, setFilterSemester] = useState<'1' | '2' | 'semua'>('semua');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form states
  const getTodayFormatted = () => new Date().toISOString().split('T')[0];
  const [tanggal, setTanggal] = useState(getTodayFormatted());
  const [studentId, setStudentId] = useState('');
  const [permasalahan, setPermasalahan] = useState('');
  const [penanganan, setPenanganan] = useState('');
  const [tindakLanjut, setTindakLanjut] = useState('');
  const [kategori, setKategori] = useState<'Akademik' | 'Perilaku' | 'Sosial' | 'Kedisiplinan'>('Akademik');
  const [semester, setSemester] = useState<'1' | '2'>(settings.activeSemester);
  const [alertSuccess, setAlertSuccess] = useState('');

  const loadData = () => {
    setCounselings(storage.getScopedCounselings(user));
    setStudents(storage.getScopedStudents(user));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setTanggal(getTodayFormatted());
    setStudentId(students.length > 0 ? students[0].id : '');
    setPermasalahan('');
    setPenanganan('');
    setTindakLanjut('');
    setKategori('Akademik');
    setSemester(settings.activeSemester);
    setShowModal(true);
  };

  const handleOpenEdit = (item: CounselingRecord) => {
    setEditId(item.id);
    setTanggal(item.tanggal);
    setStudentId(item.studentId);
    setPermasalahan(item.permasalahan);
    setPenanganan(item.penanganan);
    setTindakLanjut(item.tindakLanjut);
    setKategori(item.kategori);
    setSemester(item.semester);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus catatan bimbingan ini?')) {
      storage.deleteCounseling(id);
      loadData();
      setAlertSuccess('Catatan bimbingan berhasil dihapus');
      setTimeout(() => setAlertSuccess(''), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedStudent = students.find(s => s.id === studentId);
    if (!selectedStudent) {
      alert('Pilih siswa yang dibimbing');
      return;
    }
    if (!permasalahan.trim() || !penanganan.trim()) {
      alert('Uraian masalah dan penanganan wajib diisi');
      return;
    }

    if (editId) {
      const updated: CounselingRecord = {
        id: editId,
        studentId: selectedStudent.id,
        studentName: selectedStudent.nama,
        kelas: selectedStudent.kelas,
        tanggal,
        permasalahan,
        penanganan,
        tindakLanjut,
        kategori,
        semester,
        tahun: settings.academicYear,
        guruId: user.id
      };
      storage.updateCounseling(updated);
      setAlertSuccess('Catatan bimbingan berhasil diperbarui');
    } else {
      const newRec: CounselingRecord = {
        id: `cns_${Date.now()}`,
        studentId: selectedStudent.id,
        studentName: selectedStudent.nama,
        kelas: selectedStudent.kelas,
        tanggal,
        permasalahan,
        penanganan,
        tindakLanjut,
        kategori,
        semester,
        tahun: settings.academicYear,
        guruId: user.id
      };
      storage.addCounseling(newRec);
      setAlertSuccess('Catatan bimbingan berhasil ditambahkan');
    }

    setShowModal(false);
    loadData();
    setTimeout(() => setAlertSuccess(''), 3000);
  };

  const filteredList = counselings.filter(c => {
    if (filterSemester === 'semua') return true;
    return c.semester === filterSemester;
  });

  const handleExportExcel = () => {
    const data = filteredList.map((c, idx) => ({
      'No': idx + 1,
      'Tanggal': c.tanggal,
      'Nama Siswa': c.studentName,
      'Kelas': c.kelas,
      'Kategori': c.kategori,
      'Semester': c.semester,
      'Tahun Ajaran': c.tahun,
      'Uraian Masalah / Gejala': c.permasalahan,
      'Penanganan / Bimbingan': c.penanganan,
      'Tindak Lanjut & Evaluasi': c.tindakLanjut
    }));

    downloadExcel(data, `Bimbingan_Siswa_${user.nama.replace(/\s+/g, '_')}_Sem_${filterSemester}`);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Filter Semester
            </label>
            <select
              id="select-bimbingan-sem"
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="semua">Semua Semester</option>
              <option value="1">Semester 1 (Ganjil)</option>
              <option value="2">Semester 2 (Genap)</option>
            </select>
          </div>
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
            onClick={handleOpenAdd}
            type="button"
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Catatan Bimbingan</span>
          </button>
        </div>
      </div>

      {alertSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{alertSuccess}</span>
        </div>
      )}

      {/* Counseling Cards */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            Belum ada catatan bimbingan siswa pada semester ini. Klik <strong>Tambah Catatan Bimbingan</strong> untuk mendokumentasikan bimbingan konseling peserta didik.
          </div>
        ) : (
          filteredList.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-900 font-extrabold text-xs flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5" />
                    {item.studentName} ({item.kelas})
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    item.kategori === 'Akademik' ? 'bg-indigo-100 text-indigo-800' :
                    item.kategori === 'Kedisiplinan' ? 'bg-rose-100 text-rose-800' :
                    item.kategori === 'Perilaku' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                  }`}>
                    {item.kategori}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-semibold">
                    Semester {item.semester}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.tanggal}
                  </span>
                  <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block mb-0.5">Permasalahan / Gejala:</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {item.permasalahan}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block mb-0.5">Bimbingan & Tindakan yang Diberikan:</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {item.penanganan}
                  </p>
                </div>
                {item.tindakLanjut && (
                  <div>
                    <span className="font-bold text-slate-800 block mb-0.5">Tindak Lanjut & Evaluasi Perkembangan:</span>
                    <p className="text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 leading-relaxed">
                      {item.tindakLanjut}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-blue-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-amber-300" />
                <span>{editId ? 'Edit Catatan Bimbingan' : 'Tambah Catatan Bimbingan Siswa'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="1">Semester 1 (Ganjil)</option>
                    <option value="2">Semester 2 (Genap)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Siswa</label>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.kelas})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Masalah</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Akademik">Akademik (Kesulitan Belajar)</option>
                    <option value="Kedisiplinan">Kedisiplinan (Kerapian/Kehadiran)</option>
                    <option value="Perilaku">Perilaku & Sikap</option>
                    <option value="Sosial">Sosial / Pertemanan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Permasalahan / Gejala</label>
                <textarea
                  rows={2}
                  value={permasalahan}
                  onChange={(e) => setPermasalahan(e.target.value)}
                  placeholder="Uraian permasalahan atau keluhan yang dialami..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bimbingan & Tindakan yang Diberikan</label>
                <textarea
                  rows={2}
                  value={penanganan}
                  onChange={(e) => setPenanganan(e.target.value)}
                  placeholder="Nasihat, solusi, pendekatan personal, atau kesepakatan bersama siswa..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tindak Lanjut & Evaluasi</label>
                <textarea
                  rows={2}
                  value={tindakLanjut}
                  onChange={(e) => setTindakLanjut(e.target.value)}
                  placeholder="Rencana pemantauan ke depan atau komunikasi dengan orang tua jika diperlukan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
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
                  Simpan Bimbingan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
