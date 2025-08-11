'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, Star, Eye, Tag } from 'lucide-react';
import { formatCurrency, calculateDiscountPercentage } from '@/lib/utils';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  priceAfterDiscount?: number;
  images: string[];
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  views: number;
  stock: number;
  promo?: {
    _id: string;
    title: string;
    type: string;
    value: number;
  };
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productCount: number;
}

interface Promo {
  _id: string;
  title: string;
  type: string;
  value: number;
  productCount: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, promosRes, popularRes] = await Promise.all([
        fetch('/api/products?limit=8'),
        fetch('/api/categories?withProductCount=true'),
        fetch('/api/promos?activeOnly=true'),
        fetch('/api/products?sort=views&order=desc&limit=6')
      ]);

      const [productsData, categoriesData, promosData, popularData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        promosRes.json(),
        popularRes.json()
      ]);

      if (productsData.success) setProducts(productsData.data.products);
      if (categoriesData.success) setCategories(categoriesData.data);
      if (promosData.success) setPromos(promosData.data);
      if (popularData.success) setPopularProducts(popularData.data.products);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
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
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">SistaBag</span>
              </Link>
            </div>
            
            <div className="flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Cari tas impian Anda..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </form>
            </div>

            <nav className="flex space-x-6">
              <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium">
                Produk
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-blue-600 font-medium">
                Kategori
              </Link>
              <Link href="/promos" className="text-gray-700 hover:text-blue-600 font-medium">
                Promo
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Koleksi Tas Terbaik
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Temukan tas impian Anda dengan kualitas terbaik dan harga terjangkau
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Jelajahi Koleksi
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Kategori Unggulan</h2>
              <p className="text-gray-600">Pilih kategori sesuai kebutuhan Anda</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category._id}
                  href={`/categories/${category.slug}`}
                  className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                      <ShoppingBag className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.productCount} produk</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Products */}
      {popularProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Produk Populer</h2>
                <p className="text-gray-600">Produk yang paling banyak dilihat</p>
              </div>
              <Link
                href="/products?sort=views&order=desc"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Lihat Semua →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularProducts.map((product) => (
                <ProductCard key={product._id} product={product} showPopularBadge />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promo Section */}
      {promos.length > 0 && (
        <section className="py-16 bg-red-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Promo Aktif</h2>
              <p className="text-gray-600">Jangan lewatkan penawaran terbaik kami</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promos.slice(0, 3).map((promo) => (
                <Link
                  key={promo._id}
                  href={`/promos`}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-red-200"
                >
                  <div className="flex items-center mb-4">
                    <Tag className="h-6 w-6 text-red-600 mr-2" />
                    <span className="text-red-600 font-semibold">PROMO</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{promo.title}</h3>
                  <p className="text-2xl font-bold text-red-600 mb-2">
                    {promo.type === 'percent' ? `${promo.value}%` : formatCurrency(promo.value)} OFF
                  </p>
                  <p className="text-sm text-gray-500">{promo.productCount} produk tersedia</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Products */}
      {products.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Produk Terbaru</h2>
                <p className="text-gray-600">Koleksi terbaru yang baru saja tiba</p>
              </div>
              <Link
                href="/products"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Lihat Semua →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ShoppingBag className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">SistaBag</span>
              </div>
              <p className="text-gray-400">
                Toko tas terpercaya dengan koleksi terlengkap dan kualitas terbaik.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Kategori</h3>
              <ul className="space-y-2 text-gray-400">
                {categories.slice(0, 4).map((category) => (
                  <li key={category._id}>
                    <Link href={`/categories/${category.slug}`} className="hover:text-white">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Bantuan</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Cara Pemesanan</a></li>
                <li><a href="#" className="hover:text-white">Kebijakan Privasi</a></li>
                <li><a href="#" className="hover:text-white">Syarat & Ketentuan</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Kontak</h3>
              <ul className="space-y-2 text-gray-400">
                <li>WhatsApp: +62 812-3456-7890</li>
                <li>Email: info@sistabag.com</li>
                <li>Alamat: Jakarta, Indonesia</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SistaBag. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Product Card Component
function ProductCard({ product, showPopularBadge = false }: { product: Product; showPopularBadge?: boolean }) {
  const discountPercentage = product.priceAfterDiscount 
    ? calculateDiscountPercentage(product.price, product.priceAfterDiscount)
    : 0;

  const isPopular = product.views >= 100;

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border overflow-hidden">
        <div className="relative aspect-square">
          <Image
            src={product.images[0] || '/placeholder-bag.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {showPopularBadge && isPopular && (
              <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Star className="h-3 w-3" />
                Populer
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                -{discountPercentage}%
              </span>
            )}
          </div>
          
          {/* Views */}
          <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {product.views}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{product.category.name}</p>
          
          <div className="flex items-center justify-between">
            <div>
              {product.priceAfterDiscount ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(product.priceAfterDiscount)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            
            <span className={`text-xs px-2 py-1 rounded-full ${
              product.stock > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.stock > 0 ? 'Tersedia' : 'Habis'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
