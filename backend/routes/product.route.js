import express from "express";
import { createProduct, getProducts } from "../controllers/product.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute, createProduct);
router.get("/", protectRoute, getProducts);

export default router;