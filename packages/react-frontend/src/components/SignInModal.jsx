import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/authContext"; 
import "./SignInModal.css";
import logo from "../assets/logo-and-text.svg";

//SignInModal is the pop up for the authentication feature
//Users can Sign Up (create an account) or Log In (access account)
//email verification is required to access account once they have created one

export default function SignInModal({ onClose }) {
  // login and signup from index.jsx
  const {login, signup, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  // used to determine where click has happened
  const overlayRef = useRef(null);
  const [closing, setClosing] = useState(false);

  //error if user needs to verify email
  const isVerifyMessage = error && error.toLowerCase().includes("verify");

  // smooth transition on close
  const handleRequestClose = () => {
    if (closing) return;           
    setClosing(true);

    // wait for CSS animation to finish, then unmount
    setTimeout(() => {
      onClose?.();
    }, 250); 
  };


  // pressing the escape key closes the overlay
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        handleRequestClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleRequestClose]);

  // if you click outside the overlay, close it
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      handleRequestClose();
    }
  };

  //login and sign up submit 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      //SignUp: send email verification and throw error to trigger verif message
      if (isSignUp) {
        await signup(email, password);
        return;
      } 
      await login(email, password);

      handleRequestClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className={`auth-modal-overlay ${closing ? "closing" : ""}`}
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
    >
      <div className={`auth-modal-content ${closing ? "closing" : ""}`}>
        <img src={logo} alt="Logo" className="modal-logo" />

        {/* Error or verification message */}
        {error && <p className="error">{error}</p>}

        {/* Will show verification message instead of form */}
        {isVerifyMessage ? (
          <p className="verify-message">
            A verification email has been sent to <b>{email}</b>.
            <br />
            Please verify your account and refresh this page.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="withAsterisk">
              <span className="asterisk">*</span>
              <input
                type="email"
                placeholder=" Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="withAsterisk">
              <span className="asterisk">*</span>
              <input
                type="password"
                placeholder=" Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              style={{
                // Add a little gap between sign in and sign in with google
                marginBottom:"15px",      
              }}
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </form>
        )}

        {/*Google and Submit buttons dissapear when verification message appears*/}
        {!isVerifyMessage && (
          <>
            <button className="google-btn" onClick={signInWithGoogle}>
              {isSignUp ? "Sign up with Google" : "Sign in with Google"}
            </button>
            <p>
              {isSignUp ? "Already have an account?" : "New user?"}{" "}
              <span onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? "Sign In" : "Sign Up"}
              </span>
            </p>
          </>
        )}

        <button className="close-btn" onClick={handleRequestClose}>
          Close
        </button>
      </div>
    </div>
  );
}