import express from "express";
import { 
  createOrder, 
  getOrders, 
  updateOrderStatus,
  getOrderStats 
} from "../controllers/order.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute, createOrder);
router.get("/", protectRoute, getOrders);
router.patch("/:orderId/status", protectRoute, updateOrderStatus);
router.get("/stats", protectRoute, getOrderStats);

export default router;