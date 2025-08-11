'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  ShoppingBag,
  Tag,
  Users,
  TrendingUp,
  Eye,
  Plus,
  Settings,
  LogOut,
  BarChart3,
  Calendar,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalPromos: number;
  totalViews: number;
  recentProducts: {
    _id: string;
    name: string;
    price: number;
    stock: number;
    views: number;
    createdAt: string;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard statistics
      const [productsRes, categoriesRes, promosRes] = await Promise.all([
        fetch('/api/admin/products?limit=5'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/promos')
      ]);

      const [productsData, categoriesData, promosData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        promosRes.json()
      ]);

      if (productsData.success && categoriesData.success) {
        const totalViews = productsData.data.products.reduce(
          (sum: number, product: { views: number }) => sum + product.views,
          0
        );

        setStats({
          totalProducts: productsData.data.pagination?.totalProducts || productsData.data.products.length,
          totalCategories: categoriesData.data.length,
          totalPromos: promosData.success ? promosData.data.length : 0,
          totalViews,
          recentProducts: productsData.data.products.slice(0, 5)
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', {
        method: 'DELETE'
      });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">SistaBag Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/settings')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Selamat datang di panel admin SistaBag</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Produk</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Tag className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Kategori</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalCategories || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Promosi</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalPromos || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalViews || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/admin/products/new')}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Plus className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-600">Tambah Produk</span>
              </button>
              <button
                onClick={() => router.push('/admin/categories/new')}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <Plus className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-600">Tambah Kategori</span>
              </button>
              <button
                onClick={() => router.push('/admin/promos/new')}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
              >
                <Plus className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-600">Tambah Promo</span>
              </button>
              <button
                onClick={() => window.open('/', '_blank')}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
              >
                <Eye className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-600">Lihat Toko</span>
              </button>
            </div>
          </div>

          {/* Recent Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Produk Terbaru</h3>
            <div className="space-y-3">
              {stats?.recentProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Stok: {product.stock}</p>
                    <p className="text-sm text-gray-500">{product.views} views</p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">Belum ada produk</p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Menu Navigasi</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/admin/products')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Kelola Produk</span>
            </button>
            <button
              onClick={() => router.push('/admin/categories')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Tag className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Kelola Kategori</span>
            </button>
            <button
              onClick={() => router.push('/admin/promos')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <DollarSign className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Kelola Promo</span>
            </button>
            <button
              onClick={() => router.push('/admin/settings')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Pengaturan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}