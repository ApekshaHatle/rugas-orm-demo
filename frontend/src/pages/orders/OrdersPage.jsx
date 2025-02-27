import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IoCloseSharp } from "react-icons/io5";
import { FaUser, FaBox, FaShoppingCart, FaEye, FaTruck, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const fetchOrders = async () => {
  const res = await fetch("/api/orders");
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
};

const fetchCustomers = async () => {
  const res = await fetch("/api/customers");
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
};

const fetchProducts = async () => {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

const createOrder = async (orderData) => {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error("Failed to create order");
  return res.json();
};

const updateOrderStatus = async (orderId, status) => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update order status");
    return res.json();
  };

const formatCurrency = (amount) => {
  return `$${parseFloat(amount).toFixed(2)}`;
};

const OrderPage = () => {
  const queryClient = useQueryClient();
  const [customerId, setCustomerId] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showStatusButtons, setShowStatusButtons] = useState({});
  
  const { data: customers, isLoading: customersLoading } = useQuery({ 
    queryKey: ["customers"], 
    queryFn: fetchCustomers 
  });
  
  const { data: productsList, isLoading: productsLoading } = useQuery({ 
    queryKey: ["products"], 
    queryFn: fetchProducts 
  });
  
  const { data: orders, isLoading: ordersLoading } = useQuery({ 
    queryKey: ["orders"], 
    queryFn: fetchOrders 
  });

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      toast.success("Order Created Successfully");
      queryClient.invalidateQueries(["orders"]);
      setCustomerId("");
      setSelectedProducts([]);
    },
    onError: (error) => toast.error(error.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      toast.success("Order Status Updated");
      queryClient.invalidateQueries(["orders"]);
      setShowStatusButtons({});
    },
    onError: (error) => toast.error(error.message),
  });

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index][field] = value;
    updatedProducts[index].price = productsList.find(p => p._id === updatedProducts[index].product)?.price * updatedProducts[index].quantity || 0;
    setSelectedProducts(updatedProducts);
  };

  const addProduct = () => {
    setSelectedProducts([...selectedProducts, { product: "", quantity: 1, price: 0 }]);
  };

  const removeProduct = (index) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerId || selectedProducts.length === 0 || selectedProducts.some(p => !p.product || p.quantity <= 0)) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const totalAmount = selectedProducts.reduce((sum, product) => sum + product.price, 0);
    mutation.mutate({ customerId, products: selectedProducts, totalAmount, status: 'placed', createdAt: new Date() });
  };

  const toggleStatusButtons = (orderId) => {
    setShowStatusButtons(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'placed': return <FaShoppingCart className="mr-1" />;
      case 'shipped': return <FaTruck className="mr-1" />;
      case 'delivered': return <FaCheckCircle className="mr-1" />;
      case 'cancelled': return <FaTimesCircle className="mr-1" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'placed': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalAmount = (order) => {
    return order.products ? order.products.reduce((sum, product) => sum + product.price, 0) : 0;
  };

  return (
    <div className="container mx-auto px-4 py-6 w-full">
      <h1 className="text-3xl font-bold mb-6">Orders Management</h1>
      
      <form onSubmit={handleSubmit} className="p-6 border rounded-lg shadow-lg mb-8 bg-white">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <FaUser className="text-blue-600" /> Select Customer
        </h2>
        
        {customersLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex gap-3 flex-wrap mb-6">
            {customers?.map((customer) => (
              <div 
                key={customer._id} 
                className={`p-3 border rounded-md cursor-pointer transition-all flex items-center ${
                  customerId === customer._id 
                    ? 'bg-blue-500 text-white border-blue-600 shadow-md' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`} 
                onClick={() => setCustomerId(customer._id)}
              >
                <FaUser className="mr-2" /> {customer.name}
              </div>
            ))}
          </div>
        )}
        
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <FaBox className="text-green-600" /> Select Products
        </h2>
        
        {productsLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            {selectedProducts.map((product, index) => (
              <div key={index} className="flex flex-wrap gap-3 items-center border p-4 rounded-md mb-4 bg-gray-50">
                <div className="flex flex-wrap gap-2 mb-2 w-full md:w-auto md:mb-0">
                  {productsList?.map((p) => (
                    <div 
                      key={p._id} 
                      className={`p-3 border rounded-md cursor-pointer transition-all flex items-center ${
                        product.product === p._id 
                          ? 'bg-green-500 text-white border-green-600 shadow-md' 
                          : 'bg-white hover:bg-gray-100'
                      }`} 
                      onClick={() => handleProductChange(index, "product", p._id)}
                    >
                      <FaBox className="mr-2" /> {p.name}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="number" 
                    min="1"
                    placeholder="Qty" 
                    value={product.quantity} 
                    onChange={(e) => handleProductChange(index, "quantity", parseInt(e.target.value) || 1)} 
                    className="border p-2 w-20 rounded-md" 
                  />
                  <p className="font-bold text-lg">{formatCurrency(product.price)}</p>
                  <button 
                    type="button" 
                    onClick={() => removeProduct(index)} 
                    className="text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <IoCloseSharp size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={addProduct} 
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors mb-6 flex items-center"
            >
              <FaBox className="mr-2" /> Add Product
            </button>
            
            <div className="flex justify-between items-center">
              <div className="text-lg font-bold">
                Total: {formatCurrency(selectedProducts.reduce((sum, product) => sum + product.price, 0))}
              </div>
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                disabled={mutation.isLoading}
              >
                {mutation.isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <FaShoppingCart className="mr-2" />
                )}
                Create Order
              </button>
            </div>
          </>
        )}
      </form>
      
      {/* Recent Orders Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FaShoppingCart className="mr-2 text-blue-600" /> Recent Orders
          </h2>
          <Link to="/orders" className="text-blue-600 hover:underline text-sm flex items-center">
            <FaEye className="mr-1" /> View All
          </Link>
        </div>
        
        {ordersLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No orders found. Create your first order!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      <Link to={`/orders/${order._id}`}>
                        #{order._id.substring(0, 8)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer?.name || customers?.find(c => c._id === order.customerId)?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(order.totalAmount || calculateTotalAmount(order))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => toggleStatusButtons(order._id)}
                        className="text-blue-600 hover:text-blue-900 focus:outline-none"
                      >
                        Update
                      </button>
                      
                      {showStatusButtons[order._id] && (
                        <div className="absolute mt-2 right-8 bg-white border rounded-md shadow-lg p-2 z-10">
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => statusMutation.mutate({ orderId: order._id, status: 'placed' })}
                              className="flex items-center px-3 py-2 text-sm text-yellow-800 bg-yellow-100 rounded-md hover:bg-yellow-200"
                            >
                              <FaShoppingCart className="mr-2" /> Placed
                            </button>
                            <button
                              onClick={() => statusMutation.mutate({ orderId: order._id, status: 'shipped' })}
                              className="flex items-center px-3 py-2 text-sm text-blue-800 bg-blue-100 rounded-md hover:bg-blue-200"
                            >
                              <FaTruck className="mr-2" /> Shipped
                            </button>
                            <button
                              onClick={() => statusMutation.mutate({ orderId: order._id, status: 'delivered' })}
                              className="flex items-center px-3 py-2 text-sm text-green-800 bg-green-100 rounded-md hover:bg-green-200"
                            >
                              <FaCheckCircle className="mr-2" /> Delivered
                            </button>
                            <button
                              onClick={() => statusMutation.mutate({ orderId: order._id, status: 'cancelled' })}
                              className="flex items-center px-3 py-2 text-sm text-red-800 bg-red-100 rounded-md hover:bg-red-200"
                            >
                              <FaTimesCircle className="mr-2" /> Cancelled
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;