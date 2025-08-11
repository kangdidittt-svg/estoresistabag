'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, Star, Eye, Tag, Menu, User, Heart, ShoppingCart, ChevronLeft, ChevronRight, Mail, Facebook, Instagram, Twitter, Grid, Package } from 'lucide-react';
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerSlide = 4;
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
      <div className="loading-overlay">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-pink-100 transition-smooth">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="bg-pink-300 p-3 rounded-2xl group-hover:scale-105 transition-smooth">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient-coral animate-fade-in">SistaBag</span>
              </Link>
            </div>
            
            <div className="flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative animate-fade-in animate-delay-100">
                <input
                  type="text"
                  placeholder="Cari tas impian Anda..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-pink-200 rounded-2xl focus:ring-2 focus:ring-pink-300 focus:border-pink-300 transition-smooth bg-pink-50 hover:bg-pink-100"
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-pink-400" />
              </form>
            </div>

            <nav className="flex items-center space-x-6 animate-fade-in animate-delay-200">
              <Link href="/products" className="text-gray-600 hover:text-pink-500 font-medium transition-smooth flex items-center space-x-1">
                <ShoppingBag className="h-4 w-4" />
                <span>Produk</span>
              </Link>
              
              <Link href="/categories" className="text-gray-600 hover:text-pink-500 font-medium transition-smooth flex items-center space-x-1">
                <Menu className="h-4 w-4" />
                <span>Kategori</span>
              </Link>
              
              <Link href="/promos" className="text-gray-600 hover:text-pink-500 font-medium transition-smooth flex items-center space-x-1">
                <Tag className="h-4 w-4" />
                <span>Promo</span>
              </Link>
              
              <div className="flex items-center space-x-2 ml-4">
                <button className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-100 rounded-2xl transition-smooth">
                  <Heart className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-100 rounded-2xl transition-smooth">
                  <ShoppingCart className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-100 rounded-2xl transition-smooth">
                  <User className="h-5 w-5" />
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-pink-200 text-gray-800 py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight text-gray-700">
              Koleksi Tas Terbaru
              <br />
              <span className="text-pink-500">untuk Gaya Hidup Modern</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Temukan tas impian kamu dari koleksi eksklusif kami. Kualitas premium dengan desain yang memukau.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/products"
                className="inline-block bg-pink-400 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-pink-500 transition-smooth shadow-sm"
              >
                Jelajahi Koleksi
              </Link>
              <Link
                href="/promos"
                className="inline-block border-2 border-pink-400 text-pink-500 px-8 py-3 rounded-2xl font-semibold hover:bg-pink-50 transition-smooth"
              >
                Lihat Promo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Section */}
        {promos.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 animate-fade-in-up">
                <div className="inline-flex items-center bg-pink-400 text-white px-4 py-2 rounded-2xl text-sm font-semibold mb-4">
                  <Tag className="h-4 w-4 mr-2" />
                  PROMO SPESIAL
                </div>
                <h2 className="text-3xl font-bold text-gray-700 mb-3">Penawaran Terbaik Hari Ini</h2>
                <p className="text-gray-600 text-base">Jangan lewatkan kesempatan emas ini! Hemat hingga 70%</p>
              </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {promos.slice(0, 3).map((promo, index) => (
                <Link
                  key={promo._id}
                  href={`/promos`}
                  className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-smooth border border-pink-100 hover:border-pink-200 relative"
                >
                  <div className="absolute top-0 right-0 bg-pink-400 text-white px-3 py-1 rounded-bl-2xl rounded-tr-3xl">
                    <span className="text-xs font-semibold">HOT!</span>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="bg-pink-300 p-2 rounded-2xl mr-3">
                      <Tag className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-pink-500 font-semibold text-sm">PROMO SPESIAL</span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">{promo.title}</h3>
                  <p className="text-2xl font-bold text-pink-500 mb-3">
                    {promo.type === 'percent' ? `${promo.value}%` : formatCurrency(promo.value)} OFF
                  </p>
                  <p className="text-gray-500 mb-4 text-sm">{promo.productCount} produk tersedia</p>
                  <div className="bg-pink-400 text-white px-4 py-2 rounded-2xl text-center font-semibold text-sm group-hover:bg-pink-500 transition-smooth">
                    Ambil Sekarang!
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-pink-400 text-white px-4 py-2 rounded-2xl text-sm font-semibold mb-4">
                <Menu className="h-4 w-4 mr-2" />
                KATEGORI PRODUK
              </div>
              <h2 className="text-3xl font-bold text-gray-700 mb-3">Jelajahi Kategori</h2>
              <p className="text-gray-600 text-base">Temukan produk sesuai kebutuhan Anda</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(0, 6).map((category, index) => (
                <Link
                  key={category._id}
                  href={`/products?category=${category.slug}`}
                  className="group bg-white rounded-3xl p-5 shadow-sm hover:shadow-md transition-smooth border border-pink-100 hover:border-pink-200 text-center"
                >
                  <div className="bg-pink-300 w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 text-base">{category.name}</h3>
                  <p className="text-gray-500 text-xs mb-3">{category.productCount} produk</p>
                  <div className="bg-pink-400 text-white px-3 py-1 rounded-2xl text-xs font-semibold group-hover:bg-pink-500 transition-smooth">
                    Lihat Produk
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Products Slider */}
      {popularProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8 animate-fade-in-up">
              <div>
                <h2 className="text-2xl font-bold text-gradient-coral mb-2">Produk Populer</h2>
                <p className="text-gray-600 animate-fade-in animate-delay-100">Pilihan favorit pelanggan kami</p>
              </div>
              <div className="flex items-center space-x-4 animate-fade-in animate-delay-200">
                <button
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className="p-2 rounded-full bg-coral-100 text-coral-600 hover:bg-coral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth hover-scale"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentSlide(Math.min(Math.ceil(popularProducts.length / itemsPerSlide) - 1, currentSlide + 1))}
                  disabled={currentSlide >= Math.ceil(popularProducts.length / itemsPerSlide) - 1}
                  className="p-2 rounded-full bg-coral-100 text-coral-600 hover:bg-coral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth hover-scale"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <Link
                  href="/products?sort=views&order=desc"
                  className="text-coral-600 hover:text-coral-700 font-medium text-sm transition-smooth hover-lift"
                >
                  Lihat Semua →
                </Link>
              </div>
            </div>
            
            <div className="relative overflow-hidden">
              <div 
                className="flex transition-all duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: Math.ceil(popularProducts.length / itemsPerSlide) }).map((_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {popularProducts
                        .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                        .map((product, index) => (
                          <div key={product._id} className={`animate-scale-in animate-delay-${(index + 1) * 100}`}>
                            <ProductCard product={product} showPopularBadge />
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Slide Indicators */}
            <div className="flex justify-center mt-6 space-x-2 animate-fade-in animate-delay-300">
              {Array.from({ length: Math.ceil(popularProducts.length / itemsPerSlide) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-smooth hover-scale ${
                    currentSlide === index ? 'bg-coral-500 shadow-lg' : 'bg-gray-300 hover:bg-coral-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}



      {/* Featured Products */}
      {products.length > 0 && (
        <section className="py-16 bg-pink-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-pink-400 text-white px-4 py-2 rounded-2xl text-sm font-semibold mb-4">
                <Star className="h-4 w-4 mr-2" />
                PRODUK UNGGULAN
              </div>
              <h2 className="text-3xl font-bold text-gray-700 mb-3">Koleksi Terpopuler</h2>
              <p className="text-gray-600 text-base">Produk pilihan yang paling disukai pelanggan kami</p>
            </div>
            
            <div className="flex justify-center mb-8">
              <Link
                href="/products"
                className="bg-pink-400 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-pink-500 transition-smooth shadow-sm"
              >
                Lihat Semua →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div key={product._id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}



      {/* Newsletter */}
      <section className="py-16 bg-pink-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-pink-400 text-white px-4 py-2 rounded-2xl text-sm font-semibold mb-4">
            <Mail className="h-4 w-4 mr-2" />
            NEWSLETTER
          </div>
          <h2 className="text-3xl font-bold text-gray-700 mb-3">Dapatkan Update Terbaru</h2>
          <p className="text-gray-600 text-base mb-8">Berlangganan newsletter kami dan dapatkan info promo eksklusif</p>
          
          <form className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="Masukkan email Anda"
              className="flex-1 px-4 py-3 border border-pink-200 rounded-2xl focus:ring-2 focus:ring-pink-300 focus:border-pink-300 transition-smooth bg-white"
            />
            <button
              type="submit"
              className="bg-pink-400 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-pink-500 transition-smooth"
            >
              Berlangganan
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-pink-400 p-2 rounded-xl">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-pink-300">SistaBag</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Toko tas terpercaya dengan koleksi terlengkap dan kualitas terbaik. Kepuasan pelanggan adalah prioritas utama kami.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-lg text-pink-300">Kategori</h3>
              <ul className="space-y-2 text-gray-300">
                {categories.slice(0, 4).map((category) => (
                  <li key={category._id}>
                    <Link href={`/categories/${category.slug}`} className="hover:text-pink-300 transition-smooth text-sm">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-lg text-pink-300">Bantuan</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-pink-300 transition-smooth text-sm">
                  Cara Pemesanan
                </a></li>
                <li><a href="#" className="hover:text-pink-300 transition-smooth text-sm">
                  Kebijakan Privasi
                </a></li>
                <li><a href="#" className="hover:text-pink-300 transition-smooth text-sm">
                  Syarat & Ketentuan
                </a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4 text-lg text-pink-300">Kontak</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="text-sm">
                  WhatsApp: +62 812-3456-7890
                </li>
                <li className="text-sm">
                  Email: info@sistabag.com
                </li>
                <li className="text-sm">
                  Alamat: Jakarta, Indonesia
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-6 text-center">
            <p className="text-gray-400 text-sm">&copy; 2024 SistaBag. All rights reserved. Made with ❤️ for fashion lovers.</p>
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
      <div className="bg-white rounded-3xl shadow-sm hover:shadow-md transition-smooth border border-pink-100 hover:border-pink-200 overflow-hidden">
        <div className="relative aspect-square">
          <Image
            src={product.images[0] || '/placeholder-bag.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-smooth"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {showPopularBadge && isPopular && (
              <span className="bg-pink-400 text-white px-2 py-1 rounded-2xl text-xs font-semibold flex items-center gap-1">
                <Star className="h-3 w-3" />
                Populer
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="bg-pink-500 text-white px-2 py-1 rounded-2xl text-xs font-semibold">
                -{discountPercentage}%
              </span>
            )}
          </div>
          
          {/* Views */}
          <div className="absolute top-3 right-3 bg-gray-700 text-white px-2 py-1 rounded-2xl text-xs flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {product.views}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-base group-hover:text-pink-500 transition-smooth">{product.name}</h3>
          <p className="text-xs text-gray-500 mb-3">{product.category.name}</p>
          
          <div className="flex items-center justify-between">
            <div>
              {product.priceAfterDiscount ? (
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-pink-500">
                    {formatCurrency(product.priceAfterDiscount)}
                  </span>
                  <span className="text-xs text-gray-500 line-through">
                    {formatCurrency(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-gray-800">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            
            <span className={`text-xs px-2 py-1 rounded-2xl font-semibold ${
              product.stock > 0 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {product.stock > 0 ? 'Tersedia' : 'Habis'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
