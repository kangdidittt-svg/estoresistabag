'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Star, 
  Eye, 
  ShoppingBag, 
  MessageCircle,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Tag,
  Package,
  Truck,
  Menu,
  X,
  Search,
  Grid
} from 'lucide-react';
import { formatCurrency, calculateDiscountPercentage } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useCart } from '@/contexts/CartContext';
import { getWhatsAppUrl, formatWhatsAppMessage } from '@/lib/whatsapp';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  images: string[];
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  views: number;
  stock: number;
  sku: string;
  promo?: {
    _id: string;
    title: string;
    type: string;
    value: number;
  };
  createdAt: string;
}

interface RelatedProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  priceAfterDiscount?: number;
  images: string[];
  views: number;
  stock: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { dispatch } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${slug}`);
      const data = await response.json();
      
      if (data.success && data.data && data.data.product) {
        setProduct(data.data.product);
        // Set related products if available
        if (data.data.relatedProducts) {
          setRelatedProducts(data.data.relatedProducts);
        }
        
        // Increment view count
        incrementViewCount();
      } else {
        console.error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await fetch(`/api/products/${slug}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ createLead: false })
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };



  const handleAddToCart = () => {
    if (!product) return;
    
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        priceAfterDiscount: product.priceAfterDiscount,
        image: product.images[0] || '/placeholder-bag.jpg',
        stock: product.stock
      }
    });
  };

  const handleWhatsAppOrder = async () => {
    if (!product) return;
    
    const message = await formatWhatsAppMessage(
      product.name,
      product.priceAfterDiscount || product.price,
      product.slug,
      quantity
    );
    
    const whatsappUrl = await getWhatsAppUrl(message);
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: `Lihat produk ${product.name} di SistaBag`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link berhasil disalin!');
    }
  };

  const nextImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return <LoadingSpinner overlay={true} />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-theme-main flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-theme-primary mb-4">Produk Tidak Ditemukan</h1>
          <p className="text-theme-primary text-opacity-60 mb-8">Produk yang Anda cari tidak tersedia.</p>
          <Link 
            href="/products" 
            className="bg-accent-peach text-on-accent px-6 py-3 rounded-2xl hover:bg-accent-yellow transition-colors duration-200"
          >
            Kembali ke Produk
          </Link>
        </div>
      </div>
    );
  }

  const discountPercentage = product.priceAfterDiscount 
    ? calculateDiscountPercentage(product.price, product.priceAfterDiscount)
    : 0;

  const isPopular = product.views >= 100;
  const finalPrice = product.priceAfterDiscount || product.price;
  const totalPrice = finalPrice * quantity;

  return (
    <div className="min-h-screen bg-theme-main">
      {/* Header */}
      <header className="bg-theme-header shadow-sm sticky top-0 z-50 border-b border-theme-primary border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="group-hover:scale-105 transition-all duration-200">
                <Image 
                  src="/logo-sis.png" 
                  alt="SistaBag Logo" 
                  width={32} 
                  height={32} 
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-theme-primary">SistaBag</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-theme-primary hover:text-accent-peach font-medium transition-colors duration-200 flex items-center space-x-1">
                <span>Beranda</span>
              </Link>
              <Link href="/products" className="text-theme-primary hover:text-accent-peach font-medium transition-colors duration-200 flex items-center space-x-1">
                <ShoppingBag className="h-4 w-4" />
                <span>Produk</span>
              </Link>
              <Link href="/categories" className="text-theme-primary hover:text-accent-peach font-medium transition-colors duration-200 flex items-center space-x-1">
                <span>Kategori</span>
              </Link>
              <Link href="/promos" className="text-theme-primary hover:text-accent-peach font-medium transition-colors duration-200 flex items-center space-x-1">
                <span>Promo</span>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-theme-primary hover:bg-theme-primary hover:bg-opacity-10 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-theme-primary border-opacity-20 py-4">
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/" 
                  className="flex items-center space-x-3 text-theme-primary hover:text-accent-peach transition-colors duration-200 px-2 py-2 rounded-lg hover:bg-theme-primary hover:bg-opacity-5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Beranda</span>
                </Link>
                <Link 
                  href="/products" 
                  className="flex items-center space-x-3 text-theme-primary hover:text-accent-peach transition-colors duration-200 px-2 py-2 rounded-lg hover:bg-theme-primary hover:bg-opacity-5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Package className="h-5 w-5" />
                  <span>Produk</span>
                </Link>
                <Link 
                  href="/categories" 
                  className="flex items-center space-x-3 text-theme-primary hover:text-accent-peach transition-colors duration-200 px-2 py-2 rounded-lg hover:bg-theme-primary hover:bg-opacity-5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Grid className="h-5 w-5" />
                  <span>Kategori</span>
                </Link>
                <Link 
                  href="/promos" 
                  className="flex items-center space-x-3 text-theme-primary hover:text-accent-peach transition-colors duration-200 px-2 py-2 rounded-lg hover:bg-theme-primary hover:bg-opacity-5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Tag className="h-5 w-5" />
                  <span>Promo</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-theme-primary text-opacity-60 mb-8">
          <Link href="/" className="hover:text-accent-peach transition-colors duration-200">Beranda</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-accent-peach transition-colors duration-200">Produk</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/categories/${product.category.slug}`} className="hover:text-accent-peach transition-colors duration-200">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-theme-primary">{product.name}</span>
        </nav>

        {/* Back Button */}
        <Link 
          href="/products" 
          className="inline-flex items-center gap-2 text-theme-primary hover:text-accent-peach mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Produk
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-theme-card rounded-xl overflow-hidden border border-theme-primary border-opacity-20">
              <Image
                src={product.images[currentImageIndex] || '/placeholder-bag.jpg'}
                alt={product.name}
                fill
                className="object-cover cursor-zoom-in"
                onClick={() => setIsImageModalOpen(true)}
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {isPopular && (
                  <span className="bg-accent-yellow text-on-accent px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Populer
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="bg-accent-peach text-on-accent px-3 py-1 rounded-full text-sm font-semibold">
                    -{discountPercentage}%
                  </span>
                )}
                {product.promo && (
                  <span className="bg-accent-mint text-on-accent px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    {product.promo.title}
                  </span>
                )}
              </div>

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-accent-peach' : 'border-theme-primary border-opacity-20'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-theme-primary mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 text-sm text-theme-primary text-opacity-60">
                <span>SKU: {product.sku}</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {product.views} views
                </span>
                <Link 
                  href={`/categories/${product.category.slug}`}
                  className="text-accent-peach hover:text-accent-yellow transition-colors duration-200"
                >
                  {product.category.name}
                </Link>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              {product.priceAfterDiscount ? (
                <div>
                  <div className="text-3xl font-bold text-accent-peach">
                    {formatCurrency(product.priceAfterDiscount)}
                  </div>
                  <div className="text-lg text-theme-primary text-opacity-50 line-through">
                    {formatCurrency(product.price)}
                  </div>
                  <div className="text-sm text-accent-mint font-medium">
                    Hemat {formatCurrency(product.price - product.priceAfterDiscount)}
                  </div>
                </div>
              ) : (
                <div className="text-3xl font-bold text-theme-primary">
                  {formatCurrency(product.price)}
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-theme-primary text-opacity-40" />
              <span className={`font-medium ${
                product.stock > 0 ? 'text-accent-mint' : 'text-accent-peach'
              }`}>
                {product.stock > 0 ? `Stok tersedia (${product.stock} pcs)` : 'Stok habis'}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-theme-primary mb-3">Deskripsi Produk</h3>
              <div className="prose prose-sm text-theme-primary text-opacity-80">
                {product.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-2">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Quantity and Order */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Jumlah
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-2xl border border-theme-primary border-opacity-30 flex items-center justify-center hover:bg-accent-peach hover:text-on-accent transition-all duration-200"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center border border-theme-primary border-opacity-30 rounded-2xl py-2 focus:ring-2 focus:ring-accent-peach focus:border-accent-peach bg-theme-main text-theme-primary transition-all duration-200"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 rounded-2xl border border-theme-primary border-opacity-30 flex items-center justify-center hover:bg-accent-peach hover:text-on-accent transition-all duration-200"
                  >
                    +
                  </button>
                    <span className="text-sm text-theme-primary text-opacity-60">Max: {product.stock}</span>
                  </div>
                </div>

                <div className="card-theme p-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span className="text-theme-primary">Total:</span>
                    <span className="text-theme-primary">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-accent-peach text-on-accent py-3 px-6 rounded-2xl font-semibold hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-soft"
                    disabled={product.stock === 0}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                  </button>
                  
                  <button
                    onClick={handleWhatsAppOrder}
                    className="flex-1 bg-accent-mint text-on-accent py-3 px-6 rounded-2xl font-semibold hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-soft"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Pesan via WhatsApp
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="p-3 border border-theme-primary border-opacity-30 rounded-2xl hover:bg-accent-peach hover:text-on-accent transition-all duration-200"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Shipping Info */}
            <div className="card-theme p-4">
              <div className="flex items-center gap-2 text-theme-primary mb-2">
                <Truck className="h-5 w-5" />
                <span className="font-medium">Informasi Pengiriman</span>
              </div>
              <ul className="text-sm text-theme-primary text-opacity-80 space-y-1">
                <li>• Pengiriman ke seluruh Indonesia</li>
                <li>• Estimasi 2-5 hari kerja</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-theme-primary mb-8">Produk Serupa</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct._id} href={`/products/${relatedProduct.slug}`} className="group">
                  <div className="card-theme rounded-2xl shadow-soft hover:shadow-md transition-all duration-200 border border-theme-primary border-opacity-10 overflow-hidden">
                    <div className="relative aspect-square">
                      <Image
                        src={relatedProduct.images[0] || '/placeholder-bag.jpg'}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {relatedProduct.views}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-theme-primary mb-2 line-clamp-2 group-hover:text-accent-peach transition-all duration-200">
                        {relatedProduct.name}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          {relatedProduct.priceAfterDiscount ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-accent-peach">
                                {formatCurrency(relatedProduct.priceAfterDiscount)}
                              </span>
                              <span className="text-sm text-theme-primary text-opacity-50 line-through">
                                {formatCurrency(relatedProduct.price)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-theme-primary">
                              {formatCurrency(relatedProduct.price)}
                            </span>
                          )}
                        </div>
                        
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          relatedProduct.stock > 0 
                            ? 'bg-accent-mint bg-opacity-20 text-accent-mint' 
                            : 'bg-accent-peach bg-opacity-20 text-accent-peach'
                        }`}>
                          {relatedProduct.stock > 0 ? 'Tersedia' : 'Habis'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-xl"
            >
              ✕
            </button>
            
            <div className="relative aspect-square w-full max-w-2xl">
              <Image
                src={product.images[currentImageIndex] || '/placeholder-bag.jpg'}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>
            
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-opacity"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-opacity"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}