import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IoCloseSharp, IoAdd } from "react-icons/io5";
import { FaBox, FaTag, FaEdit, FaTrash, FaImage, FaPlus } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const fetchProducts = async () => {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

const createProduct = async (productData) => {
  // Convert images to format expected by backend
  let formData = { ...productData };
  
  // Handle image uploads
  if (formData.imageFiles && formData.imageFiles.length > 0) {
    const imagePromises = formData.imageFiles.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    });
    formData.images = await Promise.all(imagePromises);
    delete formData.imageFiles; // Remove the file objects
  }
  
  const res = await fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  
  if (!res.ok) throw new Error("Failed to create product");
  return res.json();
};

const deleteProduct = async (productId) => {
  const res = await fetch(`/api/products/${productId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.json();
};

const formatCurrency = (amount) => {
  return `$${parseFloat(amount).toFixed(2)}`;
};

const ProductPage = () => {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    imageFiles: [],
    images: []
  });
  
  const { data: products, isLoading: productsLoading } = useQuery({ 
    queryKey: ["products"], 
    queryFn: fetchProducts 
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("Product Created Successfully");
      queryClient.invalidateQueries(["products"]);
      setShowAddForm(false);
      setFormData({
        name: "",
        category: "",
        description: "",
        price: "",
        imageFiles: [],
        images: []
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Product Deleted Successfully");
      queryClient.invalidateQueries(["products"]);
    },
    onError: (error) => toast.error(error.message),
  });

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        imageFiles: [...prev.imageFiles, ...files]
      }));
    }
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.description || !formData.price) {
      toast.error("Please fill all required fields");
      return;
    }
    
    createMutation.mutate(formData);
  };

  const confirmDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(productId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 w-full">
      <h1 className="text-3xl font-bold mb-6">Products Management</h1>
      
      <div className="mb-6 flex justify-end">
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          {showAddForm ? (
            <>
              <IoCloseSharp className="mr-2" /> Cancel
            </>
          ) : (
            <>
              <FaPlus className="mr-2" /> Add New Product
            </>
          )}
        </button>
      </div>
      
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-6 border rounded-lg shadow-lg mb-8 bg-white">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <FaBox className="text-blue-600" /> Product Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter product category"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter product description"
              required
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
            <div className="flex items-center mb-2">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-md transition-colors flex items-center">
                <FaImage className="mr-2" /> Browse Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="ml-4 text-sm text-gray-500">
                {formData.imageFiles.length > 0 ? 
                  `${formData.imageFiles.length} ${formData.imageFiles.length === 1 ? 'file' : 'files'} selected` : 
                  'No files selected'}
              </span>
            </div>
            
            {formData.imageFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.imageFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="h-16 w-16 border rounded-md overflow-hidden">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${index}`} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <IoCloseSharp size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <IoAdd className="mr-2" />
              )}
              Create Product
            </button>
          </div>
        </form>
      )}
      
      {/* Products List */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FaBox className="mr-2 text-blue-600" /> Your Products
          </h2>
          <Link to="/products/inventory" className="text-blue-600 hover:underline text-sm">
            View Inventory
          </Link>
        </div>
        
        {productsLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No products found. Start by adding your first product!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-100 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <FaImage size={48} />
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <span className="font-bold text-green-600">{formatCurrency(product.price)}</span>
                  </div>
                  
                  <div className="mt-1 mb-3">
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                      {product.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <Link 
                      to={`/products/edit/${product._id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <FaEdit />
                    </Link>
                    <button 
                      onClick={() => confirmDelete(product._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;