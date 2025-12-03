import { useState } from "react";
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

  //error if user needs to verify email
  const isVerifyMessage =
    error && error.toLowerCase().includes("verify");

  //login and sign up submit 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // console.log("Submitting:", { email, password, isSignUp });

    try {
      //SignUp: send email verification and throw error to trigger verif message
      if (isSignUp) {
        await signup(email, password);
        return;
      } 
      await login(email, password);

      onClose?.();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-content">
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
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">
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

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
