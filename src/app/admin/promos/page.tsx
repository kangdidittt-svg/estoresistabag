'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  Percent,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

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
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalPromos: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    fetchPromos();
  }, [currentPage, searchQuery, statusFilter]);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/promos?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPromos(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching promos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (promoId: string, promoTitle: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus promo "${promoTitle}"?`)) return;
    
    try {
      const response = await fetch(`/api/admin/promos/${promoId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchPromos();
        alert('Promo berhasil dihapus');
      } else {
        alert('Gagal menghapus promo');
      }
    } catch (error) {
      console.error('Error deleting promo:', error);
      alert('Terjadi kesalahan saat menghapus promo');
    }
  };

  const toggleActiveStatus = async (promoId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/promos/${promoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      
      if (response.ok) {
        fetchPromos();
      } else {
        alert('Gagal mengubah status promo');
      }
    } catch (error) {
      console.error('Error toggling promo status:', error);
      alert('Terjadi kesalahan saat mengubah status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDiscount = (type: string, value: number) => {
    return type === 'percentage' ? `${value}%` : `Rp ${value.toLocaleString()}`;
  };

  const getPromoStatus = (promo: Promo) => {
    const now = new Date();
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);
    
    if (!promo.isActive) return { status: 'inactive', label: 'Nonaktif', color: 'gray' };
    if (now < startDate) return { status: 'scheduled', label: 'Terjadwal', color: 'blue' };
    if (now > endDate) return { status: 'expired', label: 'Berakhir', color: 'red' };
    return { status: 'active', label: 'Aktif', color: 'green' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Kembali ke Dashboard
              </Link>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-orange-600" />
                <h1 className="text-xl font-semibold text-gray-900">Kelola Promo</h1>
              </div>
            </div>
            <Link
              href="/admin/promos/new"
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Promo</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Cari promo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
              <option value="expired">Berakhir</option>
            </select>

            {/* Reset Button */}
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Promos Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {promos.map((promo) => {
                const status = getPromoStatus(promo);
                return (
                  <div key={promo._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {/* Promo Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{promo.title}</h3>
                          <div className="flex items-center space-x-2">
                            <Percent className="h-4 w-4" />
                            <span className="text-sm opacity-90">
                              {formatDiscount(promo.type, promo.value)}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Promo Content */}
                    <div className="p-4">
                      {promo.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {promo.description}
                        </p>
                      )}

                      {/* Promo Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{formatDate(promo.startDate)} - {formatDate(promo.endDate)}</span>
                        </div>
                        
                        {promo.usageLimit && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            <span>{promo.usageCount}/{promo.usageLimit} digunakan</span>
                          </div>
                        )}
                        
                        {promo.minPurchase && (
                          <div className="text-sm text-gray-600">
                            Min. pembelian: Rp {promo.minPurchase.toLocaleString()}
                          </div>
                        )}
                        
                        {promo.maxDiscount && promo.type === 'percentage' && (
                          <div className="text-sm text-gray-600">
                            Maks. diskon: Rp {promo.maxDiscount.toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <button
                          onClick={() => toggleActiveStatus(promo._id, promo.isActive)}
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            promo.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {promo.isActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                        
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/admin/promos/${promo._id}/edit`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit promo"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(promo._id, promo.title)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus promo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Menampilkan {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, pagination.totalPromos)} dari {pagination.totalPromos} promo
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={!pagination.hasPrevPage}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium">
                      {currentPage} / {pagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                      disabled={!pagination.hasNextPage}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && promos.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all' ? 'Promo tidak ditemukan' : 'Belum ada promo'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Coba ubah filter pencarian Anda'
                : 'Mulai dengan menambahkan promo pertama Anda'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link
                href="/admin/promos/new"
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Promo
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}