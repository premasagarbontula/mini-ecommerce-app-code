import slugify from "slugify";
import productModel from "../models/productModel.js";
import dotenv from "dotenv";
dotenv.config();

//create a product
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, quantity, brand, image } = req.fields;

    // Validation
    if (!name) return res.status(400).send({ error: "Name is required" });
    if (!description)
      return res.status(400).send({ error: "Description is required" });
    if (!price) return res.status(400).send({ error: "Price is required" });
    if (!quantity)
      return res.status(400).send({ error: "Quantity is required" });
    if (!brand) return res.status(400).send({ error: "Brand is required" });
    if (!image) return res.status(400).send({ error: "Image url is required" });

    // Create product
    const product = new productModel({
      ...req.fields,
      slug: slugify(name),
    });

    await product.save();

    res.status(201).send({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in product creation",
      error: error.message,
    });
  }
};

//get all products
export const getProductsController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .limit(100)
      .sort({ createdAt: -1 });

    if (!products || products.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No products found",
        productsCount: 0,
        products: [],
      });
    }

    res.status(200).send({
      success: true,
      message: "All Products",
      productsCount: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in getting products",
      error: error.message,
    });
  }
};

//get single product from slug
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel.findOne({ slug: req.params.slug });

    // If no product found
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // If product found
    res.status(200).send({
      success: true,
      message: "Single Product Fetched",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting single product",
      error: error.message,
    });
  }
};

//update product
export const updateProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image,
      quantity,
      brand,
      rating,
      reviews,
    } = req.fields;

    // Validation
    if (!name) return res.status(400).send({ error: "Name is required" });
    if (!description)
      return res.status(400).send({ error: "Description is required" });
    if (!price) return res.status(400).send({ error: "Price is required" });
    if (!quantity)
      return res.status(400).send({ error: "Quantity is required" });
    if (!brand) return res.status(400).send({ error: "Brand is required" });

    // Prepare update object
    const updateData = {
      name,
      description,
      price,
      quantity,
      brand,
      image,
      slug: slugify(name),
      rating,
      reviews,
    };

    // Single DB call
    const product = await productModel.findByIdAndUpdate(
      req.params.pid,
      updateData,
      { new: true },
    );

    // Check if product exists
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in updating product",
      error: error.message,
    });
  }
};

//delete controller
export const deleteProductController = async (req, res) => {
  try {
    const deletedProduct = await productModel.findByIdAndDelete(req.params.pid);

    if (!deletedProduct) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error in deleting product",
      error: error.message,
    });
  }
};

//filters
export const productFiltersController = async (req, res) => {
  try {
    const { radio } = req.body;
    let args = {};

    if (radio?.length) args.price = { $gte: radio[0], $lt: radio[1] };
    const products = await productModel.find(args);

    return res.status(200).send({
      success: true,
      products,
      productsCount: products.length,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).send({
      success: false,
      message: "Server Error while filtering products",
      error: error.message,
    });
  }
};

//search controller
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params; // or req.query.keyword if using query string

    if (!keyword) {
      return res.status(400).send({
        success: false,
        message: "Search keyword is required",
      });
    }

    const results = await productModel.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    });

    return res.status(200).send({
      success: true,
      resultsCount: results.length,
      results,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Server Error while searching products",
      error: error.message,
    });
  }
};
