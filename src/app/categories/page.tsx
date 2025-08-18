'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Package, Grid3X3, Menu, User, Heart, ShoppingCart, Search, X, Grid, Tag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { getWhatsAppUrl } from '@/lib/whatsapp';
import Navigation from '@/components/Navigation';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
}

export default function CategoriesPage() {
  const { state, dispatch } = useCart();
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
      <div className="fixed inset-0 bg-theme-main bg-opacity-80 flex items-center justify-center z-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-accent-peach border-opacity-20 border-t-accent-peach rounded-full animate-spin"></div>
          <p className="text-theme-primary text-sm font-medium animate-pulse">Memuat kategori...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-main">
      {/* Header */}
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="relative bg-gradient-to-r from-accent-peach via-accent-mint to-accent-yellow overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 mb-12">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center animate-fade-in-up">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Grid3X3 className="h-5 w-5 text-on-accent" />
                <span className="text-on-accent font-semibold text-sm tracking-wider">KATEGORI</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-on-accent mb-4 leading-tight">
                Jelajahi Kategori
                <span className="block text-on-accent text-opacity-80">Produk Terbaik</span>
              </h1>
              <p className="text-xl text-on-accent text-opacity-90 max-w-2xl mx-auto leading-relaxed">
                Temukan berbagai kategori produk tas berkualitas tinggi yang sesuai dengan gaya dan kebutuhan Anda
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-theme-primary text-opacity-40 mb-4">
              <Grid3X3 className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-theme-primary mb-2">Belum ada kategori</h3>
            <p className="text-theme-primary text-opacity-60">Kategori produk akan segera tersedia</p>
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
          <div className="relative bg-gradient-to-r from-accent-peach via-accent-mint to-accent-yellow rounded-3xl p-8 text-on-accent overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Tidak Menemukan yang Anda Cari?</h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
                Hubungi kami untuk mendapatkan rekomendasi produk yang sesuai dengan kebutuhan Anda
              </p>
              <button
                onClick={async () => {
                  const message = 'Halo, saya ingin bertanya tentang produk tas';
                  const whatsappUrl = await getWhatsAppUrl(message);
                  window.open(whatsappUrl, '_blank');
                }}
                className="inline-flex items-center space-x-2 bg-theme-main text-accent-peach px-8 py-4 rounded-xl font-bold hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span>Hubungi Kami</span>
                <div className="w-6 h-6 bg-accent-peach rounded-full flex items-center justify-center text-on-accent text-sm">
                  →
                </div>
              </button>
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
      <div className="card-theme rounded-2xl shadow-soft hover:shadow-xl transition-all duration-500 border border-theme-primary border-opacity-10 overflow-hidden group-hover:scale-105 group-hover:border-accent-peach relative">
        {/* Gradient Border Effect */}
        <div className="absolute inset-0 bg-accent-peach rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
        
        <div className="relative aspect-square bg-gradient-to-br from-accent-mint from-opacity-20 to-accent-peach to-opacity-20 overflow-hidden">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-20 h-20 bg-accent-mint bg-opacity-30 rounded-full flex items-center justify-center group-hover:bg-accent-peach group-hover:bg-opacity-30 transition-all duration-300 shadow-lg">
                <ShoppingBag className="h-10 w-10 text-accent-peach" />
              </div>
            </div>
          )}
          
          {/* Product Count Badge */}
          <div className="absolute top-4 right-4 bg-accent-peach text-on-accent px-3 py-1 rounded-full shadow-lg">
            <div className="flex items-center gap-1 text-sm font-bold">
              <Package className="h-4 w-4" />
              {category.productCount}
            </div>
          </div>
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-theme-primary mb-2 group-hover:text-accent-peach transition-colors duration-300">
            {category.name}
          </h3>
          
          {category.description && (
            <p className="text-theme-primary text-opacity-60 text-sm mb-4 line-clamp-2 leading-relaxed">
              {category.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-theme-primary text-opacity-50 font-medium">
              {category.productCount} produk tersedia
            </span>
            
            <div className="flex items-center space-x-1 text-accent-peach group-hover:text-accent-mint font-bold text-sm group-hover:translate-x-1 transition-all duration-300">
              <span>Lihat Produk</span>
              <div className="w-5 h-5 bg-accent-peach rounded-full flex items-center justify-center text-on-accent text-xs group-hover:scale-110 transition-transform duration-300">
                →
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}