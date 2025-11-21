import React, {useState, useEffect} from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

import NavbarSearch from "./components/Navbar_search";
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
      .then((error) => {console.log(error); });
  }, []);

  const handleProductAdded = (cardData) => {
    setProducts((prev) => [cardData, ...prev]);
  };
  
  return (
    <div>
      <NavbarSearch />
      <Search 
        productsData={products} onProductAdded={handleProductAdded}
      />

      {/* <Navbar />
      <Home /> */}
    </div>
  );
}

export default App;
