import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import app, { auth as firebaseAuth } from "./firebase";

// Create an instance of the Google provider
const provider = new GoogleAuthProvider();

// Get detailed error message
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/popup-closed-by-user':
      return 'The authentication popup was closed before completing the sign in process.';
    case 'auth/popup-blocked':
      return 'The authentication popup was blocked by the browser. Please allow popups for this site.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for OAuth operations. Please add this domain to your Firebase authorized domains.';
    case 'auth/cancelled-popup-request':
      return 'The authentication popup request was cancelled.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address but different sign-in credentials.';
    default:
      return 'An error occurred during authentication. Please try again.';
  }
}

// Sign in with Google using popup (better for development environments)
export async function login() {
  try {
    // For better debugging in development
    console.log('Attempting to sign in with Google...');
    console.log('Auth instance:', firebaseAuth);
    console.log('Environment variables loaded:', {
      apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
      projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
      appId: !!import.meta.env.VITE_FIREBASE_APP_ID
    });
    
    return await signInWithPopup(firebaseAuth, provider);
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    const errorMessage = getAuthErrorMessage(error.code);
    throw new Error(errorMessage);
  }
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  try {
    return await signInWithEmailAndPassword(firebaseAuth, email, password);
  } catch (error: any) {
    console.error('Email sign-in error:', error);
    throw error;
  }
}

// Create a new account
export async function createAccount(email: string, password: string, displayName: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    
    // Update profile with display name
    if (userCredential.user && displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    return userCredential;
  } catch (error: any) {
    console.error('Account creation error:', error);
    throw error;
  }
}

// Sign out
export async function logout() {
  try {
    return await signOut(firebaseAuth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}