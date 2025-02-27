import Customer from "../models/customer.model.js";

export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ error: "Customer with this email already exists" });
    }

    const customer = new Customer({
      name,
      email,
      phone,
      address,
      createdBy: req.user._id
    });

    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ createdBy: req.user._id });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
