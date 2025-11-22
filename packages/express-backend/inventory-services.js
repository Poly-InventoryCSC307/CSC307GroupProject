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

//Use this for the search bar on the main product page 

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

function addProduct(product){
    const productToAdd = new inventoryModel(product);
    const promise = productToAdd.save();
    return promise;
}

export default{
    getInventory,
    findProductByName,
    findProductBySKU,
    updateQuantityFloor,
    updateQuantityBack,
    addProduct,
};
