import React, {useState, useEffect} from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

import Search from "./pages/Search";

function App() {
  
  const [products, setProducts] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [storeLocation, setStoreLocation] = useState(null);
  const storeID = "690aaa9be73854e0640a1927";     // Change this to be dynamic
  
  // Send to change the middle id depending on the store
  useEffect(() => {
    // Get the store name
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
        setStoreLocation(hasAny ? { address, city, state, zip } : null);
      })
      .catch((err) => {
        console.error("Failed to get store data: ", err);
        setStoreName("My Store")
        setStoreLocation(null);
      });
  }, [storeID]);
  useEffect(() => {  
    // Get the products of the store 
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
        setProducts(cardData)

      })
      .catch((error) => {console.log(error); });
  }, []);

  const handleProductAdded = (cardData) => {
    setProducts((prev) => [cardData, ...prev]);
  };

  const handleProductRemoved = (SKU) => {
    setProducts(prev => prev.filter(p => (p.SKU || "").trim() !== (SKU || "").trim()));
  }
  
  return (
    <div>
      {/* Set LoggedIn to false for Sign Button or true for Logout Button */ }
      <Navbar 
        isLoggedIn={true}  
        showSearch={false} 
        storeName={storeName}
        storeLocation={storeLocation}
      />
      <Search 
        productsData={products} 
        onProductAdded={handleProductAdded} 
        onProductRemoved={handleProductRemoved}
        storeID={storeID}
      />

      {/* <Navbar />
      <Home /> */}
    </div>
  );
}

export default App;
