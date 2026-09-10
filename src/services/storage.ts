import { 
  User, 
  Student, 
  SchoolSettings, 
  AttendanceRecord, 
  GradeRecord, 
  JournalRecord, 
  CounselingRecord,
  TanggungJawabType
} from '../types';
import { 
  defaultSettings, 
  defaultUsers, 
  defaultStudents, 
  defaultAttendances, 
  defaultGrades, 
  defaultJournals, 
  defaultCounselings 
} from './seedData';

const STORAGE_KEYS = {
  USERS: 'sdn_kraton2_users',
  SETTINGS: 'sdn_kraton2_settings',
  STUDENTS: 'sdn_kraton2_students',
  ATTENDANCES: 'sdn_kraton2_attendances',
  GRADES: 'sdn_kraton2_grades',
  JOURNALS: 'sdn_kraton2_journals',
  COUNSELINGS: 'sdn_kraton2_counselings',
  CURRENT_USER: 'sdn_kraton2_current_user'
};

class StorageService {
  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(defaultStudents));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCES)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCES, JSON.stringify(defaultAttendances));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GRADES)) {
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(defaultGrades));
    }
    if (!localStorage.getItem(STORAGE_KEYS.JOURNALS)) {
      localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(defaultJournals));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COUNSELINGS)) {
      localStorage.setItem(STORAGE_KEYS.COUNSELINGS, JSON.stringify(defaultCounselings));
    }
  }

  // --- Current User ---
  getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // --- Settings ---
  getSettings(): SchoolSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return defaultSettings;
    try {
      return { ...defaultSettings, ...JSON.parse(data) };
    } catch {
      return defaultSettings;
    }
  }

  saveSettings(settings: SchoolSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // --- Users ---
  getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) return defaultUsers;
    try {
      return JSON.parse(data);
    } catch {
      return defaultUsers;
    }
  }

  saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
  }

  updateUser(updated: User): void {
    const users = this.getUsers().map(u => u.id === updated.id ? updated : u);
    this.saveUsers(users);
    const curr = this.getCurrentUser();
    if (curr && curr.id === updated.id) {
      this.setCurrentUser(updated);
    }
  }

  deleteUser(userId: string): void {
    const users = this.getUsers().filter(u => u.id !== userId);
    this.saveUsers(users);
  }

  deleteAllTeachers(): void {
    // Keep admin, remove all teachers
    const users = this.getUsers().filter(u => u.role === 'admin');
    this.saveUsers(users);
  }

  // --- Students ---
  getStudents(): Student[] {
    const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!data) return defaultStudents;
    try {
      return JSON.parse(data);
    } catch {
      return defaultStudents;
    }
  }

  /**
   * Scoped student list based on role & responsibility:
   * - Admin -> All students
   * - Guru PAI & PJOK -> All students (karena mengajar semua kelas)
   * - Guru Kelas 1..6 -> Hanya siswa di kelas tersebut
   */
  getScopedStudents(user: User): Student[] {
    const all = this.getStudents();
    if (user.role === 'admin') {
      return all;
    }
    if (user.tanggungJawab === 'Pendidikan Agama Islam' || user.tanggungJawab === 'PJOK') {
      return all;
    }
    return all.filter(s => s.kelas === user.tanggungJawab);
  }

  saveStudents(students: Student[]): void {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }

  addStudent(student: Student): void {
    const students = this.getStudents();
    students.push(student);
    this.saveStudents(students);
  }

  updateStudent(updated: Student): void {
    const students = this.getStudents().map(s => s.id === updated.id ? updated : s);
    this.saveStudents(students);
  }

  deleteStudent(studentId: string): void {
    const students = this.getStudents().filter(s => s.id !== studentId);
    this.saveStudents(students);
  }

  deleteAllStudents(): void {
    this.saveStudents([]);
  }

  // --- Attendances ---
  getAttendances(): AttendanceRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCES);
    if (!data) return defaultAttendances;
    try {
      return JSON.parse(data);
    } catch {
      return defaultAttendances;
    }
  }

  getScopedAttendances(user: User, kelasFilter?: string): AttendanceRecord[] {
    const all = this.getAttendances();
    if (user.role === 'admin') {
      if (kelasFilter && kelasFilter !== 'Semua Kelas') {
        return all.filter(a => a.kelas === kelasFilter);
      }
      return all;
    }
    if (user.tanggungJawab === 'Pendidikan Agama Islam' || user.tanggungJawab === 'PJOK') {
      if (kelasFilter && kelasFilter !== 'Semua Kelas') {
        return all.filter(a => a.kelas === kelasFilter && (a.guruId === user.id || a.kelas === kelasFilter));
      }
      return all.filter(a => a.guruId === user.id);
    }
    // Guru kelas
    return all.filter(a => a.kelas === user.tanggungJawab);
  }

  saveAttendances(records: AttendanceRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCES, JSON.stringify(records));
  }

  saveDailyAttendance(recordsToUpsert: AttendanceRecord[]): void {
    const all = this.getAttendances();
    const map = new Map<string, AttendanceRecord>();
    
    all.forEach(item => {
      // Key by studentId + tanggal
      map.set(`${item.studentId}_${item.tanggal}`, item);
    });

    recordsToUpsert.forEach(item => {
      map.set(`${item.studentId}_${item.tanggal}`, item);
    });

    this.saveAttendances(Array.from(map.values()));
  }

  // --- Grades (Penilaian Harian) ---
  getGrades(): GradeRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.GRADES);
    if (!data) return defaultGrades;
    try {
      return JSON.parse(data);
    } catch {
      return defaultGrades;
    }
  }

  getScopedGrades(user: User, kelasFilter?: string): GradeRecord[] {
    const all = this.getGrades();
    if (user.role === 'admin') {
      if (kelasFilter && kelasFilter !== 'Semua Kelas') {
        return all.filter(g => g.kelas === kelasFilter);
      }
      return all;
    }
    if (user.tanggungJawab === 'Pendidikan Agama Islam' || user.tanggungJawab === 'PJOK') {
      if (kelasFilter && kelasFilter !== 'Semua Kelas') {
        return all.filter(g => g.kelas === kelasFilter && g.guruId === user.id);
      }
      return all.filter(g => g.guruId === user.id);
    }
    return all.filter(g => g.kelas === user.tanggungJawab);
  }

  saveGrades(records: GradeRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(records));
  }

  upsertGrades(recordsToUpsert: GradeRecord[]): void {
    const all = this.getGrades();
    const map = new Map<string, GradeRecord>();
    all.forEach(g => map.set(g.id, g));
    recordsToUpsert.forEach(g => map.set(g.id, g));
    this.saveGrades(Array.from(map.values()));
  }

  deleteGrade(id: string): void {
    const all = this.getGrades().filter(g => g.id !== id);
    this.saveGrades(all);
  }

  // --- Journals ---
  getJournals(): JournalRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.JOURNALS);
    if (!data) return defaultJournals;
    try {
      return JSON.parse(data);
    } catch {
      return defaultJournals;
    }
  }

  getScopedJournals(user: User, kelasFilter?: string): JournalRecord[] {
    const all = this.getJournals();
    if (user.role === 'admin') {
      if (kelasFilter && kelasFilter !== 'Semua Kelas') {
        return all.filter(j => j.kelas === kelasFilter);
      }
      return all;
    }
    return all.filter(j => j.guruId === user.id);
  }

  saveJournals(records: JournalRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(records));
  }

  addJournal(journal: JournalRecord): void {
    const all = this.getJournals();
    all.unshift(journal);
    this.saveJournals(all);
  }

  updateJournal(updated: JournalRecord): void {
    const all = this.getJournals().map(j => j.id === updated.id ? updated : j);
    this.saveJournals(all);
  }

  deleteJournal(id: string): void {
    const all = this.getJournals().filter(j => j.id !== id);
    this.saveJournals(all);
  }

  // --- Counselings (Bimbingan Siswa) ---
  getCounselings(): CounselingRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.COUNSELINGS);
    if (!data) return defaultCounselings;
    try {
      return JSON.parse(data);
    } catch {
      return defaultCounselings;
    }
  }

  getScopedCounselings(user: User, kelasFilter?: string): CounselingRecord[] {
    const all = this.getCounselings();
    if (user.role === 'admin') {
      if (kelasFilter && kelasFilter !== 'Semua Kelas') {
        return all.filter(c => c.kelas === kelasFilter);
      }
      return all;
    }
    return all.filter(c => c.guruId === user.id);
  }

  saveCounselings(records: CounselingRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.COUNSELINGS, JSON.stringify(records));
  }

  addCounseling(item: CounselingRecord): void {
    const all = this.getCounselings();
    all.unshift(item);
    this.saveCounselings(all);
  }

  updateCounseling(updated: CounselingRecord): void {
    const all = this.getCounselings().map(c => c.id === updated.id ? updated : c);
    this.saveCounselings(all);
  }

  deleteCounseling(id: string): void {
    const all = this.getCounselings().filter(c => c.id !== id);
    this.saveCounselings(all);
  }

  // --- Guru Wipe All Data (with double confirmation) ---
  wipeTeacherData(guruId: string, kelas: TanggungJawabType): void {
    // Delete attendances
    const attendances = this.getAttendances().filter(a => {
      if (kelas === 'Pendidikan Agama Islam' || kelas === 'PJOK') {
        return a.guruId !== guruId;
      }
      return a.kelas !== kelas && a.guruId !== guruId;
    });
    this.saveAttendances(attendances);

    // Delete grades
    const grades = this.getGrades().filter(g => {
      if (kelas === 'Pendidikan Agama Islam' || kelas === 'PJOK') {
        return g.guruId !== guruId;
      }
      return g.kelas !== kelas && g.guruId !== guruId;
    });
    this.saveGrades(grades);

    // Delete journals
    const journals = this.getJournals().filter(j => j.guruId !== guruId);
    this.saveJournals(journals);

    // Delete counselings
    const counselings = this.getCounselings().filter(c => c.guruId !== guruId);
    this.saveCounselings(counselings);
  }
}

export const storage = new StorageService();
