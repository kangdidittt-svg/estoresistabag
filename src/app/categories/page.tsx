'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Package, Grid3X3, Menu, User, Heart, ShoppingCart, Search } from 'lucide-react';

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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-pink-400 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-pink-500 p-2 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold text-pink-600">
                Toko Siska
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-pink-500 transition-colors font-medium">
                Beranda
              </Link>
              <Link href="/categories" className="text-pink-500 font-bold relative">
                Kategori
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-pink-400 rounded-full"></div>
              </Link>
              <Link href="/promos" className="text-gray-700 hover:text-pink-500 transition-colors font-medium">
                Promo
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-pink-500 transition-colors">
                <Search className="h-5 w-5" />
              </button>
              {/* Hidden buttons as requested */}
              <button className="p-2 text-gray-600 hover:text-pink-500 transition-colors hidden">
                <Heart className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-pink-500 transition-colors relative hidden">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-pink-400 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">0</span>
              </button>
              <button className="p-2 text-gray-600 hover:text-pink-500 transition-colors hidden">
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="relative bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 mb-12">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center animate-fade-in-up">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Grid3X3 className="h-5 w-5 text-white" />
                <span className="text-white font-semibold text-sm tracking-wider">KATEGORI</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Jelajahi Kategori
                <span className="block text-rose-200">Produk Terbaik</span>
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Temukan berbagai kategori produk tas berkualitas tinggi yang sesuai dengan gaya dan kebutuhan Anda
              </p>
            </div>
          </div>
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
        <div className="mt-16 text-center animate-fade-in-up">
          <div className="relative bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 rounded-3xl p-8 text-white overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Tidak Menemukan yang Anda Cari?</h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
                Hubungi kami untuk mendapatkan rekomendasi produk yang sesuai dengan kebutuhan Anda
              </p>
              <a
                href="https://wa.me/6281351990003?text=Halo,%20saya%20ingin%20bertanya%20tentang%20produk%20tas"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-white text-pink-500 px-8 py-4 rounded-xl font-bold hover:bg-pink-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span>Hubungi Kami</span>
                <div className="w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center text-white text-sm">
                  →
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category Card Component
function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/categories/${category.slug}`} className="group animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-pink-100 overflow-hidden group-hover:scale-105 group-hover:border-pink-300 relative">
        {/* Gradient Border Effect */}
        <div className="absolute inset-0 bg-pink-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
        
        <div className="relative aspect-square bg-gradient-to-br from-pink-50 to-rose-50 overflow-hidden">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-20 h-20 bg-pink-200 rounded-full flex items-center justify-center group-hover:bg-pink-300 transition-all duration-300 shadow-lg">
                <ShoppingBag className="h-10 w-10 text-pink-600" />
              </div>
            </div>
          )}
          
          {/* Product Count Badge */}
          <div className="absolute top-4 right-4 bg-pink-400 text-white px-3 py-1 rounded-full shadow-lg">
            <div className="flex items-center gap-1 text-sm font-bold">
              <Package className="h-4 w-4" />
              {category.productCount}
            </div>
          </div>
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-500 transition-colors duration-300">
            {category.name}
          </h3>
          
          {category.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {category.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">
              {category.productCount} produk tersedia
            </span>
            
            <div className="flex items-center space-x-1 text-pink-500 group-hover:text-pink-600 font-bold text-sm group-hover:translate-x-1 transition-all duration-300">
              <span>Lihat Produk</span>
              <div className="w-5 h-5 bg-pink-400 rounded-full flex items-center justify-center text-white text-xs group-hover:scale-110 transition-transform duration-300">
                →
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}