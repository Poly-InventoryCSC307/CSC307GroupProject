// Search.jsx
import "./Search.css";
import addProductIcon from "../assets/add-product-button.svg";
import removeProductIcon from "../assets/remove-product-button.svg";

import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import AddProductPopUp from "../components/AddProductPopUp";
import RemoveProductPopUp from "../components/RemoveProductPopUp.jsx";

import ProductScreen from "./productPage.jsx"; 
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

function Search({ 
  productsData, 
  onProductAdded, 
  onProductRemoved, 
  storeID ,           // "690aaa9be73854e0640a1927"
}) {
  const [term, setTerm] = useState("");

  // state for the add-product modal
  const [openAdd, setOpenAdd] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // close the "Add Product" dialog safely
  const handleCloseAdd = () => { if (!submittingAdd) setOpenAdd(false); };

  // state for the remove-product modal
  const [openRem, setOpenRem] = useState(false);
  const [submittingRem, setSubmittingRem] = useState(false);

  // close the "Remove Product" dialog safely
  const handleCloseRem = () => { if (!submittingRem) setOpenRem(false); };

  // state for the product overlay
  const [selected, setSelected] = useState(null);

  // update the price and quantity
  const [priceOverrides, setPriceOverrides] = useState({});
  const [quantOverrides, setQuanOverrides] = useState({});
  const applyOverrides = (list) =>
    (list ?? []).map(p => ({
      ...p,
      ...(priceOverrides[p.SKU] != null ? { price: priceOverrides[p.SKU] } : null),
      ...(quantOverrides[p.SKU] != null ? { quantity: quantOverrides[p.SKU] } : null),
    }));

  // lock page scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = (selected || openAdd || openRem) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected, openAdd, openRem]);

  // submit handler (reuse existing POST; simplified here)
  const handleSubmitAdd = async (payload) => {
    try {
      setSubmittingAdd(true);
      // Check if SKU already exists
      const exists = (productsData ?? []).some(
        p => String(p.SKU || "").trim().toLowerCase() === String(payload.SKU || "").trim().toLowerCase()
      );

      if (exists){
        alert(`SKU "${payload.SKU}" already exists. Choose a different SKU`);
        setSubmittingAdd(false);
        return;
      }
      
      const res = await fetch(
        `http://localhost:8000/inventory/${storeID}/products`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: payload.name?.trim(),
            SKU: payload.SKU?.trim(),
            quantity: Number(payload.quantity ?? 0),
            description: payload.description?.trim() ?? "",
            price: Number(payload.price ?? 0),
          }),
        }
      );

      let data; try { data = await res.json(); } catch { data = {}; }
      if (!res.ok) {
        if (res.status === 409){
          throw new Error(data?.message || "SKU already exists.");
        }

        const msg = data?.message || data?.error || `Request failed with status ${res.status}`;
        throw new Error(msg);
      }

      const saved = data;
      const cardData = {
        name: saved.name ?? payload.name ?? "",
        imageURL: saved.imageURL ?? saved.product_photo ?? "",
        SKU: saved.SKU ?? saved.sku ?? payload.SKU ?? "",
        price: Number(saved.price ?? 0),
        quantity: Number(saved.quantity ?? saved.total_quantity ?? payload.quantity ?? 0),
        description: saved.description ?? payload.description ?? "",
      };

      onProductAdded?.(cardData);
      setOpenAdd(false);
    } catch (e) {
      alert(`Failed to save product (Search): ${e.message}`);
    } finally {
      setSubmittingAdd(false);
    }
  };

  // submit handler for DELETE
  const handleSubmitRem = async (payload) => {
    try {
      setSubmittingRem(true);
      const res = await fetch(
        `http://localhost:8000/inventory/${storeID}/products`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            SKU: payload.SKU?.trim(),
          }),
        }
      );

      let data; try { data = await res.json(); } catch { data = {}; }
      if (!res.ok) {
        const msg = data?.message || data?.error || `Request failed with status ${res.status}`;
        throw new Error(msg);
      }

      onProductRemoved?.(payload.SKU?.trim());
      setOpenRem(false);
    } catch (e) {
      alert(`Failed to remove product: ${e.message}`);
    } finally {
      setSubmittingRem(false);
    }
  };

  //starter filters
  const [filters, setFilters] = useState({
    inStockOnly: false,
    priceMin: Infinity,
    priceMax: Infinity
  });
  const [sortBy, setSortBy] = useState("name-asc");


  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    const withBoth = applyOverrides(productsData ?? []);
    const bySearch = !q ? withBoth: withBoth.filter((p) => [p.name, p.SKU].some((v) => String(v || "").toLowerCase().includes(q)));
    // if (!q) return withBoth;
    // return withBoth.filter((p) =>
    //   [p.name, p.SKU].some((v) => 
    //     String(v || "").toLowerCase().includes(q)
    //   )
    // );
    return bySearch.filter((p) => {
      if(filters.inStockOnly && (Number(p.quantity ?? p.total_quantity ?? 0) <= 0)) {
        return false;
      }
      if(Number.isFinite(filters.priceMin) && (Number(p.price ?? 0) < filters.priceMin)) {
        return false;
      }
      if(Number.isFinite(filters.priceMax) && (Number(p.price ?? 0) > filters.priceMax)) {
        return false;
      }
      return true;  
    });
  }, [productsData, term, priceOverrides, quantOverrides, filters]);

  const sorted = useMemo(() => {
    const sortedList = [...filtered];
    const cmpStr = (a, b, key) => 
      String(a[key] || "").localeCompare(String(b[key] || ""), undefined, {
        sensitivity: "base", numeric: true
      });
    const num = (v) => Number(v ?? 0);
    const cmpNum = (a, b, key) => num(a[key]) - num(b[key]);
    switch (sortBy) {
      case "name-desc":
        sortedList.sort((a, b) => cmpStr(b, a, "name"));
        break;
      case "price-asc":
        sortedList.sort((a, b) => cmpNum(a, b, "price"));
        break;
      case "price-desc":
        sortedList.sort((a, b) => cmpNum(b, a, "price"));
        break;
      case "sku-asc":
        sortedList.sort((a, b) => cmpStr(a, b, "SKU"));
        break;
      case "name-asc":
      default:
        sortedList.sort((a, b) => cmpStr(a, b, "name"));
        break;
    }
    return sortedList;
  }, [filtered, sortBy]);

  // final list to show
  // how many cards are currently visible
  const PAGE = 12;                          // initial batch size
  const [visible, setVisible] = useState(PAGE);

  // grow when new products come in (keep showing all that were visible)
  useEffect(() => {
    setVisible(v => Math.max(v, Math.min(PAGE, filtered.length)));
  }, [filtered.length]);

  // intersection observer for the sentinel
  const loaderRef = useRef(null);
  useEffect(() => {
    if (!loaderRef.current) return;
    const io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        setVisible(v => Math.min(v + PAGE, filtered.length));
      }
    }, { rootMargin: "800px 0px" }); // pre-load ahead
    io.observe(loaderRef.current);
    return () => io.disconnect();
  }, [filtered.length]);

  const [portalProduct, setPortalProduct] = useState(null);
  const [overlayClosing, setOverlayClosing] = useState(false);

  // whenever a product is selected, sync it into the portal
  useEffect(() => {
    if (selected) setPortalProduct(selected);
  }, [selected]);

  const closeOverlay = () => {
    setOverlayClosing(true);
    setTimeout(() => {
      setOverlayClosing(false);
      setPortalProduct(null);
      setSelected(null);
    }, 250); // match CSS overlayOut/panelOut timing
  };

  return (
    <section className="hero">
      {/* search + add product row remains */}
      <div className="search-line">
        <div className="search-bar-container">
            <SearchBar onSearch={setTerm} />
        </div>
        {/* Add Product Button*/}
        <button 
          type="button"
          className="add-product"
          onClick={() => setOpenAdd(true)}  
          aria-label="Add Product"
          title="Add Product"
          style={{ border: "none" }}
        >
          <img src={addProductIcon} alt="" />
        </button>

        {/* Remove Product Button*/}
        <button 
          type="button"
          className="remove-product"
          onClick={() => setOpenRem(true)}   
          aria-label="Remove Product"
          title="Remove Product"
          style={{ border: "none" }}
        >
          <img src={removeProductIcon} alt="" />
        </button>
      </div>

        {/* GRID */}
        <div className="content-wrap">
          <aside className="filters-panel">
             <div className="sort-body">
              <label htmlFor="sortSelect">Sort By</label>
              <select
                id="sortSelect"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="sku-asc">SKU</option>
                </select>
                </div>
            <div className="filters-body">
            <h2>Filters</h2>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={e => setFilters(f => ({ ...f, inStockOnly: e.target.checked }))}
              />
              In Stock Only
              
            </label>
            <h3>Price Range</h3>
            <div className="filter-row">
              <div className="filter-label">
                <label htmlFor="minPrice">Min Price</label>
              <input
                type="number"
                placeholder = "Min Price"
                value = {Number.isFinite(filters.priceMin) ? filters.priceMin : ""}
                onChange={e => setFilters(f => ({ ...f, priceMin: e.target.valueAsNumber }))}
                className="price-input"
              />
              </div>
              <div className="filter-label">
                <label htmlFor="maxPrice">Max Price</label>
              <input
                type="number"
                placeholder = "Max Price"
                value = {Number.isFinite(filters.priceMax) && filters.priceMax !== Infinity ? filters.priceMax: ""}
                onChange={(e) => setFilters((f) => ({...f, priceMax: Number(e.target.value) || Infinity}))}
                className="price-input"
            />
            </div>
            </div>
              </div>           
            <button
              type="button"
              onClick={() => {
                setFilters({
                  inStockOnly: false, 
                  priceMin: Infinity, 
                  priceMax: Infinity
              });
              setSortBy("name-asc");
            }
            }
              className="filter-clear"
              >
                Clear Filters
            </button>
          </aside>

          <div className="results-wrap">
            <div className="results-grid">
              {(filtered.slice(0, visible)).map((p) => (
                <button
                  key={p.SKU}
                  className="product-card-button"
                  onClick={() => setSelected(p)}
                  aria-label={`Open ${p.name}`}
                  title={`Open ${p.name}`}
                >
                  <ProductCard {...p} />
                </button>
              ))}
            </div>
            {/* sentinel for infinite scroll */}
            {visible < filtered.length && <div ref={loaderRef} className="grid-sentinel" />}
          </div>
          </div>

        <AddProductPopUp open={openAdd} onClose={handleCloseAdd} onSubmit={handleSubmitAdd} isSubmitting={submittingAdd} />

        <RemoveProductPopUp open={openRem} onClose={handleCloseRem} onSubmit={handleSubmitRem} isSubmitting={submittingRem} />

        {selected && createPortal(
          <div
            className={`overlay ${overlayClosing ? "closing" : ""}`}
            role="dialog"
            aria-modal="true"
            onMouseDown={closeOverlay}
            style={{
              position: "fixed", inset: 0, zIndex: 2000,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            {/* backdrop */}
            <div
              style={{
                position: "absolute", inset: 0,
                background: "rgba(0,0,0,.45)",
                backdropFilter: "blur(4px)"
              }}
            />

            {/* panel wrapper */}
            <div
              onMouseDown={e => e.stopPropagation()}              // don't close when clicking inside
              style={{
                position: "relative",
                width: "min(1120px, 95vw)",
                maxHeight: "90vh",
                borderRadius: 16,
                boxShadow: "0 24px 80px rgba(0,0,0,.35)",
                background: "transparent",
                display: "flex",
                flexDirection: "column"
              }}
            >
              {/* close button */}
              <button
                onClick={closeOverlay}
                aria-label="Close"
                style={{
                  position: "absolute",
                  top: 16,
                  right: 15,
                  zIndex: 1,
                  width: 36,
                  height: 36,
                  border: "none",
                  borderRadius: 999,
                  background: "#fff",
                  fontSize: 22,
                  fontWeight: 700,
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 3px 8px rgba(0,0,0,.25)",
                  cursor: "pointer",
                  color: "#111",       // makes the × visible
                  lineHeight: 1
                }}
              >
                X
              </button>

              {/* scrollable body */}
              <div
                style={{
                  maxHeight: "90vh", overflowY: "auto",
                  background: "#fff", borderRadius: 16, padding: 20
                }}
                className={overlayClosing ? "closing" : ""}
              >
                <div className={`p-modal ${overlayClosing ? "closing" : ""}`}>
                  <ProductScreen
                    initialProduct={selected}
                    overlay
                    onClose={closeOverlay}
                    onPriceUpdated={(sku, newPrice) => {
                      // Update overlay immediately
                      setSelected((prev) =>
                        prev && prev.SKU === sku ? { ...prev, price: newPrice } : prev
                      );
                      // Update product grid too
                      setPriceOverrides((prev) => ({ ...prev, [sku]: newPrice }));
                    }}
                    onQuantUpdated={(sku, newQuantity) => {
                      // Update overlay immediately
                      setSelected((prev) =>
                        prev && prev.SKU === sku ? { ...prev, quantity: newQuantity } : prev
                      );
                      // Update product grid too
                      setQuanOverrides((prev) => ({ ...prev, [sku]: newQuantity }));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
        </section>
    );
}
export default Search
