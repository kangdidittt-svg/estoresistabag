'use client';

import React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  MessageCircle, 
  Trash2,
  ShoppingBag
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';

export default function FloatingCart() {
  const { state, dispatch } = useCart();
  const pathname = usePathname();
  
  // Only show floating cart on product pages
  const shouldShowCart = pathname.startsWith('/products') || pathname.startsWith('/categories/');
  
  if (!shouldShowCart) {
    return null;
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity } });
  };

  const handleRemoveItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const handleWhatsAppCheckout = () => {
    if (state.items.length === 0) return;

    const orderDetails = state.items.map(item => 
      `• ${item.name}\n  Qty: ${item.quantity}\n  Harga: ${formatCurrency(item.priceAfterDiscount || item.price)}\n  Subtotal: ${formatCurrency((item.priceAfterDiscount || item.price) * item.quantity)}`
    ).join('\n\n');

    const message = `Halo, saya ingin memesan:\n\n${orderDetails}\n\n*Total: ${formatCurrency(state.totalPrice)}*\n\nApakah semua produk masih tersedia?`;
    
    const whatsappUrl = `https://wa.me/6281351990003?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Clear cart after checkout
    dispatch({ type: 'CLEAR_CART' });
    dispatch({ type: 'CLOSE_CART' });
  };

  return (
    <>
      {/* Floating Cart Balloon */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_CART' })}
        className="fixed bottom-4 right-4 z-50 group"
      >
        {/* Balloon Shape */}
        <div className="relative">
          {/* Main Balloon */}
          <div className="bg-accent-peach text-on-accent p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden">
            {/* Balloon Shine Effect */}
            <div className="absolute top-1 left-1 w-2 h-2 bg-white bg-opacity-30 rounded-full"></div>
            <ShoppingCart className="h-5 w-5" />
          </div>
          
          {/* Balloon String */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-3 bg-accent-peach bg-opacity-60"></div>
          
          {/* Item Counter Badge */}
          {state.totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent-mint text-on-accent text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce shadow-md">
              {state.totalItems}
            </span>
          )}
        </div>
      </button>

      {/* Cart Overlay */}
      {state.isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => dispatch({ type: 'CLOSE_CART' })}
          />
          
          {/* Cart Panel */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-theme-main shadow-2xl transform transition-all duration-300 ease-in-out animate-slide-in-right">
            <div className="flex flex-col min-h-0 max-h-screen">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-theme-primary border-opacity-20">
                <h2 className="text-xl font-bold text-theme-primary flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-accent-peach" />
                  Keranjang ({state.totalItems})
                </h2>
                <button
                  onClick={() => dispatch({ type: 'CLOSE_CART' })}
                  className="p-2 hover:bg-theme-primary hover:bg-opacity-10 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-theme-primary" />
                </button>
              </div>

              {/* Cart Items - Scrollable Area */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {state.items.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="h-16 w-16 text-theme-primary opacity-30 mx-auto mb-4" />
                      <p className="text-theme-primary opacity-60 mb-2">Keranjang masih kosong</p>
                      <p className="text-sm text-theme-primary opacity-40">Tambahkan produk untuk mulai berbelanja</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {state.items.map((item) => (
                        <div key={item.id} className="card-theme p-4 rounded-xl border border-theme-primary border-opacity-10">
                          <div className="flex gap-3">
                            {/* Product Image */}
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={item.image || '/placeholder-bag.jpg'}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-theme-primary text-sm truncate mb-1">
                                {item.name}
                              </h3>
                              <div className="flex items-center gap-2 mb-2">
                                {item.priceAfterDiscount ? (
                                  <>
                                    <span className="text-theme-primary font-bold text-sm">
                                      {formatCurrency(item.priceAfterDiscount)}
                                    </span>
                                    <span className="text-theme-primary opacity-50 line-through text-xs">
                                      {formatCurrency(item.price)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-theme-primary font-bold text-sm">
                                    {formatCurrency(item.price)}
                                  </span>
                                )}
                              </div>
                              
                              {/* Quantity Controls */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    className="p-1 hover:bg-theme-primary hover:bg-opacity-10 rounded-full transition-colors"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus className="h-3 w-3 text-theme-primary" />
                                  </button>
                                  <span className="text-theme-primary font-medium text-sm min-w-[2rem] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    className="p-1 hover:bg-theme-primary hover:bg-opacity-10 rounded-full transition-colors"
                                    disabled={item.quantity >= item.stock}
                                  >
                                    <Plus className="h-3 w-3 text-theme-primary" />
                                  </button>
                                </div>
                                
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="p-1 hover:bg-red-500 hover:bg-opacity-10 rounded-full transition-colors group"
                                >
                                  <Trash2 className="h-3 w-3 text-theme-primary group-hover:text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer - Fixed at Bottom */}
              {state.items.length > 0 && (
                <div className="flex-shrink-0 border-t border-theme-primary border-opacity-20 p-6 bg-theme-main">
                  {/* Total */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-theme-primary">Total:</span>
                    <span className="text-xl font-bold text-theme-primary">
                      {formatCurrency(state.totalPrice)}
                    </span>
                  </div>
                  
                  {/* Checkout Button */}
                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full bg-accent-mint text-on-accent py-3 px-4 rounded-2xl font-semibold hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-soft"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Checkout via WhatsApp
                  </button>
                  
                  <p className="text-xs text-theme-primary opacity-60 text-center mt-2">
                    Anda akan diarahkan ke WhatsApp untuk menyelesaikan pesanan
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}