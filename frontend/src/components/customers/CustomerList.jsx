import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaSearch, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const CustomerList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 10;

  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/customers");
        if (!res.ok) {
          throw new Error("Failed to fetch customers");
        }
        return res.json();
      } catch (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }
    }
  });

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) => 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  // Pagination
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Format address
  const formatAddress = (address) => {
    if (!address) return "No address";
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Customers</h2>
        <Link 
          to="/customers/new" 
          className="bg-[#2C3E50] text-white px-4 py-2 rounded-lg hover:bg-[#34495E] transition-colors duration-300"
        >
          Add New Customer
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2C3E50]"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          Error loading customers. Please try again.
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No customers found. Add your first customer!
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentCustomers.map((customer) => (
              <div key={customer._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-300">
                <Link to={`/customers/${customer._id}`}>
                  <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">{customer.name}</h3>
                </Link>
                <div className="flex items-center text-gray-600 mb-1">
                  <FaEnvelope className="mr-2 text-sm" />
                  <a href={`mailto:${customer.email}`} className="text-sm hover:underline">{customer.email}</a>
                </div>
                <div className="flex items-center text-gray-600 mb-1">
                  <FaPhone className="mr-2 text-sm" />
                  <a href={`tel:${customer.phone}`} className="text-sm hover:underline">{customer.phone}</a>
                </div>
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-2 text-sm flex-shrink-0" />
                  <span className="text-sm truncate">{formatAddress(customer.address)}</span>
                </div>
                <div className="mt-3 pt-3 border-t flex justify-end">
                  <Link
                    to={`/orders/new?customer=${customer._id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Create Order
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === index + 1
                        ? "bg-[#2C3E50] text-white"
                        : "border hover:bg-gray-100"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerList;