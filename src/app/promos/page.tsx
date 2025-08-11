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
  ChevronDown
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
              <Link href="/categories" className="text-gray-700 hover:text-blue-600 font-medium">
                Kategori
              </Link>
              <Link href="/promos" className="text-blue-600 font-medium">
                Promo
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-blue-600">Beranda</Link>
          <span>/</span>
          <span className="text-gray-900">Promo</span>
        </nav>

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mb-4">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Promo Spesial</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dapatkan penawaran terbaik dan hemat lebih banyak dengan promo eksklusif kami
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
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
            
            <span className="text-sm text-gray-600">
              {totalPromos} promo tersedia
            </span>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Promo
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Semua Jenis</option>
                  <option value="percentage">Diskon Persentase</option>
                  <option value="fixed">Potongan Harga</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="expired">Berakhir</option>
                </select>
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

        {/* Promos Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : promos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Gift className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada promo ditemukan</h3>
            <p className="text-gray-600 mb-4">Belum ada promo tersedia atau coba ubah filter Anda</p>
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Reset Filter
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
              <div className="flex items-center justify-center mt-12">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
          : 'bg-gradient-to-r from-gray-400 to-gray-500'
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
            <div className="flex items-center gap-2 text-sm text-orange-600">
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
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
            isActive
              ? 'bg-blue-600 text-white hover:bg-blue-700'
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