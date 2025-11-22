import { useState } from "react";
import { useAuth } from "../context/authContext"; 
import "./SignInModal.css"

export default function SignInModal({ onClose }) {
  const {login, signup, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  console.log("Submitting:", { email, password, isSignUp });

  try {
    let userCred;
    if (isSignUp) {
      userCred = await signup(email, password);
      console.log("Signup success:", userCred.user);
    } else {
      userCred = await login(email, password);
      console.log("Login success:", userCred.user);
    }

    onClose();
  } catch (err) {
    console.error("Firebase Auth error:", err);
    setError(err.message);
  }
};

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>
        {error && <p className="error">{error}</p>}
        
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
          <button type="submit">{isSignUp ? "Sign Up" : "Sign In"}</button>
        </form>
        <button className="google-btn" onClick={signInWithGoogle}>
          Sign in with Google
        </button>
        <p>
          {isSignUp ? "Already have an account?" : "New user?"}{" "}
          <span onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Sign In" : "Sign Up"}
          </span>
        </p>
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
