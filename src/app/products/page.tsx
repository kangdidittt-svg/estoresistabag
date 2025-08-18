'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronDown, 
  Star, 
  Eye, 
  ShoppingBag,
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { formatCurrency, calculateDiscountPercentage } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useCart } from '@/contexts/CartContext';
import Navigation from '@/components/Navigation';

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
}

interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

function ProductsContent() {
  const { state, dispatch } = useCart();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('order') || 'desc');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [onlyPromo, setOnlyPromo] = useState(searchParams.get('promo') === 'true');
  const [onlyInStock, setOnlyInStock] = useState(searchParams.get('inStock') === 'true');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [
    searchQuery,
    selectedCategory,
    sortBy,
    sortOrder,
    minPrice,
    maxPrice,
    onlyPromo,
    onlyInStock,
    currentPage
  ]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (onlyPromo) params.append('promo', 'true');
      if (onlyInStock) params.append('inStock', 'true');
      
      params.append('sort', sortBy);
      params.append('order', sortOrder);
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      const response = await fetch(`/api/products?${params.toString()}`);
      const data: ProductsResponse = await response.json();
      
      if (data.success) {
        setProducts(data.data.products);
        setTotalPages(data.data.pagination.totalPages);
        setTotalProducts(data.data.pagination.totalProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setOnlyPromo(false);
    setOnlyInStock(false);
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-theme-main">
      {/* Header */}
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme-primary mb-4">Semua Produk</h1>
          <p className="text-theme-primary opacity-75">Temukan tas impian Anda dari koleksi terlengkap kami</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-theme-card rounded-2xl shadow-lg border border-theme-primary border-opacity-20 p-6 mb-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-theme-primary border-opacity-30 rounded-2xl focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-theme-main text-theme-primary"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-theme-primary opacity-60" />
            </div>
          </form>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-theme-primary hover:text-accent-peach transition-colors duration-300"
            >
              <Filter className="h-5 w-5" />
              Filter & Urutkan
              <ChevronDown className={`h-4 w-4 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`} />
            </button>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-theme-primary opacity-75">
                {totalProducts} produk ditemukan
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-accent-blue text-on-accent' : 'text-theme-primary opacity-60 hover:bg-accent-blue hover:bg-opacity-20'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'list' ? 'bg-accent-blue text-on-accent' : 'text-theme-primary opacity-60 hover:bg-accent-blue hover:bg-opacity-20'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-theme-primary border-opacity-20">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-theme-primary border-opacity-30 rounded-xl focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-theme-main text-theme-primary"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Rentang Harga
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full p-2 border border-theme-primary border-opacity-30 rounded-xl focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-theme-main text-theme-primary"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full p-2 border border-theme-primary border-opacity-30 rounded-xl focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-theme-main text-theme-primary"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Urutkan
                </label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setSortBy(sort);
                    setSortOrder(order);
                  }}
                  className="w-full p-2 border border-theme-primary border-opacity-30 rounded-xl focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-theme-main text-theme-primary"
                >
                  <option value="createdAt-desc">Terbaru</option>
                  <option value="createdAt-asc">Terlama</option>
                  <option value="price-asc">Harga Terendah</option>
                  <option value="price-desc">Harga Tertinggi</option>
                  <option value="views-desc">Paling Populer</option>
                  <option value="name-asc">Nama A-Z</option>
                  <option value="name-desc">Nama Z-A</option>
                </select>
              </div>

              {/* Additional Filters */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Filter Tambahan
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={onlyPromo}
                      onChange={(e) => setOnlyPromo(e.target.checked)}
                      className="rounded border-theme-primary text-accent-peach focus:ring-accent-peach"
                    />
                    <span className="ml-2 text-sm text-theme-primary">Hanya Promo</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                      className="rounded border-theme-primary text-accent-peach focus:ring-accent-peach"
                    />
                    <span className="ml-2 text-sm text-theme-primary">Stok Tersedia</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Reset Filters */}
          {(searchQuery || selectedCategory || minPrice || maxPrice || onlyPromo || onlyInStock) && (
            <div className="pt-4 border-t mt-4">
              <button
                onClick={resetFilters}
                className="text-sm text-theme-primary hover:text-accent-peach font-medium transition-colors duration-200"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </div>

        {/* Products Grid/List */}
        {initialLoading ? (
          <LoadingSpinner overlay={true} />
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-peach"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-theme-primary text-opacity-40 mb-4">
              <ShoppingBag className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-theme-primary mb-2">Tidak ada produk ditemukan</h3>
            <p className="text-theme-primary text-opacity-60 mb-4">Coba ubah filter atau kata kunci pencarian Anda</p>
            <button
              onClick={resetFilters}
              className="text-accent-peach hover:text-accent-yellow font-medium transition-colors duration-200"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-12">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg border ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat produk...</p>
        </div>
      </div>
    }>      <ProductsContent />    </Suspense>  );
}

// Product Card Component
function ProductCard({ product, viewMode }: { product: Product; viewMode: 'grid' | 'list' }) {
  const { dispatch } = useCart();
  const discountPercentage = product.priceAfterDiscount 
    ? calculateDiscountPercentage(product.price, product.priceAfterDiscount)
    : 0;

  const isPopular = product.views >= 100;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product._id,
        name: product.name,
        price: product.priceAfterDiscount || product.price,
        image: product.images[0] || '/placeholder-bag.jpg',
        slug: product.slug,
        stock: product.stock
      }
    });
  };

  if (viewMode === 'list') {
    return (
      <Link href={`/products/${product.slug}`} className="group">
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border overflow-hidden">
          <div className="flex">
            <div className="relative w-48 h-48 flex-shrink-0">
              <Image
                src={product.images[0] || '/placeholder-bag.jpg'}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {isPopular && (
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
            </div>
            
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{product.category.name}</p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">{product.views} views</span>
                    </div>
                    
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.stock > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  {product.priceAfterDiscount ? (
                    <div>
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {formatCurrency(product.priceAfterDiscount)}
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        {formatCurrency(product.price)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(product.price)}
                    </div>
                  )}
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      product.stock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-accent-peach text-on-accent hover:bg-accent-yellow'
                    }`}
                  >
                    {product.stock === 0 ? 'Habis' : 'Tambah ke Keranjang'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

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
            {isPopular && (
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
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600">
            {product.name}
          </h3>
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
            
            <div className="flex flex-col gap-2">
              <span className={`text-xs px-2 py-1 rounded-full text-center ${
                product.stock > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.stock > 0 ? 'Tersedia' : 'Habis'}
              </span>
              
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  product.stock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-accent-peach text-on-accent hover:bg-accent-yellow'
                }`}
              >
                {product.stock === 0 ? 'Habis' : '+ Keranjang'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}