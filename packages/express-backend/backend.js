// backend.js
import inventoryServices from "./inventory-services.js";
import express from "express";
import cors from "cors";

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

app.get("/inventory", (req, res) => {
  const name = req.query.name;
  const SKU = req.query.SKU;
  
  const result = inventoryServices.getInventory(name, SKU);
  result
    .then((result) => {
      res.send({store_list:result});  
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Can't Find Inventory from Database");
    }); 

});

// app.get("/stores/:id", (req, res) => {
//   const id = req.params["id"]; 
//   const result = inventoryServices.findUserById(id);  
  
//   result
//     .then((result) => {
//       res.send({store_list: result})
//     })
//     .catch((error) => {
//       console.log(error);
//       res.status(404).send("Resource not found.");
//     });
// });

app.post("/inventory", (req, res) => {
  const product = req.body;
  const newProduct = inventoryServices.addProduct(product);
  
  newProduct
    .then((product) => {
      res.status(201).send(product);
    })
    .catch((error) => {
      res.status(500).send(error);
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

// app.listen(port, () => {
//   console.log(
//     `Example app listening at http://polyplus-inventory-febhaeaah4a2a9ht.westus3-01.azurewebsites.net`
//   );
// });
app.listen(process.env.PORT || port, () => {
  console.log("REST API is listening.");
});