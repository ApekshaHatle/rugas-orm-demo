import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MdShoppingCart, MdPeople, MdInventory, MdLocalShipping, MdAttachMoney, MdPerson } from "react-icons/md";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const HomePage = () => {
  const [orderStats, setOrderStats] = useState({
    total: 0,
    placed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalAmount: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [orderTrends, setOrderTrends] = useState([]);
  
  // Fetch order statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["orderStats"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/orders/stats");
        if (!res.ok) {
          throw new Error("Failed to fetch order statistics");
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching order stats:", error);
        throw error;
      }
    }
  });
  
  // Fetch recent orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["recentOrders"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/orders?limit=5");
        if (!res.ok) {
          throw new Error("Failed to fetch recent orders");
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching recent orders:", error);
        throw error;
      }
    }
  });

  useEffect(() => {
    if (ordersData) {
      setRecentOrders(ordersData);
    }
  }, [ordersData]);

  // Generate order trends from recent orders data
  useEffect(() => { 
    if (ordersData && Array.isArray(ordersData)) {
      // Group orders by date
      const ordersByDate = {};
      
      // Process orders to count by date
      ordersData.forEach(order => {
        if (order.createdAt) {
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
          if (!ordersByDate[orderDate]) {
            ordersByDate[orderDate] = 0;
          }
          ordersByDate[orderDate]++;
        }
      });

      // Generate data for the last 7 days (including today)
      const trendData = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        trendData.push({
          date: dateString.substring(5), // Format as MM-DD for display
          count: ordersByDate[dateString] || 0
        });
      }

      setOrderTrends(trendData);
    } else if (!ordersLoading) {
      // If we have no orders data but loading is complete, show empty trend
      const trendData = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        trendData.push({
          date: dateString.substring(5), // Format as MM-DD for display
          count: 0
        });
      }

      setOrderTrends(trendData);
    }
  }, [ordersData, ordersLoading]);
  
  // Update state when stats data is fetched
  useEffect(() => {
    if (statsData) {
      // Initialize with zeros
      const stats = {
        total: 0,
        placed: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        totalAmount: 0
      };
      
      // If orderStats exists in the API response
      if (statsData.orderStats) {
        // Calculate total from all status counts
        let total = 0;
        let totalAmount = 0;
        
        // Map each status to its count
        statsData.orderStats.forEach(stat => {
          if (stat._id in stats) {
            stats[stat._id] = stat.count;
          }
          total += stat.count;
          totalAmount += stat.totalAmount || 0;
        });
        
        // Set the total
        stats.total = total;
        stats.totalAmount = totalAmount;
      }
      
      setOrderStats(stats);
      
      // Set top customers if available
      if (statsData.topCustomers) {
        setTopCustomers(statsData.topCustomers);
      }
    }
  }, [statsData]);

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <Link 
          to="/orders" 
          className="bg-[#2C3E50] text-white px-4 py-2 rounded-lg hover:bg-[#34495E] transition-colors duration-300"
        >
          Create New Order
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <h3 className="text-2xl font-bold">{statsLoading ? "..." : orderStats.total}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <MdShoppingCart className="text-blue-500 w-6 h-6" />
            </div>
          </div>
        </div>
        
        {/* Orders Placed */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Orders Placed</p>
              <h3 className="text-2xl font-bold">{statsLoading ? "..." : orderStats.placed}</h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <MdPeople className="text-yellow-500 w-6 h-6" />
            </div>
          </div>
        </div>
        
        {/* Orders Shipped */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Orders Shipped</p>
              <h3 className="text-2xl font-bold">{statsLoading ? "..." : orderStats.shipped}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <MdLocalShipping className="text-green-500 w-6 h-6" />
            </div>
          </div>
        </div>
        
        {/* Orders Delivered */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Orders Delivered</p>
              <h3 className="text-2xl font-bold">{statsLoading ? "..." : orderStats.delivered}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <MdInventory className="text-purple-500 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-emerald-500">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <h3 className="text-2xl font-bold">{statsLoading ? "..." : formatCurrency(orderStats.totalAmount)}</h3>
          </div>
          <div className="bg-emerald-100 p-3 rounded-full">
            <MdAttachMoney className="text-emerald-500 w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Order Trends Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Order Trends (Last 7 Days)</h2>
        </div>
        
        {ordersLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2C3E50]"></div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={orderTrends}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value) => [`${value} orders`, 'Count']} />
                <Line type="monotone" dataKey="count" stroke="#2C3E50" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Customers Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Top Customers</h2>
          <Link to="/customers" className="text-[#2C3E50] hover:underline text-sm">View All</Link>
        </div>
        
        {statsLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2C3E50]"></div>
          </div>
        ) : topCustomers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No customer data available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <MdPerson className="text-gray-600 w-6 h-6" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.customerInfo[0]?.name || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.customerInfo[0]?.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.orderCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
          <Link to="/orders" className="text-[#2C3E50] hover:underline text-sm">View All</Link>
        </div>
        
        {ordersLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2C3E50]"></div>
          </div>
        ) : recentOrders.length === 0 ? (
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2C3E50]">
                      <Link to={`/orders/${order._id}`}>
                        #{order._id.substring(0, 8)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'placed' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
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

export default HomePage;