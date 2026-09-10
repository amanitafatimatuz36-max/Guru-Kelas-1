import { User, Student, SchoolSettings, AttendanceRecord, GradeRecord, JournalRecord, CounselingRecord } from '../types';

export const defaultSettings: SchoolSettings = {
  schoolName: 'SD NEGERI KRATON 2',
  npsn: '20534211',
  address: 'Jl. Raya Kraton No. 42, Kraton',
  schoolAddress: 'Jl. Raya Kraton No. 42, Kecamatan Kraton, Kabupaten Pasuruan 67151',
  schoolLogoUrl: '/icon.svg',
  cityLogoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&auto=format&fit=crop&q=60',
  signatureCity: 'Kraton',
  signaturePosition: 'right',
  headmasterName: 'Drs. H. Mulyadi, M.Pd.',
  headmasterNip: '196812151993031008',
  headmasterSignatureUrl: '',
  academicYear: '2024/2025',
  activeSemester: '1',
  governmentHeader: 'PEMERINTAH KABUPATEN PASURUAN',
  educationDepartment: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
  schoolEmail: 'sdnkraton2@pasuruankab.go.id',
  schoolPhone: '(0343) 421589'
};

export const defaultUsers: User[] = [
  {
    id: 'user-admin',
    username: 'admin',
    nama: 'Administrator SD Negeri Kraton 2',
    nip: '197904212006041011',
    role: 'admin',
    tanggungJawab: 'Admin Sistem',
    password: 'admin123',
    signatureUrl: '',
    createdAt: '2024-07-01'
  },
  {
    id: 'user-guru-1',
    username: 'guru1',
    nama: 'Siti Rahayu, S.Pd.',
    nip: '198503142010012015',
    role: 'guru',
    tanggungJawab: 'Kelas 1',
    password: 'sdnsuratmajan2',
    signatureUrl: '',
    createdAt: '2024-07-01'
  },
  {
    id: 'user-guru-2',
    username: 'guru2',
    nama: 'Budi Santoso, S.Pd.',
    nip: '198705202011011009',
    role: 'guru',
    tanggungJawab: 'Kelas 2',
    password: 'sdnsuratmajan2',
    signatureUrl: '',
    createdAt: '2024-07-01'
  },
  {
    id: 'user-guru-3',
    username: 'guru3',
    nama: 'Dewi Lestari, S.Pd.',
    nip: '199002182015022003',
    role: 'guru',
    tanggungJawab: 'Kelas 3',
    password: 'sdnsuratmajan2',
    signatureUrl: '',
    createdAt: '2024-07-01'
  },
  {
    id: 'user-guru-4',
    username: 'guru4',
    nama: 'Ahmad Fauzi, S.Pd.',
    nip: '198411052009031004',
    role: 'guru',
    tanggungJawab: 'Kelas 4',
    password: 'sdnsuratmajan2',
    signatureUrl: '',
    createdAt: '2024-07-01'
  },
  {
    id: 'user-guru-5',
    username: 'guru5',
    nama: 'Sri Wahyuni, S.Pd.',
    nip: '198908122014022002',
    role: 'guru',
    tanggungJawab: 'Kelas 5',
    password: 'sdnsuratmajan2',
    signatureUrl: '',
    createdAt: '2024-07-01'
  },
  {
    id: 'user-guru-6',
    username: 'guru6',
    nama: 'Hendra Wijaya, S.Pd.',
    nip: '198207192008011007',
    role: 'guru',
    tanggungJawab: 'Kelas 6',
    password: 'sdnsuratmajan2',
    signatureUrl: '',
    createdAt: '2024-07-01'
  },
  {
    id: 'user-guru-pai',
    username: 'gurupai',
    nama: 'Ust. Muhammad Ridwan, S.Pd.I',
    nip: '198604102012021003',
    role: 'guru',
    tanggungJawab: 'Pendidikan Agama Islam',
    password: 'sdnsuratmajan2',
    signatureUrl: '',
    createdAt: '2024-07-01'
  },
  {
    id: 'user-guru-pjok',
    username: 'gurupjok',
    nama: 'Bambang Pratama, S.Pd.',
    nip: '199106252016031005',
    role: 'guru',
    tanggungJawab: 'PJOK',
    password: 'sdnsuratmajan2',
    signatureUrl: '',
    createdAt: '2024-07-01'
  }
];

