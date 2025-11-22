import React, {useState} from "react"; 
import logo from "../assets/logo.svg";
import searchIcon from "../assets/search-button.svg";
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
        <li>Dashboard</li>
        <li>Resources</li>
        <li>Features</li>
        <li>About</li>
      </ul>

      <div className="navbar-right">
        <img src={searchIcon} alt="Search" className="icon search" />
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
