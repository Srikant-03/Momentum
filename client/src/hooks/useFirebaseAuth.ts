import { useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  GoogleAuthProvider, 
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';

// Custom user type with additional application data
export interface User extends FirebaseUser {
  id: string; // Use Firebase UID as our app user ID
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Convert Firebase user to our User type
        const appUser = {
          ...firebaseUser,
          id: firebaseUser.uid,
        } as User;
        
        setUser(appUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      setError(error.message);
      console.error('Google sign in error:', error);
    }
  };

  // Sign in with email/password
  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(error.message);
      console.error('Email sign in error:', error);
    }
  };

  // Create account with email/password
  const createAccount = async (email: string, password: string) => {
    setError(null);
    
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setError(error.message);
      console.error('Account creation error:', error);
    }
  };

  // Sign out
  const logout = async () => {
    setError(null);
    
    try {
      await signOut(auth);
    } catch (error: any) {
      setError(error.message);
      console.error('Sign out error:', error);
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    createAccount,
    logout
  };
}