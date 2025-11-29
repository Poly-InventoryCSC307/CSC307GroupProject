import React, {useState} from "react";
import logo from "../assets/logo.svg";
import signInIcon from "../assets/sign-in-button.svg";
import "./Navbar.css";
import SignInModal from "./SignInModal";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  return (
    <>
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Poly+ Inventory Logo" className="logo" />
      </div>

      <ul className="navbar-menu">
        <li onClick={() => navigate("/")}>Home</li>
        <li onClick={() => navigate("/features")}>Features</li>
        <li onClick={() => navigate("/about")}>About</li>
      </ul>

      <div className="navbar-right">
        <img
          src={signInIcon}
          alt="Sign In"
           className="icon sign-in"
           onClick={() => setShowModal(true)}
           style={{ cursor: "pointer"}}
            />
      </div>
    </nav>
    {showModal && <SignInModal onClose={() => setShowModal(false)} />}
    </>
  );
}
