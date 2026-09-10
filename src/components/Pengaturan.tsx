import React, { useState, useEffect } from 'react';
import { User, SchoolSettings } from '../types';
import { storage } from '../services/storage';
import { testFirestoreConnection, syncLocalToFirestore } from '../services/firebase';
import { 
  Settings, 
  School, 
  Image, 
  PenTool, 
  Database, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  KeyRound,
  Lock,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface PengaturanProps {
  currentUser: User;
  settings: SchoolSettings;
  onSettingsUpdate: (settings: SchoolSettings) => void;
  onUserUpdate: (user: User) => void;
}

export const Pengaturan: React.FC<PengaturanProps> = ({
  currentUser,
  settings,
  onSettingsUpdate,
  onUserUpdate
}) => {
  // Admin form state
  const [formData, setFormData] = useState<SchoolSettings>(settings);
  const [firebaseStatus, setFirebaseStatus] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncingData, setSyncingData] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Guru profile state
  const [guruNama, setGuruNama] = useState(currentUser.nama);
  const [guruNip, setGuruNip] = useState(currentUser.nip || '');
  const [guruSignatureUrl, setGuruSignatureUrl] = useState(currentUser.signatureUrl || '');
  const [guruPassword, setGuruPassword] = useState(currentUser.password || '');

  // 2-Step Wipe for Teacher Data
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeConfirmInput, setWipeConfirmInput] = useState('');

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSettings(formData);
    onSettingsUpdate(formData);
    setAlertMsg({ type: 'success', text: 'Pengaturan sekolah dan kop surat berhasil disimpan!' });
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleGuruProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = {
      ...currentUser,
      nama: guruNama.trim(),
      nip: guruNip.trim(),
      signatureUrl: guruSignatureUrl.trim() || undefined,
      password: guruPassword.trim() || 'sdnsuratmajan2'
    };

    storage.updateUser(updatedUser);
    onUserUpdate(updatedUser);
    setAlertMsg({ type: 'success', text: 'Profil dan tanda tangan guru berhasil diperbarui!' });
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleTestFirebase = async () => {
    setTestingConnection(true);
    setFirebaseStatus('Sedang menguji koneksi ke Firestore...');
    const res = await testFirestoreConnection();
    setTestingConnection(false);
    setFirebaseStatus(res.message);
  };

  const handleSyncFirebase = async () => {
    setSyncingData(true);
    const res = await syncLocalToFirestore();
    setSyncingData(false);
    if (res.success) {
      setAlertMsg({ type: 'success', text: `Berhasil sinkronisasi ${res.count} dokumen ke Firebase Firestore!` });
    } else {
      setAlertMsg({ type: 'error', text: `Sinkronisasi gagal: ${res.error}` });
    }
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleTeacherWipeData = () => {
    if (wipeConfirmInput.trim().toUpperCase() !== 'HAPUS DATA KELAS') {
      alert('Teks konfirmasi tidak cocok. Ketik: HAPUS DATA KELAS');
      return;
    }

    storage.wipeTeacherData(currentUser.id, currentUser.tanggungJawab);
    setShowWipeModal(false);
    setWipeConfirmInput('');
    setAlertMsg({ type: 'success', text: `Seluruh data tersimpan untuk ${currentUser.tanggungJawab} berhasil dibersihkan.` });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {alertMsg && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
          alertMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          {alertMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Profile & Signature for GURU */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <PenTool className="w-5 h-5 text-blue-700" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Pengaturan Profil & Tanda Tangan Digital ({currentUser.nama})
            </h2>
            <p className="text-xs text-slate-500">
              Atur tanda tangan yang akan otomatis tersemat di lembar cetak dokumen Anda
            </p>
          </div>
        </div>

        <form onSubmit={handleGuruProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap Guru (dengan Gelar)
              </label>
              <input
                type="text"
                value={guruNama}
                onChange={(e) => setGuruNama(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                NIP Guru
              </label>
              <input
                type="text"
                value={guruNip}
                onChange={(e) => setGuruNip(e.target.value)}
                placeholder="Contoh: 198503142010012015"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                URL Gambar Tanda Tangan Guru
              </label>
              <input
                type="url"
                value={guruSignatureUrl}
                onChange={(e) => setGuruSignatureUrl(e.target.value)}
                placeholder="https://example.com/ttd-guru.png"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Gunakan URL gambar PNG transparan. Kosongkan jika ingin tanda tangan basah (manual).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pratinjau Tanda Tangan Guru:
              </label>
              <div className="h-20 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center p-2">
                {guruSignatureUrl ? (
                  <img
                    src={guruSignatureUrl}
                    alt="Pratinjau TTD Guru"
                    className="max-h-16 max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-xs text-slate-400 italic">Belum ada URL tanda tangan (Manual)</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi Guru (Default: sdnsuratmajan2)
              </label>
              <input
                type="text"
                value={guruPassword}
                onChange={(e) => setGuruPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Profil & TTD Guru</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Wipe data section for Guru */}
      {currentUser.role === 'guru' && (
        <div className="bg-rose-50/70 p-6 rounded-2xl border border-rose-200 space-y-3">
          <div className="flex items-center gap-2 text-rose-900">
            <Trash2 className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold">Zona Bahaya: Bersihkan Data Tersimpan Guru</h3>
          </div>
          <p className="text-xs text-rose-800 leading-relaxed max-w-2xl">
            Fitur ini akan menghapus seluruh data absensi, penilaian, jurnal, dan bimbingan yang telah diinput untuk kelas binaan Anda (<strong>{currentUser.tanggungJawab}</strong>). Memerlukan konfirmasi 2 langkah demi keamanan.
          </p>
          <button
            type="button"
            onClick={() => setShowWipeModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Hapus Semua Data Tersimpan Kelas Ini</span>
          </button>
        </div>
      )}

      {/* ADMIN EXCLUSIVE CONFIGURATIONS */}
      {currentUser.role === 'admin' && (
        <div className="space-y-6">
          {/* School Letterhead & Principal Settings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <School className="w-5 h-5 text-blue-700" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Konfigurasi Satuan Pendidikan & Kop Surat (Admin)
                </h2>
                <p className="text-xs text-slate-500">
                  Kelola identitas resmi, kop surat, logo, dan tanda tangan Kepala Satuan Pendidikan
                </p>
              </div>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              {/* Logos and Signature URLs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Logo Sekolah
                  </label>
                  <input
                    type="url"
                    value={formData.schoolLogoUrl}
                    onChange={(e) => setFormData({ ...formData, schoolLogoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <div className="mt-2 h-16 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center p-1">
                    <img 
                      src={formData.schoolLogoUrl} 
                      alt="Logo Sekolah" 
                      className="max-h-14 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/icon.svg'; }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Logo Daerah (Kab. Pasuruan)
                  </label>
                  <input
                    type="url"
                    value={formData.cityLogoUrl}
                    onChange={(e) => setFormData({ ...formData, cityLogoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <div className="mt-2 h-16 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center p-1">
                    <img 
                      src={formData.cityLogoUrl} 
                      alt="Logo Daerah" 
                      className="max-h-14 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL Tanda Tangan Kepala Satuan Pendidikan
                  </label>
                  <input
                    type="url"
                    value={formData.headmasterSignatureUrl}
                    onChange={(e) => setFormData({ ...formData, headmasterSignatureUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <div className="mt-2 h-16 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center p-1">
                    {formData.headmasterSignatureUrl ? (
                      <img 
                        src={formData.headmasterSignatureUrl} 
                        alt="TTD Kepala Satuan Pendidikan" 
                        className="max-h-14 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-xs text-slate-400 italic">Manual (Kosong)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Headmaster Data and Position */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Kepala Satuan Pendidikan
                  </label>
                  <input
                    type="text"
                    value={formData.headmasterName}
                    onChange={(e) => setFormData({ ...formData, headmasterName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP Kepala Satuan Pendidikan
                  </label>
                  <input
                    type="text"
                    value={formData.headmasterNip}
                    onChange={(e) => setFormData({ ...formData, headmasterNip: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Posisi Tanda Tangan Kepala Satuan Pendidikan
                  </label>
                  <select
                    value={formData.signaturePosition}
                    onChange={(e) => setFormData({ ...formData, signaturePosition: e.target.value as 'left' | 'right' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="right">Di Sebelah Kanan Lembar Cetak</option>
                    <option value="left">Di Sebelah Kiri Lembar Cetak</option>
                  </select>
                </div>
              </div>

              {/* School Letterhead fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Header Pemerintah Daerah
                  </label>
                  <input
                    type="text"
                    value={formData.governmentHeader}
                    onChange={(e) => setFormData({ ...formData, governmentHeader: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dinas Pendidikan
                  </label>
                  <input
                    type="text"
                    value={formData.educationDepartment}
                    onChange={(e) => setFormData({ ...formData, educationDepartment: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Satuan Pendidikan
                  </label>
                  <input
                    type="text"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tahun Ajaran
                  </label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="2024/2025"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Semester Aktif
                  </label>
                  <select
                    value={formData.activeSemester}
                    onChange={(e) => setFormData({ ...formData, activeSemester: e.target.value as '1' | '2' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="1">Semester 1 (Ganjil)</option>
                    <option value="2">Semester 2 (Genap)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Lengkap Sekolah
                </label>
                <input
                  type="text"
                  value={formData.schoolAddress}
                  onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Konfigurasi Sekolah</span>
                </button>
              </div>
            </form>
          </div>

          {/* Firebase Firestore Cloud Integration Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-amber-600" />
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Koneksi & Sinkronisasi Firebase Firestore
                  </h2>
                  <p className="text-xs text-slate-500">
                    Sesuai instruksi "Aku akan menyambungkan ke firebase firestore. Pastikan kembali semua fitur terkoneksi dengan database firebase"
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Aplikasi telah dilengkapi dengan <strong>firebase-blueprint.json</strong> dan <strong>firestore.rules</strong> berstandar role-based access control. Anda dapat memasukkan konfigurasi Firebase Web App Anda di bawah ini untuk sinkronisasi data langsung ke cloud.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Firebase Project ID
                  </label>
                  <input
                    type="text"
                    value={formData.firebaseConfig?.projectId || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      firebaseConfig: {
                        ...(formData.firebaseConfig || { apiKey: '', authDomain: '' }),
                        projectId: e.target.value
                      }
                    })}
                    placeholder="Contoh: sdn-kraton2-app"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Firebase API Key
                  </label>
                  <input
                    type="password"
                    value={formData.firebaseConfig?.apiKey || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      firebaseConfig: {
                        ...(formData.firebaseConfig || { projectId: '', authDomain: '' }),
                        apiKey: e.target.value
                      }
                    })}
                    placeholder="AIzaSy..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {firebaseStatus && (
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-800 text-xs flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{firebaseStatus}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestFirebase}
                  disabled={testingConnection}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                  <span>Uji Koneksi Firestore</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncFirebase}
                  disabled={syncingData}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Sinkronisasi Data ke Cloud Firestore</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2-Step Wipe Confirmation Modal for Teachers */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-rose-600 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-300" />
                <span>Konfirmasi Hapus Data Tersimpan</span>
              </h3>
              <button onClick={() => setShowWipeModal(false)} className="text-white/80 hover:text-white p-1">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <p className="text-xs text-rose-900 font-semibold leading-relaxed">
                Anda akan menghapus seluruh data absensi, penilaian, jurnal mengajar, dan bimbingan untuk <strong>{currentUser.tanggungJawab}</strong>.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ketik <span className="font-mono text-rose-600">HAPUS DATA KELAS</span> untuk konfirmasi:
                </label>
                <input
                  type="text"
                  value={wipeConfirmInput}
                  onChange={(e) => setWipeConfirmInput(e.target.value)}
                  placeholder="Ketik teks konfirmasi persis..."
                  className="w-full px-3 py-2 bg-rose-50 border border-rose-300 rounded-xl text-xs font-bold text-rose-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowWipeModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleTeacherWipeData}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs"
                >
                  Ya, Bersihkan Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
