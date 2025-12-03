import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import inventoryModel from "./inventory.js"
 
mongoose.set("debug", true);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.log(error));

// Get the inventory for the backend page 
function getInventory(SKU, name){
    let promise;
    if (name === undefined && SKU === undefined){
        promise = inventoryModel.find();
    }
    else if (SKU && !name){
        promise = findProductBySKU(SKU);
    }
    else if (!SKU && name){
        promise = findProductByName(name);
    }
    return promise;
}

function getStoreData(storeId){
    return inventoryModel
    .findOne(
      { _id: storeId },
      { name: 1, location: 1, _id: 0 }   
    )
}

function getStoreByUserUid(uid) {
  const cleanUid = String(uid || "").trim();
  if (!cleanUid) return Promise.resolve(null);

  return inventoryModel
    .findOne({ owner_uid: cleanUid })
    .lean()
    .exec();
}

// Create a store for a Firebase UID (if not already present)
function createStoreForUser(uid, name, location) {
  const cleanUid = String(uid || "").trim();
  const cleanName = String(name || "").trim();

  if (!cleanUid || !cleanName) {
    return Promise.reject(
      new Error("Both uid and name are required to create a store")
    );
  }

  // Normalize location into [ { street, city, state, zip } ]
  const locObject =
    location && typeof location === "object"
        ? {
          street: location.street || "",
          city: location.city || "",
          state: location.state || "",
          zip: location.zip || "",
        }
      : undefined;

  return inventoryModel
    .findOne({ owner_uid: cleanUid })
    .then((existing) => {
      if (existing) {
        const err = new Error("Store already exists for this user");
        err.code = "STORE_EXISTS";
        throw err;
      }

      return inventoryModel.create({
        owner_uid: cleanUid,
        name: cleanName,
        location: locObject,
        inventory: [],
      });
    });
}

// Filter via a given product name
function findProductByName(storeID, name){
    return inventoryModel.find(
        { _id: storeID},
        {"inventory.name":name}
    );
}

// Filter via a given product SKU
function findProductBySKU(storeID, SKU){
    return inventoryModel.find(
        { _id: storeID},
        {"inventory.SKU":SKU}
    );
}

// Use these to update the database quantity by given amount 
// function updateQuantityFloor(SKU, update_val){
//     return inventoryModel.findOneAndUpdate(
//         SKU, 
//         {$inc : {quantity_on_floor: update_val}},   
//         {new: true} 
//     );
// }

// function updateQuantityBack(SKU, update_val){
//     return inventoryModel.findOneAndUpdate(
//         SKU, 
//         {$inc : {quantity_in_back: update_val}},  
//         {new: true} 
//     );
// }

// The user should press the button to update the quantity and based on the number increase for decrease the amount by that much. 

function updateProductBySKU(storeID, oldSKU, updates = {}) {
  const cleanStoreId = String(storeID || "").trim();
  const cleanOldSKU = String(oldSKU || "").trim();

  if (!cleanStoreId) {
    return Promise.reject(new Error("storeID is required"));
  }
  if (!cleanOldSKU) {
    return Promise.reject(new Error("SKU is required"));
  }

  // Build $set only for fields actually provided
  const setOps = {};

  if (updates.name != null) {
    setOps["inventory.$.name"] = String(updates.name).trim();
  }

  if (updates.SKU != null) {
    setOps["inventory.$.SKU"] = String(updates.SKU).trim();
  }

  if (updates.description != null) {
    setOps["inventory.$.description"] = String(updates.description).trim();
  }

  if (updates.product_photo != null) {
    setOps["inventory.$.product_photo"] = String(
      updates.product_photo
    ).trim();
  }

  if (updates.price != null) {
    setOps["inventory.$.price"] = Number(updates.price);
  }

  // allow total_quantity OR quantity alias
  if (updates.total_quantity != null) {
    setOps["inventory.$.total_quantity"] = Number(updates.total_quantity);
  } else if (updates.quantity != null) {
    setOps["inventory.$.total_quantity"] = Number(updates.quantity);
  }

  if (updates.quantity_on_floor != null) {
    setOps["inventory.$.quantity_on_floor"] = Number(
      updates.quantity_on_floor
    );
  }

  if (updates.quantity_in_back != null) {
    setOps["inventory.$.quantity_in_back"] = Number(
      updates.quantity_in_back
    );
  }

  if (updates.incoming_quantity != null) {
    setOps["inventory.$.incoming_quantity"] = Number(
      updates.incoming_quantity
    );
  }

  if (Object.keys(setOps).length === 0) {
    // nothing to update
    return Promise.resolve(null);
  }

  return inventoryModel
    .findOneAndUpdate(
      // use OLD SKU from params to match the product
      { _id: cleanStoreId, "inventory.SKU": cleanOldSKU },
      { $set: setOps },
      {
        new: true,
        runValidators: true,
      }
    )
    .then((doc) => {
      if (!doc || !doc.inventory) return null;

      const newSku =
        updates.SKU != null ? String(updates.SKU).trim() : null;
      const finalSku = newSku || cleanOldSKU;

      // try by new SKU first, then old SKU just in case
      const p =
        doc.inventory.find((it) => it.SKU === finalSku) ||
        doc.inventory.find((it) => it.SKU === cleanOldSKU);

      return p || null;
    })
    .catch((err) => {
      console.error("Error updating product:", err);
      throw err;
    });
}

function addProduct(storeID, product) {
    const productDetails = {
        name: product.name,
        SKU: product.SKU,
        total_quantity: Number(product.total_quantity ?? product.quantity ?? 0),
        description: product.description || "",
        price: Number(product.price ?? 0),
        product_photo: product.product_photo || "",
        // if you track these separately, default them explicitly:
        quantity_on_floor: Number(product.quantity_on_floor ?? 0),
        quantity_in_back: Number(product.quantity_in_back ?? 0),
        incoming_quantity: Number(product.incoming_quantity ?? 0),
    };
    return inventoryModel.findByIdAndUpdate(
        storeID,
        {$push: {inventory:productDetails}},
        {new: true}
    );
}

// Find a product with a given SKU and remove it 
function removeProductBySKU(storeID, SKU){
    return inventoryModel.findByIdAndUpdate(
        storeID,
        { $pull: {inventory: {SKU: SKU}}},
        { returnDocument: "after"}
    );
}

export default{
    getInventory,
    getStoreData,
    getStoreByUserUid,
    createStoreForUser,
    findProductByName,
    findProductBySKU,
    // updateQuantityFloor,
    // updateQuantityBack,
    addProduct,
    removeProductBySKU,
    updateProductBySKU,
};
