import { Product } from "../models/product.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createProduct = async (req, res) => {
  try {
    const { name, category, description, price } = req.body;
    let { images } = req.body;

    // Handle image uploads to cloudinary
    const imageUrls = [];
    if (images && images.length > 0) {
      for (const image of images) {
        const uploadedResponse = await cloudinary.uploader.upload(image);
        imageUrls.push(uploadedResponse.secure_url);
      }
    }

    const product = new Product({
      name,
      category,
      description,
      price,
      images: imageUrls,
      createdBy: req.user._id
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ createdBy: req.user._id });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
