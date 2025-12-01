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
function updateQuantityBy(storeID, SKU, delta){
    const cleanSKU = String(SKU || "").trim();
    const incBy = Number(delta) || 0;
    
    return inventoryModel
        .findOneAndUpdate(
            { _id: storeID, "inventory.SKU": cleanSKU },
            { $inc: { "inventory.$.total_quantity": incBy } },
            { new: true, }
        )
        .then((doc) => {
            if (!doc || !doc.inventory) return null;
            const p = doc.inventory.find((it) => it.SKU === cleanSKU);
            return p ? { SKU: p.SKU, total_quantity: p.total_quantity } : null;
        })
        .catch((err) => {
            console.log("Error updating quantity:", err);
            throw err; // let backend send the real message
        });
}

function updatePriceBySKU(storeID, SKU, newPrice) {
  const cleanSKU = String(SKU || "").trim();
  const priceNum = Number(newPrice);

  return inventoryModel
    .findOneAndUpdate(
      { _id: storeID, "inventory.SKU": cleanSKU },
      { $set: { "inventory.$[elem].price": priceNum } },
      {
        new: true,                          // return updated doc
        arrayFilters: [{ "elem.SKU": cleanSKU }],
      }
    )
    .then((doc) => {
      if (!doc || !doc.inventory) return null;
      const p = doc.inventory.find((it) => it.SKU === cleanSKU);
      return p ? { SKU: p.SKU, price: p.price } : null;
    })
    .catch((err) => {
      console.log("Error updating price:", err);
      throw err; // let backend send the real message
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
    updatePriceBySKU,
    updateQuantityBy
};
