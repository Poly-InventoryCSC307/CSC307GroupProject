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
  const [currentUser, setCurrentUser] = useState(null);       // Stores User id for store signup page 
  const [authLoading, setAuthLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);
  
  // Login with email + password, but require verified email
  const login = async (email, password) => {
    //Talking to firebase: Attempt to login user with email/password    
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // Refresh user data
    await user.reload();

    //User attempts to login, but has not yet verified email
    if (!user.emailVerified) {
      await firebaseSignOut(auth);
      throw new Error("Please verify your email before signing in.");
    }

    return user;
  };

  const signup = async (email, password) => {
    //Talking to firebase: Attempt to create user with email/password
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    //retreive infromation (copies reference to user firebase made)
    const user = userCred.user;

    //the default is to automatically sign the user in
    //Important: signout immediately to prevent redirection

    await sendEmailVerification(user);
    await firebaseSignOut(auth);

    //display error, keep signup/signin popup open, but change the message
    throw new Error("A verification email has been sent. Please verify your email.");
  };

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

  const value = { 
    currentUser, 
    authLoading, 
    login, 
    signup, 
    signInWithGoogle, 
    logout 
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Delay children until Firebase finishes first check */}
      {!authLoading && children}
    </AuthContext.Provider>
  );
}