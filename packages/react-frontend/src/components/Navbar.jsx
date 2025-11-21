import React from "react"; 
import logo from "../assets/logo.svg";
import searchIcon from "../assets/search-button.svg";
import signInIcon from "../assets/sign-in-button.svg";
import "./Navbar.css";

export default function Navbar() {
  return (
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
        <img src={signInIcon} alt="Sign In" className="icon sign-in" />
      </div>
    </nav>
  );
}