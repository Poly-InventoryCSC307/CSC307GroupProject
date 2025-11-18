import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import inventoryModel from "./inventory.js"
 
mongoose.set("debug", true);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.log(error));

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

function getStoreByID(storeID){
    return inventoryModel.findById(storeID).lean().exec();
}

// Filter via a given product name
function findProductByName(name){
    return inventoryModel.find({"inventory.name":name});
}

// Filter via a given product SKU
function findProductBySKU(SKU){
    return inventoryModel.find({"inventory.SKU":SKU});
}

// Use these to update the database quantity by given amount 
function updateQuantityFloor(SKU, update_val){
    return inventoryModel.findOneAndUpdate(
        SKU, 
        {$inc : {quantity_on_floor: update_val}},   
        {new: true} 
    );
}

function updateQuantityBack(SKU, update_val){
    return inventoryModel.findOneAndUpdate(
        SKU, 
        {$inc : {quantity_in_back: update_val}},  
        {new: true} 
    );
}

function updatePriceBySKU(storeId, SKU, newPrice) {
  const cleanSKU = String(SKU || "").trim();
  const priceNum = Number(newPrice);

  return inventoryModel
    .findOneAndUpdate(
      { _id: storeId, "inventory.SKU": cleanSKU },
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
    findProductByName,
    findProductBySKU,
    updateQuantityFloor,
    updateQuantityBack,
    addProduct,
    removeProductBySKU,
    updatePriceBySKU,
};