export const defaultStudents: Student[] = [
  // Kelas 1
  { id: 'std-101', nama: 'Aditya Pratama', nis: '240101', nisn: '0148729101', kelas: 'Kelas 1', jenisKelamin: 'L', createdAt: '2024-07-15' },
  { id: 'std-102', nama: 'Aisyah Putri Azzahra', nis: '240102', nisn: '0148729102', kelas: 'Kelas 1', jenisKelamin: 'P', createdAt: '2024-07-15' },
  { id: 'std-103', nama: 'Alif Kurniawan', nis: '240103', nisn: '0148729103', kelas: 'Kelas 1', jenisKelamin: 'L', createdAt: '2024-07-15' },
  { id: 'std-104', nama: 'Aqila Dania', nis: '240104', nisn: '0148729104', kelas: 'Kelas 1', jenisKelamin: 'P', createdAt: '2024-07-15' },
  { id: 'std-105', nama: 'Bagas Prasetyo', nis: '240105', nisn: '0148729105', kelas: 'Kelas 1', jenisKelamin: 'L', createdAt: '2024-07-15' },

  // Kelas 2
  { id: 'std-201', nama: 'Bilal Arkan', nis: '230201', nisn: '0138729201', kelas: 'Kelas 2', jenisKelamin: 'L', createdAt: '2023-07-15' },
  { id: 'std-202', nama: 'Cantika Dewi', nis: '230202', nisn: '0138729202', kelas: 'Kelas 2', jenisKelamin: 'P', createdAt: '2023-07-15' },
  { id: 'std-203', nama: 'Dimas Anggara', nis: '230203', nisn: '0138729203', kelas: 'Kelas 2', jenisKelamin: 'L', createdAt: '2023-07-15' },
  { id: 'std-204', nama: 'Eka Nur Fadilah', nis: '230204', nisn: '0138729204', kelas: 'Kelas 2', jenisKelamin: 'P', createdAt: '2023-07-15' },

  // Kelas 3
  { id: 'std-301', nama: 'Fajar Nugraha', nis: '220301', nisn: '0128729301', kelas: 'Kelas 3', jenisKelamin: 'L', createdAt: '2022-07-15' },
  { id: 'std-302', nama: 'Gita Permata', nis: '220302', nisn: '0128729302', kelas: 'Kelas 3', jenisKelamin: 'P', createdAt: '2022-07-15' },
  { id: 'std-303', nama: 'Hafiz Maulana', nis: '220303', nisn: '0128729303', kelas: 'Kelas 3', jenisKelamin: 'L', createdAt: '2022-07-15' },
  { id: 'std-304', nama: 'Indah Cahyani', nis: '220304', nisn: '0128729304', kelas: 'Kelas 3', jenisKelamin: 'P', createdAt: '2022-07-15' },

  // Kelas 4
  { id: 'std-401', nama: 'Jovan Sebastian', nis: '210401', nisn: '0118729401', kelas: 'Kelas 4', jenisKelamin: 'L', createdAt: '2021-07-15' },
  { id: 'std-402', nama: 'Khansa Naura', nis: '210402', nisn: '0118729402', kelas: 'Kelas 4', jenisKelamin: 'P', createdAt: '2021-07-15' },
  { id: 'std-403', nama: 'Lukman Hakim', nis: '210403', nisn: '0118729403', kelas: 'Kelas 4', jenisKelamin: 'L', createdAt: '2021-07-15' },
  { id: 'std-404', nama: 'Maya Safitri', nis: '210404', nisn: '0118729404', kelas: 'Kelas 4', jenisKelamin: 'P', createdAt: '2021-07-15' },

  // Kelas 5
  { id: 'std-501', nama: 'Nabil Ramadhan', nis: '200501', nisn: '0108729501', kelas: 'Kelas 5', jenisKelamin: 'L', createdAt: '2020-07-15' },
  { id: 'std-502', nama: 'Olivia Kirana', nis: '200502', nisn: '0108729502', kelas: 'Kelas 5', jenisKelamin: 'P', createdAt: '2020-07-15' },
  { id: 'std-503', nama: 'Panji Satrio', nis: '200503', nisn: '0108729503', kelas: 'Kelas 5', jenisKelamin: 'L', createdAt: '2020-07-15' },
  { id: 'std-504', nama: 'Qori Annisa', nis: '200504', nisn: '0108729504', kelas: 'Kelas 5', jenisKelamin: 'P', createdAt: '2020-07-15' },

  // Kelas 6
  { id: 'std-601', nama: 'Rian Hidayat', nis: '190601', nisn: '0098729601', kelas: 'Kelas 6', jenisKelamin: 'L', createdAt: '2019-07-15' },
  { id: 'std-602', nama: 'Salma Zahra', nis: '190602', nisn: '0098729602', kelas: 'Kelas 6', jenisKelamin: 'P', createdAt: '2019-07-15' },
  { id: 'std-603', nama: 'Tegar Wibowo', nis: '190603', nisn: '0098729603', kelas: 'Kelas 6', jenisKelamin: 'L', createdAt: '2019-07-15' },
  { id: 'std-604', nama: 'Zaskia Aurelia', nis: '190604', nisn: '0098729604', kelas: 'Kelas 6', jenisKelamin: 'P', createdAt: '2019-07-15' }
];

