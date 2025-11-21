import "./ProductCard.css"

function ProductCard({name, imageURL, SKU, price, quantity}){
    return (
        <article className="product-card">
            <h3 className="pc-title">
                {name}
            </h3>
            <div className="pc-image">
                {imageURL ? <img src={imageURL} alt={name} /> : <span>Product Picture</span>}            
            </div>

            <div className="pc-meta">
                <p><strong>SKU:</strong> {SKU ?? "-"}</p>
                <p><strong>Price:</strong> ${price?.toFixed?.(2) ?? "-"}</p>
                <p><strong>Quantity Total:</strong> {quantity ?? "-"}</p>
            </div>


        </article>
    )
}

export default ProductCard;