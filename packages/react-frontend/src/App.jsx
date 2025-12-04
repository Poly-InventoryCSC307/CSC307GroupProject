import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

import { API_BASE_URL } from "./apiConfig";

import Navbar from "./components/Navbar";
import NavbarSearch from "./components/Navbar_search";

import Home from "./pages/Home";
import Search from "./pages/Search";
import About from "./pages/About";
import Features from "./pages/Features";
import StoreSetup from "./pages/StoreSetup";

import { useAuth } from "./context/authContext";

function App() {
  const { currentUser, authLoading } = useAuth();
  const [store, setStore] = useState(null);
  const [storeChecked, setStoreChecked] = useState(false);

  const [products, setProducts] = useState([]);
  const [_loadingProducts, setLoadingProducts] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // When auth state changes, figure out if user has a store
  useEffect(() => {
    if (authLoading) return;

    // Logged out: clear store + products, push to home if on protected routes
    if (!currentUser) {
      setStore(null);
      setStoreChecked(false);
      setProducts([]);

      if (
        location.pathname === "/products" ||
        location.pathname === "/store-setup"
      ) {
        navigate("/");
      }
      return;
    }

    // Logged in but not verified: dont auto-redirect
    if (!currentUser.emailVerified) {
      if (
        location.pathname === "/products" ||
        location.pathname === "/store-setup"
      ) {
        navigate("/");
      }
      return;
    }

    // Logged in: check if this user already has a store
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/stores/by-user/${currentUser.uid}`
        );

        if (res.status === 404) {
          // no store yet, first-time setup
          setStore(null);
          setStoreChecked(true);
          if (location.pathname !== "/store-setup") {
            navigate("/store-setup");
          }
          return;
        }

        if (!res.ok) {
          console.error("Failed to fetch store");
          return;
        }

        const data = await res.json();
        setStore(data);
        setStoreChecked(true);

        // If user is on home or setup, send them to products
        if (
          location.pathname === "/" ||
          location.pathname === "/store-setup" ||
          location.pathname === "/about" ||
          location.pathname === "/features"
        ) {
          navigate("/products");
        }
      } catch (err) {
        console.error("Error looking up store:", err);
      }
    })();
  }, [currentUser, authLoading, navigate, location.pathname]);

  // When we have a store, load its products
  useEffect(() => {
    if (!store?._id) return;

    setLoadingProducts(true);
    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/inventory/${store._id}/products`
        );
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();

        const list = Array.isArray(data) ? data : data.products || [];
        setProducts(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProducts(false);
      }
    })();
  }, [store?._id]);

  // Keep products in sync when child components add/remove
  const handleProductAdded = (newProduct) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.SKU === newProduct.SKU);
      if (exists) {
        return prev.map((p) => (p.SKU === newProduct.SKU ? newProduct : p));
      }
      return [newProduct, ...prev];
    });
  };

  const handleProductRemoved = (sku) => {
    setProducts((prev) => prev.filter((p) => p.SKU !== sku));
  };

  // Decide which navbar to render
  const isProductRoute = location.pathname === "/products";
  const isStoreSetupRoute = location.pathname === "/store-setup";

  const storeLocation = store?.location || null;

  const userName =
    currentUser?.displayName || currentUser?.email.split("@")[0] || "";

  return (
    <>
      {isProductRoute || isStoreSetupRoute ? (
        <NavbarSearch
          userName={userName}
          storeName={store?.name || ""}
          storeLocation={storeLocation}
        />
      ) : (
        <Navbar isLoggedIn={!!currentUser} showSearch={false} />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />

        <Route
          path="/store-setup"
          element={
            <StoreSetup
              onStoreCreated={(s) => {
                setStore(s);
                setStoreChecked(true);
              }}
            />
          }
        />

        <Route
          path="/products"
          element={
            storeChecked && store ? (
              <Search
                productsData={products}
                onProductAdded={handleProductAdded}
                onProductRemoved={handleProductRemoved}
                storeID={store._id}
              />
            ) : (
              <div style={{ padding: "2rem" }}>
                {authLoading || !currentUser
                  ? "Please sign in..."
                  : "Loading store..."}
              </div>
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;
