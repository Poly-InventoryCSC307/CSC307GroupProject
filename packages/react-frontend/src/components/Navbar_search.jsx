import React, { useState } from "react";
import logo from "../assets/logo.svg";
import logoutIcon from "../assets/logout-button.svg";
import searchIcon from "../assets/search-button.svg";
import "./Navbar_search.css";

import LogOutPopUp from "../components/LogOutPopUp";

import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function NavbarSearch({
  userName = "",
  showSearch = false,
  storeName = "",
  storeLocation = null,
}) {

  // state for the logout-popup modal
  const [openLogout, setOpenLogout] = useState(false);
  const [submittingLogout, setSubmittingLogout] = useState(false);
  
  const handleOpenLogout = () => {
    if (!submittingLogout) setOpenLogout(true);
  };

  // close the "Confirm Logout Popup" dialog safely
  const handleCloseLogout = () => { 
    if (!submittingLogout) setOpenLogout(false); 
  };

  const handleConfirmLogout = async () => {
    try {
      setSubmittingLogout(true);
      await signOut(auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to log out. Please try again.");
    } finally {
      setSubmittingLogout(false);
      setOpenLogout(false);
    }
  };

  return (
    <nav className="navbar-product">
      {/* LEFT: Logo */}
      <div className="navbar-product-left">
        <img
          src={logo}
          alt="Poly+ Inventory Logo"
          className="logo-product"
        />
      </div>

      {/* RIGHT: search, greeting, store info, logout */}
      <div className="navbar-product-right">

        {/* optional search icon */}
        {showSearch && (
          <img
            src={searchIcon}
            alt="Search"
            className="icon-product search-product"
          />
        )}

        {/* greeting */}
        {userName && (
          <span className="store-name">Hello {userName}</span>
        )}

        {/* optional store name + tooltip (merged from filters branch) */}
        {storeName && (
          <span className="store-name-wrap">
            <span className="store-name">{storeName}</span>

            <div className="store-addr-rect">
              {storeLocation ? (
                <>
                  <div className="addr-line addr-title">
                    Store Location
                  </div>

                  {storeLocation.street && (
                    <div className="addr-line">
                      {storeLocation.street}
                    </div>
                  )}

                  {/* city, state, zip */}
                  {[storeLocation.city, storeLocation.state, storeLocation.zip]
                    .filter(Boolean)
                    .join(", ") && (
                    <div className="addr-line">
                      {[storeLocation.city, storeLocation.state, storeLocation.zip]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  )}
                </>
              ) : (
                <div className="addr-line">Location unavailable</div>
              )}
            </div>
          </span>
        )}

        {/* Logout wrapper */}
        <div className="logout-wrap" onClick={handleOpenLogout}>
          <img
            src={logoutIcon}
            alt="Logout"
            className="logout-product"
          />
        </div>

        {/* Logout confirmation popup */}
        <LogOutPopUp
          open={openLogout}
          onClose={handleCloseLogout}
          onConfirm={handleConfirmLogout}
          isSubmitting={submittingLogout}
        />

      </div>
    </nav>
  );
}
