import { createContext, useState, useContext, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "../../firebase/firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);       // Stores User 
  const [authLoading, setAuthLoading] = useState(true);
  
  // Monitor Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);
  
  // Login with email + password (requires email verification)
  const login = async (email, password) => {

    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    await user.reload();

    if (!user.emailVerified) {
      await firebaseSignOut(auth);
      throw new Error("Please verify your email before signing in.");
    }

    return user;
  };

  // Signup + send verification email
  const signup = async (email, password) => {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    await sendEmailVerification(user);
    await firebaseSignOut(auth);

    throw new Error("A verification email has been sent. Please verify your email.");
  };

  // Google sign-in
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => firebaseSignOut(auth);

  const value = { 
    currentUser, 
    authLoading, 
    login, 
    signup, 
    signInWithGoogle, 
    logout, 
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Delay children until Firebase finishes first check */}
      {!authLoading && children}
    </AuthContext.Provider>
  );
}
