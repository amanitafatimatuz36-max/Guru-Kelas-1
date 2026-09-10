import React, { useState, useEffect, useRef } from 'react';
import { User, SchoolSettings, TanggungJawabType } from '../types';
import { storage } from '../services/storage';
import { downloadExcel, downloadCSVTemplate } from '../utils/excelExport';
import { 
  UserCog, 
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
  ShieldAlert
} from 'lucide-react';

interface DataGuruProps {
  currentUser: User;
  settings: SchoolSettings;
}

export const DataGuru: React.FC<DataGuruProps> = ({ currentUser, settings }) => {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form states
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [username, setUsername] = useState('');
  const [tanggungJawab, setTanggungJawab] = useState<TanggungJawabType>('Kelas 1');
  const [password, setPassword] = useState('sdnsuratmajan2');

  // CSV massal
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvPreview, setCsvPreview] = useState<User[]>([]);
  const [csvCount, setCsvCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2-step delete all
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [alertSuccess, setAlertSuccess] = useState('');

  const loadTeachers = () => {
    const list = storage.getUsers().filter(u => u.role === 'guru');
    setTeachers(list);
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setNama('');
    setNip('');
    setUsername('');
    setTanggungJawab('Kelas 1');
    setPassword('sdnsuratmajan2');
    setShowModal(true);
  };

  const handleOpenEdit = (guru: User) => {
    setEditId(guru.id);
    setNama(guru.nama);
    setNip(guru.nip);
    setUsername(guru.username);
    setTanggungJawab(guru.tanggungJawab);
    setPassword(guru.password || 'sdnsuratmajan2');
    setShowModal(true);
  };

  const handleDelete = (id: string, guruName: string) => {
    if (window.confirm(`Hapus akun guru "${guruName}"?`)) {
      storage.deleteUser(id);
      loadTeachers();
      setAlertSuccess(`Guru ${guruName} berhasil dihapus`);
      setTimeout(() => setAlertSuccess(''), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !username.trim()) {
      alert('Nama guru dan username wajib diisi.');
      return;
    }

    if (editId) {
      const existing = teachers.find(t => t.id === editId);
      const updated: User = {
        id: editId,
        username: username.trim().toLowerCase(),
        nama: nama.trim(),
        nip: nip.trim(),
        role: 'guru',
        tanggungJawab,
        password: password.trim() || 'sdnsuratmajan2',
        signatureUrl: existing?.signatureUrl
      };
      storage.updateUser(updated);
      setAlertSuccess(`Akun ${updated.nama} berhasil diperbarui`);
    } else {
      const newUser: User = {
        id: `guru_${Date.now()}`,
        username: username.trim().toLowerCase(),
        nama: nama.trim(),
        nip: nip.trim(),
        role: 'guru',
        tanggungJawab,
        password: password.trim() || 'sdnsuratmajan2'
      };
      storage.addUser(newUser);
      setAlertSuccess(`Guru ${newUser.nama} berhasil ditambahkan`);
    }

    setShowModal(false);
    loadTeachers();
    setTimeout(() => setAlertSuccess(''), 3000);
  };

  // CSV file parser for teachers
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        alert('File CSV kosong.');
        return;
      }

      // format: username,nama,nip,tanggungJawab,password
      const parsed: User[] = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
        if (row[0] && row[1]) {
          parsed.push({
            id: `guru_csv_${Date.now()}_${i}`,
            username: row[0].toLowerCase(),
            nama: row[1],
            nip: row[2] || '',
            tanggungJawab: (row[3] as TanggungJawabType) || 'Kelas 1',
            role: 'guru',
            password: row[4] || 'sdnsuratmajan2'
          });
        }
      }

      setCsvPreview(parsed);
      setCsvCount(parsed.length);
    };

    reader.readAsText(file);
  };

  const handleApplyCSV = () => {
    if (csvPreview.length === 0) return;
    const currentUsers = storage.getUsers();
    storage.saveUsers([...currentUsers, ...csvPreview]);
    loadTeachers();
    setShowCSVModal(false);
    setCsvPreview([]);
    setCsvCount(null);
    setAlertSuccess(`Berhasil mengimpor ${csvPreview.length} guru baru!`);
    setTimeout(() => setAlertSuccess(''), 3000);
  };

  const handleDeleteAllTeachers = () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'HAPUS SEMUA GURU') {
      alert('Teks konfirmasi salah. Ketik: HAPUS SEMUA GURU');
      return;
    }
    storage.deleteAllTeachers();
    loadTeachers();
    setShowDeleteAllConfirm(false);
    setDeleteConfirmText('');
    setAlertSuccess('Semua akun guru berhasil dihapus.');
    setTimeout(() => setAlertSuccess(''), 3000);
  };

  const filteredTeachers = teachers.filter(t => 
    t.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.nip.includes(searchQuery) ||
    t.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportExcel = () => {
    const data = filteredTeachers.map((t, idx) => ({
      'No': idx + 1,
      'Nama Guru': t.nama,
      'NIP': t.nip,
      'Username': t.username,
      'Tanggung Jawab': t.tanggungJawab,
      'Password Bawaan': t.password || 'sdnsuratmajan2'
    }));
    downloadExcel(data, `Data_Guru_SDN_Kraton_2`);
  };

  const responsibilities: TanggungJawabType[] = [
    'Kelas 1',
    'Kelas 2',
    'Kelas 3',
    'Kelas 4',
    'Kelas 5',
    'Kelas 6',
    'Pendidikan Agama Islam',
    'PJOK'
  ];

  return (
    <div className="space-y-5">
      {/* Top Header & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari guru berdasarkan nama / NIP..."
              className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
            />
          </div>
        </div>

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
            <span>Tambah Guru</span>
          </button>

          <button
            onClick={() => setShowDeleteAllConfirm(true)}
            type="button"
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            title="Hapus semua akun guru dengan 2-step verifikasi"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Semua Guru</span>
          </button>
        </div>
      </div>

      {alertSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{alertSuccess}</span>
        </div>
      )}

      {/* Teachers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Daftar Guru Pengampu SD Negeri Kraton 2 ({filteredTeachers.length} Guru)
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            Password Bawaan: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">sdnsuratmajan2</code>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Lengkap & Gelar</th>
                <th className="py-3 px-4 w-40">NIP</th>
                <th className="py-3 px-4 w-32">Username</th>
                <th className="py-3 px-4 w-48">Tugas / Tanggung Jawab</th>
                <th className="py-3 px-4 w-28 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.map((guru, idx) => (
                <tr key={guru.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 text-center text-slate-500 font-medium">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{guru.nama}</td>
                  <td className="py-3 px-4 text-slate-600 font-mono">{guru.nip || '-'}</td>
                  <td className="py-3 px-4 font-mono text-blue-700 font-semibold">{guru.username}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-100">
                      {guru.tanggungJawab}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(guru)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Guru"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(guru.id, guru.nama)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                        title="Hapus Guru"
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
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-blue-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <UserCog className="w-4 h-4 text-amber-300" />
                <span>{editId ? 'Edit Akun Guru' : 'Tambah Guru Baru'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Siti Aisyah, S.Pd."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIP (Nomor Induk)</label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Contoh: 19850314..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username Login</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: guru1 / sitiaisyah"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tugas / Tanggung Jawab</label>
                <select
                  value={tanggungJawab}
                  onChange={(e) => setTanggungJawab(e.target.value as TanggungJawabType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {responsibilities.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Catatan: Guru Agama dan PJOK otomatis memiliki hak akses ke seluruh kelas (Kelas 1 - Kelas 6).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (bawaan: sdnsuratmajan2)"
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
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mass CSV Upload for Teachers */}
      {showCSVModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-indigo-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-300" />
                <span>Upload Massal Guru via File CSV</span>
              </h3>
              <button onClick={() => setShowCSVModal(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1.5">
                <p className="font-bold">Format Kolom File CSV:</p>
                <p className="font-mono text-[11px] bg-white p-1.5 rounded border border-blue-200 text-blue-800">
                  username,nama,nip,tanggungJawab,password
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => downloadCSVTemplate('guru')}
                    className="inline-flex items-center gap-1 font-bold text-blue-700 underline text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Template CSV Guru
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih File CSV dari Perangkat:
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,text/csv"
                  onChange={handleCSVUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              {csvCount !== null && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                  <p className="font-bold">Ditemukan {csvCount} guru valid!</p>
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
                  disabled={!csvCount || csvCount === 0}
                  onClick={handleApplyCSV}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition shadow-xs"
                >
                  Terapkan Impor ({csvCount || 0} Guru)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2-step confirmation modal for deleting all teachers */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-300" />
                <span>Konfirmasi Hapus Semua Akun Guru</span>
              </h3>
              <button onClick={() => setShowDeleteAllConfirm(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <p className="text-xs text-rose-900 font-semibold leading-relaxed">
                Tindakan ini akan menghapus <strong>SELURUH</strong> akun guru. Akun administrator utama akan tetap aman.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ketik <span className="font-mono text-rose-600">HAPUS SEMUA GURU</span> untuk melanjutkan:
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
                  onClick={handleDeleteAllTeachers}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs"
                >
                  Ya, Hapus Semua Guru
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
