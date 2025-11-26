import React, {useState, useEffect} from "react";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";

import NavbarSearch from "./components/Navbar_search";
import Search from "./pages/Search";

import {onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";

function App() {
  const [user, setUser] = useState(null); 
  const [products, setProducts] = useState([]);
  
  useEffect(() => { 
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => { 
       setUser(currentUser); 
    }); 
    
    return () => unsubscribe(); 
  }, []); 

  // Send to change the middle id depending on the store
  useEffect(() => {
    if (!user) return; 

    fetch("http://localhost:8000/inventory/690aaa9be73854e0640a1927/products")
      .then((res) => res.json())
      .then((data) => {
        const cardData = (data || []).map((p) => ({
          name: p.name ?? "",
          imageURL: p.imageURL ?? p.product_photo ?? "",
          SKU: p.SKU ?? p.sku ?? "",
          price: Number(p.price ?? 0),
          quantity: Number(p.quantity ?? p.total_quantity ?? 0),
        }));
        setProducts(cardData)

      })
      .catch((error) => console.log(error)); 
  }, [user]);

  const handleProductAdded = (cardData) => {
    setProducts((prev) => [cardData, ...prev]);
  };
  
  return (
    <div>
      {!user ? (
        <>
          <Navbar />
          <Home />
        </>
      ) : (
        <>
          <NavbarSearch />
          <Search
            productsData={products}
            onProductAdded={handleProductAdded}
          />
        </>
      )}
    </div>
  );
}

export default App;
