// ─── Firebase Configuration ───
// Centralized Firebase app initialization with environment variable support.

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'smartvenue-demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'smartvenue-demo',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'smartvenue-demo.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:000000000000:web:000000000000',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX',
};

/**
 * Get or initialize the Firebase app singleton.
 * Prevents re-initialization in Next.js hot-reload / serverless environments.
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (getApps().length > 0) {
    return getApp();
  }
  
  if (firebaseConfig.apiKey.includes('your-') || firebaseConfig.apiKey.includes('demo-')) {
    console.warn('Firebase initialized with dummy keys. Sync and Analytics disabled.');
    return null;
  }
  
  return initializeApp(firebaseConfig);
}

export { firebaseConfig };
