import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";

dotenv.config();
console.log("MONGODB_URI:", process.env.MONGODB_URI);

import inventoryServices from "./inventory-services.js";
import uploadRoutes from "./uploadRoutes.js";
import express from "express";
import cors from "cors";

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());
app.use("/images", uploadRoutes);

app.get("/", (req, res) => {
  res.send("PolyPlus Inventory API is running");
});

// Create new store front
app.post("/stores", (req, res) => {
  const { uid, name, location } = req.body || {};

  if (!uid || !name) {
    return res
      .status(400)
      .json({ error: "Missing required fields: uid and name" });
  }

  inventoryServices
    .createStoreForUser(uid, name, location)
    .then((store) => {
      res.json(store);
    })
    .catch((err) => {
      console.error("Create store failed:", err);

      if (err.code === "STORE_EXISTS") {
        return res.status(400).json({ error: "Store already exists" });
      }

      res.status(500).json({ error: "Failed to create store" });
    });
});

// Get the data for new store
app.get("/stores/by-user/:uid", (req, res) => {
  const { uid } = req.params;

  inventoryServices
    .getStoreByUserUid(uid)
    .then((store) => {
      if (!store) {
        return res.status(404).json({ error: "No store for this user" });
      }
      res.json(store);
    })
    .catch((err) => {
      console.error("Lookup store failed:", err);
      res.status(500).json({ error: "Failed to fetch store" });
    });
});

// Entire store page including name and location
app.get("/inventory", (req, res) => {
  const name = req.query.name;
  const SKU = req.query.SKU;

  const result = inventoryServices.getInventory(SKU, name);
  result
    .then((result) => {
      res.send({ store_list: result });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Can't Find Inventory from Database");
    });
});

// Get the store name and and location data for a store
app.get("/inventory/:storeId/", (req, res) => {
  const { storeId } = req.params;

  inventoryServices
    .getStoreData(storeId)
    .then((doc) => {
      if (!doc) return res.status(404).json({ error: "Store not found" });

      res.json({ name: doc.name || "", location: doc.location || null });
    })
    .catch((err) => {
      console.error("getStoreMeta failed:", err);
      res.status(500).json({ error: "Failed to load store meta" });
    });
});

// Strictly the products for a store
app.get("/inventory/:storeId/products", (req, res) => {
  const { storeId } = req.params;

  // Use service: returns all store docs; filter in-memory to the one we need
  inventoryServices
    .getInventory(undefined, undefined) // <- required per your request
    .then((docs) => {
      // docs can be one or many store documents depending on your data
      const storeDoc = Array.isArray(docs)
        ? docs.find((d) => d._id?.toString() === storeId)
        : null;

      if (!storeDoc) {
        return res.status(404).json({ message: "Store not found" });
      }

      // Return just the inventory array
      const items = (storeDoc.inventory ?? []).map((p) => ({
        _id: p._id,
        name: p.name ?? "",
        SKU: p.SKU ?? "",
        price: Number(p.price ?? 0),
        total_quantity: Number(p.total_quantity ?? 0),
        // include a 'quantity' mirror since UI reads either
        quantity: Number(p.total_quantity ?? 0),
        quantity_on_floor: Number(p.quantity_on_floor ?? 0),
        quantity_in_back: Number(p.quantity_in_back ?? 0),
        incoming_quantity: Number(p.incoming_quantity ?? 0),
        product_photo: p.product_photo ?? "",
        imageURL: p.product_photo ?? "",
        description: p.description ?? "",
      }));

      return res.json(items);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ message: "Failed to load inventory" });
    });
});

// Add product to a inventory
app.post("/inventory/:storeId/products", (req, res) => {
  const { storeId } = req.params;
  const body = req.body || {};

  // Normalize incoming payload
  const product = {
    name: (body.name || "").trim(),
    SKU: (body.SKU || "").trim(),
    price: Number(body.price ?? 0),
    // Accept either 'quantity' or 'total_quantity' from the client; the service handles both
    total_quantity: Number(body.total_quantity ?? body.quantity ?? 0),
    description: (body.description || "").trim(),
    product_photo: body.product_photo || "",
    quantity_on_floor: Number(body.quantity_on_floor ?? 0),
    quantity_in_back: Number(body.quantity_in_back ?? 0),
    incoming_quantity: Number(body.incoming_quantity ?? 0),
  };

  if (!product.name || !product.SKU) {
    return res.status(400).json({ message: "name and SKU are required" });
  }

  // Use service to push into inventory
  inventoryServices
    .addProduct(storeId, product)
    .then((updatedDoc) => {
      if (!updatedDoc) {
        return res.status(404).json({ message: "Store not found" });
      }

      // Return the just-added product (last element)
      const inv = updatedDoc.inventory || [];
      const saved = inv[inv.length - 1];

      return res.status(201).json({
        _id: saved._id,
        name: saved.name,
        SKU: saved.SKU,
        price: Number(saved.price ?? 0),
        total_quantity: Number(saved.total_quantity ?? 0),
        quantity: Number(saved.total_quantity ?? 0),
        quantity_on_floor: Number(saved.quantity_on_floor ?? 0),
        quantity_in_back: Number(saved.quantity_in_back ?? 0),
        incoming_quantity: Number(saved.incoming_quantity ?? 0),
        product_photo: saved.product_photo ?? "",
        description: saved.description ?? "",
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ message: "Failed to add product" });
    });
});

// Remove products from a given inventory
app.delete("/inventory/:storeId/products", (req, res) => {
  const { storeId } = req.params;
  const { SKU } = req.body || {};
  if (!SKU || !SKU.trim()) {
    return res.status(400).json({ error: "SKU is required" });
  }

  inventoryServices
    .removeProductBySKU(storeId, SKU.trim())
    .then((result) => {
      if (!result) {
        return res.status(404).json({ error: "Store not found" });
      }

      // Check if a product was actually removed
      const inventoryAfter = result.inventory || [];
      const stillExists = inventoryAfter.some(
        (item) => item.SKU === SKU.trim(),
      );
      if (stillExists) {
        return res
          .status(404)
          .json({ error: "Product SKU not found in this store" });
      }

      res.json({ ok: true, removedSKU: SKU.trim() });
    })
    .catch((err) => {
      console.error("Error removing product:", err);
      res.status(500).json({ error: "Failed to remove product" });
    });
});

// Update the product with new edits
app.patch("/inventory/:storeId/products/:sku", (req, res) => {
  const { storeId, sku } = req.params;
  const updates = req.body || {};

  console.log("PATCH /inventory/:storeId/products/:sku", {
    storeId,
    sku,
    updates,
  });

  inventoryServices
    .updateProductBySKU(storeId, sku, updates)
    .then((p) => {
      if (!p) return res.status(404).json({ error: "Product not found" });
      // send the full updated product or a subset
      res.json({
        SKU: p.SKU,
        name: p.name,
        price: p.price,
        total_quantity: p.total_quantity,
        quantity_on_floor: p.quantity_on_floor,
        quantity_in_back: p.quantity_in_back,
        incoming_quantity: p.incoming_quantity,
        description: p.description,
        product_photo: p.product_photo,
      });
    })
    .catch((err) => {
      console.error("Update product failed:", err);
      res.status(500).json({ error: "Failed to update product" });
    });
});

// app.listen(port, () => {
//   console.log(
//     `Example app listening at http://polyplus-inventory-febhaeaah4a2a9ht.westus3-01.azurewebsites.net`
//   );
// });

app.listen(process.env.PORT || port, () => {
  console.log("Running on port:", process.env.PORT || port);
  console.log("REST API is listening.");
});
