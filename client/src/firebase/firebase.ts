import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Validate environment variables
const validateFirebaseConfig = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
    console.error('Please provide all required Firebase configuration values.');
    return false;
  }
  
  return true;
};

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012", // Can use a default for local dev
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase with error handling
let app;
let auth;

if (validateFirebaseConfig()) {
  try {
    // Initialize Firebase app
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
    
    // Initialize Firebase Authentication
    auth = getAuth(app);
    console.log('Firebase Auth initialized successfully');
    
    // Configure Google provider persistence
    auth.useDeviceLanguage();
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // Create stub objects to prevent runtime errors
    app = {} as any;
    auth = {
      currentUser: null,
      onAuthStateChanged: () => () => {},
      signOut: () => Promise.resolve(),
    } as any;
  }
} else {
  console.error('Firebase initialization skipped due to missing configuration');
  // Create stub objects to prevent runtime errors
  app = {} as any;
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signOut: () => Promise.resolve(),
  } as any;
}

// Log current auth state for debugging (not for production)
console.log('Current Firebase auth state:', auth.currentUser ? 'Signed in' : 'Not signed in');

export { auth };
export default app;