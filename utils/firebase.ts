import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
import { inMemoryPersistence, initializeAuth } from 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { collection, getDocs, getFirestore, persistentLocalCache } from 'firebase/firestore';

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

const firebaseConfig = {
  apiKey: "AIzaSyB2MnlM2Iwsyd3V8obVP2xF4Ti4dFzRAFI",
  authDomain: "click-solidariov2.com",
  databaseURL: "https://project-id.firebaseio.com",
  projectId: "click-solidariov2",
  storageBucket: "click-solidariov2.appspot.com",
  messagingSenderId: "sender-id",
  appId: "1:622298577976:android:d8e1009e351856cef5bacd",
  measurementId: "G-measurement-id",
};

const firebase = initializeApp(firebaseConfig);
const db = getFirestore(firebase);
const auth = initializeAuth(firebase, {
  persistence: inMemoryPersistence,
});

// Get a list of cities from your database
/* async function getCities(db: any) {
  const citiesCol = collection(db, 'users');
  const citySnapshot = await getDocs(citiesCol);
  const cityList = citySnapshot.docs.map((doc) => doc.data());
  return cityList;
}

getCities(db).then((cityList) => {
  console.log(cityList);
}); */

/* const auth = initializeAuth(firebase, {
  persistence: undefined,
}); */

// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase

export default firebase;
