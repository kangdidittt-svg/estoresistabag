'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Upload, X, Plus } from 'lucide-react';
import Toast, { useToast } from '@/components/ui/Toast';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Promo {
  _id: string;
  title: string;
  type: string;
  value: number;
}

export default function NewProductPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    priceAfterDiscount: '',
    category: '',
    tags: '',
    stock: '',
    isPublished: true,
    isFeatured: false,
    promo: ''
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchPromos();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPromos = async () => {
    try {
      const response = await fetch('/api/admin/promos');
      const data = await response.json();
      if (data.success) {
        setPromos(data.data);
      }
    } catch (error) {
      console.error('Error fetching promos:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setImageLoading(true);
    const newFiles = Array.from(files);
    const newPreviews: string[] = [];

    // Create previews for display
    for (const file of newFiles) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPreviews.push(event.target.result as string);
          if (newPreviews.length === newFiles.length) {
            setImages(prev => [...prev, ...newFiles]);
            setImagePreviews(prev => [...prev, ...newPreviews]);
            setImageLoading(false);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price || !formData.category || images.length === 0) {
      showToast('Mohon lengkapi semua field yang wajib diisi', 'error');
      return;
    }

    setLoading(true);
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add basic form data
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock || '0');
      formDataToSend.append('isPublished', formData.isPublished.toString());
      
      if (formData.priceAfterDiscount) {
        formDataToSend.append('priceAfterDiscount', formData.priceAfterDiscount);
      }
      
      if (formData.promo) {
        formDataToSend.append('promo', formData.promo);
      }
      
      if (formData.tags) {
        formDataToSend.append('tags', formData.tags);
      }
      
      // Add image files
      images.forEach((file, index) => {
        formDataToSend.append(`images`, file);
      });

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();
      
      if (data.success) {
        showToast('Produk berhasil ditambahkan!', 'success');
        setTimeout(() => {
          router.push('/admin/products');
        }, 1500);
      } else {
        showToast(data.error || 'Gagal menambahkan produk', 'error');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      showToast('Terjadi kesalahan saat menambahkan produk', 'error');
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
                href="/admin/products"
                className="text-theme-primary hover:text-accent-peach transition-colors"
              >
                ← Kembali ke Produk
              </Link>
              <div className="flex items-center space-x-2">
                <Package className="h-6 w-6 text-accent-peach" />
                <h1 className="text-xl font-semibold text-theme-primary">Tambah Produk Baru</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card-theme rounded-lg shadow-soft p-6">
            <h2 className="text-lg font-semibold text-theme-primary mb-4">Informasi Dasar</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-theme-primary border-opacity-30 rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-200 bg-theme-main text-theme-primary"
                  placeholder="Masukkan nama produk"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Kategori *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-theme-primary border-opacity-30 rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-200 bg-theme-main text-theme-primary"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Deskripsi *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-theme-primary border-opacity-30 rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-200 bg-theme-main text-theme-primary"
                placeholder="Masukkan deskripsi produk"
                required
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Tags (pisahkan dengan koma)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-theme-primary border-opacity-30 rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-200 bg-theme-main text-theme-primary"
                placeholder="tas, fashion, wanita"
              />
            </div>
          </div>



          {/* Images */}
          <div className="card-theme rounded-lg shadow-soft p-6">
            <h2 className="text-lg font-semibold text-theme-primary mb-4">Gambar Produk *</h2>
            
            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-theme-primary border-opacity-30 border-dashed rounded-lg cursor-pointer bg-theme-main hover:bg-theme-primary hover:bg-opacity-5 transition-all duration-200">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-theme-primary opacity-60" />
                  <p className="mb-2 text-sm text-theme-primary opacity-75">
                    <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                  </p>
                  <p className="text-xs text-theme-primary opacity-60">PNG, JPG atau JPEG (MAX. 5MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageLoading}
                />
              </label>
            </div>

            {imageLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-peach"></div>
                <span className="ml-2 text-sm text-theme-primary opacity-75">Mengupload gambar...</span>
              </div>
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <Image
                        src={imagePreviews[index]}
                        alt={`${formData.name || 'Produk'} - Gambar ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="card-theme rounded-lg shadow-soft p-6">
            <h2 className="text-lg font-semibold text-theme-primary mb-4">Harga & Stok</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Harga Normal *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-theme-primary border-opacity-30 rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-200 bg-theme-main text-theme-primary"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Harga Setelah Diskon
                </label>
                <input
                  type="number"
                  name="priceAfterDiscount"
                  value={formData.priceAfterDiscount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-theme-primary border-opacity-30 rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-200 bg-theme-main text-theme-primary"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Stok
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-theme-primary border-opacity-30 rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-200 bg-theme-main text-theme-primary"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Promo (Opsional)
              </label>
              <select
                name="promo"
                value={formData.promo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-theme-primary border-opacity-30 rounded-lg focus:ring-2 focus:ring-accent-peach focus:border-accent-peach transition-all duration-200 bg-theme-main text-theme-primary"
              >
                <option value="">Tidak ada promo</option>
                {promos.map((promo) => (
                  <option key={promo._id} value={promo._id}>
                    {promo.title} ({promo.type === 'percentage' ? `${promo.value}%` : `Rp ${promo.value.toLocaleString()}`})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Settings */}
          <div className="card-theme rounded-lg shadow-soft p-6">
            <h2 className="text-lg font-semibold text-theme-primary mb-4">Pengaturan</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-accent-peach focus:ring-accent-peach border-theme-primary border-opacity-30 rounded"
                />
                <label className="ml-2 block text-sm text-theme-primary">
                  Publikasikan produk sekarang
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-accent-peach focus:ring-accent-peach border-theme-primary border-opacity-30 rounded"
                />
                <label className="ml-2 block text-sm text-theme-primary">
                  Tandai sebagai produk unggulan
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/admin/products"
              className="px-6 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading || imageLoading}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-300 shadow-soft hover:shadow-medium font-semibold"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Tambah Produk</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}