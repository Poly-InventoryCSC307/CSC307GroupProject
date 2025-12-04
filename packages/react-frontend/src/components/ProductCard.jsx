import "./ProductCard.css";
import { useProductImage } from "./useProductImage";

function trimText(text, max = 30) {
  const s = typeof text === "string" ? text : String(text ?? "");
  if (s.length <= max) return s;
  return s.slice(0, Math.max(0, max - 3)) + "...";
}

function ProductCard({ name, image, imageURL, product_photo, SKU, price, quantity }) {
  const imgSrc = useProductImage({ image, imageURL, product_photo});
  return (
    <article className="product-card">
      <h3 className="pc-title">{trimText(name, 20)}</h3>
      <div className="pc-image">
        {imgSrc ? (
          <img src={imgSrc} alt={name} />
        ) : (
          <span>Product Picture</span>
        )}
      </div>

      <div className="pc-meta">
        <p>
          <strong>SKU:</strong> {trimText(SKU, 24) ?? "-"}
        </p>
        <p>
          <strong>Price:</strong> ${price?.toFixed?.(2) ?? "-"}
        </p>
        <p>
          <strong>Quantity Total:</strong> {quantity ?? "-"}
        </p>
      </div>
    </article>
  );
}

export default ProductCard;