export const defaultAttendances: AttendanceRecord[] = [
  { id: 'att-1', studentId: 'std-101', studentName: 'Aditya Pratama', kelas: 'Kelas 1', tanggal: '2024-09-02', status: 'H', semester: '1', bulan: '09', tahun: '2024', guruId: 'user-guru-1' },
  { id: 'att-2', studentId: 'std-102', studentName: 'Aisyah Putri Azzahra', kelas: 'Kelas 1', tanggal: '2024-09-02', status: 'H', semester: '1', bulan: '09', tahun: '2024', guruId: 'user-guru-1' },
  { id: 'att-3', studentId: 'std-103', studentName: 'Alif Kurniawan', kelas: 'Kelas 1', tanggal: '2024-09-02', status: 'S', catatan: 'Flu dan demam', semester: '1', bulan: '09', tahun: '2024', guruId: 'user-guru-1' },
  { id: 'att-4', studentId: 'std-104', studentName: 'Aqila Dania', kelas: 'Kelas 1', tanggal: '2024-09-02', status: 'H', semester: '1', bulan: '09', tahun: '2024', guruId: 'user-guru-1' },
  { id: 'att-5', studentId: 'std-105', studentName: 'Bagas Prasetyo', kelas: 'Kelas 1', tanggal: '2024-09-02', status: 'H', semester: '1', bulan: '09', tahun: '2024', guruId: 'user-guru-1' },
  
  { id: 'att-6', studentId: 'std-101', studentName: 'Aditya Pratama', kelas: 'Kelas 1', tanggal: '2024-09-03', status: 'H', semester: '1', bulan: '09', tahun: '2024', guruId: 'user-guru-1' },
  { id: 'att-7', studentId: 'std-102', studentName: 'Aisyah Putri Azzahra', kelas: 'Kelas 1', tanggal: '2024-09-03', status: 'I', catatan: 'Acara keluarga', semester: '1', bulan: '09', tahun: '2024', guruId: 'user-guru-1' },
  { id: 'att-8', studentId: 'std-103', studentName: 'Alif Kurniawan', kelas: 'Kelas 1', tanggal: '2024-09-03', status: 'H', semester: '1', bulan: '09', tahun: '2024', guruId: 'user-guru-1' },
  { id: 'att-9', studentId: 'std-104', studentName: 'Aqila Dania', kelas: 'Kelas 1', tanggal: '2024-09-03', status: 'H', semester: '1', bulan: '09', tahun: '2024', guruId: 'user-guru-1' },
  { id: 'att-10', studentId: 'std-105', studentName: 'Bagas Prasetyo', kelas: 'Kelas 1', tanggal: '2024-09-03', status: 'H', semester: '1', bulan: '09', tahun: '2024', guruId: 'user-guru-1' }
];

