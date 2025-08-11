'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tag, Plus, Search, Edit, Trash2, Package } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        withProductCount: 'true'
      });
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/admin/categories?${params}`);
      const data = await response.json();
      
      if (data.success) {
        let filteredCategories = data.data;
        
        // Filter by search query on client side if needed
        if (searchQuery) {
          filteredCategories = data.data.filter((category: Category) =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.description?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        setCategories(filteredCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId: string, categoryName: string, productCount: number) => {
    if (productCount > 0) {
      alert(`Tidak dapat menghapus kategori "${categoryName}" karena masih memiliki ${productCount} produk.`);
      return;
    }
    
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${categoryName}"?`)) return;
    
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchCategories();
        alert('Kategori berhasil dihapus');
      } else {
        alert(data.error || 'Gagal menghapus kategori');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Terjadi kesalahan saat menghapus kategori');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Kembali ke Dashboard
              </Link>
              <div className="flex items-center space-x-2">
                <Tag className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-semibold text-gray-900">Kelola Kategori</h1>
              </div>
            </div>
            <Link
              href="/admin/categories/new"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Kategori</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Category Image */}
                <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 relative">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Tag className="h-16 w-16 text-white opacity-50" />
                    </div>
                  )}
                  
                  {/* Product Count Badge */}
                  <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-3 py-1 flex items-center space-x-1">
                    <Package className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {category.productCount || 0}
                    </span>
                  </div>
                </div>

                {/* Category Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        /{category.slug}
                      </p>
                    </div>
                  </div>

                  {category.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Dibuat: {new Date(category.createdAt).toLocaleDateString('id-ID')}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/categories/${category._id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit kategori"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(category._id, category.name, category.productCount || 0)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus kategori"
                        disabled={category.productCount && category.productCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <div className="text-center py-12">
            <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Kategori tidak ditemukan' : 'Belum ada kategori'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? `Tidak ada kategori yang cocok dengan "${searchQuery}"`
                : 'Mulai dengan menambahkan kategori pertama Anda'
              }
            </p>
            {!searchQuery && (
              <Link
                href="/admin/categories/new"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kategori
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}