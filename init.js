// ============================================
// FIREBASE INITIALIZATION - Complete Firebase Setup
// Madhav Prajapati Art - Bagwali, Panchkula
// ============================================

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
  getFirestore, 
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { 
  getStorage, 
  connectStorageEmulator 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";
import { 
  getAnalytics, 
  logEvent, 
  setAnalyticsCollectionEnabled 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";
import { 
  getPerformance 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-performance.js";

// ============================================
// FIREBASE CONFIGURATION
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyBC9T1Gyf6cyLIFxcrhOr3CmGDTAqrhs-M",
  authDomain: "madhav-prajapati-art.firebaseapp.com",
  projectId: "madhav-prajapati-art",
  storageBucket: "madhav-prajapati-art.firebasestorage.app",
  messagingSenderId: "75531600018",
  appId: "1:75531600018:web:ef5d1f62b8746f55a6e64b",
  measurementId: "G-XXXXXXXXXX" // Add your measurement ID if available
};

// ============================================
// INITIALIZE FIREBASE (Prevent duplicate apps)
// ============================================

let app;
let auth;
let db;
let storage;
let analytics;
let performance;

try {
  // Initialize or get existing app
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('🔥 Firebase initialized successfully');
  } else {
    app = getApp();
    console.log('🔥 Using existing Firebase app');
  }

  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Initialize optional services (they might fail in some environments)
  try {
    analytics = getAnalytics(app);
    setAnalyticsCollectionEnabled(analytics, true);
    console.log('📊 Firebase Analytics initialized');
  } catch (e) {
    console.warn('📊 Analytics not available:', e.message);
  }

  try {
    performance = getPerformance(app);
    console.log('⚡ Firebase Performance initialized');
  } catch (e) {
    console.warn('⚡ Performance monitoring not available:', e.message);
  }

} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw new Error('Firebase initialization failed. Please check your configuration.');
}

// ============================================
// ENABLE OFFLINE PERSISTENCE (Firestore)
// ============================================

if (db) {
  enableIndexedDbPersistence(db, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  }).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('📴 Offline persistence failed - multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('📴 Offline persistence not supported by this browser');
    }
  });
}

// ============================================
// DEVELOPMENT MODE - Emulators
// ============================================

const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

if (isDevelopment) {
  // Uncomment to use Firebase Emulators during development
  /*
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('🧪 Connected to Firebase Emulators');
  } catch (e) {
    console.warn('🧪 Emulators not available:', e.message);
  }
  */
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if Firebase is initialized
 */
export function isFirebaseInitialized() {
  return !!(app && auth && db && storage);
}

/**
 * Get Firebase app instance
 */
export function getFirebaseApp() {
  return app;
}

/**
 * Get Auth instance with error handling
 */
export function getFirebaseAuth() {
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }
  return auth;
}

/**
 * Get Firestore instance with error handling
 */
export function getFirebaseFirestore() {
  if (!db) {
    throw new Error('Firebase Firestore not initialized');
  }
  return db;
}

/**
 * Get Storage instance with error handling
 */
export function getFirebaseStorage() {
  if (!storage) {
    throw new Error('Firebase Storage not initialized');
  }
  return storage;
}

/**
 * Log analytics event
 */
export function logAnalyticsEvent(eventName, eventParams = {}) {
  if (analytics) {
    try {
      logEvent(analytics, eventName, eventParams);
    } catch (e) {
      console.warn('📊 Failed to log analytics event:', e.message);
    }
  }
}

/**
 * Get current user token
 */
export async function getCurrentUserToken() {
  if (!auth?.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken();
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
}

/**
 * Sign out and clear cache
 */
export async function signOutAndClearCache() {
  try {
    if (auth) {
      await auth.signOut();
    }
    // Clear any cached data
    if ('caches' in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys
          .filter(key => key.includes('firebase'))
          .map(key => caches.delete(key))
      );
    }
    console.log('👋 Signed out and cache cleared');
    return true;
  } catch (error) {
    console.error('Error during sign out:', error);
    return false;
  }
}

/**
 * Get Firebase error message
 */
export function getFirebaseErrorMessage(error) {
  const errorMessages = {
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'Email already registered',
    'auth/weak-password': 'Password is too weak',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/too-many-requests': 'Too many attempts. Try again later',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/requires-recent-login': 'Please login again to continue',
    'permission-denied': 'You don\'t have permission to perform this action',
    'unavailable': 'Service temporarily unavailable',
    'internal': 'Internal error. Please try again'
  };
  
  const code = error?.code || error?.message || 'unknown';
  return errorMessages[code] || error?.message || 'An error occurred';
}

// ============================================
// EXPORT ALL FIREBASE INSTANCES
// ============================================

export { 
  app, 
  auth, 
  db, 
  storage, 
  analytics, 
  performance 
};

// ============================================
// EXPORT DEFAULT FOR EASY IMPORT
// ============================================

export default {
  app,
  auth,
  db,
  storage,
  analytics,
  performance,
  isFirebaseInitialized,
  getFirebaseApp,
  getFirebaseAuth,
  getFirebaseFirestore,
  getFirebaseStorage,
  logAnalyticsEvent,
  getCurrentUserToken,
  signOutAndClearCache,
  getFirebaseErrorMessage
};

// ============================================
// LOG INITIALIZATION STATUS
// ============================================

console.log('🔥 Firebase services ready:', {
  auth: !!auth,
  firestore: !!db,
  storage: !!storage,
  analytics: !!analytics,
  performance: !!performance
});