export type UserRole = 'admin' | 'guru';

export type TanggungJawabType = 
  | 'Kelas 1' 
  | 'Kelas 2' 
  | 'Kelas 3' 
  | 'Kelas 4' 
  | 'Kelas 5' 
  | 'Kelas 6' 
  | 'Pendidikan Agama Islam' 
  | 'PJOK'
  | 'Admin Sistem';

export interface User {
  id: string;
  username: string;
  nama: string;
  nip: string;
  role: UserRole;
  tanggungJawab: TanggungJawabType;
  signatureUrl?: string;
  password?: string;
  createdAt?: string;
}

export interface SchoolSettings {
  schoolName: string;
  npsn?: string;
  address?: string;
  schoolAddress?: string;
  schoolLogoUrl: string;
  cityLogoUrl: string;
  signatureCity?: string;
  signaturePosition: 'left' | 'right';
  headmasterName: string;
  headmasterNip: string;
  headmasterSignatureUrl: string;
  academicYear: string;
  activeSemester: '1' | '2';
  governmentHeader?: string;
  educationDepartment?: string;
  schoolEmail?: string;
  schoolPhone?: string;
  firebaseConfig?: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
}

export interface Student {
  id: string;
  nama: string;
  nis: string;
  nisn?: string;
  kelas: string;
  jenisKelamin: 'L' | 'P';
  createdAt?: string;
}

export type AttendanceStatus = 'H' | 'S' | 'I' | 'A';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  kelas: string;
  tanggal: string; // YYYY-MM-DD
  status: AttendanceStatus;
  catatan?: string;
  semester: '1' | '2';
  bulan: string; // '01' .. '12'
  tahun: string;
  guruId: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  kelas: string;
  mataPelajaran: string;
  bab: string; // e.g. "Bab 1: Bilangan Cacah"
  penilaianKe: number; // e.g. 1, 2, 3
  judulPenilaian: string;
  nilai: number;
  semester: '1' | '2';
  tahun: string;
  guruId: string;
  updatedAt: string;
}

export interface JournalRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  jamKe: string;
  kelas: string;
  mataPelajaran: string;
  bab: string;
  materi: string;
  kegiatan: string;
  refleksi: string;
  guruId: string;
  guruNama: string;
  bulan: string;
  semester: '1' | '2';
  tahun: string;
}

export interface CounselingRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  studentId: string;
  studentName: string;
  kelas: string;
  permasalahan: string;
  penanganan: string;
  tindakLanjut: string;
  kategori: 'Akademik' | 'Perilaku' | 'Sosial' | 'Kedisiplinan';
  hasil?: string;
  semester: '1' | '2';
  tahun: string;
  guruId: string;
  guruNama?: string;
}

export type ActiveMenu = 
  | 'dashboard' 
  | 'absen' 
  | 'nilai' 
  | 'jurnal' 
  | 'bimbingan' 
  | 'siswa' 
  | 'guru' 
  | 'cetak' 
  | 'pengaturan';
