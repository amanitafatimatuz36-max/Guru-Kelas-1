import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDocFromServer, collection, getDocs, setDoc } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { storage } from './storage';

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;

export function initFirebase() {
  const settings = storage.getSettings();
  const config = settings.firebaseConfig;

  if (config && config.projectId && config.apiKey) {
    try {
      if (!getApps().length) {
        firebaseApp = initializeApp(config);
      } else {
        firebaseApp = getApps()[0];
      }
      firestoreDb = getFirestore(firebaseApp);
      firebaseAuth = getAuth(firebaseApp);
      return { app: firebaseApp, db: firestoreDb, auth: firebaseAuth };
    } catch (e) {
      console.warn('Firebase init warning:', e);
      return null;
    }
  }
  return null;
}

export async function testFirestoreConnection(): Promise<{ success: boolean; message: string }> {
  const settings = storage.getSettings();
  if (!settings.firebaseConfig || !settings.firebaseConfig.projectId) {
    return { 
      success: false, 
      message: 'Konfigurasi Firebase belum diatur. Silakan masukkan Project ID dan API Key di menu Pengaturan.' 
    };
  }

  const fb = initFirebase();
  if (!fb || !fb.db) {
    return { success: false, message: 'Gagal menginisialisasi Firebase SDK dengan parameter yang diberikan.' };
  }

  try {
    // Testing connection using doc fetch from server
    await getDocFromServer(doc(fb.db, 'settings', 'config'));
    return { success: true, message: 'Berhasil terhubung ke Firebase Firestore!' };
  } catch (error: any) {
    if (error?.message?.includes('the client is offline') || error?.code === 'unavailable') {
      return { success: false, message: 'Koneksi Firestore gagal: Klien offline atau jaringan tidak terjangkau.' };
    }
    if (error?.code === 'permission-denied') {
      return { success: true, message: 'Terhubung ke Firestore! (Aturan keamanan rules_version aktif).' };
    }
    return { success: false, message: `Error Firestore: ${error?.message || String(error)}` };
  }
}

/**
 * Sync local data to Firestore if configured
 */
export async function syncLocalToFirestore(): Promise<{ success: boolean; count: number; error?: string }> {
  const fb = initFirebase();
  if (!fb || !fb.db) {
    return { success: false, count: 0, error: 'Firebase belum dikonfigurasi' };
  }

  try {
    let count = 0;
    const settings = storage.getSettings();
    await setDoc(doc(fb.db, 'settings', 'config'), settings, { merge: true });
    count++;

    const students = storage.getStudents();
    for (const student of students) {
      await setDoc(doc(fb.db, 'students', student.id), student, { merge: true });
      count++;
    }

    const attendances = storage.getAttendances();
    for (const att of attendances) {
      await setDoc(doc(fb.db, 'attendances', att.id), att, { merge: true });
      count++;
    }

    const grades = storage.getGrades();
    for (const grd of grades) {
      await setDoc(doc(fb.db, 'grades', grd.id), grd, { merge: true });
      count++;
    }

    const journals = storage.getJournals();
    for (const jrn of journals) {
      await setDoc(doc(fb.db, 'journals', jrn.id), jrn, { merge: true });
      count++;
    }

    const counselings = storage.getCounselings();
    for (const cns of counselings) {
      await setDoc(doc(fb.db, 'counselings', cns.id), cns, { merge: true });
      count++;
    }

    return { success: true, count };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || String(err) };
  }
}
