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
  CheckCircle,
  Phone,
  Database,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react';

interface Admin {
  _id: string;
  username: string;
  email?: string;
  role: 'super_admin' | 'admin';
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
  role: 'super_admin' | 'admin';
}

interface AppConfig {
  _id: string;
  whatsappNumber: string;
  whatsappTemplate: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'password' | 'admins' | 'whatsapp' | 'guide' | 'data'>('password');
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
    email: '',
    role: 'admin'
  });
  const [newAdminErrors, setNewAdminErrors] = useState<Record<string, string>>({});
  const [showNewAdminForm, setShowNewAdminForm] = useState(false);

  // WhatsApp settings
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappTemplate, setWhatsappTemplate] = useState('');
  const [whatsappError, setWhatsappError] = useState('');
  const [templateError, setTemplateError] = useState('');

  // Guide management
  const [guideContent, setGuideContent] = useState({
    title: '',
    content: '',
    steps: [{ title: '', description: '', image: '' }]
  });
  const [guideLoading, setGuideLoading] = useState(false);

  // Clear data
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  const [clearDataLoading, setClearDataLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'admins') {
      fetchAdmins();
    } else if (activeTab === 'whatsapp') {
      fetchAppConfig();
    } else if (activeTab === 'guide') {
      fetchGuideContent();
    }
  }, [activeTab]);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin/admins');
      const data = await response.json();
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchAppConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      const data = await response.json();
      if (data.success) {
        setAppConfig(data.data);
        setWhatsappNumber(data.data.whatsappNumber || '');
        setWhatsappTemplate(data.data.whatsappTemplate || '');
      }
    } catch (error) {
      console.error('Error fetching app config:', error);
    }
  };

  const handleWhatsAppUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setWhatsappError('');
    setTemplateError('');
    setMessage(null);

    // Validasi nomor WhatsApp
    if (!whatsappNumber) {
      setWhatsappError('Nomor WhatsApp wajib diisi');
      return;
    }

    const phoneRegex = /^62\d{8,13}$/;
    if (!phoneRegex.test(whatsappNumber)) {
      setWhatsappError('Format nomor tidak valid. Gunakan format: 62xxxxxxxxx');
      return;
    }

    // Validasi template
    if (!whatsappTemplate || whatsappTemplate.trim().length === 0) {
      setTemplateError('Template pesan wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ whatsappNumber, whatsappTemplate })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Konfigurasi WhatsApp berhasil diperbarui' });
        setAppConfig(data.data);
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal memperbarui konfigurasi WhatsApp' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat memperbarui konfigurasi WhatsApp' });
    } finally {
      setLoading(false);
    }
  };

  const fetchGuideContent = async () => {
    try {
      const response = await fetch('/api/admin/guide');
      const data = await response.json();
      if (data.success && data.data) {
        setGuideContent({
          title: data.data.title || '',
          content: data.data.content || '',
          steps: data.data.steps || [{ title: '', description: '', image: '' }]
        });
      }
    } catch (error) {
      console.error('Error fetching guide content:', error);
    }
  };

  const handleGuideUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuideLoading(true);
    
    try {
      const response = await fetch('/api/admin/guide', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(guideContent)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Panduan berhasil diperbarui' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal memperbarui panduan' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat memperbarui panduan' });
    } finally {
      setGuideLoading(false);
    }
  };

  const addGuideStep = () => {
    setGuideContent(prev => ({
      ...prev,
      steps: [...prev.steps, { title: '', description: '', image: '' }]
    }));
  };

  const removeGuideStep = (index: number) => {
    if (guideContent.steps.length > 1) {
      setGuideContent(prev => ({
        ...prev,
        steps: prev.steps.filter((_, i) => i !== index)
      }));
    }
  };

  const updateGuideStep = (index: number, field: string, value: string) => {
    setGuideContent(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, [field]: value } : step
      )
    }));
  };

  const handleClearData = async () => {
    setClearDataLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/clear-data', {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setShowClearDataConfirm(false);
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal menghapus data' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menghapus data' });
    } finally {
      setClearDataLoading(false);
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
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: newAdminForm.username,
          password: newAdminForm.password,
          email: newAdminForm.email || undefined,
          role: newAdminForm.role
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Admin baru berhasil ditambahkan' });
        setNewAdminForm({ username: '', password: '', confirmPassword: '', email: '', role: 'admin' });
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
      const response = await fetch(`/api/admin/admins/${adminId}`, {
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
    <div className="min-h-screen bg-theme-main">
      {/* Header */}
      <header className="bg-theme-header shadow-soft border-b border-theme-primary border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-on-accent text-opacity-60 hover:text-accent-peach transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Settings className="h-6 w-6 text-accent-peach mr-3" />
              <h1 className="text-xl font-semibold text-on-accent">Pengaturan Admin</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-accent-mint bg-opacity-20 text-accent-mint border border-accent-mint border-opacity-30' 
              : 'bg-red-100 text-red-700 border border-red-200'
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
        <div className="card-theme rounded-lg shadow-soft">
          <div className="border-b border-theme-primary border-opacity-10">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'password'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-theme-primary text-opacity-60 hover:text-blue-600 hover:border-blue-600 hover:border-opacity-50'
                }`}
              >
                <Lock className="h-4 w-4 inline mr-2" />
                Ganti Password
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'admins'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-theme-primary text-opacity-60 hover:text-blue-600 hover:border-blue-600 hover:border-opacity-50'
                }`}
              >
                <User className="h-4 w-4 inline mr-2" />
                Kelola Admin
              </button>
              <button
                onClick={() => setActiveTab('whatsapp')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'whatsapp'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-theme-primary text-opacity-60 hover:text-blue-600 hover:border-blue-600 hover:border-opacity-50'
                }`}
              >
                <Phone className="h-4 w-4 inline mr-2" />
                WhatsApp
              </button>
              <button
                onClick={() => setActiveTab('guide')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'guide'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-theme-primary text-opacity-60 hover:text-blue-600 hover:border-blue-600 hover:border-opacity-50'
                }`}
              >
                <BookOpen className="h-4 w-4 inline mr-2" />
                Panduan
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'data'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-theme-primary text-opacity-60 hover:text-blue-600 hover:border-blue-600 hover:border-opacity-50'
                }`}
              >
                <Database className="h-4 w-4 inline mr-2" />
                Data Management
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Password Change Tab */}
            {activeTab === 'password' && (
              <div className="max-w-md">
                <h3 className="text-lg font-medium text-theme-primary mb-4">Ubah Password Admin</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Password Saat Ini
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className={`block w-full pr-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-white text-theme-primary ${
                          passwordErrors.currentPassword ? 'border-red-500' : 'border-theme-primary border-opacity-20'
                        }`}
                        placeholder="Masukkan password saat ini"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4 text-theme-primary text-opacity-50" />
                        ) : (
                          <Eye className="h-4 w-4 text-theme-primary text-opacity-50" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className={`block w-full pr-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-white text-theme-primary ${
                          passwordErrors.newPassword ? 'border-red-500' : 'border-theme-primary border-opacity-20'
                        }`}
                        placeholder="Masukkan password baru"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4 text-theme-primary text-opacity-50" />
                        ) : (
                          <Eye className="h-4 w-4 text-theme-primary text-opacity-50" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className={`block w-full pr-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-white text-theme-primary ${
                          passwordErrors.confirmPassword ? 'border-red-500' : 'border-theme-primary border-opacity-20'
                        }`}
                        placeholder="Konfirmasi password baru"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4 text-theme-primary text-opacity-50" />
                        ) : (
                          <Eye className="h-4 w-4 text-theme-primary text-opacity-50" />
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
                    className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-accent-peach to-accent-mint text-on-accent rounded-lg hover:from-accent-mint hover:to-accent-yellow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-soft hover:shadow-medium"
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
                  <h3 className="text-lg font-medium text-theme-primary">Kelola Admin</h3>
                  <button
                    onClick={() => setShowNewAdminForm(!showNewAdminForm)}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-accent-peach to-accent-mint text-on-accent rounded-lg hover:from-accent-mint hover:to-accent-yellow transition-all duration-300 shadow-soft hover:shadow-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Admin
                  </button>
                </div>

                {/* New Admin Form */}
                {showNewAdminForm && (
                  <div className="card-theme rounded-lg p-6 mb-6 shadow-soft">
                    <h4 className="text-md font-medium text-theme-primary mb-4">Tambah Admin Baru</h4>
                    <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Username *
                        </label>
                        <input
                          type="text"
                          value={newAdminForm.username}
                          onChange={(e) => setNewAdminForm(prev => ({ ...prev, username: e.target.value }))}
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-white text-theme-primary ${
                            newAdminErrors.username ? 'border-red-500' : 'border-theme-primary border-opacity-20'
                          }`}
                          placeholder="Username admin"
                        />
                        {newAdminErrors.username && (
                          <p className="mt-1 text-sm text-red-600">{newAdminErrors.username}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={newAdminForm.email}
                          onChange={(e) => setNewAdminForm(prev => ({ ...prev, email: e.target.value }))}
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-white text-theme-primary ${
                            newAdminErrors.email ? 'border-red-500' : 'border-theme-primary border-opacity-20'
                          }`}
                          placeholder="email@example.com (opsional)"
                        />
                        {newAdminErrors.email && (
                          <p className="mt-1 text-sm text-red-600">{newAdminErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.newAdmin ? 'text' : 'password'}
                            value={newAdminForm.password}
                            onChange={(e) => setNewAdminForm(prev => ({ ...prev, password: e.target.value }))}
                            className={`block w-full pr-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-white text-theme-primary ${
                              newAdminErrors.password ? 'border-red-500' : 'border-theme-primary border-opacity-20'
                            }`}
                            placeholder="Password admin"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('newAdmin')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.newAdmin ? (
                              <EyeOff className="h-4 w-4 text-theme-primary text-opacity-50" />
                            ) : (
                              <Eye className="h-4 w-4 text-theme-primary text-opacity-50" />
                            )}
                          </button>
                        </div>
                        {newAdminErrors.password && (
                          <p className="mt-1 text-sm text-red-600">{newAdminErrors.password}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Konfirmasi Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirmNewAdmin ? 'text' : 'password'}
                            value={newAdminForm.confirmPassword}
                            onChange={(e) => setNewAdminForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className={`block w-full pr-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-white text-theme-primary ${
                              newAdminErrors.confirmPassword ? 'border-red-500' : 'border-theme-primary border-opacity-20'
                            }`}
                            placeholder="Konfirmasi password"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirmNewAdmin')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.confirmNewAdmin ? (
                              <EyeOff className="h-4 w-4 text-theme-primary text-opacity-50" />
                            ) : (
                              <Eye className="h-4 w-4 text-theme-primary text-opacity-50" />
                            )}
                          </button>
                        </div>
                        {newAdminErrors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">{newAdminErrors.confirmPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Role *
                        </label>
                        <select
                          value={newAdminForm.role}
                          onChange={(e) => setNewAdminForm(prev => ({ ...prev, role: e.target.value as 'super_admin' | 'admin' }))}
                          className="block w-full px-3 py-2 border border-theme-primary border-opacity-20 rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-white text-theme-primary"
                        >
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 flex items-center space-x-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center px-4 py-2 bg-gradient-to-r from-accent-mint to-accent-yellow text-on-accent rounded-lg hover:from-accent-yellow hover:to-accent-peach disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-soft hover:shadow-medium"
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
                            setNewAdminForm({ username: '', password: '', confirmPassword: '', email: '', role: 'admin' });
                            setNewAdminErrors({});
                          }}
                          className="px-4 py-2 bg-theme-primary bg-opacity-10 text-theme-primary border border-theme-primary border-opacity-50 rounded-lg hover:bg-theme-primary hover:bg-opacity-20 transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Admin List */}
                <div className="card-theme border border-theme-primary border-opacity-10 rounded-lg overflow-hidden shadow-soft">
                  <div className="px-6 py-4 border-b border-theme-primary border-opacity-10 bg-theme-primary bg-opacity-5">
                    <h4 className="text-sm font-medium text-theme-primary">Daftar Admin</h4>
                  </div>
                  <div className="divide-y divide-theme-primary divide-opacity-10">
                    {admins.length === 0 ? (
                      <div className="px-6 py-8 text-center text-theme-primary text-opacity-60">
                        <Shield className="h-12 w-12 mx-auto text-theme-primary text-opacity-30 mb-4" />
                        <p>Belum ada admin yang terdaftar</p>
                      </div>
                    ) : (
                      admins.map((admin) => (
                        <div key={admin._id} className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 bg-accent-peach bg-opacity-20 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-accent-peach" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-theme-primary">{admin.username}</p>
                                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  admin.role === 'super_admin' 
                                    ? 'bg-accent-peach bg-opacity-20 text-accent-peach' 
                                    : 'bg-accent-mint bg-opacity-20 text-accent-mint'
                                }`}>
                                  {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                </span>
                                {!admin.isActive && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Nonaktif
                                  </span>
                                )}
                              </div>
                              {admin.email && (
                                <p className="text-sm text-theme-primary text-opacity-60">{admin.email}</p>
                              )}
                              <p className="text-xs text-theme-primary text-opacity-40">
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
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shadow-soft hover:shadow-medium"
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

            {/* WhatsApp Settings Tab */}
            {activeTab === 'whatsapp' && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-medium text-theme-primary mb-4">Pengaturan WhatsApp</h3>
                <p className="text-sm text-theme-primary text-opacity-60 mb-6">
                  Atur nomor WhatsApp dan template pesan yang akan digunakan untuk tombol "Pesan via WhatsApp" di seluruh aplikasi.
                </p>
                
                <form onSubmit={handleWhatsAppUpdate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Nomor WhatsApp *
                    </label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-white text-theme-primary ${
                        whatsappError ? 'border-red-500' : 'border-theme-primary border-opacity-20'
                      }`}
                      placeholder="62812345678901"
                    />
                    {whatsappError && (
                      <p className="mt-1 text-sm text-red-600">{whatsappError}</p>
                    )}
                    <p className="mt-1 text-xs text-theme-primary text-opacity-50">
                      Format: 62xxxxxxxxx (dimulai dengan 62, tanpa tanda +)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Template Pesan WhatsApp *
                    </label>
                    <textarea
                      value={whatsappTemplate}
                      onChange={(e) => setWhatsappTemplate(e.target.value)}
                      rows={6}
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-white text-theme-primary resize-none ${
                        templateError ? 'border-red-500' : 'border-theme-primary border-opacity-20'
                      }`}
                      placeholder="Halo, saya tertarik dengan produk:\n\n*{productName}*\nHarga: {price}\nJumlah: {quantity}\n\nLink produk: {productUrl}\n\nBisakah saya mendapatkan informasi lebih lanjut?"
                    />
                    {templateError && (
                      <p className="mt-1 text-sm text-red-600">{templateError}</p>
                    )}
                    <div className="mt-2 text-xs text-theme-primary text-opacity-50">
                      <p className="mb-1">Variabel yang tersedia:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">{'{productName}'}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">{'{price}'}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">{'{quantity}'}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-700">{'{productUrl}'}</span>
                      </div>
                      <p className="mt-2">Gunakan \\n untuk baris baru</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Menyimpan...' : 'Simpan Konfigurasi WhatsApp'}
                  </button>
                </form>

                {appConfig && (
                  <div className="mt-6 p-4 bg-theme-secondary bg-opacity-50 rounded-lg">
                    <h4 className="text-sm font-medium text-theme-primary mb-3">Konfigurasi Saat Ini:</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-theme-primary text-opacity-60 mb-1">Nomor WhatsApp:</p>
                        <p className="text-sm text-theme-primary text-opacity-80">+{appConfig.whatsappNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-theme-primary text-opacity-60 mb-1">Template Pesan:</p>
                        <div className="bg-white p-2 rounded border text-xs text-theme-primary max-h-20 overflow-y-auto">
                          {appConfig.whatsappTemplate?.split('\\n').map((line, index) => (
                            <div key={index}>{line}</div>
                          )) || 'Template tidak tersedia'}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-theme-primary text-opacity-50 mt-3">
                      Terakhir diperbarui: {new Date(appConfig.updatedAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Guide Management Tab */}
            {activeTab === 'guide' && (
              <div>
                <h3 className="text-lg font-medium text-theme-primary mb-4">Kelola Panduan</h3>
                <p className="text-sm text-theme-primary text-opacity-60 mb-6">
                  Edit konten panduan cara memesan produk yang akan ditampilkan kepada pelanggan.
                </p>

                <form onSubmit={handleGuideUpdate} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Judul Panduan *
                    </label>
                    <input
                      type="text"
                      value={guideContent.title}
                      onChange={(e) => setGuideContent(prev => ({ ...prev, title: e.target.value }))}
                      className="block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-white text-theme-primary border-theme-primary border-opacity-20"
                      placeholder="Panduan Cara Memesan Produk"
                      required
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      Deskripsi Panduan *
                    </label>
                    <textarea
                      value={guideContent.content}
                      onChange={(e) => setGuideContent(prev => ({ ...prev, content: e.target.value }))}
                      rows={3}
                      className="block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-white text-theme-primary border-theme-primary border-opacity-20 resize-none"
                      placeholder="Ikuti langkah-langkah mudah berikut untuk memesan produk di SistaBag:"
                      required
                    />
                  </div>

                  {/* Steps */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-theme-primary">
                        Langkah-langkah Panduan
                      </label>
                      <button
                        type="button"
                        onClick={addGuideStep}
                        className="flex items-center px-3 py-1 bg-accent-mint text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Tambah Langkah
                      </button>
                    </div>

                    <div className="space-y-4">
                      {guideContent.steps.map((step, index) => (
                        <div key={index} className="card-theme p-4 border border-theme-primary border-opacity-10 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-theme-primary">Langkah {index + 1}</h4>
                            {guideContent.steps.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeGuideStep(index)}
                                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-theme-primary mb-1">
                                Judul Langkah *
                              </label>
                              <input
                                type="text"
                                value={step.title}
                                onChange={(e) => updateGuideStep(index, 'title', e.target.value)}
                                className="block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-white text-theme-primary border-theme-primary border-opacity-20 text-sm"
                                placeholder="1. Pilih Produk"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-theme-primary mb-1">
                                Deskripsi Langkah *
                              </label>
                              <textarea
                                value={step.description}
                                onChange={(e) => updateGuideStep(index, 'description', e.target.value)}
                                rows={3}
                                className="block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-white text-theme-primary border-theme-primary border-opacity-20 resize-none text-sm"
                                placeholder="Jelaskan langkah ini dengan detail..."
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-theme-primary mb-1">
                                URL Gambar (Opsional)
                              </label>
                              <div className="flex items-center space-x-2">
                                <ImageIcon className="h-4 w-4 text-theme-primary text-opacity-50" />
                                <input
                                  type="url"
                                  value={step.image || ''}
                                  onChange={(e) => updateGuideStep(index, 'image', e.target.value)}
                                  className="block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-white text-theme-primary border-theme-primary border-opacity-20 text-sm"
                                  placeholder="https://example.com/image.jpg"
                                />
                              </div>
                              <p className="mt-1 text-xs text-theme-primary text-opacity-50">
                                Masukkan URL gambar untuk membantu menjelaskan langkah ini
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button
                      type="submit"
                      disabled={guideLoading}
                      className="flex items-center px-6 py-2 bg-gradient-to-r from-accent-peach to-accent-mint text-white rounded-lg hover:from-accent-mint hover:to-accent-yellow transition-all duration-300 shadow-soft hover:shadow-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {guideLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {guideLoading ? 'Menyimpan...' : 'Simpan Panduan'}
                    </button>
                    
                    <a
                      href="/panduan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-theme-primary bg-opacity-10 text-theme-primary border border-theme-primary border-opacity-50 rounded-lg hover:bg-theme-primary hover:bg-opacity-20 transition-colors"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Preview Panduan
                    </a>
                  </div>
                </form>
              </div>
            )}

            {/* Data Management Tab */}
            {activeTab === 'data' && (
              <div>
                <h3 className="text-lg font-medium text-theme-primary mb-4">Manajemen Data</h3>
                <p className="text-sm text-theme-primary text-opacity-60 mb-6">
                  Kelola data aplikasi dengan hati-hati. Tindakan ini tidak dapat dibatalkan.
                </p>

                <div className="space-y-6">
                  {/* Clear All Data */}
                  <div className="card-theme rounded-lg p-6 border border-red-200">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <Database className="h-5 w-5 text-red-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-md font-medium text-theme-primary mb-2">Bersihkan Semua Data</h4>
                        <p className="text-sm text-theme-primary text-opacity-60 mb-4">
                          Hapus semua produk dan promo beserta file gambarnya. Kategori dan data admin tidak akan terhapus.
                        </p>
                        
                        {!showClearDataConfirm ? (
                          <button
                            onClick={() => setShowClearDataConfirm(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-soft hover:shadow-medium"
                          >
                            <Trash2 className="h-4 w-4 inline mr-2" />
                            Bersihkan Data
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-800 font-medium mb-2">
                                ⚠️ Peringatan: Tindakan ini akan menghapus SEMUA data produk dan promo!
                              </p>
                              <p className="text-xs text-red-700">
                                Data yang akan dihapus: Semua produk, semua promo, dan file gambar terkait.
                              </p>
                            </div>
                            <div className="flex space-x-3">
                              <button
                                onClick={handleClearData}
                                disabled={clearDataLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-soft hover:shadow-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {clearDataLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                                    Menghapus...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 inline mr-2" />
                                    Ya, Hapus Semua Data
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => setShowClearDataConfirm(false)}
                                disabled={clearDataLoading}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors shadow-soft hover:shadow-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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