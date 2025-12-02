import React, {useEffect, useRef, useState} from "react";
import "./PopUp.css";

function EditProductPopUp({
    open,
    onClose,
    onSubmit,
    isSubmitting,
    initialProduct,
}) {
  const overlayRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    SKU: "",
    price: "",
    quantity: "",
    description: "",
  });
    
  // Use for opening and closing animations 
  const [show, setShow] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // When it opens, populate from the product
  useEffect(() => {
    if (!open) return;
    setForm({
      name: initialProduct?.name ?? "",
      SKU: initialProduct?.SKU ?? "",
      price:
        initialProduct?.price !== undefined && initialProduct?.price !== null
          ? String(initialProduct.price)
          : "",
      quantity:
        (initialProduct?.total_quantity ??
          initialProduct?.quantity ??
          "") !== ""
          ? String(
              initialProduct?.total_quantity ?? initialProduct?.quantity ?? ""
            )
          : "",
      description: initialProduct?.description ?? "",
    });
  }, [open, initialProduct]);

  useEffect(() => {
    if (open) {
      setShow(true);
      setClosing(false);
      return;
    }
    if (show) {
      setClosing(true);
      const t = setTimeout(() => {
        setShow(false);
        setClosing(false);
      }, 250); 
      return () => clearTimeout(t);
    }
  }, [open, show]);

  if (!show) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      SKU: form.SKU.trim(),
      price: Number(form.price || 0),
      quantity: Number(form.quantity || 0),
      description: form.description.trim(),
    };
    onSubmit?.(payload);
  };

  return (
  <div
    className={`modal-overlay ${closing ? "closing" : ""}`}
    ref={overlayRef}
    onMouseDown={handleOverlayClick}
    aria-modal="true"
    role="dialog"
    aria-labelledby="edit-product-title"
  >
    <div className={`modal ${closing ? "closing" : ""}`} role="document">
      <header className="modal-header">
        <h3 id="edit-product-title">Edit Product Details</h3>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          X
        </button>
      </header>

      <form className="modal-content" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Product Name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g., Green Tea 16oz"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="SKU">SKU</label>
          <input
            id="SKU"
            name="SKU"
            value={form.SKU}
            onChange={handleChange}
            placeholder="e.g., GT-16-001"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="price">Price</label>
          <input
            id="price"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="e.g., 10.99"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            step="1"
            value={form.quantity}
            onChange={handleChange}
            placeholder="0"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="description">Product Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Short description..."
            rows={4}
          />
        </div>

        <footer className="modal-actions">
          <button
            type="button"
            className="btn ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={isSubmitting}>
            {isSubmitting ? "Updating Product..." : "Update Product"}
          </button>
        </footer>
      </form>
    </div>
  </div>
  );
}


export default EditProductPopUp