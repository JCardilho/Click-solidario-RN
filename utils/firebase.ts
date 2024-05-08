import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
import { inMemoryPersistence, initializeAuth } from 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { collection, getDocs, getFirestore, persistentLocalCache } from 'firebase/firestore';
import initialize from './firebaseInitialize';

// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
/* const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
}; */

/*
const firebaseConfig = {
  apiKey: 'AIzaSyB2MnlM2Iwsyd3V8obVP2xF4Ti4dFzRAFI',
  authDomain: 'click-solidariov2.com',
  databaseURL: 'https://click-solidariov2-default-rtdb.firebaseio.com',
  projectId: 'click-solidariov2',
  storageBucket: 'click-solidariov2.appspot.com',
  messagingSenderId: 'sender-id',
  appId: '1:622298577976:android:d8e1009e351856cef5bacd',
  measurementId: 'G-measurement-id',
  
};
*/

const firebaseConfig = {
  apiKey: 'AIzaSyC5Y6nl34a0hgAlIK5N9sdrL3sBKVSYnxg',
  authDomain: 'click-solidariov1.firebaseapp.com',
  projectId: 'click-solidariov1',
  storageBucket: 'click-solidariov1.appspot.com',
  messagingSenderId: '449973756973',
  appId: '1:449973756973:web:ddee6191c9ae0b039c04a4',
  measurementId: 'G-T94G4NT096',
};

const firebase = initializeApp(firebaseConfig);
initialize(firebase);

export default firebase;
