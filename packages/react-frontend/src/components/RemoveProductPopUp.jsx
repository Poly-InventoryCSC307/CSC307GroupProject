import React, { useEffect, useRef, useState } from "react";
import "./PopUp.css";

function RemoveProductPopUp({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  const overlayRef = useRef(null);
  const [form, setForm] = useState({
    SKU: "",
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setForm({ SKU: ""});
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
      SKU: form.SKU.trim(),
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
          <h3 id="remove-product-title">Remove Product By SKU</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            X
          </button>
        </header>

        <form className="modal-content" onSubmit={handleSubmit}>

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
              {isSubmitting ? "Removing..." : "Remove Product"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default RemoveProductPopUp