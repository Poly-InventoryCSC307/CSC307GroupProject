import React from "react"; 
import logo from "../assets/logo.svg";
import logoutIcon from "../assets/logout-button.svg";
import "./Navbar_search.css";

import { signOut } from "firebase/auth"; 
import { auth } from "../firebase/firebase";

export default function Navbar(){
   
    const handleLogout = () => {
      signOut(auth)
        .then(() => {
          console.log("User signed out");
        })
        .catch((error) => {
          console.error("Logout error:", error);
        });
    };

    return (
        <nav className="navbar-product">
          <div className="navbar-product-left">
            <img src={logo} alt="Poly+ Inventory Logo" className="logo-product" />
          </div>
    
          <div className="navbar-product-right">
            <img src={logoutIcon} alt="Logout" className="logout-product" onClick={handleLogout} />
          </div>
        </nav>
   );

}
