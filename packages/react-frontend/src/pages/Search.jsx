// Search.jsx
import "./Search.css";
import addProductIcon from "../assets/add-product-button.svg";
import removeProductIcon from "../assets/remove-product-button.svg";

import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import AddProductPopUp from "../components/AddProductPopUp";
import RemoveProductPopUp from "../components/RemoveProductPopUp.jsx";

import ProductScreen from "./productPage.jsx"; // <-- add this import
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

function Search({ productsData, onProductAdded, onProductRemoved }) {
  const [term, setTerm] = useState("");

// state for the add-product modal
const [open, setOpen] = useState(false);
const [submitting, setSubmitting] = useState(false);

// close the "Add Product" dialog safely
const handleClose = () => { if (!submitting) setOpen(false); };

// state for the remove-product modal
const [openR, setOpenR] = useState(false);
const [submittingR, setSubmittingR] = useState(false);

// close the "Remove Product" dialog safely
const handleCloseR = () => { if (!submittingR) setOpenR(false); };

// state for the product overlay
const [selected, setSelected] = useState(null);
const closeOverlay = () => setSelected(null);

// keep this effect if you want to lock page scroll when overlay is open
useEffect(() => {
  document.body.style.overflow = selected ? "hidden" : "";
  return () => { document.body.style.overflow = ""; };
}, [selected]);

// submit handler (reuse existing POST; simplified here)
const handleSubmit = async (payload) => {
  try {
    setSubmitting(true);
    // Check if SKU already exists
    const exists = (productsData ?? []).some(
      p => String(p.SKU || "").trim().toLocaleLowerCase() === String(payload.SKU || "").trim().toLocaleLowerCase()
    );

    if (exists){
      alert(`SKU "${payload.SKU}" already exists. Choose a different SKU`);
      setSubmitting(false);
      return;
    }
    
    const res = await fetch(
      "http://localhost:8000/inventory/690aaa9be73854e0640a1927/products",
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
        throw new Errow(data?.message || "SKU already exists.");
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
    setOpen(false);
  } catch (e) {
    alert(`Failed to save product: ${e.message}`);
  } finally {
    setSubmitting(false);
  }
};

// submit handler for DELETE
const handleSubmitR = async (payload) => {
  try {
    setSubmittingR(true);
    const res = await fetch(
      "http://localhost:8000/inventory/690aaa9be73854e0640a1927/products",
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

    // const saved = data;
    // const cardData = {
    //   name: saved.name ?? payload.name ?? "",
    //   imageURL: saved.imageURL ?? saved.product_photo ?? "",
    //   SKU: saved.SKU ?? saved.sku ?? payload.SKU ?? "",
    //   price: Number(saved.price ?? 0),
    //   quantity: Number(saved.quantity ?? saved.total_quantity ?? payload.quantity ?? 0),
    // };

    onProductRemoved?.(payload.SKU?.trim());
    setOpenR(false);
  } catch (e) {
    alert(`Failed to remove product: ${e.message}`);
  } finally {
    setSubmittingR(false);
  }
};

  // filter by search term (optional)
  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return productsData ?? [];
    return (productsData ?? []).filter(p =>
      [p.name, p.SKU].some(v => String(v || "").toLowerCase().includes(q))
    );
  }, [productsData, term]);

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
          onClick={() => setOpen(true)}   // <— no separate handleOpen needed
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
          onClick={() => setOpenR(true)}   // <— no separate handleOpen needed
          aria-label="Remove Product"
          title="Remove Product"
          style={{ border: "none" }}
          >
          <img src={removeProductIcon} alt="" />
        </button>

      </div>

      {/* GRID */}
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

      <AddProductPopUp open={open} onClose={handleClose} onSubmit={handleSubmit} isSubmitting={submitting} />

      <RemoveProductPopUp open={openR} onClose={handleCloseR} onSubmit={handleSubmitR} isSubmitting={submittingR} />

      {selected && createPortal(
        <div
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
            >
              <ProductScreen initialProduct={selected} overlay />
            </div>
          </div>
        </div>,
        document.body
      )}
      </section>
  );
}
export default Search