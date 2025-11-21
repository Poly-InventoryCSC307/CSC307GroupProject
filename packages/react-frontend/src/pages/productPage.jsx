import "./productPage.css"


export default function ProductScreen({ initialProduct = null, overlay = false }) {
  const p = initialProduct || {};

  if (overlay) {
    return (
      <div className="p-modal">
        <div className="p-modal__grid">
          {/* Left: image */}
          <div className="p-modal__image">
            {p.imageURL?.trim() ? (
              <img
                src={p.imageURL.trim()}
                alt={p.name || "Product"}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <span className="p-modal__image-placeholder">Product Picture</span>
            )}
          </div>

          {/* Right: details */}
          <aside className="p-modal__side">
            <div className="p-row"><span className="p-label">Product Name:</span><span className="p-val">{p.name || "—"}</span></div>
            <div className="p-row"><span className="p-label">SKU:</span><span className="p-val">{p.SKU || "—"}</span></div>
            <div className="p-row"><span className="p-label">Quantity Total:</span><span className="p-val">{p.quantity ?? 0}</span></div>
            <div className="p-row"><span className="p-label">Quantity on Floor:</span><span className="p-val">{p.quantity_on_floor ?? 0}</span></div>
            <div className="p-row"><span className="p-label">Quantity in Back:</span><span className="p-val">{p.quantity_in_back ?? 0}</span></div>
            <div className="p-row"><span className="p-label">Price:</span><span className="p-val">${Number(p.price ?? 0).toFixed(2)}</span></div>

            <div className="p-actions">
              <button className="btn-order">Order</button>
            </div>
          </aside>
        </div>

        {/* Bottom: description */}
        <section className="p-modal__desc">
          <h3>Product Description:</h3>
          <p>{(p.description || "").trim() || "No description provided."}</p>
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
