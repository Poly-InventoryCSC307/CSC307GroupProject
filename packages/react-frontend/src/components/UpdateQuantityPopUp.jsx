<<<<<<< HEAD
import React, { useEffect, useRef, useState } from "react";
import "./PopUp.css";

function UpdateQuantityPopUp({ open, onClose, onSubmit, isSubmitting }) {
  const overlayRef = useRef(null);
  const [form, setForm] = useState({ delta: "" });

  // Use for opening and closing animations
  const [show, setShow] = useState(open);
  const [closing, setClosing] = useState(false);

  // When open allow the user to press esc to exit out
=======
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
  
>>>>>>> ff7df4ea462862f5079b204ed44da0a6bc61e336
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

<<<<<<< HEAD
  useEffect(() => {
    if (!open) return;
    setForm({ delta: "" });
  }, [open]);

  useEffect(() => {
    if (open) {
      setShow(true);
      setClosing(false);
      return;
    }
    if (show) {
      setClosing(true);
      const t = setTimeout(() => {
        setShow(false);
        setClosing(false);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open, show]);

  if (!show) return null;
=======
    // Refresh user data
    await user.reload();

    //User attempts to login, but has not yet verified email
    if (!user.emailVerified) {
      await firebaseSignOut(auth);
      throw new Error("Please verify your email before signing in.");
    }
>>>>>>> ff7df4ea462862f5079b204ed44da0a6bc61e336

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
<<<<<<< HEAD
    <div
      className={`modal-overlay ${closing ? "closing" : ""}`}
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="update-quant-title"
    >
      <div className={`modal ${closing ? "closing" : ""}`} role="document">
        <header className="modal-header">
          <h3 id="update-quant-title">Update Quantity</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            X
          </button>
        </header>

        <form className="modal-content" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="delta">Change Quantity By (+-)</label>
            <input
              id="delta"
              name="delta"
              type="number"
              step="1"
              value={form.delta}
              onChange={handleChange}
              placeholder="e.g., 5 or -3"
              required
            />
          </div>

          <footer className="modal-actions">
            <button
              type="button"
              className="btn ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating Quantity..." : "Apply Change"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default UpdateQuantityPopUp;
=======
    <AuthContext.Provider value={value}>
      {/* Delay children until Firebase finishes first check */}
      {!authLoading && children}
    </AuthContext.Provider>
  );
}
>>>>>>> ff7df4ea462862f5079b204ed44da0a6bc61e336
