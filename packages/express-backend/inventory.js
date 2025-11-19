import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      SKU: { type: String, required: true, unique: true },
      total_quantity: { type: Number, required: true, min: 0, default: 0},
      quantity_on_floor: { type: Number, min: 0, default: 0 },
      quantity_in_back:  { type: Number, min: 0, default: 0 },
      incoming_quantity: { type: Number, min: 0, default: 0 },
      product_photo: { type: String, required: true },
      price: { type: Number, min: 0, default: 0, required: true },
      description: {type: String, trim: true},
      // pending_shipping : { type: Number, min: 0, default: 0 }
    }
);

const LocatationSchema = new mongoose.Schema(
    {
      street: String,
      city: String,
      state: String,
      zip: String,
    }
);

const StoreSchema = new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      location: {LocatationSchema},
      inventory: {type: [ProductSchema], default: []},
    },
  { collection: "store_list" }
);

const Inventory = mongoose.model("Inventory", StoreSchema);

export default Inventory;
