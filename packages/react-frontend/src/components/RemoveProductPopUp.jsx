import React, { useEffect, useRef, useState } from "react";
import "./RemoveProductPopUp.css";

function RemoveProductPopUp({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  const overlayRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    SKU: "",
    price: "",
    quantity: "",
    description: "",
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setForm({ name: "", SKU: "", price: "", quantity: "", description: "" });
  }, [open]);

  if (!open) return null;

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
      className="modal-overlay"
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="remove-product-title"
    >
      <div className="modal" role="document">
        <header className="modal-header">
          <h3 id="add-product-title">Remove Product</h3>
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
              {isSubmitting ? "Saving..." : "Save Product"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default AddProductPopUp