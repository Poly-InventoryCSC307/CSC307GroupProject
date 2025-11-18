import React, {useEffect, useRef, useState} from "react";
import "./PopUp.css";

function UpdateQuantityPopUp({
    open,
    onClose,
    onSubmit,
    isSubmitting,
}) {
    const overlayRef = useRef(null);
        const [form, setForm] = useState({
        quantity: "",
      });
    
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose?.();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
      }, [open, onClose]);

    useEffect(() => {
        if (!open) return;
        setForm({quantity: ""});
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
            quantity: Number(form.quantity || 0),
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
      aria-labelledby="update-quant-title"
    >
      <div className="modal" role="document">
        <header className="modal-header">
          <h3 id="update-quant-title">Update Quantity</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            X
          </button>
        </header>

        <form className="modal-content" onSubmit={handleSubmit}>
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
              {isSubmitting ? "Updating Quantity..." : "Updated Quantity"}
            </button>
          </footer>
        </form>
      </div>
    </div>
    );
}



export default UpdateQuantityPopUp