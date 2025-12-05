import "./productPage.css";

import EditProductPopUp from "../components/EditProductPopUp";

import React, { useEffect, useState } from "react";
import { useProductImage } from "../components/useProductImage";
import { API_BASE_URL } from "../apiConfig";

export default function ProductScreen({
  initialProduct = null,
  baseSKU,
  overlay = false,
  storeID,
  onClose,
  onProductUpdated,
}) {
  const [product, setProduct] = useState(() => initialProduct || {});

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
    }
  }, [initialProduct]);
  // state for the Edit Product modal
  const [openEP, setOpenEP] = useState(false);
  const [submittingEP, setSubmittingEP] = useState(false);

  // close the "Edit Product" dialog safely
  const handleCloseEP = () => {
    if (!submittingEP) setOpenEP(false);
  };
  const handleSubmitEP = async (payload) => {
    try {
      setSubmittingEP(true);

      const oldSkuForDB = String(product?.SKU || "").trim();
      if (!oldSkuForDB) throw new Error("Missing SKU for this product.");

      const newName = payload.name.trim();
      const newSku = payload.SKU.trim();
      const newPrice = Number(payload.price ?? 0);
      const newQty = Number(payload.quantity ?? 0);
      let newQtyFloor = Number(
        payload.quantity_on_floor ?? product?.quantity_on_floor ?? 0,
      );
      let newQtyBack = Number(
        payload.quantity_in_back ?? product?.quantity_in_back ?? 0,
      );
      const newDesc = payload.description.trim();
      // upload image to polyproducts (name of s3 bucket)
      const oldimageURL = product?.image || product?.imageURL || "";
      let newimageURL = oldimageURL;

      if (payload.imageFile) {
        const formData = new FormData();
        formData.append("image", payload.imageFile);

        const uploadRes = await fetch(
          `${API_BASE_URL}/images/upload/${storeID}`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error(
            `Image upload failed: ${errText || uploadRes.status}`,
          );
        }

        const uploadData = await uploadRes.json();
        // adjust the property to whatever the api returns
        newimageURL =
          uploadData.imageURL || uploadData.url || uploadData.location || "";
        if (!newimageURL) {
          throw new Error("Image upload did not return an imageURL");
        }
      }

      if (!newName) throw new Error("Product name is required.");
      if (!newSku) throw new Error("SKU is required.");
      if (!Number.isFinite(newPrice) || newPrice < 0) {
        throw new Error("Price must be a non-negative number.");
      }
      if (!Number.isInteger(newQty) || newQty < 0) {
        throw new Error("Quantity must be an integer ≥ 0.");
      }

      if (!Number.isFinite(newQtyFloor)) newQtyFloor = 0;
      if (!Number.isFinite(newQtyBack)) newQtyBack = 0;

      if (newQty <= 0) {
        newQtyFloor = 0;
        newQtyBack = 0;
      } else if (newQtyFloor === 0 && newQtyBack === 0) {
        newQtyBack = Math.floor(newQty * 0.75);
        newQtyFloor = newQty - newQtyBack;
      } else {
        if (newQtyFloor < 0) newQtyFloor = 0;
        if (newQtyBack < 0) newQtyBack = 0;

        if (newQtyFloor + newQtyBack === 0) {
          newQtyBack = Math.floor(newQty * 0.75);
          newQtyFloor = newQty - newQtyBack;
        } else if (newQtyBack > newQty) {
          newQtyBack = newQty;
          newQtyFloor = 0;
        } else {
          // keep back as the “primary” and adjust floor
          newQtyFloor = newQty - newQtyBack;
        }
      }

      if (!newimageURL && !oldimageURL)
        throw Error("You must tag an image to the product");
      const finalImageURL = newimageURL || oldimageURL;

      const updates = {
        name: newName,
        SKU: newSku,
        description: newDesc,
        price: newPrice,
        total_quantity: newQty,
        quantity_on_floor: newQtyFloor,
        quantity_in_back: newQtyBack,
        product_photo: finalImageURL,
      };

      const res = await fetch(
        `${API_BASE_URL}/inventory/${storeID}/products/${encodeURIComponent(
          oldSkuForDB,
        )}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        },
      );

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          `Update failed with status ${res.status}`;
        throw new Error(msg);
      }

      // data is the updated product from backend.js
      const saved = data;
      const newImage =
        saved.product_photo ||
        newimageURL ||
        product.product_photo ||
        product.imageURL ||
        "";

      // update local overlay product
      setProduct((prev) => ({
        ...prev,
        ...saved,
        quantity: saved.total_quantity ?? newQty,
        product_photo: newImage,
        image: newImage,
        imageURL: newImage,
      }));

      onProductUpdated?.(baseSKU ?? product.SKU, {
        name: saved.name,
        SKU: saved.SKU,
        price: saved.price,
        total_quantity: saved.total_quantity,
        quantity_on_floor: saved.quantity_on_floor,
        quantity_in_back: saved.quantity_in_back,
        description: saved.description,
        image: newImage,
        product_photo: newImage,
      });

      if (payload.imageFile && oldimageURL && oldimageURL != -finalImageURL) {
        try {
          await fetch(`${API_BASE_URL}/images/file/${storeID}`, {
            method: "DELETE",
          });
        } catch (err) {
          console.err("Failed to delete old image:", err);
        }
      }

      setOpenEP(false);
    } catch (e) {
      alert(`Failed to save product (ProductPage): ${e.message}`);
    } finally {
      setSubmittingEP(false);
    }
  };

  useEffect(() => {
    if (!overlay) return;

    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (openEP) return; // If the edit or update is open
      onClose?.();
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [overlay, onClose, openEP]);

  const name = product?.name || "—";
  const sku = product?.SKU || "—";
  const qtyTotal = Number(product?.total_quantity ?? product?.quantity ?? 0);
  const qtyFloor = Number(product?.quantity_on_floor ?? 0);
  const qtyBack = Number(product?.quantity_in_back ?? 0);
  const priceNum = Number(product?.price ?? 0);

  const imageURL = useProductImage(product);

  if (overlay) {
    return (
      <div className="p-modal">
        <button
          type="button"
          className="p-modal__close"
          onClick={onClose}
          aria-label="Close product details"
        >
          X
        </button>
        <div className="p-modal__grid">
          {/* Left: image */}
          <div className="p-modal__image">
            {imageURL ? (
              <img
                src={imageURL}
                alt={name || "Product"}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span className="p-modal__image-placeholder">
                Product Picture
              </span>
            )}
          </div>

          {/* Right: details */}
          <aside className="p-modal__side">
            <div className="p-row">
              <span className="p-label">Product Name:</span>
              <span className="p-val">{name}</span>
            </div>
            <div className="p-row">
              <span className="p-label">SKU:</span>
              <span className="p-val">{sku}</span>
            </div>
            <div className="p-row">
              <span className="p-label">Quantity Total:</span>
              <span className="p-val">{qtyTotal}</span>
            </div>
            <div className="p-row">
              <span className="p-label">Quantity on Floor:</span>
              <span className="p-val">{qtyFloor}</span>
            </div>
            <div className="p-row">
              <span className="p-label">Quantity in Back:</span>
              <span className="p-val">{qtyBack}</span>
            </div>
            <div className="p-row">
              <span className="p-label">Price:</span>
              <span className="p-val">${priceNum.toFixed(2)}</span>
            </div>

            <div className="p-actions">
              <button
                className="btn-edit-product"
                onClick={() => setOpenEP(true)}
              >
                Edit Product
              </button>
            </div>
          </aside>
        </div>

        <EditProductPopUp
          open={openEP}
          onClose={handleCloseEP}
          onSubmit={handleSubmitEP}
          isSubmitting={submittingEP}
          initialProduct={product}
        />

        {/* Bottom: description */}
        <section className="p-modal__desc">
          <h3>Product Description:</h3>
          <p>
            {String(product?.description || "").trim() ||
              "No description provided."}
          </p>
        </section>
      </div>
    );
  }

  // full-page version (leave as it was)
  return (
    <div className={`app-shell ${overlay ? "" : "fullpage"}`}>
      {!overlay && <header className="topbar">{}</header>}
      <main className="stage">{/*  existing full-page layout */}</main>
    </div>
  );
}
