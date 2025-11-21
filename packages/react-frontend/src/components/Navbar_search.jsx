import React from "react"; 
import logo from "../assets/logo.svg";

import logoutIcon from "../assets/logout-button.svg";
import "./Navbar_search.css";

export default function Navbar(){
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
            {/* <img src={searchIcon} alt="Search" className="icon search" /> */}
            <img src={logoutIcon} alt="Logout" className="icon logout" />
          </div>
        </nav>
      );

}



