import React, { useState, useEffect } from 'react';
import { User, JournalRecord, SchoolSettings } from '../types';
import { storage } from '../services/storage';
import { downloadExcel } from '../utils/excelExport';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Calendar, 
  Download, 
  FileSpreadsheet,
  X,
  CheckCircle2
} from 'lucide-react';

interface JurnalProps {
  user: User;
  settings: SchoolSettings;
}

export const Jurnal: React.FC<JurnalProps> = ({ user, settings }) => {
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

  const defaultClass = (user.role === 'guru' && user.tanggungJawab.startsWith('Kelas'))
    ? user.tanggungJawab
    : 'Kelas 1';

  const [journals, setJournals] = useState<JournalRecord[]>([]);
  const [filterMonth, setFilterMonth] = useState<string>('semua');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form states
  const getTodayFormatted = () => new Date().toISOString().split('T')[0];
  const [tanggal, setTanggal] = useState(getTodayFormatted());
  const [jamKe, setJamKe] = useState('1 - 3');
  const [kelas, setKelas] = useState(defaultClass);
  const [mataPelajaran, setMataPelajaran] = useState(
    user.tanggungJawab === 'Pendidikan Agama Islam' ? 'Pendidikan Agama Islam' :
    user.tanggungJawab === 'PJOK' ? 'PJOK' : 'Bahasa Indonesia'
  );
  const [bab, setBab] = useState('');
  const [materi, setMateri] = useState('');
  const [kegiatan, setKegiatan] = useState('');
  const [refleksi, setRefleksi] = useState('');
  const [alertSuccess, setAlertSuccess] = useState('');

  const loadJournals = () => {
    setJournals(storage.getScopedJournals(user));
  };

  useEffect(() => {
    loadJournals();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setTanggal(getTodayFormatted());
    setJamKe('1 - 3');
    setKelas(defaultClass);
    setBab('');
    setMateri('');
    setKegiatan('');
    setRefleksi('');
    setShowModal(true);
  };

  const handleOpenEdit = (item: JournalRecord) => {
    setEditId(item.id);
    setTanggal(item.tanggal);
    setJamKe(item.jamKe);
    setKelas(item.kelas);
    setMataPelajaran(item.mataPelajaran);
    setBab(item.bab);
    setMateri(item.materi);
    setKegiatan(item.kegiatan);
    setRefleksi(item.refleksi);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus catatan jurnal ini?')) {
      storage.deleteJournal(id);
      loadJournals();
      setAlertSuccess('Catatan jurnal berhasil dihapus');
      setTimeout(() => setAlertSuccess(''), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materi.trim() || !kegiatan.trim()) {
      alert('Materi pokok dan kegiatan pembelajaran wajib diisi.');
      return;
    }

    const d = new Date(tanggal + 'T00:00:00');
    const bulanStr = String(d.getMonth() + 1).padStart(2, '0');
    const tahunStr = String(d.getFullYear());

    if (editId) {
      const updated: JournalRecord = {
        id: editId,
        tanggal,
        jamKe,
        kelas,
        mataPelajaran,
        bab,
        materi,
        kegiatan,
        refleksi,
        guruId: user.id,
        guruNama: user.nama,
        bulan: bulanStr,
        semester: settings.activeSemester,
        tahun: tahunStr
      };
      storage.updateJournal(updated);
      setAlertSuccess('Jurnal mengajar berhasil diperbarui');
    } else {
      const newJournal: JournalRecord = {
        id: `jrn_${Date.now()}`,
        tanggal,
        jamKe,
        kelas,
        mataPelajaran,
        bab,
        materi,
        kegiatan,
        refleksi,
        guruId: user.id,
        guruNama: user.nama,
        bulan: bulanStr,
        semester: settings.activeSemester,
        tahun: tahunStr
      };
      storage.addJournal(newJournal);
      setAlertSuccess('Jurnal mengajar berhasil ditambahkan');
    }

    setShowModal(false);
    loadJournals();
    setTimeout(() => setAlertSuccess(''), 3000);
  };

  // Filtered by month
  const filteredJournals = journals.filter(j => {
    if (filterMonth === 'semua') return true;
    return j.bulan === filterMonth;
  });

  // Export to Excel
  const handleExportExcel = () => {
    const data = filteredJournals.map((j, idx) => ({
      'No': idx + 1,
      'Tanggal': j.tanggal,
      'Jam Ke': j.jamKe,
      'Kelas': j.kelas,
      'Mata Pelajaran': j.mataPelajaran,
      'Bab': j.bab,
      'Materi Pembelajaran': j.materi,
      'Kegiatan Pembelajaran': j.kegiatan,
      'Refleksi / Catatan': j.refleksi,
      'Nama Guru': j.guruNama
    }));

    downloadExcel(data, `Jurnal_Mengajar_${user.nama.replace(/\s+/g, '_')}_Bulan_${filterMonth}`);
  };

  const months = [
    { val: 'semua', label: 'Semua Bulan' },
    { val: '07', label: 'Juli' },
    { val: '08', label: 'Agustus' },
    { val: '09', label: 'September' },
    { val: '10', label: 'Oktober' },
    { val: '11', label: 'November' },
    { val: '12', label: 'Desember' },
    { val: '01', label: 'Januari' },
    { val: '02', label: 'Februari' },
    { val: '03', label: 'Maret' },
    { val: '04', label: 'April' },
    { val: '05', label: 'Mei' },
    { val: '06', label: 'Juni' }
  ];

  return (
    <div className="space-y-5">
      {/* Top Header & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Month Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Filter Bulan
            </label>
            <select
              id="select-jurnal-bulan"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {months.map(m => (
                <option key={m.val} value={m.val}>{m.label}</option>
              ))}
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
            <span>Tambah Jurnal</span>
          </button>
        </div>
      </div>

      {alertSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{alertSuccess}</span>
        </div>
      )}

      {/* Journal Cards List */}
      <div className="space-y-3">
        {filteredJournals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            Belum ada catatan jurnal mengajar pada periode ini. Klik <strong>Tambah Jurnal</strong> untuk membuat catatan pembelajaran baru.
          </div>
        ) : (
          filteredJournals.map(j => (
            <div key={j.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs">
                    {j.kelas}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs">
                    {j.mataPelajaran}
                  </span>
                  {j.bab && (
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs">
                      {j.bab}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {j.tanggal} (Jam {j.jamKe})
                  </span>
                  <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                    <button
                      onClick={() => handleOpenEdit(j)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(j.id)}
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
                  <span className="font-bold text-slate-800 block mb-0.5">Materi Pembelajaran:</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {j.materi}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block mb-0.5">Kegiatan Belajar Mengajar:</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {j.kegiatan}
                  </p>
                </div>
                {j.refleksi && (
                  <div>
                    <span className="font-bold text-slate-800 block mb-0.5">Refleksi / Hasil Capaian:</span>
                    <p className="text-slate-600 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50 leading-relaxed">
                      "{j.refleksi}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add/Edit Journal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-blue-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>{editId ? 'Edit Jurnal Mengajar' : 'Catat Jurnal Mengajar Baru'}</span>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Ke-</label>
                  <input
                    type="text"
                    value={jamKe}
                    onChange={(e) => setJamKe(e.target.value)}
                    placeholder="Contoh: 1 - 3"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={mataPelajaran}
                    onChange={(e) => setMataPelajaran(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bab / Topik</label>
                <input
                  type="text"
                  value={bab}
                  onChange={(e) => setBab(e.target.value)}
                  placeholder="Contoh: Bab 2 Bilangan Pecahan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Materi Pokok</label>
                <textarea
                  rows={2}
                  value={materi}
                  onChange={(e) => setMateri(e.target.value)}
                  placeholder="Ringkasan materi pokok yang disampaikan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kegiatan Pembelajaran</label>
                <textarea
                  rows={3}
                  value={kegiatan}
                  onChange={(e) => setKegiatan(e.target.value)}
                  placeholder="Uraian ringkas kegiatan awal, inti, dan penutup pembelajaran..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Refleksi / Catatan Guru</label>
                <textarea
                  rows={2}
                  value={refleksi}
                  onChange={(e) => setRefleksi(e.target.value)}
                  placeholder="Evaluasi proses, siswa yang butuh bimbingan, atau tindak lanjut pertemuan berikutnya..."
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
                  Simpan Jurnal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
