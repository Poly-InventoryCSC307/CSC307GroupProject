// src/hooks/useProductImage.js
import { useEffect, useState } from "react";

const S3_HOST = "polyproducts.s3.amazonaws.com"; // bucket host

export function useProductImage(product) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!product) {
      setUrl("");
      return;
    }

    let raw =
      (product.image && String(product.image).trim()) ||
      (product.product_photo && String(product.product_photo).trim()) ||
      (product.imageURL && String(product.imageURL).trim()) ||
      "";

    if (!raw) {
      setUrl("");
      return;
    }

    // ---- raw is a full URL ----
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      try {
        const u = new URL(raw);

        // If it's your S3 bucket (private), derive the key and fetch signed URL
        if (u.hostname === S3_HOST) {
          // "/uploads/123.png" -> "uploads/123.png"
          const key = u.pathname.replace(/^\/+/, "");

          fetch(
            `http://localhost:8000/images/file-url/${encodeURIComponent(key)}`
          )
            .then((res) => res.json())
            .then((data) => setUrl(data.url || ""))
            .catch((err) => {
              console.error("Failed to fetch signed URL from S3 URL:", err);
              setUrl("");
            });

          return; // don't fall through
        }

        // Otherwise: it's some other public URL -> just use it
        setUrl(raw);
        return;
      } catch {
        // If URL parsing fails, we'll treat it like a key below
      }
    }

    // ---- raw is a key like "uploads/123.png" ----
    const key = raw;
    fetch(
      `http://localhost:8000/images/file-url/${encodeURIComponent(key)}`
    )
      .then((res) => res.json())
      .then((data) => setUrl(data.url || ""))
      .catch((err) => {
        console.error("Failed to fetch signed URL from key:", err);
        setUrl("");
      });
  }, [product]);

  return url;
}