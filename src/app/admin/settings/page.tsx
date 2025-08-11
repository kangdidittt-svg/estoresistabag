'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  EyeOff, 
  User, 
  Lock, 
  Plus, 
  Trash2,
  Settings,
  Shield,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Admin {
  _id: string;
  username: string;
  email?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NewAdminForm {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'password' | 'admins'>('password');
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change form
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // New admin form
  const [newAdminForm, setNewAdminForm] = useState<NewAdminForm>({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  });
  const [newAdminErrors, setNewAdminErrors] = useState<Record<string, string>>({});
  const [showNewAdminForm, setShowNewAdminForm] = useState(false);

  useEffect(() => {
    if (activeTab === 'admins') {
      fetchAdmins();
    }
  }, [activeTab]);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    setMessage(null);

    // Validation
    const errors: Record<string, string> = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Password saat ini wajib diisi';
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'Password baru wajib diisi';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password baru minimal 6 karakter';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password tidak cocok';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Password berhasil diubah' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal mengubah password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat mengubah password' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewAdminErrors({});
    setMessage(null);

    // Validation
    const errors: Record<string, string> = {};
    if (!newAdminForm.username) {
      errors.username = 'Username wajib diisi';
    } else if (newAdminForm.username.length < 3) {
      errors.username = 'Username minimal 3 karakter';
    }
    if (!newAdminForm.password) {
      errors.password = 'Password wajib diisi';
    } else if (newAdminForm.password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
    }
    if (newAdminForm.password !== newAdminForm.confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password tidak cocok';
    }
    if (newAdminForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdminForm.email)) {
      errors.email = 'Format email tidak valid';
    }

    if (Object.keys(errors).length > 0) {
      setNewAdminErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: newAdminForm.username,
          password: newAdminForm.password,
          email: newAdminForm.email || undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Admin baru berhasil ditambahkan' });
        setNewAdminForm({ username: '', password: '', confirmPassword: '', email: '' });
        setShowNewAdminForm(false);
        fetchAdmins();
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal menambahkan admin' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menambahkan admin' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, username: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus admin "${username}"?`)) return;

    try {
      const response = await fetch(`/api/admin/users/${adminId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Admin berhasil dihapus' });
        fetchAdmins();
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal menghapus admin' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menghapus admin' });
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Settings className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Pengaturan Admin</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'password'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Lock className="h-4 w-4 inline mr-2" />
                Ganti Password
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'admins'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="h-4 w-4 inline mr-2" />
                Kelola Admin
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Password Change Tab */}
            {activeTab === 'password' && (
              <div className="max-w-md">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ubah Password Admin</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Saat Ini
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className={`block w-full pr-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Masukkan password saat ini"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className={`block w-full pr-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Masukkan password baru"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className={`block w-full pr-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Konfirmasi password baru"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {loading ? 'Menyimpan...' : 'Simpan Password'}
                  </button>
                </form>
              </div>
            )}

            {/* Admin Management Tab */}
            {activeTab === 'admins' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Kelola Admin</h3>
                  <button
                    onClick={() => setShowNewAdminForm(!showNewAdminForm)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Admin
                  </button>
                </div>

                {/* New Admin Form */}
                {showNewAdminForm && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Tambah Admin Baru</h4>
                    <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username *
                        </label>
                        <input
                          type="text"
                          value={newAdminForm.username}
                          onChange={(e) => setNewAdminForm(prev => ({ ...prev, username: e.target.value }))}
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            newAdminErrors.username ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Username admin"
                        />
                        {newAdminErrors.username && (
                          <p className="mt-1 text-sm text-red-600">{newAdminErrors.username}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={newAdminForm.email}
                          onChange={(e) => setNewAdminForm(prev => ({ ...prev, email: e.target.value }))}
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            newAdminErrors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="email@example.com (opsional)"
                        />
                        {newAdminErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{newAdminErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.newAdmin ? 'text' : 'password'}
                            value={newAdminForm.password}
                            onChange={(e) => setNewAdminForm(prev => ({ ...prev, password: e.target.value }))}
                            className={`block w-full pr-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              newAdminErrors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Password admin"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('newAdmin')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.newAdmin ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {newAdminErrors.password && (
                          <p className="mt-1 text-sm text-red-600">{newAdminErrors.password}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Konfirmasi Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirmNewAdmin ? 'text' : 'password'}
                            value={newAdminForm.confirmPassword}
                            onChange={(e) => setNewAdminForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className={`block w-full pr-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              newAdminErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Konfirmasi password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirmNewAdmin')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.confirmNewAdmin ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {newAdminErrors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">{newAdminErrors.confirmPassword}</p>
                        )}
                      </div>

                      <div className="md:col-span-2 flex items-center space-x-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          {loading ? 'Menambahkan...' : 'Tambah Admin'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewAdminForm(false);
                            setNewAdminForm({ username: '', password: '', confirmPassword: '', email: '' });
                            setNewAdminErrors({});
                          }}
                          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Admin List */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-900">Daftar Admin</h4>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {admins.length === 0 ? (
                      <div className="px-6 py-8 text-center text-gray-500">
                        <Shield className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p>Belum ada admin yang terdaftar</p>
                      </div>
                    ) : (
                      admins.map((admin) => (
                        <div key={admin._id} className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-gray-900">{admin.username}</p>
                                {!admin.isActive && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Nonaktif
                                  </span>
                                )}
                              </div>
                              {admin.email && (
                                <p className="text-sm text-gray-500">{admin.email}</p>
                              )}
                              <p className="text-xs text-gray-400">
                                Dibuat: {new Date(admin.createdAt).toLocaleDateString('id-ID')}
                                {admin.lastLogin && (
                                  <span className="ml-2">
                                    • Login terakhir: {new Date(admin.lastLogin).toLocaleDateString('id-ID')}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDeleteAdmin(admin._id, admin.username)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus admin"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}