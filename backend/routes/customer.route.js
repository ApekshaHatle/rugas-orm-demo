import express from "express";
import { createCustomer, getCustomers } from "../controllers/customer.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute, createCustomer);
router.get("/", protectRoute, getCustomers);

export default router;