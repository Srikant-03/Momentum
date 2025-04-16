import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { login as googleLogin, logout as firebaseLogout } from '../firebase/auth';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  createAccount: (email: string, password: string, name: string) => Promise<void>;
  loginDemo: () => void;
  isFirebaseConfigured: boolean;
}

// Create context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  signInWithEmail: async () => {},
  signInWithGoogle: async () => {},
  createAccount: async () => {},
  loginDemo: () => {},
  isFirebaseConfigured: false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps your app and provides the auth context value
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(false);
  
  // Check if Firebase is properly configured
  useEffect(() => {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    const appId = import.meta.env.VITE_FIREBASE_APP_ID;
    
    if (apiKey && projectId && appId) {
      setIsFirebaseConfigured(true);
    } else {
      console.warn('Firebase is not configured with required credentials.');
      setIsFirebaseConfigured(false);
    }
  }, []);
  
  // Initialize Firebase auth
  const auth = getAuth();
  
  // Function to handle logout
  const logout = async () => {
    setLoading(true);
    try {
      // Check if user is a demo user
      if (user?.isDemo) {
        // If demo user, just clear the user state
        setUser(null);
        localStorage.removeItem('momentum_demo_user');
      } else {
        // If real user, sign out from Firebase
        await firebaseLogout();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please provide Firebase credentials or use Demo Mode.');
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error signing in with email and password:', error);
      throw error;
    }
  };

  // Function to sign in with Google
  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please provide Firebase credentials or use Demo Mode.');
    }
    
    try {
      await googleLogin();
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  // Function to create a new account
  const createAccount = async (email: string, password: string, name: string) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please provide Firebase credentials or use Demo Mode.');
    }
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      if (result.user && name) {
        await updateProfile(result.user, { displayName: name });
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      throw error;
    }
  };
  
  // Function to login with a demo account
  const loginDemo = () => {
    // Create a fake demo user
    const demoUser: User = {
      uid: 'demo-user-' + Date.now().toString(),
      email: 'demo@example.com',
      displayName: 'Demo User',
      photoURL: null,
      isDemo: true
    };
    
    setUser(demoUser);
    setLoading(false);
    
    // Save demo status to local storage
    localStorage.setItem('momentum_demo_user', JSON.stringify(demoUser));
    
    console.log('Demo mode activated');
  };
  
  // Check for stored demo user on initial load
  useEffect(() => {
    const storedDemoUser = localStorage.getItem('momentum_demo_user');
    if (storedDemoUser) {
      try {
        const demoUser = JSON.parse(storedDemoUser);
        if (demoUser && demoUser.isDemo) {
          setUser(demoUser);
          setLoading(false);
          console.log('Demo user restored from storage');
        }
      } catch (error) {
        console.error('Error parsing stored demo user:', error);
        localStorage.removeItem('momentum_demo_user');
      }
    }
  }, []);
  
  // Subscribe to auth state changes when the component mounts
  useEffect(() => {
    let unsubscribe = () => {};
    
    if (isFirebaseConfigured) {
      unsubscribe = onAuthStateChanged(auth, (authUser) => {
        if (authUser) {
          // User is signed in with Firebase
          const { uid, email, displayName, photoURL } = authUser;
          
          // Clear any demo user in storage when signing in with real account
          localStorage.removeItem('momentum_demo_user');
          
          setUser({ uid, email, displayName, photoURL });
        } else {
          // Check if there's a demo user in storage before setting to null
          const storedDemoUser = localStorage.getItem('momentum_demo_user');
          if (!storedDemoUser) {
            setUser(null);
          }
        }
        setLoading(false);
      });
    } else {
      // If Firebase is not configured, check for demo user
      const storedDemoUser = localStorage.getItem('momentum_demo_user');
      if (!storedDemoUser) {
        setLoading(false);
      }
    }
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, isFirebaseConfigured]);
  
  // The value that will be supplied to any consuming components
  const value = {
    user,
    loading,
    login: googleLogin,
    logout,
    signInWithEmail,
    signInWithGoogle,
    createAccount,
    loginDemo,
    isFirebaseConfigured,
  };
  
  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}