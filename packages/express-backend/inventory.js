/*
Easy Copy and Paste for inserting into the database (at least when inserting from the terminal and running mongosh)
db.store_list.insertOne({
  name: " ",
  location: {
    city: " ",
    state: " "
  },
  inventory: { 
    name: " ", 
    SKU: " ",
    total_quantity: " ""
    product_photo: " ",
    price: " ",
  }
});
*/

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
      location: [LocatationSchema],
      inventory: {type: [ProductSchema], default: []},
    },
  { collection: "store_list" }
);

const Inventory = mongoose.model("Inventory", StoreSchema);

export default Inventory;
