import React, { useEffect, useRef, useState } from "react";
import "./PopUp.css";

function LogOutPopUp({ open, onClose, onConfirm, isSubmitting }) {
  const overlayRef = useRef(null);

  // Use for opening and closing animations
  const [show, setShow] = useState(open);
  const [closing, setClosing] = useState(false);

  // Close the popup with escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
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

  // If you click outside the overlay, close it
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  // Once you confirm to logout, sign the user out
  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm?.(); // tell parent: “user confirmed logout”
  };

  return (
    <div
      className={`modal-overlay ${closing ? "closing" : ""}`}
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="logout-title"
    >
      <div className={`modal ${closing ? "closing" : ""}`} role="document">
        <header className="modal-header">
          <h3 id="logout-title">Confirm Logout</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            X
          </button>
        </header>

        <form className="modal-content" onSubmit={handleSubmit}>
          <p
            style={{
              margin: "auto 1rem",
              color: "black",
              fontWeight: "bold",
              fontSize: "20pt",
              paddingBottom: "20px",
            }}
          >
            Are you sure you want to log out?
          </p>
          <footer className="modal-actions">
            <button
              type="submit"
              className="btn primary"
              disabled={isSubmitting}
              style={{
                margin: "auto",
              }}
            >
              {isSubmitting ? "Logging Out..." : "Logout"}
            </button>

            <button
              type="button"
              className="btn ghost"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                margin: "auto",
              }}
            >
              Cancel
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default LogOutPopUp;