export const defaultGrades: GradeRecord[] = [
  { id: 'grd-1', studentId: 'std-101', studentName: 'Aditya Pratama', kelas: 'Kelas 1', mataPelajaran: 'Matematika', bab: 'Bab 1 Bilangan 1-10', penilaianKe: 1, judulPenilaian: 'PH 1 Mengenal Angka', nilai: 88, semester: '1', tahun: '2024', guruId: 'user-guru-1', updatedAt: '2024-08-10' },
  { id: 'grd-2', studentId: 'std-101', studentName: 'Aditya Pratama', kelas: 'Kelas 1', mataPelajaran: 'Matematika', bab: 'Bab 1 Bilangan 1-10', penilaianKe: 2, judulPenilaian: 'PH 2 Menghitung Benda', nilai: 92, semester: '1', tahun: '2024', guruId: 'user-guru-1', updatedAt: '2024-08-20' },
  { id: 'grd-3', studentId: 'std-102', studentName: 'Aisyah Putri Azzahra', kelas: 'Kelas 1', mataPelajaran: 'Matematika', bab: 'Bab 1 Bilangan 1-10', penilaianKe: 1, judulPenilaian: 'PH 1 Mengenal Angka', nilai: 95, semester: '1', tahun: '2024', guruId: 'user-guru-1', updatedAt: '2024-08-10' },
  { id: 'grd-4', studentId: 'std-102', studentName: 'Aisyah Putri Azzahra', kelas: 'Kelas 1', mataPelajaran: 'Matematika', bab: 'Bab 1 Bilangan 1-10', penilaianKe: 2, judulPenilaian: 'PH 2 Menghitung Benda', nilai: 90, semester: '1', tahun: '2024', guruId: 'user-guru-1', updatedAt: '2024-08-20' },
  { id: 'grd-5', studentId: 'std-103', studentName: 'Alif Kurniawan', kelas: 'Kelas 1', mataPelajaran: 'Matematika', bab: 'Bab 1 Bilangan 1-10', penilaianKe: 1, judulPenilaian: 'PH 1 Mengenal Angka', nilai: 80, semester: '1', tahun: '2024', guruId: 'user-guru-1', updatedAt: '2024-08-10' },
  { id: 'grd-6', studentId: 'std-103', studentName: 'Alif Kurniawan', kelas: 'Kelas 1', mataPelajaran: 'Matematika', bab: 'Bab 1 Bilangan 1-10', penilaianKe: 2, judulPenilaian: 'PH 2 Menghitung Benda', nilai: 85, semester: '1', tahun: '2024', guruId: 'user-guru-1', updatedAt: '2024-08-20' }
];

export const defaultJournals: JournalRecord[] = [
  {
    id: 'jrn-1',
    tanggal: '2024-09-02',
    jamKe: '1 - 3',
    kelas: 'Kelas 1',
    mataPelajaran: 'Bahasa Indonesia',
    bab: 'Bab 2 Aku dan Temanku',
    materi: 'Mengenal huruf vokal dan konsonan dalam nama sendiri',
    kegiatan: 'Siswa menuliskan nama panggilan menggunakan kartu huruf dan memperkenalkan diri di depan kelas.',
    refleksi: 'Sebagian besar siswa antusias dan sudah mampu menyusun huruf dengan urutan yang benar.',
    guruId: 'user-guru-1',
    guruNama: 'Siti Rahayu, S.Pd.',
    bulan: '09',
    semester: '1',
    tahun: '2024'
  },
  {
    id: 'jrn-2',
    tanggal: '2024-09-03',
    jamKe: '1 - 2',
    kelas: 'Kelas 1',
    mataPelajaran: 'Matematika',
    bab: 'Bab 1 Bilangan 1-10',
    materi: 'Membilang benda secara konkrit',
    kegiatan: 'Menggunakan kelereng dan balok warna untuk menghitung kuantitas benda 1 sampai 10.',
    refleksi: 'Siswa memahami konsep bilangan dengan bantuan benda konkret.',
    guruId: 'user-guru-1',
    guruNama: 'Siti Rahayu, S.Pd.',
    bulan: '09',
    semester: '1',
    tahun: '2024'
  }
];

export const defaultCounselings: CounselingRecord[] = [
  {
    id: 'cns-1',
    tanggal: '2024-09-04',
    studentId: 'std-103',
    studentName: 'Alif Kurniawan',
    kelas: 'Kelas 1',
    kategori: 'Kedisiplinan',
    permasalahan: 'Siswa sering terlihat mengantuk di kelas pada jam pelajaran pagi dan kurang fokus saat mendengarkan penjelasan.',
    penanganan: 'Melakukan pendekatan persuasif, mengajak dialog santai, serta mengatur posisi duduk di baris depan.',
    tindakLanjut: 'Memanggil orang tua untuk berdiskusi tentang jam tidur anak di rumah.',
    hasil: 'Orang tua menyepakati pembatasan gawai pada malam hari dan jam tidur anak maksimal pukul 20.30 WIB.',
    semester: '1',
    tahun: '2024',
    guruId: 'user-guru-1',
    guruNama: 'Siti Rahayu, S.Pd.'
  }
];
