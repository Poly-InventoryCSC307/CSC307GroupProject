import React, {useEffect, useRef, useState} from "react";
import "./PopUp.css";

function UpdateQuantityPopUp({
    open,
    onClose,
    onSubmit,
    isSubmitting,
}) {
  const overlayRef = useRef(null);
  const [form, setForm] = useState({ delta: "" });
    
  // Use for opening and closing animations 
  const [show, setShow] = useState(open);
  const [closing, setClosing] = useState(false);

  // When open allow the user to press esc to exit out 
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

    
  useEffect(() => {
    if (!open) return;
    setForm({ delta: "" });
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
      delta: Number(form.delta || 0),
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
    aria-labelledby="update-quant-title"
  >
    <div className={`modal ${closing ? "closing" : ""}`} role="document">
      <header className="modal-header">
        <h3 id="update-quant-title">Update Quantity</h3>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          X
        </button>
      </header>

      <form className="modal-content" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="delta">Change Quantity By (+-)</label>
          <input
            id="delta"
            name="delta"
            type="number"
            step="1"
            value={form.delta}
            onChange={handleChange}
            placeholder="e.g., 5 or -3"
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
            {isSubmitting ? "Updating Quantity..." : "Apply Change"}
          </button>
        </footer>
      </form>
    </div>
  </div>
  );
}



export default UpdateQuantityPopUp