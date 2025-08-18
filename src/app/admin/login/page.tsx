'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Shield } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Login gagal');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-main flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-theme-header rounded-full mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-on-accent" />
          </div>
          <h1 className="text-3xl font-bold text-theme-primary mb-2">Admin Login</h1>
          <p className="text-theme-primary opacity-75">Masuk ke dashboard admin SistaBag</p>
        </div>

        {/* Login Form */}
        <div className="card-theme p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-theme-primary mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-theme-primary opacity-50" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-header-color focus:border-header-color bg-white transition-all duration-300 text-theme-primary"
                  placeholder="Masukkan username admin"
                  required
                  style={{ borderRadius: '16px' }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-theme-primary mb-2">
                Password Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-theme-primary opacity-50" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-header-color focus:border-header-color bg-white transition-all duration-300 text-theme-primary"
                  placeholder="Masukkan password admin"
                  required
                  style={{ borderRadius: '16px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-theme-primary opacity-50 hover:opacity-75 transition-opacity" />
                  ) : (
                    <Eye className="h-5 w-5 text-theme-primary opacity-50 hover:opacity-75 transition-opacity" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3" style={{ borderRadius: '16px' }}>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="btn-theme-primary w-full py-3 px-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="small" className="mr-2" />
                  Memproses...
                </div>
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Hanya untuk administrator SistaBag
            </p>
          </div>
        </div>

        {/* Back to Store */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-pink-500 hover:text-pink-600 text-sm font-medium transition-colors"
          >
            ← Kembali ke Toko
          </Link>
        </div>
      </div>
    </div>
  );
}