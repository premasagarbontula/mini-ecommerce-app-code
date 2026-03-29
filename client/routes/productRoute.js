import express from "express";
import formidable from "express-formidable";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  createProductController,
  deleteProductController,
  getProductsController,
  getSingleProductController,
  productFiltersController,
  searchProductController,
  updateProductController,
} from "../controllers/productController.js";

const router = express.Router();

//routes
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController,
);
//formidable() from express-formidable is middleware because it processes the request (parses form data) and passes control using next().
// Behaves exactly like: express.json()
//req.fields : text inputs
//req.files   :uploaded files(images)

//update product
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController,
);

//get products
router.get("/get-products", getProductsController);

//get single product
router.get("/get-product/:slug", getSingleProductController);

//delete product
router.delete(
  "/delete-product/:pid",
  requireSignIn,
  isAdmin,
  deleteProductController,
);

//filter product (SERVER SIDE FILTERING)
router.post("/product-filters", productFiltersController); //post because we passing data

//product search
router.get("/search/:keyword", searchProductController);

export default router;
