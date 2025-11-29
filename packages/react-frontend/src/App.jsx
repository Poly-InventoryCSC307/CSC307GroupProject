import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";

import NavbarSearch from "./components/Navbar_search";
import Search from "./pages/Search";

import About from "./pages/About";
import Features from "./pages/Features";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";

function App() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [storeLocation, setStoreLocation] = useState(null);

  const storeID = "690aaa9be73854e0640a1927";
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      if (
        location.pathname === "/" ||
        location.pathname === "/about" ||
        location.pathname === "/features"
      ) {
        navigate("/products");
      }
    } else {
      if (location.pathname === "/products") {
        navigate("/");
      }
    }
  }, [user, navigate, location.pathname]);

  useEffect(() => {
    fetch(`http://localhost:8000/inventory/${storeID}`)
      .then((res) => res.json())
      .then((data) => {
        setStoreName(data?.name || "My Store");

        const locArray = data?.location || [];
        const loc = Array.isArray(locArray) ? locArray[0] || {} : locArray;

        const address = loc?.address || loc?.street || "";
        const city = loc?.city || "";
        const state = loc?.state || "";
        const zip = loc?.zip || "";
        const hasAny = [address, city, state, zip].some(Boolean);

        setStoreLocation(
          hasAny ? { address, city, state, zip } : null
        );
      })
      .catch(() => {
        setStoreName("My Store");
        setStoreLocation(null);
      });
  }, [storeID]);

  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:8000/inventory/${storeID}/products`)
      .then((res) => res.json())
      .then((data) => {
        const cardData = (data || []).map((p) => ({
          name: p.name ?? "",
          imageURL: p.imageURL ?? p.product_photo ?? "",
          SKU: p.SKU ?? p.sku ?? "",
          price: Number(p.price ?? 0),
          quantity: Number(p.quantity ?? p.total_quantity ?? 0),
          description: p.description ?? "",
        }));
        setProducts(cardData);
      })
      .catch((err) => console.log("Fetch error:", err));
  }, [user, storeID]);

  const handleProductAdded = (cardData) => {
    setProducts((prev) => [cardData, ...prev]);
  };

  const handleProductRemoved = (sku) => {
    setProducts((prev) =>
      prev.filter(
        (p) => (p.SKU || "").trim() !== (sku || "").trim()
      )
    );
  };

  return (
    <>
      {!user ? (
        <Navbar />
      ) : (
        <NavbarSearch
          userName={user?.displayName || user?.email?.split("@")[0]}
          storeName={storeName}
          storeLocation={storeLocation}
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route
          path="/products"
          element={
            <Search
              productsData={products}
              onProductAdded={handleProductAdded}
              onProductRemoved={handleProductRemoved}
              storeID={storeID}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
