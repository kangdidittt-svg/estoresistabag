'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  DollarSign, 
  Upload, 
  Calendar, 
  Percent, 
  Users, 
  ShoppingCart,
  AlertCircle,
  X
} from 'lucide-react';

interface FormData {
  title: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  minPurchase: number;
  maxDiscount: number;
  usageLimit: number;
}

export default function NewPromoPage() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'percentage',
    value: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    minPurchase: 0,
    maxDiscount: 0,
    usageLimit: 0
  });
  
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    // Set default dates (today and 30 days from now)
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);
    
    setFormData(prev => ({
      ...prev,
      startDate: today.toISOString().split('T')[0],
      endDate: futureDate.toISOString().split('T')[0]
    }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : 
               type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Ukuran gambar maksimal 5MB' }));
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'File harus berupa gambar' }));
        return;
      }
      
      setImage(file);
      setErrors(prev => ({ ...prev, image: '' }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
    setErrors(prev => ({ ...prev, image: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Judul promo wajib diisi';
    }
    
    if (formData.value <= 0) {
      newErrors.value = 'Nilai diskon harus lebih dari 0';
    }
    
    if (formData.type === 'percentage' && formData.value > 100) {
      newErrors.value = 'Persentase diskon tidak boleh lebih dari 100%';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Tanggal mulai wajib diisi';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'Tanggal berakhir wajib diisi';
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'Tanggal berakhir harus setelah tanggal mulai';
    }
    
    if (formData.type === 'percentage' && formData.maxDiscount > 0 && formData.maxDiscount < formData.value) {
      newErrors.maxDiscount = 'Maksimal diskon tidak boleh kurang dari nilai diskon';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const submitData = new FormData();
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString());
      });
      
      // Add image if exists
      if (image) {
        submitData.append('image', image);
      }
      
      const response = await fetch('/api/admin/promos', {
        method: 'POST',
        body: submitData
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Promo berhasil ditambahkan!');
        router.push('/admin/promos');
      } else {
        alert(result.message || 'Gagal menambahkan promo');
      }
    } catch (error) {
      console.error('Error creating promo:', error);
      alert('Terjadi kesalahan saat menambahkan promo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-main">
      {/* Header */}
      <div className="bg-theme-header shadow-soft border-b border-theme-primary border-opacity-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/promos"
                className="text-theme-primary hover:text-accent-peach transition-colors"
              >
                ← Kembali ke Kelola Promo
              </Link>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-accent-peach" />
                <h1 className="text-xl font-semibold text-theme-primary">Tambah Promo Baru</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card-theme rounded-lg shadow-soft p-6">
            <h2 className="text-lg font-medium text-theme-primary mb-4">Informasi Dasar</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Judul Promo *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-200 bg-theme-main text-theme-primary ${
                    errors.title ? 'border-red-500' : 'border-theme-primary border-opacity-30'
                  }`}
                  placeholder="Contoh: Diskon Akhir Tahun 50%"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-theme-primary border-opacity-30 rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-200 bg-theme-main text-theme-primary"
                  placeholder="Deskripsi detail tentang promo ini..."
                />
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Jenis Diskon *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-theme-primary border-opacity-30 rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-200 bg-theme-main text-theme-primary"
                >
                  <option value="percentage">Persentase (%)</option>
                  <option value="fixed">Nominal Tetap (Rp)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Nilai Diskon *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {formData.type === 'percentage' ? (
                      <Percent className="h-4 w-4 text-theme-primary opacity-60" />
                    ) : (
                      <span className="text-theme-primary opacity-60 text-sm">Rp</span>
                    )}
                  </div>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    min="0"
                    max={formData.type === 'percentage' ? "100" : undefined}
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-200 bg-theme-main text-theme-primary ${
                      errors.value ? 'border-red-500' : 'border-theme-primary border-opacity-30'
                    }`}
                    placeholder={formData.type === 'percentage' ? '10' : '50000'}
                  />
                </div>
                {errors.value && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.value}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="card-theme rounded-lg shadow-soft p-6">
            <h2 className="text-lg font-medium text-theme-primary mb-4">Periode Promo</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Tanggal Mulai *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-theme-primary opacity-60" />
                  </div>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-200 bg-theme-main text-theme-primary ${
                      errors.startDate ? 'border-red-500' : 'border-theme-primary border-opacity-30'
                    }`}
                  />
                </div>
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.startDate}
                  </p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Tanggal Berakhir *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-theme-primary opacity-60" />
                  </div>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={formData.startDate}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-200 bg-theme-main text-theme-primary ${
                      errors.endDate ? 'border-red-500' : 'border-theme-primary border-opacity-30'
                    }`}
                  />
                </div>
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="card-theme rounded-lg shadow-soft p-6">
            <h2 className="text-lg font-medium text-theme-primary mb-4">Pengaturan Lanjutan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Min Purchase */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Minimal Pembelian
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShoppingCart className="h-4 w-4 text-theme-primary opacity-60" />
                  </div>
                  <input
                    type="number"
                    name="minPurchase"
                    value={formData.minPurchase}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full pl-10 pr-3 py-2 border border-theme-primary border-opacity-30 rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-200 bg-theme-main text-theme-primary"
                    placeholder="0 (tidak ada minimal)"
                  />
                </div>
                <p className="mt-1 text-xs text-theme-primary opacity-60">
                  Kosongkan atau isi 0 jika tidak ada minimal pembelian
                </p>
              </div>

              {/* Max Discount (only for percentage) */}
              {formData.type === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maksimal Diskon (Rp)
                  </label>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={formData.maxDiscount}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-200 bg-theme-main text-theme-primary ${
                      errors.maxDiscount ? 'border-red-500' : 'border-theme-primary border-opacity-30'
                    }`}
                    placeholder="0 (tidak ada batas)"
                  />
                  {errors.maxDiscount && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.maxDiscount}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-theme-primary opacity-60">
                    Kosongkan atau isi 0 jika tidak ada batas maksimal
                  </p>
                </div>
              )}

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Batas Penggunaan
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-4 w-4 text-theme-primary opacity-60" />
                  </div>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full pl-10 pr-3 py-2 border border-theme-primary border-opacity-30 rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-200 bg-theme-main text-theme-primary"
                    placeholder="0 (tidak terbatas)"
                  />
                </div>
                <p className="mt-1 text-xs text-theme-primary opacity-60">
                  Kosongkan atau isi 0 jika tidak ada batas penggunaan
                </p>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="card-theme rounded-lg shadow-soft p-6">
            <h2 className="text-lg font-medium text-theme-primary mb-4">Gambar Promo</h2>
            
            <div className="space-y-4">
              {!imagePreview ? (
                <div className="border-2 border-dashed border-theme-primary border-opacity-30 rounded-lg p-6 text-center hover:border-accent-peach transition-colors">
                  <Upload className="h-12 w-12 text-theme-primary opacity-60 mx-auto mb-4" />
                  <div className="space-y-2">
                    <label className="cursor-pointer">
                      <span className="text-accent-peach hover:text-accent-mint font-medium">
                        Klik untuk upload gambar
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-theme-primary opacity-60">
                      PNG, JPG, JPEG hingga 5MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              {errors.image && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.image}
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="card-theme rounded-lg shadow-soft p-6">
            <h2 className="text-lg font-medium text-theme-primary mb-4">Status</h2>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-accent-peach focus:ring-accent-peach border-theme-primary border-opacity-30 rounded"
              />
              <label className="ml-2 text-sm text-theme-primary">
                Aktifkan promo setelah dibuat
              </label>
            </div>
            <p className="mt-1 text-xs text-theme-primary opacity-60">
              Promo yang tidak aktif tidak akan ditampilkan kepada pelanggan
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <Link
              href="/admin/promos"
              className="px-6 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-accent-peach to-accent-mint text-on-accent rounded-lg hover:from-accent-mint hover:to-accent-yellow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-soft hover:shadow-medium flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Promo</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}