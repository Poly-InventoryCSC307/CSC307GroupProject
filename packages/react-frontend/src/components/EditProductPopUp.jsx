import React, { useEffect, useRef, useState } from "react";
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
    image: "",
  });

  // Use for opening and closing animations
  const [show, setShow] = useState(open);
  const [closing, setClosing] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // Convert input into an integer
  const toInt = (v) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  // Close the popup with escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // When it opens, populate from the product
  useEffect(() => {
    if (!open) return;

    // Special logic to split the quantities properly
    const total =
      initialProduct?.total_quantity ?? initialProduct?.quantity ?? 0;

    let floor = initialProduct?.quantity_on_floor;
    let back = initialProduct?.quantity_in_back;

    floor = floor != null ? Number(floor) : 0;
    back = back != null ? Number(back) : 0;

    if (total > 0 && floor === 0 && back === 0) {
      back = Math.floor(total * 0.75);
      floor = total - back;
    }

    setForm({
      name: initialProduct?.name ?? "",
      SKU: initialProduct?.SKU ?? "",
      price:
        initialProduct?.price !== undefined && initialProduct?.price !== null
          ? String(initialProduct.price)
          : "",
      quantity: total !== "" ? String(total) : "",
      quantity_on_floor: floor !== "" ? String(floor) : "",
      quantity_in_back: back !== "" ? String(back) : "",
      description: initialProduct?.description ?? "",
      image: initialProduct?.imageFile ?? "",
    });
    setImageFile(null);
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  // Keep floor + back = total, don't exceed total
  const handleQuantityChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      let total = toInt(name === "quantity" ? value : (prev.quantity ?? "0"));
      let floor = toInt(prev.quantity_on_floor ?? "0");
      let back = toInt(prev.quantity_in_back ?? "0");

      if (name === "quantity") {
        // User changed total
        if (total <= 0) {
          floor = 0;
          back = 0;
        } else {
          const sum = floor + back;
          if (sum === 0) {
            back = Math.floor(total * 0.75);
            floor = total - back;
          } else {
            // Preserve ratio
            back = Math.round((back / sum) * total);
            floor = total - back;
          }
        }

        return {
          ...prev,
          quantity: String(total),
          quantity_on_floor: String(floor),
          quantity_in_back: String(back),
        };
      }

      if (name === "quantity_in_back") {
        back = toInt(value);
        if (back > total) back = total;
        if (total <= 0) {
          back = 0;
          floor = 0;
        } else {
          floor = total - back;
        }

        return {
          ...prev,
          quantity: String(total),
          quantity_in_back: String(back),
          quantity_on_floor: String(floor),
        };
      }

      if (name === "quantity_on_floor") {
        floor = toInt(value);
        if (floor > total) floor = total;
        if (total <= 0) {
          floor = 0;
          back = 0;
        } else {
          back = total - floor;
        }

        return {
          ...prev,
          quantity: String(total),
          quantity_on_floor: String(floor),
          quantity_in_back: String(back),
        };
      }

      return prev;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const total = toInt(form.quantity);
    let floor = toInt(form.quantity_on_floor);
    let back = toInt(form.quantity_in_back);

    if (total <= 0) {
      floor = 0;
      back = 0;
    } else if (floor === 0 && back === 0) {
      back = Math.floor(total * 0.75);
      floor = total - back;
    } else {
      if (floor > total) floor = total;
      if (back > total) back = total;
      if (floor + back !== total) {
        // Treat back as authoritative and fix floor
        if (back > total) back = total;
        floor = total - back;
      }
    }

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

          {/* Have Total, Floor, and Back Quantity on same line */}
          <div className="field">
            <label htmlFor="quantity">Quantity</label>
            <div className="qty-row">
              <div className="qty-col">
                <span className="qty-label">Total</span>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity}
                  onChange={handleQuantityChange}
                  placeholder="0"
                  required
                />
              </div>
              <div className="qty-col">
                <span className="qty-label">On Floor</span>
                <input
                  name="quantity_on_floor"
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity_on_floor}
                  onChange={handleQuantityChange}
                  placeholder="0"
                />
              </div>
              <div className="qty-col">
                <span className="qty-label">In Back</span>
                <input
                  name="quantity_in_back"
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity_in_back}
                  onChange={handleQuantityChange}
                  placeholder="0"
                />
              </div>
            </div>
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
            />
          </div>

          <footer className="modal-actions">
            <button
              type="submit"
              className="btn submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating Product..." : "Update Product"}
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

export default EditProductPopUp;
