// Search.jsx
import "./Search.css";
import addProductIcon from "../assets/add-product-button.svg";
import removeProductIcon from "../assets/remove-product-button.svg";

import { API_BASE_URL } from "../apiConfig";

import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import AddProductPopUp from "../components/AddProductPopUp";
import RemoveProductPopUp from "../components/RemoveProductPopUp.jsx";

import ProductScreen from "./productPage.jsx";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { createPortal } from "react-dom";

const PRICE_MIN = 0;
const PRICE_MAX = Infinity; // The user can enter any amount into the price max
const PRICE_MAX_SLIDER = 1000; // Display only up to 1000 with the slider

const QTY_MIN = 0;
const QTY_MAX = Infinity; // The user can enter any amount into the quantity max
const QTY_MAX_SLIDER = 1000; // Display only up to 1000 with the slider

function Search({ productsData, onProductAdded, onProductRemoved, storeID }) {
  const [term, setTerm] = useState("");

  // state for the add-product modal
  const [openAdd, setOpenAdd] = useState(false);
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // close the "Add Product" dialog safely
  const handleCloseAdd = () => {
    if (!submittingAdd) setOpenAdd(false);
  };

  // state for the remove-product modal
  const [openRem, setOpenRem] = useState(false);
  const [submittingRem, setSubmittingRem] = useState(false);

  // close the "Remove Product" dialog safely
  const handleCloseRem = () => {
    if (!submittingRem) setOpenRem(false);
  };

  // state for the product overlay
  const [selected, setSelected] = useState(null);

  // update the main search grid with any new changes
  const [overrides, setOverrides] = useState({});

  const applyOverrides = useCallback(
    (list) =>
      (list ?? []).map((p) => {
        const base = p._baseSKU ?? p.SKU; // pick stable key
        const ov = overrides[base];
        // always keep _baseSKU on the object
        return ov ? { ...p, ...ov, _baseSKU: base } : { ...p, _baseSKU: base };
      }),
    [overrides],
  );

  const handleProductUpdated = (originalSku, patch) => {
    // update the product in the overlay
    setSelected((prev) => {
      if (!prev) return prev;
      const base = prev._baseSKU ?? prev.SKU;
      if (base !== originalSku) return prev;
      
      const merged = { ...prev, ...patch, _baseSKU: base };

      // normalize image fields if patch has an image
      if (patch.image) {
        merged.image = patch.image;
        merged.imageURL = patch.image;
      }

      return merged;
    });

    // update the overrides used by the grid
    setOverrides((prev) => {
      const overridesForOld = {
        ...(prev[originalSku] || {}),
        ...patch,
      };

      // normalize image in overrides too
      if (patch.image) {
        overridesForOld.image = patch.image;
        overridesForOld.imageURL = patch.image;
      }

      const next = {
        ...prev,
        [originalSku]: overridesForOld,
      };

      // if SKU changed, move overrides to the new SKU key
      const newSku =
        patch.SKU && patch.SKU !== originalSku ? patch.SKU : null;

      if (newSku) {
        next[newSku] = {
          ...(next[newSku] || {}),
          ...overridesForOld,
        };
        delete next[originalSku];
      }

      return next;
    });
  };

  // lock page scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow =
      selected || openAdd || openRem ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected, openAdd, openRem]);

  // submit handler (reuse existing POST; simplified here)
  const handleSubmitAdd = async (payload) => {
    try {
      setSubmittingAdd(true);
      // Check if SKU already exists
      const exists = (productsData ?? []).some(
        (p) =>
          String(p.SKU || "")
            .trim()
            .toLowerCase() ===
          String(payload.SKU || "")
            .trim()
            .toLowerCase(),
      );

      if (exists) {
        alert(`SKU "${payload.SKU}" already exists. Choose a different SKU`);
        setSubmittingAdd(false);
        return;
      }

      // upload image to polyproducts (name of s3 bucket)
      let imageURL = "";

      if (payload.imageFile) {
        const formData = new FormData();
        formData.append("image", payload.imageFile);
        
        const uploadRes = await fetch(`${API_BASE_URL}/upload/${storeID}`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error(`Image upload failed: ${errText || uploadRes.status}`)
        }

        const uploadData = await uploadRes.json();
        // adjust the property to whatever the api returns
        imageURL = uploadData.imageURL || uploadData.url || uploadData.location || "";
        if (!imageURL) {
          throw new Error("Image upload did not return an imageURL");
        }
      }

      const res = await fetch(
        `${API_BASE_URL}/inventory/${storeID}/products`, 
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name?.trim(),
          SKU: payload.SKU?.trim(),
          quantity: Number(payload.quantity ?? 0),
          description: payload.description?.trim() ?? "",
          price: Number(payload.price ?? 0),
          product_photo: imageURL // send this back to backend to store it
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) {
        if (res.status === 409) {
          throw new Error(data?.message || "SKU already exists.");
        }

        const msg =
          data?.message ||
          data?.error ||
          `Request failed with status ${res.status}`;
        throw new Error(msg);
      }

      const saved = data;
      const cardData = {
        name: saved.name ?? payload.name ?? "",
        imageURL: saved.imageURL ?? saved.product_photo ?? "",
        SKU: saved.SKU ?? saved.sku ?? payload.SKU ?? "",
        price: Number(saved.price ?? 0),
        quantity: Number(
          saved.quantity ?? saved.total_quantity ?? payload.quantity ?? 0,
        ),
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

      const sku = String(payload.SKU).trim();
      if (!sku) {
        throw new Error("SKU is required");
      }

      const product = (productsData ?? []).find((p) => 
        String(p.SKU).trim().toLowerCase() === sku.toLowerCase()
      );

      let imageKey = "";

      if (product) {
        const raw = (product.product_photo && String(product.product_photo).trim()) ||
          (product.imageURL && String(product.imageURL).trim()) ||
          "";

        if (raw) {
          if (raw.startsWith("http://") || raw.startsWith("https://")) {
            try {
              const u = new URL(raw);
              if (u.hostname === "polyproducts.s3.amazonaws.com") {
                imageKey = u.pathname.replace(/^\/+/, "");
              }
            } catch {
              throw Error("Couldn't delete Image, so can't delete product.");
            }
          } else {
            imageKey = raw;
          }
        } else {console.error("issue with raw url")}
      } else {
        console.error("issue with getting product");
      }
      if (imageKey) {
        try { 
          const resFile = await fetch(
          `${API_BASE_URL}/images/file/${encodeURIComponent(imageKey)}`,
          {
            method: "DELETE",
          })
          if (!resFile.ok) {
            console.warn("Failed to delete image from S3",
            resFile.status,
          );
          } else {
            const fileData = await resFile.json();
            console.log("Image deleted:", fileData);
          }
        } catch (err) {
          console.warn("Error when deleting image from S3", err);
        }
      } else {
        console.error("issue, can't get imageKey");
      }
      

      const res = await fetch(
        `${API_BASE_URL}/inventory/${storeID}/products`, 
        {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          SKU: payload.SKU?.trim(),
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          `Request failed with status ${res.status}`;
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
    priceMin: PRICE_MIN,
    priceMax: PRICE_MAX,
    qtyMin: QTY_MIN,
    qtyMax: QTY_MAX,
  });

  // filter states
  const [sortBy, setSortBy] = useState("name-asc");

  // where the filter slider should be
  const priceMinVal = Number.isFinite(filters.priceMin)
    ? Math.min(filters.priceMin, PRICE_MAX_SLIDER)
    : PRICE_MIN;
  const priceMaxVal = Number.isFinite(filters.priceMax)
    ? Math.min(filters.priceMax, PRICE_MAX_SLIDER)
    : PRICE_MAX_SLIDER;

  // how full the slider bar should be
  const priceMinPercent =
    ((priceMinVal - PRICE_MIN) / (PRICE_MAX_SLIDER - PRICE_MIN)) * 100;

  const priceMaxPercent =
    ((priceMaxVal - PRICE_MIN) / (PRICE_MAX_SLIDER - PRICE_MIN)) * 100;

  // where the filter slider should be
  const qtyMinVal = Number.isFinite(filters.qtMin)
    ? Math.min(filters.qtyMin, QTY_MAX_SLIDER)
    : QTY_MIN;

  const qtyMaxVal = Number.isFinite(filters.qtMax)
    ? Math.min(filters.qtyMax, QTY_MAX_SLIDER)
    : QTY_MAX_SLIDER;

  // how full the slider bar should be
  const qtyMinPercent =
    ((qtyMinVal - QTY_MIN) / (QTY_MAX_SLIDER - QTY_MIN)) * 100;

  const qtyMaxPercent =
    ((qtyMaxVal - QTY_MIN) / (QTY_MAX_SLIDER - QTY_MIN)) * 100;

  const withOverrides = useMemo(
    () => applyOverrides(productsData ?? []),
    [productsData, applyOverrides],
  );

  // Removes products that don't fit with the given filters
  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    const bySearch = !q
      ? withOverrides
      : withOverrides.filter((p) =>
          [p.name, p.SKU].some((v) =>
            String(v || "")
              .toLowerCase()
              .includes(q),
          ),
        );

    return bySearch.filter((p) => {
      if (
        filters.inStockOnly &&
        Number(p.quantity ?? p.total_quantity ?? 0) <= 0
      ) {
        return false;
      }
      if (
        Number.isFinite(filters.priceMin) &&
        Number(p.price ?? 0) < filters.priceMin
      ) {
        return false;
      }
      if (
        Number.isFinite(filters.priceMax) &&
        Number(p.price ?? 0) > filters.priceMax
      ) {
        return false;
      }
      if (
        Number.isFinite(filters.minQty) &&
        Number(p.quantity ?? p.total_quantity ?? 0) < filters.minQty
      ) {
        return false;
      }
      if (
        Number.isFinite(filters.maxQty) &&
        Number(p.quantity ?? p.total_quantity ?? 0) > filters.maxQty
      ) {
        return false;
      }

      return true;
    });
  }, [withOverrides, term, filters]);

  // Sorts the products cards based on the given filters
  const sorted = useMemo(() => {
    const sortedList = [...filtered];
    const cmpStr = (a, b, key) =>
      String(a[key] || "").localeCompare(String(b[key] || ""), undefined, {
        sensitivity: "base",
        numeric: true,
      });
    const num = (v) => Number(v ?? 0);
    const cmpNum = (a, b, key) => num(a[key]) - num(b[key]);
    switch (sortBy) {
      case "name-asc":
        sortedList.sort((a, b) => cmpStr(a, b, "name"));
        break;
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
      case "sku-desc":
        sortedList.sort((a, b) => cmpStr(b, a, "SKU"));
        break;
      default:
        break;
    }
    return sortedList;
  }, [filtered, sortBy]);

  // final list to show
  // how many cards are currently visible
  const PAGE = 12; // initial batch size
  const [visible, setVisible] = useState(PAGE);

  // grow when new products come in (keep showing all that were visible)
  useEffect(() => {
    setVisible((v) => Math.max(v, Math.min(PAGE, sorted.length)));
  }, [sorted.length]);

  // intersection observer for the sentinel
  const loaderRef = useRef(null);
  useEffect(() => {
    if (!loaderRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setVisible((v) => Math.min(v + PAGE, sorted.length));
        }
      },
      { rootMargin: "800px 0px" },
    ); // pre-load ahead
    io.observe(loaderRef.current);
    return () => io.disconnect();
  }, [sorted.length]);

  // const [portalProduct, setPortalProduct] = useState(null);
  const [overlayClosing, setOverlayClosing] = useState(false);

  const closeOverlay = () => {
    setOverlayClosing(true);
    setTimeout(() => {
      setOverlayClosing(false);
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
          {/* adding sort by to the filters column, dropdown */}
          <div className="sort-body">
            <label htmlFor="sortSelect">Sort By</label>
            <select
              id="sortSelect"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="sku-asc">SKU (A-Z)</option>
              <option value="sku-desc">SKU (Z-A)</option>
            </select>
          </div>
          <div className="filters-body">
            <h2>Filters</h2>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, inStockOnly: e.target.checked }))
                }
              />
              In Stock Only
            </label>

            {/* filter for price with range sliders */}
            <div className="filter-row">
              <div className="filter-label">
                <label> Price Range</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  <input
                    type="number"
                    placeholder="Min Price"
                    className="price-input"
                    value={
                      Number.isFinite(filters.priceMin) ? filters.priceMin : ""
                    }
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        setFilters((f) => ({ ...f, priceMin: PRICE_MIN }));
                        return;
                      }
                      const val = Number(raw);
                      setFilters((f) => ({
                        ...f,
                        priceMin: Math.min(
                          val,
                          Number.isFinite(f.priceMax) ? f.priceMax : PRICE_MAX,
                        ),
                      }));
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    className="price-input"
                    value={
                      Number.isFinite(filters.priceMax) ? filters.priceMax : ""
                    }
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        setFilters((f) => ({ ...f, priceMax: PRICE_MAX }));
                        return;
                      }
                      const val = Number(raw);
                      setFilters((f) => ({
                        ...f,
                        priceMax: Math.max(
                          val,
                          Number.isFinite(f.priceMin) ? f.priceMin : PRICE_MIN,
                        ),
                      }));
                    }}
                  />
                </div>
                <div className="range-slider">
                  <div className="range-slider__track" />
                  <div
                    className="range-slider__range"
                    style={{
                      left: `${priceMinPercent}%`,
                      right: `${100 - priceMaxPercent}%`,
                    }}
                  />
                  <input
                    type="range"
                    min={PRICE_MIN}
                    max={PRICE_MAX_SLIDER}
                    value={priceMinVal}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFilters((f) => {
                        const newMin = Math.min(
                          val,
                          Number.isFinite(f.priceMax) ? f.priceMax : PRICE_MAX,
                        );
                        return { ...f, priceMin: newMin };
                      });
                    }}
                    className="range-slider__thumb"
                  />
                  <input
                    type="range"
                    min={PRICE_MIN}
                    max={PRICE_MAX_SLIDER}
                    value={priceMaxVal}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFilters((f) => {
                        const newMax = Math.max(
                          val,
                          Number.isFinite(f.priceMin) ? f.priceMin : 0,
                        );
                        return { ...f, priceMax: newMax };
                      });
                    }}
                    className="range-slider__thumb"
                  />
                </div>
              </div>
            </div>

            {/* filter for quantity with range sliders */}
            <div className="filter-row">
              <div className="filter-label" style={{ gridColumn: "1/-1" }}>
                <label> Quantity Range</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  <input
                    type="number"
                    placeholder="Min Qty"
                    className="price-input"
                    value={
                      Number.isFinite(filters.minQty) ? filters.minQty : ""
                    }
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        setFilters((f) => ({ ...f, minQty: QTY_MIN }));
                        return;
                      }
                      const val = Number(raw);
                      setFilters((f) => ({
                        ...f,
                        minQty: Math.min(
                          val,
                          Number.isFinite(f.maxQty) ? f.maxQty : QTY_MAX,
                        ),
                      }));
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Max Qty"
                    className="price-input"
                    value={
                      Number.isFinite(filters.maxQty) ? filters.maxQty : ""
                    }
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "") {
                        setFilters((f) => ({ ...f, maxQty: QTY_MAX }));
                        return;
                      }
                      const val = Number(raw);
                      setFilters((f) => ({
                        ...f,
                        maxQty: Math.max(
                          val,
                          Number.isFinite(f.minQty) ? f.minQty : QTY_MIN,
                        ),
                      }));
                    }}
                  />
                </div>
                <div className="range-slider">
                  <div className="range-slider__track" />
                  <div
                    className="range-slider__range"
                    style={{
                      left: `${qtyMinPercent}%`,
                      right: `${100 - qtyMaxPercent}%`,
                    }}
                  />
                  {/* min */}
                  <input
                    type="range"
                    min={QTY_MIN}
                    max={QTY_MAX_SLIDER}
                    value={qtyMinVal}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFilters((f) => {
                        const newMin = Math.min(
                          val,
                          Number.isFinite(f.maxQty) ? f.maxQty : QTY_MAX,
                        );
                        return { ...f, minQty: newMin };
                      });
                    }}
                    className="range-slider__thumb"
                  />
                  {/* max */}
                  <input
                    type="range"
                    min={QTY_MIN}
                    max={QTY_MAX_SLIDER}
                    value={qtyMaxVal}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFilters((f) => {
                        const newMax = Math.max(
                          val,
                          Number.isFinite(f.minQty) ? f.minQty : QTY_MIN,
                        );
                        return { ...f, maxQty: newMax };
                      });
                    }}
                    className="range-slider__thumb"
                  />
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setFilters({
                inStockOnly: false,
                priceMin: Infinity,
                priceMax: Infinity,
                minQty: QTY_MIN,
                maxQty: QTY_MAX,
              });
              setSortBy("name-asc");
            }}
            className="filter-clear"
          >
            Clear Filters
          </button>
        </aside>

        <div className="results-wrap">
          <div className="results-grid">
            {sorted.slice(0, visible).map((p) => (
              <button
                key={p.SKU}
                className="product-card-button"
                onClick={() =>
                  setSelected({
                    ...p,
                    _baseSKU: p._baseSKU ?? p.SKU, // remember the original SKU
                  })
                }
                aria-label={`Open ${p.name}`}
                title={`Open ${p.name}`}
              >
                <ProductCard {...p} />
              </button>
            ))}
          </div>
          {/* sentinel for infinite scroll */}
          {visible < sorted.length && (
            <div ref={loaderRef} className="grid-sentinel" />
          )}
        </div>
      </div>

      <AddProductPopUp
        open={openAdd}
        onClose={handleCloseAdd}
        onSubmit={handleSubmitAdd}
        isSubmitting={submittingAdd}
      />

      <RemoveProductPopUp
        open={openRem}
        onClose={handleCloseRem}
        onSubmit={handleSubmitRem}
        isSubmitting={submittingRem}
      />

      {selected &&
        createPortal(
          <div
            className={`overlay ${overlayClosing ? "closing" : ""}`}
            role="dialog"
            aria-modal="true"
            onMouseDown={closeOverlay}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* backdrop */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,.45)",
                backdropFilter: "blur(4px)",
              }}
            />

            {/* panel wrapper */}
            <div
              onMouseDown={(e) => e.stopPropagation()} // don't close when clicking inside
              style={{
                position: "relative",
                width: "min(1120px, 95vw)",
                maxHeight: "90vh",
                borderRadius: 16,
                boxShadow: "0 24px 80px rgba(0,0,0,.35)",
                background: "transparent",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* scrollable body */}
              <div
                style={{
                  maxHeight: "90vh",
                  overflowY: "auto",
                  background: "#fff",
                  borderRadius: 16,
                  padding: 20,
                }}
                className={overlayClosing ? "closing" : ""}
              >
                <div className={`p-modal ${overlayClosing ? "closing" : ""}`}>
                  <ProductScreen
                    initialProduct={selected}
                    baseSKU={selected?._baseSKU ?? selected?.SKU}
                    overlay
                    storeID={storeID}
                    onClose={closeOverlay}
                    onProductUpdated={handleProductUpdated}
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
export default Search;
