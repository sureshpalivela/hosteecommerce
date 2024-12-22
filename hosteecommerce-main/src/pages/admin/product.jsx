import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/admin/sidebar';
import { Pencil, Save, Search, ArrowUpDown, Plus, Trash2 } from 'lucide-react';
import { Helmet } from "react-helmet";
import { useParams, useNavigate } from 'react-router-dom';

const Product = () => {
    const { sellerId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({
    name: '',
    category: '',
    price: '',
    inStockValue: '',
    soldStockValue: '',
    description: ''
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    inStockValue: '',
    description: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const verifySeller = async () => {
      if (!sellerId) {
        navigate('/seller/login');
        return;
      }

      try {
        const response = await fetch('https://ecommercebackend-8gx8.onrender.com/admin/verify-seller', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sellerId })
        });

        const data = await response.json();
        if (data.loggedIn !== 'loggedin') {
          navigate('/seller/login');
        }
      } catch (error) {
        console.error('Error verifying seller:', error);
        navigate('/seller/login');
      }
    };

    verifySeller();
  }, [sellerId, navigate]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://ecommercebackend-8gx8.onrender.com/get-product');
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.productId);
    setEditValues({
      name: product.name || '',
      category: product.category || '',
      price: product.price || 0,
      inStockValue: product.inStockValue || 0,
      soldStockValue: product.soldStockValue || 0,
      description: product.description || ''
    });
  };

  const handleSave = async (productId) => {
    try {
      const response = await fetch('https://ecommercebackend-8gx8.onrender.com/instock-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          ...editValues
        })
      });

      if (response.ok) {
        setEditingId(null);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDelete = async (productId) => {
    try {
      const response = await fetch(`https://ecommercebackend-8gx8.onrender.com/delete-product/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleAddProduct = async () => {
    try {
      const response = await fetch('https://ecommercebackend-8gx8.onrender.com/add-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
      });

      if (response.ok) {
        setNewProduct({ name: '', category: '', price: '', inStockValue: '', description: '' });
        setIsAddModalOpen(false);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = React.useMemo(() => {
    if (!Array.isArray(products)) return [];
    let sortableProducts = [...products];
    if (sortConfig.key !== null) {
      sortableProducts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProducts;
  }, [products, sortConfig]);

  const filteredProducts = sortedProducts.filter(product => 
    product.productId?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex">
      <Helmet>
        <title>Products | Admin | Mera Bestie</title>
      </Helmet>
      <Sidebar />
      <div className="flex-1 p-8 ml-[5rem] lg:ml-64 bg-pink-50 min-h-screen">
        <div className="mb-6 flex justify-between items-center">
          <div className="relative">
            <div className={`flex items-center ${isSearchExpanded ? 'w-full md:w-64' : 'w-10 md:w-64'} transition-all duration-300`}>
              <button 
                className="md:hidden absolute left-2 z-10"
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              >
                <Search size={20} />
              </button>
              <input
                type="text"
                placeholder="Search by product ID or name..."
                className={`pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 ${
                  isSearchExpanded ? 'w-full opacity-100' : 'w-0 md:w-full opacity-0 md:opacity-100'
                } transition-all duration-300`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
          >
            <Plus size={20} className="inline-block mr-2" /> Add Product
          </button>
        </div>

        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full border rounded px-4 py-2"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Category"
                  className="w-full border rounded px-4 py-2"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Price"
                  className="w-full border rounded px-4 py-2"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="In Stock"
                  className="w-full border rounded px-4 py-2"
                  value={newProduct.inStockValue}
                  onChange={(e) => setNewProduct({ ...newProduct, inStockValue: e.target.value })}
                />
                <textarea
                  placeholder="Description"
                  className="w-full border rounded px-4 py-2"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-pink-100">
              <tr>
                <th onClick={() => handleSort('name')} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">
                  <div className="flex items-center">
                    Product
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th onClick={() => handleSort('category')} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">
                  <div className="flex items-center">
                    Category
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th onClick={() => handleSort('price')} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">
                  <div className="flex items-center">
                    Price
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th onClick={() => handleSort('inStockValue')} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">
                  <div className="flex items-center">
                    In Stock
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th onClick={() => handleSort('soldStockValue')} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer">
                  <div className="flex items-center">
                    Sold
                    <ArrowUpDown size={14} className="ml-1" />
                  </div>
                </th>
                <th>Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.productId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.productId ? (
                      <input
                        type="text"
                        className="w-20 border rounded px-2 py-1"
                        value={editValues.name}
                        onChange={(e) => setEditValues({...editValues, name: e.target.value})}
                      />
                    ) : (
                      product.name || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.productId ? (
                      <input
                        type="text"
                        className="w-20 border rounded px-2 py-1"
                        value={editValues.category}
                        onChange={(e) => setEditValues({...editValues, category: e.target.value})}
                      />
                    ) : (
                      product.category || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.productId ? (
                      <input
                        type="number"
                        className="w-20 border rounded px-2 py-1"
                        value={editValues.price}
                        onChange={(e) => setEditValues({...editValues, price: e.target.value})}
                      />
                    ) : (
                      product.price || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.productId ? (
                      <input
                        type="number"
                        className="w-20 border rounded px-2 py-1"
                        value={editValues.inStockValue}
                        onChange={(e) => setEditValues({...editValues, inStockValue: e.target.value})}
                      />
                    ) : (
                      product.inStockValue || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.productId ? (
                      <input
                        type="number"
                        className="w-20 border rounded px-2 py-1"
                        value={editValues.soldStockValue}
                        onChange={(e) => setEditValues({...editValues, soldStockValue: e.target.value})}
                      />
                    ) : (
                      product.soldStockValue || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.productId ? (
                      <textarea
                        className="w-20 border rounded px-2 py-1"
                        value={editValues.description}
                        onChange={(e) => setEditValues({...editValues, description: e.target.value})}
                      />
                    ) : (
                      product.description || '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingId === product.productId ? (
                      <button
                        onClick={() => handleSave(product.productId)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Save size={18} />
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.productId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Product;
