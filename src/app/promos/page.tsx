'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingBag, 
  Calendar, 
  Tag, 
  Percent, 
  Gift,
  Clock,
  ArrowRight,
  Filter,
  ChevronDown,
  Menu,
  User,
  Heart,
  ShoppingCart,
  Search
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

// Helper functions
const isPromoActive = (promo: Promo) => {
  const now = new Date();
  const startDate = new Date(promo.startDate);
  const endDate = new Date(promo.endDate);
  return now >= startDate && now <= endDate && promo.isActive;
};

const getTimeRemaining = (endDate: string) => {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) {
    return 'Berakhir';
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} hari lagi`;
  } else if (hours > 0) {
    return `${hours} jam lagi`;
  } else {
    return `${minutes} menit lagi`;
  }
};

interface Promo {
  _id: string;
  title: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  image?: string;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  products?: {
    _id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
    priceAfterDiscount?: number;
  }[];
}

interface PromosResponse {
  success: boolean;
  data: {
    promos: Promo[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalPromos: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'percentage' | 'fixed'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPromos, setTotalPromos] = useState(0);

  useEffect(() => {
    fetchPromos();
  }, [filterType, filterStatus, sortBy, sortOrder, currentPage]);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      params.append('sort', sortBy);
      params.append('order', sortOrder);
      params.append('page', currentPage.toString());
      params.append('limit', '12');
      params.append('includeProducts', 'true');

      const response = await fetch(`/api/promos?${params.toString()}`);
      const data: PromosResponse = await response.json();
      
      if (data.success) {
        setPromos(data.data.promos);
        setTotalPages(data.data.pagination.totalPages);
        setTotalPromos(data.data.pagination.totalPromos);
      }
    } catch (error) {
      console.error('Error fetching promos:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilterType('all');
    setFilterStatus('all');
    setSortBy('startDate');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPromoIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-5 w-5" />;
      case 'fixed':
        return <Tag className="h-5 w-5" />;
      default:
        return <Gift className="h-5 w-5" />;
    }
  };

  const getPromoValue = (promo: Promo) => {
    if (promo.type === 'percentage') {
      return `${promo.value}%`;
    } else {
      return formatCurrency(promo.value);
    }
  };



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
              <Link href="/categories" className="text-gray-700 hover:text-pink-500 transition-colors font-medium">
                Kategori
              </Link>
              <Link href="/promos" className="text-pink-500 font-bold relative">
                Promo
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-pink-400 rounded-full"></div>
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
        <div className="relative bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 mb-12 rounded-3xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-white/80 mb-8">
              <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
              <span>/</span>
              <span className="text-white font-medium">Promo</span>
            </nav>
            
            <div className="text-center animate-fade-in-up">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Gift className="h-5 w-5 text-white" />
                <span className="text-white font-semibold text-sm tracking-wider">PROMO SPESIAL</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Penawaran Terbaik
                <span className="block text-rose-200">Untuk Anda</span>
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Dapatkan penawaran terbaik dan hemat lebih banyak dengan promo eksklusif kami
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100 p-6 mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-700 hover:text-pink-500 transition-colors font-medium"
            >
              <div className="p-2 bg-pink-200 rounded-lg">
                <Filter className="h-4 w-4 text-pink-600" />
              </div>
              Filter & Urutkan
              <ChevronDown className={`h-4 w-4 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`} />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
              <span className="text-sm text-gray-600 font-medium">
                {totalPromos} promo tersedia
              </span>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-pink-100">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Jenis Promo
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full p-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                >
                  <option value="all">Semua Jenis</option>
                  <option value="percentage">Diskon Persentase</option>
                  <option value="fixed">Potongan Harga</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full p-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="expired">Berakhir</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Urutkan
                </label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setSortBy(sort);
                    setSortOrder(order);
                  }}
                  className="w-full p-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                >
                  <option value="startDate-desc">Terbaru</option>
                  <option value="startDate-asc">Terlama</option>
                  <option value="endDate-asc">Berakhir Segera</option>
                  <option value="value-desc">Nilai Tertinggi</option>
                  <option value="value-asc">Nilai Terendah</option>
                </select>
              </div>
            </div>
          )}

          {/* Reset Filters */}
          {(filterType !== 'all' || filterStatus !== 'all') && (
            <div className="pt-6 border-t border-pink-100 mt-6">
              <button
                onClick={resetFilters}
                className="inline-flex items-center space-x-2 text-sm text-pink-500 hover:text-pink-600 font-bold transition-colors"
              >
                <div className="w-4 h-4 bg-pink-400 rounded-full flex items-center justify-center text-white text-xs">
                  ×
                </div>
                <span>Reset Semua Filter</span>
              </button>
            </div>
          )}
        </div>

        {/* Promos Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="loading-spinner"></div>
          </div>
        ) : promos.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-100 rounded-full mb-6">
              <Gift className="h-10 w-10 text-pink-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Tidak ada promo ditemukan</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">Belum ada promo tersedia atau coba ubah filter Anda untuk menemukan penawaran menarik</p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center space-x-2 bg-pink-400 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <span>Reset Filter</span>
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-sm">
                ↻
              </div>
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {promos.map((promo) => (
                <PromoCard key={promo._id} promo={promo} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-16 animate-fade-in-up">
                <nav className="flex items-center space-x-3">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-3 rounded-xl border border-pink-200 text-pink-500 hover:text-pink-600 hover:border-pink-300 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
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
                        className={`px-4 py-3 rounded-xl border font-bold transition-all duration-300 shadow-sm hover:shadow-md ${
                          currentPage === pageNum
                            ? 'bg-pink-400 text-white border-pink-400 shadow-lg scale-105'
                            : 'border-pink-200 text-pink-500 hover:text-pink-600 hover:border-pink-300 hover:bg-pink-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-xl border border-pink-200 text-pink-500 hover:text-pink-600 hover:border-pink-300 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
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

// Promo Card Component
function PromoCard({ promo }: { promo: Promo }) {
  const isActive = isPromoActive(promo);
  const timeRemaining = getTimeRemaining(promo.endDate);
  
  const getPromoIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-5 w-5" />;
      case 'fixed':
        return <Tag className="h-5 w-5" />;
      default:
        return <Gift className="h-5 w-5" />;
    }
  };

  const getPromoValue = (promo: Promo) => {
    if (promo.type === 'percentage') {
      return `${promo.value}%`;
    } else {
      return formatCurrency(promo.value);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border overflow-hidden ${
      isActive ? 'border-green-200' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className={`p-6 ${
        isActive 
          ? 'bg-pink-400' 
          : 'bg-gray-400'
      }`}>
        <div className="flex items-center justify-between text-white mb-4">
          <div className="flex items-center gap-2">
            {getPromoIcon(promo.type)}
            <span className="text-sm font-medium capitalize">
              {promo.type === 'percentage' ? 'Diskon' : 'Potongan'}
            </span>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isActive 
              ? 'bg-white bg-opacity-20 text-white' 
              : 'bg-white bg-opacity-20 text-white'
          }`}>
            {isActive ? 'Aktif' : 'Berakhir'}
          </span>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            {getPromoValue(promo)}
          </div>
          <h3 className="text-xl font-semibold">{promo.title}</h3>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {promo.description && (
          <p className="text-gray-600 mb-4 line-clamp-2">{promo.description}</p>
        )}
        
        {/* Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Berlaku: {formatDate(promo.startDate)} - {formatDate(promo.endDate)}</span>
          </div>
          
          {isActive && (
            <div className="flex items-center gap-2 text-sm text-pink-500">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{timeRemaining}</span>
            </div>
          )}
          
          {promo.minPurchase && (
            <div className="text-sm text-gray-600">
              Min. pembelian: {formatCurrency(promo.minPurchase)}
            </div>
          )}
          
          {promo.maxDiscount && promo.type === 'percentage' && (
            <div className="text-sm text-gray-600">
              Maks. potongan: {formatCurrency(promo.maxDiscount)}
            </div>
          )}
          
          {promo.usageLimit && (
            <div className="text-sm text-gray-600">
              Tersisa: {promo.usageLimit - promo.usageCount} dari {promo.usageLimit}
            </div>
          )}
        </div>
        
        {/* Products Preview */}
        {promo.products && promo.products.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Produk Promo:</h4>
            <div className="grid grid-cols-3 gap-2">
              {promo.products.slice(0, 3).map((product) => (
                <Link 
                  key={product._id} 
                  href={`/products/${product.slug}`}
                  className="group"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={product.images[0] || '/placeholder-bag.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-1">{product.name}</p>
                </Link>
              ))}
            </div>
            {promo.products.length > 3 && (
              <p className="text-xs text-gray-500 mt-2">
                +{promo.products.length - 3} produk lainnya
              </p>
            )}
          </div>
        )}
        
        {/* Action Button */}
        <Link 
          href={`/products?promo=${promo._id}`}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all duration-300 shadow-sm hover:shadow-md ${
            isActive
              ? 'bg-pink-400 text-white hover:bg-pink-500 transform hover:scale-105'
              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isActive ? 'Lihat Produk Promo' : 'Promo Berakhir'}
          {isActive && <ArrowRight className="h-4 w-4" />}
        </Link>
      </div>
    </div>
  );
}