import React, { useEffect, useRef, useState } from "react";
import "./PopUp.css";

function AddProductPopUp({ open, onClose, onSubmit, isSubmitting }) {
  const overlayRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    SKU: "",
    price: "",
    quantity: "",
    description: "",
    image: "",
  });

  // Use for opening and closing animations
  const [show, setShow] = useState(open);
  const [closing, setClosing] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // Close the popup with escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setForm({ name: "", SKU: "", price: "", quantity: "", description: "" });
    setImageFile(null);
  }, [open]);

  // Add transition between opening and closing
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      SKU: form.SKU.trim(),
      price: Number(form.price || 0),
      quantity: Number(form.quantity || 0),
      description: form.description.trim(),
      imageFile,
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
      aria-labelledby="add-product-title"
    >
      <div className={`modal ${closing ? "closing" : ""}`} role="document">
        <header className="modal-header">
          <h3 id="add-product-title">Add Product</h3>
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

          <div className="field">
            <label htmlFor="img">Image</label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>

          <footer className="modal-actions">
            <button
              type="submit"
              className="btn submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Product"}
            </button>
            <button
              type="button"
              className="btn cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default AddProductPopUp;
