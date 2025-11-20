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
  // Use for opening and closing animations 
  const [show, setShow] = useState(open);
  const [closing, setClosing] = useState(false);

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
      SKU: form.SKU.trim(),
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
      aria-labelledby="remove-product-title"
    >
      <div className={`modal ${closing ? "closing" : ""}`} role="document">
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