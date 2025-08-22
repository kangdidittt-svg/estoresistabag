'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronDown,
  Star,
  Eye,
  ArrowRight,
  Menu,
  X,
  Grid,
  Tag,
  Package
} from 'lucide-react';
import { formatCurrency, calculateDiscountPercentage } from '@/lib/utils';

interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  priceAfterDiscount?: number;
  images: ProductImage[];
  views: number;
  stock: number;
  isFeatured?: boolean;
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
  description?: string;
  image?: string;
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

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchCategory();
      fetchProducts();
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchProducts();
    }
  }, [
    sortBy,
    sortOrder,
    minPrice,
    maxPrice,
    onlyPromo,
    onlyInStock,
    currentPage
  ]);

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/categories/${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setCategory(data.data);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const params = new URLSearchParams();
      
      params.append('category', slug);
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
      setProductsLoading(false);
    }
  };

  const resetFilters = () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-main flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-peach"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-theme-main flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-theme-primary mb-4">Kategori Tidak Ditemukan</h1>
          <p className="text-theme-primary text-opacity-60 mb-8">Kategori yang Anda cari tidak tersedia.</p>
          <Link 
            href="/categories" 
            className="bg-accent-peach text-on-accent px-6 py-3 rounded-2xl hover:bg-accent-yellow transition-colors duration-200"
          >
            Kembali ke Kategori
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-main">
      {/* Header */}
      <header className="bg-theme-header shadow-sm sticky top-0 z-50 border-b border-theme-primary border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="bg-accent-peach p-2 rounded-2xl group-hover:scale-105 transition-all duration-200 overflow-hidden">
                <Image 
                  src="/logo-sis.png" 
                  alt="SistaBag Logo" 
                  width={32} 
                  height={32} 
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-theme-primary">SistaBag</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-theme-primary hover:text-accent-peach font-medium transition-colors duration-200 flex items-center space-x-1">
                <span>Beranda</span>
              </Link>
              <Link href="/products" className="text-theme-primary hover:text-accent-peach font-medium transition-colors duration-200 flex items-center space-x-1">
                <ShoppingBag className="h-4 w-4" />
                <span>Produk</span>
              </Link>
              <Link href="/categories" className="text-accent-peach font-medium flex items-center space-x-1">
                <span>Kategori</span>
              </Link>
              <Link href="/promos" className="text-theme-primary hover:text-accent-peach font-medium transition-colors duration-200 flex items-center space-x-1">
                <span>Promo</span>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-theme-primary hover:bg-theme-primary hover:bg-opacity-10 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-theme-primary border-opacity-20 py-4">
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/" 
                  className="flex items-center space-x-3 text-theme-primary hover:text-accent-peach transition-colors duration-200 px-2 py-2 rounded-lg hover:bg-theme-primary hover:bg-opacity-5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Beranda</span>
                </Link>
                <Link 
                  href="/products" 
                  className="flex items-center space-x-3 text-theme-primary hover:text-accent-peach transition-colors duration-200 px-2 py-2 rounded-lg hover:bg-theme-primary hover:bg-opacity-5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Package className="h-5 w-5" />
                  <span>Produk</span>
                </Link>
                <Link 
                  href="/categories" 
                  className="flex items-center space-x-3 text-accent-peach px-2 py-2 rounded-lg bg-accent-peach bg-opacity-10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Grid className="h-5 w-5" />
                  <span>Kategori</span>
                </Link>
                <Link 
                  href="/promos" 
                  className="flex items-center space-x-3 text-theme-primary hover:text-accent-peach transition-colors duration-200 px-2 py-2 rounded-lg hover:bg-theme-primary hover:bg-opacity-5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Tag className="h-5 w-5" />
                  <span>Promo</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600">Beranda</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-blue-600">Kategori</Link>
          <span>/</span>
          <span className="text-gray-900">{category.name}</span>
        </nav>

        {/* Back Button */}
        <Link 
          href="/categories" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Kategori
        </Link>

        {/* Category Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
          <div className="flex items-center gap-8">
            {category.image ? (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="h-16 w-16 text-blue-600" />
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.name}</h1>
              {category.description && (
                <p className="text-lg text-gray-600 mb-4">{category.description}</p>
              )}
              <div className="text-sm text-gray-500">
                {totalProducts} produk tersedia dalam kategori ini
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
            >
              <Filter className="h-5 w-5" />
              Filter & Urutkan
              <ChevronDown className={`h-4 w-4 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`} />
            </button>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {totalProducts} produk ditemukan
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rentang Harga
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urutkan
                </label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setSortBy(sort);
                    setSortOrder(order);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter Tambahan
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={onlyPromo}
                      onChange={(e) => setOnlyPromo(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Hanya Promo</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Stok Tersedia</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Reset Filters */}
          {(minPrice || maxPrice || onlyPromo || onlyInStock) && (
            <div className="pt-4 border-t mt-4">
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </div>

        {/* Products Grid/List */}
        {productsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ShoppingBag className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada produk ditemukan</h3>
            <p className="text-gray-600 mb-4">Belum ada produk dalam kategori ini atau coba ubah filter Anda</p>
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-700 font-medium"
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

// Product Card Component
function ProductCard({ product, viewMode }: { product: Product; viewMode: 'grid' | 'list' }) {
  const discountPercentage = product.priceAfterDiscount 
    ? calculateDiscountPercentage(product.price, product.priceAfterDiscount)
    : 0;

  const isPopular = product.views >= 100;

  if (viewMode === 'list') {
    return (
      <Link href={`/products/${product.slug}`} className="group">
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border overflow-hidden">
          <div className="flex">
            <div className="relative w-48 h-48 flex-shrink-0">
              <Image
                src={product.images[0]?.url || '/placeholder-bag.jpg'}
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
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Eye className="h-4 w-4" />
                      <span className="text-sm">{product.views} views</span>
                      {product.isFeatured && (
                        <span className="ml-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Unggulan
                        </span>
                      )}
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
            src={product.images[0]?.url || '/placeholder-bag.jpg'}
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
            {product.isFeatured && (
              <span className="ml-1 bg-purple-500 text-white px-1 py-0.5 rounded text-xs font-semibold">
                Unggulan
              </span>
            )}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600">
            {product.name}
          </h3>
          
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