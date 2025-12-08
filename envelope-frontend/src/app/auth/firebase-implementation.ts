import { initializeApp } from 'firebase/app';
import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { environment } from '../../environments/environment';

const firebaseConfig = environment.firebase;

function hasConfig(cfg: Record<string, string | undefined>) {
  return Object.values(cfg).every(v => !!v);
}

let auth: Auth | null = null;
try {
  if (hasConfig(firebaseConfig)) {
    const firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
  } else {
    console.warn('Firebase config is missing; auth disabled.');
  }
} catch (err) {
  console.error('Failed to initialize Firebase', err);
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function createUser(email: string, password: string) {
  if (!auth) throw new Error('Firebase is not configured. Please set firebaseConfig values.');
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function login(email: string, password: string) {
  if (!auth) throw new Error('Firebase is not configured. Please set firebaseConfig values.');
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout() {
  if (!auth) throw new Error('Firebase is not configured. Please set firebaseConfig values.');
  await signOut(auth);
}
