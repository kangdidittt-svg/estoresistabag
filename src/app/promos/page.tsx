'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
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
import { useCart } from '@/contexts/CartContext';
import Navigation from '@/components/Navigation';

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
    images: {
      url: string;
      alt: string;
      isPrimary: boolean;
    }[];
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
  const { state, dispatch } = useCart();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'percentage' | 'fixed'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
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
      setInitialLoading(false);
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
    <div className="min-h-screen bg-theme-main">
      {/* Header */}
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="relative bg-gradient-to-r from-accent-peach via-accent-mint to-accent-yellow overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 mb-12 rounded-3xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-on-accent text-opacity-80 mb-8">
              <Link href="/" className="hover:text-on-accent transition-colors">Beranda</Link>
              <span>/</span>
              <span className="text-on-accent font-medium">Promo</span>
            </nav>
            
            <div className="text-center animate-fade-in-up">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Gift className="h-5 w-5 text-on-accent" />
                <span className="text-on-accent font-semibold text-sm tracking-wider">PROMO SPESIAL</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-on-accent mb-4 leading-tight">
                Penawaran Terbaik
                <span className="block text-on-accent text-opacity-80">Untuk Anda</span>
              </h1>
              <p className="text-xl text-on-accent text-opacity-90 max-w-2xl mx-auto leading-relaxed">
                Dapatkan penawaran terbaik dan hemat lebih banyak dengan promo eksklusif kami
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card-theme rounded-2xl shadow-soft border border-theme-primary border-opacity-10 p-6 mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-theme-primary hover:text-accent-peach transition-colors font-medium"
            >
              <div className="p-2 bg-accent-peach bg-opacity-20 rounded-lg">
                <Filter className="h-4 w-4 text-accent-peach" />
              </div>
              Filter & Urutkan
              <ChevronDown className={`h-4 w-4 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`} />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent-peach rounded-full"></div>
              <span className="text-sm text-theme-primary text-opacity-60 font-medium">
                {totalPromos} promo tersedia
              </span>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-theme-primary border-opacity-10">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-bold text-theme-primary mb-3">
                  Jenis Promo
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'percentage' | 'fixed')}
                  className="w-full p-3 border border-theme-primary border-opacity-20 rounded-xl focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-300 bg-theme-main backdrop-blur-sm text-theme-primary"
                >
                  <option value="all">Semua Jenis</option>
                  <option value="percentage">Diskon Persentase</option>
                  <option value="fixed">Potongan Harga</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-bold text-theme-primary mb-3">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                  className="w-full p-3 border border-theme-primary border-opacity-20 rounded-xl focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-300 bg-theme-main backdrop-blur-sm text-theme-primary"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-bold text-theme-primary mb-3">
                  Urutkan
                </label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setSortBy(sort);
                    setSortOrder(order);
                  }}
                  className="w-full p-3 border border-theme-primary border-opacity-20 rounded-xl focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-300 bg-theme-main backdrop-blur-sm text-theme-primary"
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
            <div className="pt-6 border-t border-theme-primary border-opacity-10 mt-6">
              <button
                onClick={resetFilters}
                className="inline-flex items-center space-x-2 text-sm text-accent-peach hover:text-accent-mint font-bold transition-colors"
              >
                <div className="w-4 h-4 bg-accent-peach rounded-full flex items-center justify-center text-on-accent text-xs">
                  ×
                </div>
                <span>Reset Semua Filter</span>
              </button>
            </div>
          )}
        </div>

        {/* Promos Grid */}
        {initialLoading ? (
          <div className="loading-overlay">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="loading-spinner"></div>
          </div>
        ) : promos.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-peach bg-opacity-20 rounded-full mb-6">
              <Gift className="h-10 w-10 text-accent-peach" />
            </div>
            <h3 className="text-2xl font-bold text-theme-primary mb-3">Tidak ada promo ditemukan</h3>
            <p className="text-theme-primary text-opacity-60 mb-6 max-w-md mx-auto leading-relaxed">Belum ada promo tersedia atau coba ubah filter Anda untuk menemukan penawaran menarik</p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center space-x-2 bg-accent-peach text-on-accent px-6 py-3 rounded-xl font-bold hover:bg-accent-mint transition-all duration-300 shadow-soft hover:shadow-medium hover:scale-105"
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
                    className="p-3 rounded-xl border border-theme-primary border-opacity-20 text-accent-peach hover:text-accent-mint hover:border-accent-peach hover:bg-accent-peach hover:bg-opacity-10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-soft hover:shadow-medium"
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
                        className={`px-4 py-3 rounded-xl border font-bold transition-all duration-300 shadow-soft hover:shadow-medium ${
                          currentPage === pageNum
                            ? 'bg-accent-peach text-on-accent border-accent-peach shadow-medium scale-105'
                            : 'border-theme-primary border-opacity-20 text-accent-peach hover:text-accent-mint hover:border-accent-peach hover:bg-accent-peach hover:bg-opacity-10'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-xl border border-theme-primary border-opacity-20 text-accent-peach hover:text-accent-mint hover:border-accent-peach hover:bg-accent-peach hover:bg-opacity-10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-soft hover:shadow-medium"
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
    <div className={`card-theme rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 border overflow-hidden ${
      isActive ? 'border-accent-mint border-opacity-50' : 'border-theme-primary border-opacity-20'
    }`}>
      {/* Header */}
      <div className={`p-6 ${
        isActive 
          ? 'bg-gradient-to-r from-accent-peach to-accent-mint' 
          : 'bg-theme-primary bg-opacity-40'
      }`}>
        <div className="flex items-center justify-between text-on-accent mb-4">
          <div className="flex items-center gap-2">
            {getPromoIcon(promo.type)}
            <span className="text-sm font-medium capitalize">
              {promo.type === 'percentage' ? 'Diskon' : 'Potongan'}
            </span>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isActive 
              ? 'bg-white bg-opacity-20 text-on-accent' 
              : 'bg-white bg-opacity-20 text-on-accent'
          }`}>
            {isActive ? 'Aktif' : 'Berakhir'}
          </span>
        </div>
        
        <div className="text-center">
          <div className="text-4xl font-bold mb-2 text-on-accent">
            {getPromoValue(promo)}
          </div>
          <h3 className="text-xl font-semibold text-on-accent">{promo.title}</h3>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {promo.description && (
          <p className="text-theme-primary text-opacity-70 mb-4 line-clamp-2">{promo.description}</p>
        )}
        
        {/* Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-theme-primary text-opacity-60">
            <Calendar className="h-4 w-4" />
            <span>Berlaku: {formatDate(promo.startDate)} - {formatDate(promo.endDate)}</span>
          </div>
          
          {isActive && (
            <div className="flex items-center gap-2 text-sm text-accent-peach">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{timeRemaining}</span>
            </div>
          )}
          
          {promo.minPurchase && (
            <div className="text-sm text-theme-primary text-opacity-60">
              Min. pembelian: {formatCurrency(promo.minPurchase)}
            </div>
          )}
          
          {promo.maxDiscount && promo.type === 'percentage' && (
            <div className="text-sm text-theme-primary text-opacity-60">
              Maks. potongan: {formatCurrency(promo.maxDiscount)}
            </div>
          )}
          
          {promo.usageLimit && (
            <div className="text-sm text-theme-primary text-opacity-60">
              Tersisa: {promo.usageLimit - promo.usageCount} dari {promo.usageLimit}
            </div>
          )}
        </div>
        
        {/* Products Preview */}
        {promo.products && promo.products.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-theme-primary mb-3">Produk Promo:</h4>
            <div className="grid grid-cols-3 gap-2">
              {promo.products.slice(0, 3).map((product) => (
                <Link 
                  key={product._id} 
                  href={`/products/${product.slug}`}
                  className="group"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={product.images[0]?.url || '/placeholder-bag.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="text-xs text-theme-primary text-opacity-60 mt-1 line-clamp-1">{product.name}</p>
                </Link>
              ))}
            </div>
            {promo.products.length > 3 && (
              <p className="text-xs text-theme-primary text-opacity-50 mt-2">
                +{promo.products.length - 3} produk lainnya
              </p>
            )}
          </div>
        )}
        
        {/* Action Button */}
        <Link 
          href={`/products?promo=${promo._id}`}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all duration-300 shadow-soft hover:shadow-medium ${
            isActive
              ? 'bg-gradient-to-r from-accent-peach to-accent-mint hover:from-accent-mint hover:to-accent-yellow text-on-accent transform hover:scale-105'
              : 'bg-theme-primary bg-opacity-20 text-theme-primary text-opacity-60 cursor-not-allowed'
          }`}
        >
          {isActive ? 'Lihat Produk Promo' : 'Promo Berakhir'}
          {isActive && <ArrowRight className="h-4 w-4" />}
        </Link>
      </div>
    </div>
  );
}