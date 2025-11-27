import React, {useState} from "react";
import logo from "../assets/logo.svg";
import signInIcon from "../assets/sign-in-button.svg";
import "./Navbar.css";
import SignInModal from "./SignInModal";

export default function Navbar() {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Poly+ Inventory Logo" className="logo" />
      </div>

      <ul className="navbar-menu">
        <li onClick={() => console.log("Dashboard clicked")}>Dashboard</li>
        <li onClick={() => console.log("Resources clicked")}>Resources</li>
        <li onClick={() => console.log("Features clicked")}>Features</li>
        <li onClick={() => console.log("About clicked")}>About</li>
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

