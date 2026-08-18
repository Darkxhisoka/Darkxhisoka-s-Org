import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with robust connection settings for sandboxed/proxy environments
export const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  },
  firebaseConfig.firestoreDatabaseId
);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Safe async connection check conforming to Firebase skill specifications
async function testConnection() {
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      await getDocFromServer(doc(db, 'test', 'connection'));
      console.log('Firebase Firestore backend connected successfully.');
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.info('Firestore is operating in offline mode.');
    } else {
      console.debug('Firestore backend probe note:', error);
    }
  }
}

testConnection();


