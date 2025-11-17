import React, {useState, useEffect} from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

import Search from "./pages/Search";

function App() {
  
  const [products, setProducts] = useState([]);
  
  // Send to change the middle id depending on the store
  useEffect(() => {
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
      .catch((error) => {console.log(error); });
  }, []);

  const handleProductAdded = (cardData) => {
    setProducts((prev) => [cardData, ...prev]);
  };

  const handleProductRemoved = (SKU) => {
    setProducts(prev => prev.filter(p => (p.SKU || "").trim() !== (SKU || "".trim())));
  }
  
  return (
    <div>
      {/* Set LoggedIn to false for Sign Button or true for Logout Button */ }
      <Navbar isLoggedIn={true} showSearch={false}/>
      <Search 
        productsData={products} onProductAdded={handleProductAdded} onProductRemoved={handleProductRemoved}
      />

      {/* <Navbar />
      <Home /> */}
    </div>
  );
}

export default App;
