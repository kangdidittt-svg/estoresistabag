'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Package, Grid3X3 } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?withProductCount=true');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">SistaBag</span>
            </Link>
            
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                Beranda
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium">
                Produk
              </Link>
              <Link href="/categories" className="text-blue-600 font-medium">
                Kategori
              </Link>
              <Link href="/promos" className="text-gray-700 hover:text-blue-600 font-medium">
                Promo
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kategori Produk</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Jelajahi koleksi tas kami berdasarkan kategori yang sesuai dengan kebutuhan Anda
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Grid3X3 className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada kategori</h3>
            <p className="text-gray-600">Kategori produk akan segera tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Tidak Menemukan yang Anda Cari?</h2>
            <p className="text-lg mb-6 opacity-90">
              Hubungi kami untuk mendapatkan rekomendasi produk yang sesuai dengan kebutuhan Anda
            </p>
            <a
              href="https://wa.me/6281351990003?text=Halo,%20saya%20ingin%20bertanya%20tentang%20produk%20tas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Hubungi Kami
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category Card Component
function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/categories/${category.slug}`} className="group">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border overflow-hidden group-hover:scale-105">
        <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-purple-50">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <ShoppingBag className="h-10 w-10 text-blue-600" />
              </div>
            </div>
          )}
          
          {/* Product Count Badge */}
          <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full">
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <Package className="h-4 w-4" />
              {category.productCount}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {category.name}
          </h3>
          
          {category.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {category.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {category.productCount} produk tersedia
            </span>
            
            <div className="text-blue-600 group-hover:text-blue-700 font-medium text-sm">
              Lihat Produk →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}