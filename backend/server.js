import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import customerRoutes from "./routes/customer.route.js";
import productRoutes from "./routes/product.route.js";
import orderRoutes from "./routes/order.route.js";

import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({limit: "5mb"}));    // to parse req.body (middleware) // limit shouldn't be too high to prevent DOS attack
app.use(express.urlencoded({extended: true}));  // to parse form data [url encoded] (middleware)
app.use(cookieParser());      // to parse the cookies (middleware)

// Existing routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

// New routes for order management system
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
    connectMongoDB();
});