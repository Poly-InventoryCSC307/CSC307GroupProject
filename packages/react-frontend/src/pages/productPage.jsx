import "./productPage.css"
import EditPricePopUp from "../components/EditPricePopUp";
import UpdateQuantityPopUp from "../components/UpdateQuantityPopUp";
import React, {useEffect, useMemo, useState} from "react";

export default function ProductScreen({ 
  initialProduct = null, 
  overlay = false,
  storeID =  "690aaa9be73854e0640a1927",     // Hard coded ID for one store
  onPriceUpdated,
  onQuantUpdated,
  onClose,
}) {

  const [product, setProduct] = useState(() => initialProduct || {});

  // state for the edit-price modal
  const [openEP, setOpenEP] = useState(false);
  const [submittingEP, setSubmittingEP] = useState(false);

  // close the "Edit Price" dialog safely
  const handleCloseEP = () => { if (!submittingEP) setOpenEP(false); };

  const handleSubmitEP = async ({price}) => {
    try {
      setSubmittingEP(true);

      const newPrice = Number(price ?? 0);

      if (newPrice < 0){
        throw new Error(`New Price is less than 0`);
      }

      const sku = String(product?.SKU || "").trim();
      if (!sku) throw new Error("Missing SKU for this product.");

      const res = await fetch(
        `http://localhost:8000/inventory/${storeID}/products`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            SKU: sku,
            price: Number(price),
          }),
        }
      );

      let data; try { data = await res.json(); } catch { data = {}; }
      if (!res.ok) {
        const msg = data?.message || data?.error || `Request failed with status ${res.status}`;
        throw new Error(msg);
      }

      setProduct((p) => ({ ...p, price: newPrice }));

      onPriceUpdated?.(sku, newPrice);

      setOpenEP(false);
    } catch (e) {
      alert(`Failed to save product (ProductPage): ${e.message}`);
    } finally {
      setSubmittingEP(false);
    }
  };

  // state for the update-quantity modal
  const [openUQ, setOpenUQ] = useState(false);
  const [submittingUQ, setSubmittingUQ] = useState(false);

  // close the "Update Quantity" dialog safely
  const handleCloseUQ = () => { if (!submittingUQ) setOpenUQ(false); };

  const handleSubmitUQ = async ({ delta }) => {
    try {
      setSubmittingUQ(true);

      const sku = String(product?.SKU || "").trim();
      if (!sku) throw new Error("Missing SKU for this product.");

      const prevTotal = Number(product?.total_quantity ?? product?.quantity ?? 0);
      const change = Number(delta);
      const nextTotal = prevTotal + change;

      if (!Number.isInteger(change)) {
        throw new Error("Please enter a integer value")
      }

      if (!Number.isFinite(change) || change === 0) {
        throw new Error("Please enter a non-zero numeric value.");
      }

      if (nextTotal < 0){
        throw new Error(`Quantity Below Zero: Try -${prevTotal} or more`);
      }

      const res = await fetch(
        `http://localhost:8000/inventory/${storeID}/products/${encodeURIComponent(sku)}/quantity`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            delta: Number(delta),
          }),
        }
      );

      let data; try { data = await res.json(); } catch { data = {}; }
      if (!res.ok) {
        const msg = data?.message || data?.error || `Request failed with status ${res.status}`;
        throw new Error(msg);
      }

      setProduct((p) => ({ ...p, quantity: nextTotal, total_quantity: nextTotal }));
      onQuantUpdated?.(sku, nextTotal);

      setOpenUQ(false);
    } catch (e) {
      alert(`Failed to save product (ProductPage): ${e.message}`);
    } finally {
      setSubmittingUQ(false);
    }
  };

  useEffect(() => {
    if (!overlay) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (openEP || openUQ) return;     // If the edit or update is open 
      onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose, openEP, openUQ]);  

  const name = product?.name || "—";
  const sku = product?.SKU || "—";
  const qtyTotal = Number(
    product?.total_quantity ?? product?.quantity ?? 0
  );
  const qtyFloor = Number(product?.quantity_on_floor ?? 0);
  const qtyBack = Number(product?.quantity_in_back ?? 0);
  const priceNum = Number(product?.price ?? 0);

  const imageURL = useMemo(() => {
    const raw =
      (product?.product_photo && String(product.product_photo)) ||
      (product?.imageURL && String(product.imageURL)) ||
      "";
    return raw.trim();
  }, [product]);

  if (overlay) {
    return (
      <div className="p-modal">
        <div className="p-modal__grid">
          {/* Left: image */}
          <div className="p-modal__image">
            {imageURL? (
              <img
                src={imageURL}
                alt={name || "Product"}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <span className="p-modal__image-placeholder">Product Picture</span>
            )}
          </div>

          {/* Right: details */}
          <aside className="p-modal__side">
            <div className="p-row"><span className="p-label">Product Name:</span><span className="p-val">{name }</span></div>
            <div className="p-row"><span className="p-label">SKU:</span><span className="p-val">{sku}</span></div>
            <div className="p-row"><span className="p-label">Quantity Total:</span><span className="p-val">{qtyTotal}</span></div>
            <div className="p-row"><span className="p-label">Quantity on Floor:</span><span className="p-val">{qtyFloor}</span></div>
            <div className="p-row"><span className="p-label">Quantity in Back:</span><span className="p-val">{qtyBack}</span></div>
            <div className="p-row"><span className="p-label">Price:</span><span className="p-val">${priceNum.toFixed(2)}</span></div>

            <div className="p-actions">
              <button className="btn-order">Order</button>
              <button className="btn-edit-price" onClick={() => setOpenEP(true)}>
                Edit Price
              </button>
              <button className="btn-update-quantity" onClick={() => setOpenUQ(true)}>
                Update Quantity
              </button>
            </div>
          </aside>
        </div>

        <EditPricePopUp open={openEP} onClose={handleCloseEP} onSubmit={handleSubmitEP} isSubmitting={submittingEP} />
        <UpdateQuantityPopUp open={openUQ} onClose={handleCloseUQ} onSubmit={handleSubmitUQ} isSubmitting={submittingUQ} />

        {/* Bottom: description */}
        <section className="p-modal__desc">
          <h3>Product Description:</h3>
          <p>{(String(product?.description || "").trim() || "No description provided.")}</p>

        </section>
      </div>
    );
  }

  // full-page version (leave as you had it)
  return (
    <div className={`app-shell ${overlay ? "" : "fullpage"}`}>
      {!overlay && <header className="topbar">{/* ... */}</header>}
      <main className="stage">{/* your existing full-page layout */}</main>
    </div>
  );
}
