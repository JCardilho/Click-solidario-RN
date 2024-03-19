import { Auth, inMemoryPersistence, initializeAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

export let db: Firestore;
export let auth: Auth;
export let dbRealtime: any;

const initialize = (firebase: FirebaseApp) => {
  db = getFirestore(firebase);
  auth = initializeAuth(firebase, {
    persistence: inMemoryPersistence,
  });
  dbRealtime = getDatabase(firebase);
};

export default initialize;
