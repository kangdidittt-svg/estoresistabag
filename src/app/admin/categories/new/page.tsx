'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tag, Upload, X, Plus } from 'lucide-react';

export default function NewCategoryPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [image, setImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageLoading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string);
        setImageLoading(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert('Nama kategori wajib diisi');
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        image: image || undefined
      };

      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Kategori berhasil ditambahkan!');
        router.push('/admin/categories');
      } else {
        alert(data.error || 'Gagal menambahkan kategori');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Terjadi kesalahan saat menambahkan kategori');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-main">
      {/* Header */}
      <div className="bg-theme-header shadow-soft border-b border-theme-primary border-opacity-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/categories"
                className="text-theme-primary hover:text-accent-peach transition-colors"
              >
                ← Kembali ke Kategori
              </Link>
              <div className="flex items-center space-x-2">
                <Tag className="h-6 w-6 text-accent-mint" />
                <h1 className="text-xl font-semibold text-theme-primary">Tambah Kategori Baru</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card-theme rounded-lg shadow-soft p-6">
            <h2 className="text-lg font-semibold text-theme-primary mb-4">Informasi Kategori</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-theme-primary border-opacity-30 rounded-lg focus:ring-2 focus:ring-accent-mint focus:border-accent-mint transition-all duration-200 bg-theme-main text-theme-primary"
                  placeholder="Masukkan nama kategori"
                  required
                />
                <p className="mt-1 text-xs text-theme-primary opacity-60">
                  Slug akan dibuat otomatis berdasarkan nama kategori
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-theme-primary border-opacity-30 rounded-lg focus:ring-2 focus:ring-accent-mint focus:border-accent-mint transition-all duration-200 bg-theme-main text-theme-primary"
                  placeholder="Masukkan deskripsi kategori (opsional)"
                />
              </div>
            </div>
          </div>

          {/* Category Image */}
          <div className="card-theme rounded-lg shadow-soft p-6">
            <h2 className="text-lg font-semibold text-theme-primary mb-4">Gambar Kategori</h2>
            
            {!image ? (
              <div className="mb-4">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-theme-primary border-opacity-30 border-dashed rounded-lg cursor-pointer bg-theme-main hover:bg-accent-mint hover:bg-opacity-5 transition-all duration-300">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-theme-primary opacity-60" />
                    <p className="mb-2 text-sm text-theme-primary opacity-75">
                      <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                    </p>
                    <p className="text-xs text-theme-primary opacity-50">PNG, JPG atau JPEG (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageLoading}
                  />
                </label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={image}
                  alt="Category preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {imageLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-mint"></div>
                <span className="ml-2 text-sm text-theme-primary opacity-75">Mengupload gambar...</span>
              </div>
            )}

            <p className="mt-2 text-xs text-theme-primary opacity-60">
              Gambar kategori akan ditampilkan di halaman kategori. Ukuran yang disarankan: 400x300 piksel.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/admin/categories"
              className="px-6 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading || imageLoading}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-300 shadow-soft hover:shadow-medium font-semibold"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Tambah Kategori</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}