import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';


const firebaseConfig = {
  apiKey: "AIzaSyCFpsh7uUO4UKkSh4qdWedvXNZwwXFCfkY",
  authDomain: "quad-quest.firebaseapp.com",
  projectId: "quad-quest",
  storageBucket: "quad-quest.firebasestorage.app",
  messagingSenderId: "438177736375",
  appId: "1:438177736375:web:7ca470b365fc57deb94f32"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');

export const loginAnon = () => signInAnonymously(auth);
export const loginGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
export const logout = () => signOut(auth);

export const validateAnswer = (data) => httpsCallable(functions, 'validateAnswer')(data);
export const exportCSV = (data) => httpsCallable(functions, 'exportCSV')(data);
export const seedRoom = async (data) => {
  const callable = httpsCallable(functions, 'seedRoom');
  const result = await callable(data);
  return result.data;
}
