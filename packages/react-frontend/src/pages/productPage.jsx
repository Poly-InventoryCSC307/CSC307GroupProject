import { useEffect, useMemo, useState } from "react";

export default function ProductScreen() {
  // Read SKU or name from the URL: /product?SKU=ABC123 or /product?name=Widget
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : "");
  const query = useMemo(() => ({
    SKU: params.get("SKU") || undefined,
    name: params.get("name") || undefined,
  }), [params.toString()]);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const q = new URLSearchParams();
        if (query.SKU) q.set("SKU", query.SKU);
        if (query.name) q.set("name", query.name);
        const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:8000"}/inventory?${q.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // The backend may return: array of store docs with inventory[] or a flat list
        // Normalize into a single product object if possible.
        let found = null;
        if (Array.isArray(data)) {
          // Could be an array of stores, each with inventory[]
          for (const d of data) {
            if (Array.isArray(d?.inventory)) {
              for (const p of d.inventory) {
                if ((query.SKU && p.SKU === query.SKU) || (query.name && p.name === query.name)) {
                  found = p; break;
                }
              }
            } else if ((query.SKU && d.SKU === query.SKU) || (query.name && d.name === query.name)) {
              found = d; // flat product
            }
            if (found) break;
          }
          // If no filter, show the first product in the first inventory array
          if (!found) {
            const firstWithInv = data.find(d => Array.isArray(d?.inventory) && d.inventory.length > 0);
            found = firstWithInv ? firstWithInv.inventory[0] : null;
          }
        } else if (data && typeof data === 'object') {
          found = data;
        }

        if (active) setProduct(found);
      } catch (e) {
        if (active) setError(String(e));
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => { active = false };
  }, [query]);

  // Derived fields with safe fallbacks
  const name = product?.name || "Product Name";
  const sku = product?.SKU || product?.sku || "SKU";
  const qtyTotal = Number(product?.total_quantity ?? product?.qtyTotal ?? 0);
  const qtyFloor = Number(product?.quantity_on_floor ?? product?.qtyFloor ?? 0);
  const qtyBack = Number(product?.quantity_in_back ?? product?.qtyBack ?? 0);
  const price = product?.price;
  const description = product?.description || "No description provided.";
  const photo = product?.product_photo;

  async function handleOrder() {
    // Example: decrement back, increment floor — adjust to your business logic.
    // NOTE: Your backend currently exposes /inventory and service fns for quantity updates.
    // If you enable endpoints like PUT /inventory/floor and /inventory/back, wire them here.
    alert("Order button clicked. Hook this up to your POST/PUT endpoint when ready.");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="cube" aria-hidden>⬢</span>
          <span>Poly+ Inventory</span>
        </div>
        <div className="topbar-actions">
          <a className="btn btn-ghost" href="/">Back to Inventory</a>
          <button className="btn btn-outline">Logout</button>
        </div>
      </header>

      <main className="stage">
        <section className="panel">
          <div className="panel-grid">
            <div className="product-media">
              {photo ? (
                <img className="media-img" src={photo} alt={`${name} photo`} />
              ) : (
                <div className="media-box" role="img" aria-label="Product picture placeholder">
                  Product Picture
                </div>
              )}
            </div>

            <aside className="details card" aria-busy={loading} aria-live="polite">
              {loading ? (
                <div className="skeleton">Loading product…</div>
              ) : error ? (
                <div className="error">{error}</div>
              ) : (
                <>
                  <dl className="kv">
                    <div className="row"><dt>Product Name:</dt><dd>{name}</dd></div>
                    <div className="row"><dt>SKU:</dt><dd>{sku}</dd></div>
                    <div className="row"><dt>Quantity Total:</dt><dd>{qtyTotal}</dd></div>
                    <div className="row"><dt>Quantity on Floor:</dt><dd>{qtyFloor}</dd></div>
                    <div className="row"><dt>Quantity in Back:</dt><dd>{qtyBack}</dd></div>
                    {price != null && (
                      <div className="row"><dt>Price:</dt><dd>${'{'}price{'}'}</dd></div>
                    )}
                  </dl>
                  <div className="actions">
                    <button onClick={handleOrder} className="btn btn-primary">Order</button>
                  </div>
                </>
              )}
            </aside>
          </div>

          <section className="description card">
            <h2>Product Description:</h2>
            <div className="desc-scroll" role="region" aria-label="Product description">
              {loading ? " " : description}
            </div>
          </section>
        </section>
      </main>

      <style>{`
        :root{ --bg:#0b0b0b; --panel-start:#1aa37a; --panel-end:#0b5a44; --surface:#e5e7eb; --ink:#0f172a; --muted:#334155; --radius:16px; --max:1120px; }
        *{box-sizing:border-box}
        html, body, #root{height:100%}
        body{margin:0; background: var(--bg); color: #fff; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif}
        .app-shell{min-height:100%}
        .topbar{position:sticky; top:0; z-index:5; display:flex; align-items:center; justify-content:space-between; padding:14px 20px; background:#111; border-bottom:1px solid #262626}
        .brand{display:flex; align-items:center; gap:10px; font-weight:700}
        .cube{font-size:18px}
        .topbar-actions{display:flex; gap:10px}
        .btn{appearance:none; border:1px solid transparent; border-radius:999px; padding:10px 14px; font-weight:600; cursor:pointer}
        .btn-ghost{background:#0b2a23; color:#a7f3d0; border-color:#0f5132}
        .btn-outline{background:#1f2937; color:#fff; border-color:#374151}
        .btn-primary{background:#17653f; color:#fff; border-color:#17653f}
        .btn-primary:hover{filter:brightness(1.08)}
        .stage{display:flex; justify-content:center; padding:24px}
        .panel{width:100%; max-width:var(--max); background: linear-gradient(160deg, var(--panel-start), var(--panel-end)); padding:28px; border-radius:8px; box-shadow: 0 10px 30px rgba(0,0,0,.35)}
        .panel-grid{display:grid; grid-template-columns: 1.1fr 0.9fr; gap:28px; align-items:start}
        .product-media{display:flex; align-items:center; justify-content:center}
        .media-box{width:100%; aspect-ratio:1/1; background:#fff; color:#111; border-radius:6px; display:grid; place-items:center; font-weight:700}
        .media-img{width:100%; aspect-ratio:1/1; object-fit:cover; border-radius:6px; background:#fff}
        .card{background: var(--surface); color: var(--ink); border-radius: 14px; padding:20px; box-shadow: inset 0 0 0 1px rgba(0,0,0,.06)}
        .details .kv{margin:0; display:flex; flex-direction:column; gap:12px}
        .details .row{display:grid; grid-template-columns: 220px 1fr; gap:10px; align-items:center}
        .details dt{font-weight:800}
        .details dd{margin:0; color: var(--muted); font-weight:600}
        .details .actions{margin-top:16px}
        .description{margin-top:22px}
        .description h2{margin:0 0 10px 0; font-size:22px}
        .desc-scroll{max-height:200px; overflow:auto; padding-right:6px;}
        .desc-scroll::-webkit-scrollbar{width:10px}
        .desc-scroll::-webkit-scrollbar-thumb{background:#cbd5e1; border-radius:999px}
        .skeleton{height:150px; border-radius:8px; background: repeating-linear-gradient( 90deg, #e5e7eb 0, #e5e7eb 16px, #f1f5f9 16px, #f1f5f9 32px ); animation: shimmer 2s linear infinite;}
        @keyframes shimmer{ 0%{background-position:-200px 0} 100%{background-position:200px 0}}
        .error{color:#b91c1c; font-weight:700}
        @media (max-width: 960px){ .panel-grid{grid-template-columns: 1fr;} }
      `}</style>
    </div>
  );
}
