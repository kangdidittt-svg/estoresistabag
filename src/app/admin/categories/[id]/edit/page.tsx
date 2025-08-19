'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Folder, 
  Upload, 
  X, 
  AlertCircle, 
  FileText
} from 'lucide-react';

interface FormData {
  name: string;
  slug: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  isActive: boolean;
}

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    metaTitle: '',
    metaDescription: '',
    isActive: true
  });
  
  const [existingImage, setExistingImage] = useState<string>('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`);
      const data = await response.json();
      
      if (data.success) {
        const category = data.data;
        setFormData({
          name: category.name || '',
          slug: category.slug || '',
          description: category.description || '',
          metaTitle: category.metaTitle || '',
          metaDescription: category.metaDescription || '',
          isActive: category.isActive ?? true
        });
        setExistingImage(category.image || '');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      alert('Gagal memuat data kategori');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Auto-generate slug from name
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value),
        metaTitle: value
      }));
    }
    
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
      
      setNewImage(file);
      setErrors(prev => ({ ...prev, image: '' }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeNewImage = () => {
    setNewImage(null);
    setNewImagePreview('');
    setErrors(prev => ({ ...prev, image: '' }));
  };

  const removeExistingImage = () => {
    setExistingImage('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama kategori wajib diisi';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug kategori wajib diisi';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      const submitData = new FormData();
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString());
      });
      
      // Add existing image info
      submitData.append('existingImage', existingImage);
      
      // Add new image if exists
      if (newImage) {
        submitData.append('image', newImage);
      }
      
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        body: submitData
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Kategori berhasil diperbarui!');
        router.push('/admin/categories');
      } else {
        alert(result.message || 'Gagal memperbarui kategori');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Terjadi kesalahan saat memperbarui kategori');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-main flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-mint"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-main">
      {/* Header */}
      <div className="bg-theme-header shadow-soft border-b border-theme-primary border-opacity-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/categories"
                className="text-theme-primary hover:text-accent-peach transition-colors"
              >
                ← Kembali ke Kelola Kategori
              </Link>
              <div className="flex items-center space-x-2">
                <Folder className="h-6 w-6 text-accent-mint" />
                <h1 className="text-xl font-semibold text-theme-primary">Edit Kategori</h1>
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
              {/* Category Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-mint focus:border-accent-mint transition-all duration-200 bg-theme-main text-theme-primary ${
                    errors.name ? 'border-red-500' : 'border-theme-primary border-opacity-30'
                  }`}
                  placeholder="Masukkan nama kategori"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-mint focus:border-accent-mint transition-all duration-200 bg-theme-main text-theme-primary ${
                    errors.slug ? 'border-red-500' : 'border-theme-primary border-opacity-30'
                  }`}
                  placeholder="kategori-slug"
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.slug}
                  </p>
                )}
                <p className="mt-1 text-xs text-theme-primary opacity-60">
                  URL-friendly version dari nama kategori
                </p>
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
                  rows={4}
                  className="w-full px-3 py-2 border border-theme-primary border-opacity-30 rounded-lg focus:ring-2 focus:ring-accent-mint focus:border-accent-mint transition-all duration-200 bg-theme-main text-theme-primary"
                  placeholder="Deskripsi kategori..."
                />
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="card-theme rounded-lg shadow-soft p-6">
            <h2 className="text-lg font-medium text-theme-primary mb-4">Gambar Kategori</h2>
            
            <div className="space-y-4">
              {/* Current Image */}
              {existingImage && !newImagePreview && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-theme-primary">Gambar Saat Ini</h3>
                  <div className="relative w-full max-w-md">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-theme-primary border-opacity-20">
                      <Image
                        src={existingImage}
                        alt="Current category image"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeExistingImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* New Image Preview */}
              {newImagePreview && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-theme-primary">Gambar Baru</h3>
                  <div className="relative w-full max-w-md">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-theme-primary border-opacity-20">
                      <Image
                        src={newImagePreview}
                        alt="New category image preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeNewImage}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Upload New Image */}
              {!newImagePreview && (
                <div className="border-2 border-dashed border-theme-primary border-opacity-30 rounded-lg p-6 text-center hover:border-accent-mint hover:bg-accent-mint hover:bg-opacity-5 transition-all duration-300">
                  <Upload className="h-12 w-12 text-theme-primary opacity-60 mx-auto mb-4" />
                  <div className="space-y-2">
                    <label className="cursor-pointer">
                      <span className="text-accent-mint hover:text-accent-blue font-medium transition-colors">
                        {existingImage ? 'Ganti gambar' : 'Upload gambar kategori'}
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
              )}
              
              {errors.image && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.image}
                </p>
              )}
            </div>
          </div>

          {/* SEO */}
          <div className="card-theme rounded-lg shadow-soft p-6">
            <h2 className="text-lg font-medium text-theme-primary mb-4">SEO</h2>
            
            <div className="space-y-4">
              {/* Meta Title */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-theme-primary border-opacity-30 rounded-lg focus:ring-2 focus:ring-accent-mint focus:border-accent-mint transition-all duration-200 bg-theme-main text-theme-primary"
                  placeholder="Judul untuk SEO"
                />
                <p className="mt-1 text-xs text-theme-primary opacity-60">
                  Judul yang akan ditampilkan di hasil pencarian Google
                </p>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-theme-primary border-opacity-30 rounded-lg focus:ring-2 focus:ring-accent-mint focus:border-accent-mint transition-all duration-200 bg-theme-main text-theme-primary"
                  placeholder="Deskripsi untuk SEO"
                />
                <p className="mt-1 text-xs text-theme-primary opacity-60">
                  Deskripsi yang akan ditampilkan di hasil pencarian Google (maksimal 160 karakter)
                </p>
              </div>
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
                className="h-4 w-4 text-accent-mint focus:ring-accent-mint border-theme-primary border-opacity-30 rounded"
              />
              <label className="ml-2 text-sm text-theme-primary">
                Aktifkan kategori
              </label>
            </div>
            <p className="mt-1 text-xs text-theme-primary opacity-60">
              Kategori yang tidak aktif tidak akan ditampilkan di website
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <Link
              href="/admin/categories"
              className="px-6 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-accent-mint to-accent-blue text-on-accent rounded-lg hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-on-accent"></div>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Perbarui Kategori</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}