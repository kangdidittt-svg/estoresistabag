'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
import LoadingSpinner from '@/components/LoadingSpinner';

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
  stockData: {
    _id: string;
    name: string;
    stock: number;
    category: string;
    price: number;
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
      const [productsRes, categoriesRes, promosRes, allProductsRes] = await Promise.all([
        fetch('/api/admin/products?limit=5'),
        fetch('/api/admin/categories'),
        fetch('/api/admin/promos'),
        fetch('/api/admin/products') // Fetch all products for stock data
      ]);

      const [productsData, categoriesData, promosData, allProductsData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        promosRes.json(),
        allProductsRes.json()
      ]);

      if (productsData.success && categoriesData.success) {
        const totalViews = productsData.data.products.reduce(
          (sum: number, product: { views: number }) => sum + product.views,
          0
        );

        // Prepare stock data
        const stockData = allProductsData.success ? allProductsData.data.products.map((product: any) => ({
          _id: product._id,
          name: product.name,
          stock: product.stock,
          category: product.category?.name || 'Tanpa Kategori',
          price: product.price
        })) : [];

        setStats({
          totalProducts: productsData.data.pagination?.totalProducts || productsData.data.products.length,
          totalCategories: categoriesData.data.length,
          totalPromos: promosData.success ? promosData.data.length : 0,
          totalViews,
          recentProducts: productsData.data.products.slice(0, 5),
          stockData
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
      <div className="min-h-screen bg-theme-main flex items-center justify-center">
        <LoadingSpinner overlay={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-main">
      {/* Header */}
      <header className="bg-theme-header shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="p-2 bg-accent-peach rounded-xl mr-3 overflow-hidden">
                <Image 
                  src="/logo-sis.png" 
                  alt="SistaBag Logo" 
                  width={24} 
                  height={24} 
                  className="object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-on-accent">SistaBag Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/settings')}
                className="p-2 text-on-accent hover:bg-accent-peach rounded-xl transition-all duration-300"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300"
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
          <h2 className="text-3xl font-bold text-theme-primary mb-2">Dashboard</h2>
          <p className="text-theme-primary opacity-75">Selamat datang di panel admin SistaBag</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card-theme p-6">
            <div className="flex items-center">
              <div className="p-3 bg-accent-blue rounded-2xl">
                <Package className="h-6 w-6 text-on-accent" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-theme-primary opacity-75">Total Produk</p>
                <p className="text-2xl font-bold text-theme-primary">{stats?.totalProducts || 0}</p>
              </div>
            </div>
          </div>

          <div className="card-theme p-6">
            <div className="flex items-center">
              <div className="p-3 bg-accent-mint rounded-2xl">
                <Tag className="h-6 w-6 text-on-accent" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-theme-primary opacity-75">Kategori</p>
                <p className="text-2xl font-bold text-theme-primary">{stats?.totalCategories || 0}</p>
              </div>
            </div>
          </div>

          <div className="card-theme p-6">
            <div className="flex items-center">
              <div className="p-3 bg-accent-yellow rounded-2xl">
                  <DollarSign className="h-6 w-6 text-theme-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-theme-primary opacity-75">Promosi</p>
                <p className="text-2xl font-bold text-theme-primary">{stats?.totalPromos || 0}</p>
              </div>
            </div>
          </div>

          <div className="card-theme p-6">
            <div className="flex items-center">
              <div className="p-3 bg-accent-lavender rounded-2xl">
                <Eye className="h-6 w-6 text-on-accent" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-theme-primary opacity-75">Total Views</p>
                <p className="text-2xl font-bold text-theme-primary">{stats?.totalViews || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="card-theme p-6 mb-8">
          <h3 className="text-lg font-semibold text-theme-primary mb-4">Menu Navigasi</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/admin/products')}
              className="flex flex-col items-center p-4 bg-accent-blue text-white rounded-xl hover:bg-blue-600 transition-all duration-300 shadow-soft hover:shadow-medium"
            >
              <div className="p-2 bg-white bg-opacity-20 rounded-xl mb-2">
                <Package className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-white">Kelola Produk</span>
            </button>
            <button
              onClick={() => router.push('/admin/categories')}
              className="flex flex-col items-center p-4 bg-accent-mint text-white rounded-xl hover:bg-green-600 transition-all duration-300 shadow-soft hover:shadow-medium"
            >
              <div className="p-2 bg-white bg-opacity-20 rounded-xl mb-2">
                <Tag className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-white">Kelola Kategori</span>
            </button>
            <button
              onClick={() => router.push('/admin/promos')}
              className="flex flex-col items-center p-4 bg-accent-yellow text-white rounded-xl hover:bg-yellow-600 transition-all duration-300 shadow-soft hover:shadow-medium"
            >
              <div className="p-2 bg-white bg-opacity-20 rounded-xl mb-2">
                <DollarSign className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-white">Kelola Promo</span>
            </button>
            <button
              onClick={() => router.push('/admin/settings')}
              className="flex flex-col items-center p-4 bg-accent-lavender text-white rounded-xl hover:bg-purple-600 transition-all duration-300 shadow-soft hover:shadow-medium"
            >
              <div className="p-2 bg-white bg-opacity-20 rounded-xl mb-2">
                <Settings className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-white">Pengaturan</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card-theme p-6">
            <h3 className="text-lg font-semibold text-theme-primary mb-4">Aksi Cepat</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/admin/products/new')}
                className="flex items-center justify-center p-4 bg-accent-blue text-white rounded-xl hover:bg-blue-600 transition-all duration-300 shadow-soft hover:shadow-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Tambah Produk</span>
              </button>
              <button
                onClick={() => router.push('/admin/categories/new')}
                className="flex items-center justify-center p-4 bg-accent-mint text-white rounded-xl hover:bg-green-600 transition-all duration-300 shadow-soft hover:shadow-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Tambah Kategori</span>
              </button>
              <button
                onClick={() => router.push('/admin/promos/new')}
                className="flex items-center justify-center p-4 bg-accent-yellow text-white rounded-xl hover:bg-yellow-600 transition-all duration-300 shadow-soft hover:shadow-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Tambah Promo</span>
              </button>
              <button
                onClick={() => window.open('/', '_blank')}
                className="flex items-center justify-center p-4 bg-accent-lavender text-white rounded-xl hover:bg-purple-600 transition-all duration-300 shadow-soft hover:shadow-medium"
              >
                <Eye className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Lihat Toko</span>
              </button>
            </div>
          </div>

          {/* Recent Products */}
          <div className="card-theme p-6">
            <h3 className="text-lg font-semibold text-theme-primary mb-4">Produk Terbaru</h3>
            <div className="space-y-3">
              {stats?.recentProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-theme-primary bg-opacity-5 rounded-xl">
                  <div>
                    <p className="font-medium text-theme-primary truncate">{product.name}</p>
                    <p className="text-sm text-theme-primary opacity-75">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-theme-primary opacity-75">Stok: {product.stock}</p>
                    <p className="text-sm text-theme-primary opacity-60">{product.views} views</p>
                  </div>
                </div>
              )) || (
                <p className="text-theme-primary opacity-75 text-center py-4">Belum ada produk</p>
              )}
            </div>
          </div>
        </div>

        {/* Stock Overview */}
        <div className="card-theme p-6 mb-8">
          <h3 className="text-lg font-semibold text-theme-primary mb-4">Data Stok Produk</h3>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats?.stockData.map((product) => (
                <div key={product._id} className="flex items-center justify-between p-4 bg-theme-primary bg-opacity-5 rounded-xl border border-theme-primary border-opacity-10">
                  <div className="flex-1">
                    <p className="font-medium text-theme-primary truncate">{product.name}</p>
                    <p className="text-sm text-theme-primary opacity-75">{product.category}</p>
                    <p className="text-sm text-theme-primary opacity-60">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.stock > 10 
                        ? 'bg-accent-mint text-theme-primary' 
                        : product.stock > 0 
                        ? 'bg-accent-yellow text-theme-primary' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      Stok: {product.stock}
                    </div>
                  </div>
                </div>
              )) || (
                <div className="col-span-full text-center py-8">
                  <p className="text-theme-primary opacity-75">Belum ada data stok</p>
                </div>
              )}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}