import { initializeApp } from 'firebase/app';
import {
  Auth,
  User,
  createUserWithEmailAndPassword,
  getAuth,
  getIdToken,
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

export function getAuthUser(): Promise<User | null> {
  if (!auth) return Promise.resolve(null);
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  return new Promise(resolve => {
    const timeout = setTimeout(() => resolve(null), 3000);
    const unsub = onAuthStateChanged(auth, user => {
      clearTimeout(timeout);
      unsub();
      resolve(user);
    });
  });
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

export async function getIdTokenForAuth(): Promise<string | null> {
  if (!auth) return null;
  const user = auth.currentUser || (await getAuthUser());
  if (!user) return null;
  return getIdToken(user, false);
}
