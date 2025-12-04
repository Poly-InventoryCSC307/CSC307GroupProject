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
  const [currentUser, setCurrentUser] = useState(null); // Stores user
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
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      await user.reload();

      if (!user.emailVerified) {
        await firebaseSignOut(auth);
        throw new Error("Please verify your email before signing in.");
      }

      return user;
    }
    catch (error) {
      // Email or Password is incorrect
      // For security, website will not disclose which, if any, are correct
      if (error.code === "auth/invalid-credential"){
        throw new Error("Incorrect email or password.")
      }
      throw error;
    }
  };

  // Signup + send verification email
  const signup = async (email, password) => {
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCred.user;

      await sendEmailVerification(user);
      await firebaseSignOut(auth);

      throw new Error(
        "A verification email has been sent. Please verify your email.",
      );
    }
    catch (error) {
      //Email already registered
      if(error.code === "auth/email-already-in-use"){
        throw new Error("Email is already registered.")
      }
      //Password not in valid format
      if (error.code === "auth/weak-password"){
        throw new Error("Password does not meet minimum requirements.")
      }
      if(error instanceof Error){
        throw error;
      }

      throw new Error ("Unexpected error occured during sign up")
    }
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
