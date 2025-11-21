// backend.js
import inventoryServices from "./inventory-services.js";
import express from "express";
import cors from "cors";

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

// Entire store page including name and location
app.get("/inventory", (req, res) => {
  const name = req.query.name;
  const SKU = req.query.SKU;
  
  const result = inventoryServices.getInventory(SKU, name);
  result
    .then((result) => {
      res.send({store_list:result});  
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Can't Find Inventory from Database");
    }); 
});

// Strictly the products for a store
app.get("/inventory/:storeId/products", (req, res) => {
  const { storeId } = req.params;

  // Use your service: returns all store docs; filter in-memory to the one we need
  inventoryServices
    .getInventory(undefined, undefined) // <- required per your request
    .then((docs) => {
      // docs can be one or many store documents depending on your data
      const storeDoc =
        Array.isArray(docs) ? docs.find((d) => d._id?.toString() === storeId) : null;

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
        // include a 'quantity' mirror since your UI reads either
        quantity: Number(p.total_quantity ?? 0),
        quantity_on_floor: Number(p.quantity_on_floor ?? 0),
        quantity_in_back: Number(p.quantity_in_back ?? 0),
        incoming_quantity: Number(p.incoming_quantity ?? 0),
        product_photo: p.product_photo ?? "",
        description: p.description ?? "",
      }));

      return res.json(items);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ message: "Failed to load inventory" });
    });
});

app.post("/inventory/:storeId/products", (req, res) => {
  const { storeId } = req.params;
  const body = req.body || {};

  // Normalize incoming payload -> your service already remaps quantity->total_quantity
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

  // Use your service to push into inventory
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


/*
app.delete("/stores/:id", (req, res) => {
  const id = req.params["id"];
  
  const deleteStore = inventoryServices.deleteStoreById(id);
  
  deleteStore
    .then((result) => {
      res.status(204).send(result);
    })
    .catch((error) => {
      console.log(error);
      res.status(404).send("ID not found");
    });

});
*/

app.listen(port, () => {
  console.log(
    `Example app listening at http://localhost:${port}`
  );
});
