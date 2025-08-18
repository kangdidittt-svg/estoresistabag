'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  priceAfterDiscount?: number;
  stock: number;
  views: number;
  isPublished: boolean;
  images: string[];
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  promo?: {
    _id: string;
    title: string;
    type: string;
    value: number;
  };
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [currentPage, searchQuery, selectedCategory, statusFilter]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/products?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchProducts();
        alert('Produk berhasil dihapus');
      } else {
        alert('Gagal menghapus produk');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Terjadi kesalahan saat menghapus produk');
    }
  };

  const togglePublishStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPublished: !currentStatus })
      });
      
      if (response.ok) {
        fetchProducts();
      } else {
        alert('Gagal mengubah status publikasi');
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Terjadi kesalahan saat mengubah status');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-theme-main">
      {/* Header */}
      <div className="bg-theme-header shadow-soft border-b border-theme-primary border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/dashboard"
                className="text-on-accent hover:text-accent-peach transition-colors"
              >
                ← Kembali ke Dashboard
              </Link>
              <div className="flex items-center space-x-2">
                <Package className="h-6 w-6 text-accent-peach" />
                <h1 className="text-xl font-semibold text-on-accent">Kelola Produk</h1>
              </div>
            </div>
            <Link
              href="/admin/products/new"
              className="bg-gradient-to-r from-accent-peach to-accent-mint text-on-accent px-4 py-2 rounded-lg hover:from-accent-mint hover:to-accent-yellow transition-all duration-300 flex items-center space-x-2 shadow-soft hover:shadow-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Produk</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="card-theme rounded-lg shadow-soft p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-primary text-opacity-50 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-theme-primary border-opacity-20 rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-theme-main text-theme-primary transition-all duration-200"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-theme-primary border-opacity-20 rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-theme-main text-theme-primary transition-all duration-200"
            >
              <option value="">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-theme-primary border-opacity-20 rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-theme-main text-theme-primary transition-all duration-200"
            >
              <option value="all">Semua Status</option>
              <option value="published">Dipublikasi</option>
              <option value="unpublished">Draft</option>
            </select>

            {/* Reset Button */}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-theme-primary border border-theme-primary border-opacity-20 rounded-lg hover:bg-theme-primary hover:bg-opacity-5 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="card-theme rounded-lg shadow-soft overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-peach"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-theme-primary divide-opacity-10">
                  <thead className="bg-theme-primary bg-opacity-5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-primary text-opacity-60 uppercase tracking-wider">
                        Produk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-primary text-opacity-60 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-primary text-opacity-60 uppercase tracking-wider">
                        Harga
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-primary text-opacity-60 uppercase tracking-wider">
                        Stok
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-primary text-opacity-60 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-theme-primary text-opacity-60 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-theme-primary text-opacity-60 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-primary divide-opacity-10">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-theme-primary hover:bg-opacity-5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={product.images[0] || '/placeholder-bag.jpg'}
                                alt={product.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-theme-primary">
                                {product.name}
                              </div>
                              <div className="text-sm text-theme-primary text-opacity-60">
                                SKU: {product.sku}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-theme-primary">
                            {product.category.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-theme-primary">
                            {formatPrice(product.price)}
                            {product.priceAfterDiscount && (
                              <div className="text-xs text-accent-mint">
                                Diskon: {formatPrice(product.priceAfterDiscount)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm ${
                            product.stock < 5 ? 'text-red-500' : 'text-theme-primary'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-primary">
                          {product.views}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => togglePublishStatus(product._id, product.isPublished)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                              product.isPublished
                                ? 'bg-accent-mint bg-opacity-20 text-accent-mint'
                                : 'bg-theme-primary bg-opacity-10 text-theme-primary text-opacity-60'
                            }`}
                          >
                            {product.isPublished ? (
                              <><Eye className="h-3 w-3 mr-1" /> Dipublikasi</>
                            ) : (
                              <><EyeOff className="h-3 w-3 mr-1" /> Draft</>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/admin/products/${product._id}/edit`}
                              className="text-accent-peach hover:text-accent-yellow transition-colors p-1 rounded"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="bg-theme-main px-4 py-3 flex items-center justify-between border-t border-theme-primary border-opacity-10 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-theme-primary border-opacity-20 text-sm font-medium rounded-md text-theme-primary bg-theme-main hover:bg-theme-primary hover:bg-opacity-5 disabled:opacity-50 transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                      disabled={currentPage === pagination.totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-theme-primary border-opacity-20 text-sm font-medium rounded-md text-theme-primary bg-theme-main hover:bg-theme-primary hover:bg-opacity-5 disabled:opacity-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-theme-primary text-opacity-75">
                        Menampilkan{' '}
                        <span className="font-medium text-theme-primary">
                          {(currentPage - 1) * 10 + 1}
                        </span>{' '}
                        sampai{' '}
                        <span className="font-medium text-theme-primary">
                          {Math.min(currentPage * 10, pagination.totalProducts)}
                        </span>{' '}
                        dari{' '}
                        <span className="font-medium text-theme-primary">{pagination.totalProducts}</span>{' '}
                        produk
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-soft -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-theme-primary border-opacity-20 bg-theme-main text-sm font-medium text-theme-primary text-opacity-60 hover:bg-theme-primary hover:bg-opacity-5 disabled:opacity-50 transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                          .filter(page => 
                            page === 1 || 
                            page === pagination.totalPages || 
                            Math.abs(page - currentPage) <= 2
                          )
                          .map((page, index, array) => (
                            <div key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className="relative inline-flex items-center px-4 py-2 border border-theme-primary border-opacity-20 bg-theme-main text-sm font-medium text-theme-primary text-opacity-60">
                                  ...
                                </span>
                              )}
                              <button
                                onClick={() => setCurrentPage(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                                  currentPage === page
                                    ? 'z-10 bg-accent-peach bg-opacity-10 border-accent-peach text-accent-peach'
                                    : 'bg-theme-main border-theme-primary border-opacity-20 text-theme-primary text-opacity-60 hover:bg-theme-primary hover:bg-opacity-5'
                                }`}
                              >
                                {page}
                              </button>
                            </div>
                          ))
                        }
                        <button
                          onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                          disabled={currentPage === pagination.totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-theme-primary border-opacity-20 bg-theme-main text-sm font-medium text-theme-primary text-opacity-60 hover:bg-theme-primary hover:bg-opacity-5 disabled:opacity-50 transition-colors"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}