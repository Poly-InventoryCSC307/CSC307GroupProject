import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      SKU: { type: String, required: true, trim: true },
      total_quantity: { type: Number, required: true, min: 0, default: 0},
      quantity_on_floor: { type: Number, min: 0, default: 0 },
      quantity_in_back:  { type: Number, min: 0, default: 0 },
      product_photo: { type: String, required: true },
      price: { type: Number, min: 0, default: 0, required: true },
      description: {type: String, trim: true},
    }
);

const LocatationSchema = new mongoose.Schema(
    {
      street: { type: String, trim: true },
      city:   { type: String, trim: true },
      state:  { type: String, trim: true },
      zip:    { type: String, trim: true },
    },
    {_id: false}      // Never need to any id for location
);

const StoreSchema = new mongoose.Schema(
    {
      owner_uid: { type: String, index: true },           // Keep track of logged in user and store database 
      name: { type: String, required: true, trim: true },
      location: LocatationSchema,
      inventory: {type: [ProductSchema], default: []},
    },
  { collection: "store_list" }
);

const Inventory = mongoose.model("Inventory", StoreSchema);

export default Inventory;
