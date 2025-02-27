import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";

export const createOrder = async (req, res) => {
  try {
    const { customerId, products } = req.body;

    // Calculate total amount
    const totalAmount = products.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = new Order({
      customer: customerId,
      products,
      totalAmount,
      createdBy: req.user._id
    });

    await order.save();
    
    // Populate customer and product details
    await order.populate('customer products.product');
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { status, customerId, category, limit } = req.query;
    
    const query = { createdBy: req.user._id };
    
    if (status) query.status = status;
    if (customerId) query.customer = customerId;
    if (category) {
      query['products.product'] = {
        $in: await Product.find({ category }).select('_id')
      };
    }

    const limitValue = limit ? parseInt(limit, 10) : undefined;

    const orders = await Order.find(query)
      .populate('customer')
      .populate('products.product')
      .limit(limitValue); // Apply limit
    
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findOne({ 
      _id: orderId,
      createdBy: req.user._id 
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    await order.save();
    
    await order.populate('customer products.product');
    
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $match: { createdBy: req.user._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" }
        }
      }
    ]);

    const customerStats = await Order.aggregate([
      { $match: { createdBy: req.user._id } },
      {
        $group: {
          _id: "$customer",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customerInfo"
        }
      }
    ]);

    res.status(200).json({ orderStats: stats, topCustomers: customerStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};