import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";

import NavbarSearch from "./components/Navbar_search";
import Search from "./pages/Search";
import About from "./pages/About";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";

function App() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [storeLocation, setStoreLocation] = useState(null);
  const storeID = "690aaa9be73854e0640a1927";

  /* --- your existing useEffects here --- */

  return (
    <Routes>

      <Route
        path="/"
        element={
          !user ? (
            <>
              <Navbar />
              <Home />
            </>
          ) : (
            <>
              <NavbarSearch
                userName={user?.displayName || user?.email?.split("@")[0]}
                storeName={storeName}
                storeLocation={storeLocation}
              />
              <Search
                productsData={products}
                onProductAdded={cardData => setProducts(prev => [cardData, ...prev])}
                onProductRemoved={sku => setProducts(prev => prev.filter(p => p.SKU !== sku))}
                storeID={storeID}
              />
            </>
          )
        }
      />

      <Route
         path="/about"
         element={
            <>
              <Navbar />
              <About />
            </>
         }
      />

    </Routes>
  );
}

export default App;