'use client';

import { useCart } from '@/contexts/CartContext';
import { X, Plus, Minus, ShoppingBag, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { formatCartMessage, getWhatsAppUrl } from '@/lib/whatsapp';
import { useState, useEffect } from 'react';

export default function CartOverlay() {
  const { state, dispatch } = useCart();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    if (state.isOpen && typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [state.isOpen]);

  if (!state.isOpen) return null;

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity } });
    }
  };

  const handleWhatsAppCheckout = async () => {
    const message = formatCartMessage(state.items);
    const whatsappUrl = await getWhatsAppUrl(message);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Cart Overlay */}
      <div 
        className="fixed right-4 w-full max-w-md bg-theme-main shadow-xl z-40 transform transition-all duration-300 ease-in-out rounded-2xl border border-accent-peach border-opacity-20 flex flex-col"
        style={{
          top: `${Math.max(80, scrollY + 80)}px`,
          maxHeight: typeof window !== 'undefined' ? `${Math.min(window.innerHeight - 160, window.innerHeight - scrollY - 160)}px` : '70vh',
          height: typeof window !== 'undefined' ? `${Math.min(window.innerHeight - 160, window.innerHeight - scrollY - 160)}px` : '70vh'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-accent-peach border-opacity-20 bg-theme-header rounded-t-2xl">
          <h2 className="text-lg font-semibold text-theme-primary">
            Keranjang Belanja
          </h2>
          <button 
            onClick={() => dispatch({ type: 'CLOSE_CART' })}
            className="p-1 hover:bg-accent-peach hover:bg-opacity-10 rounded-lg transition-colors text-theme-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {state.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 mx-auto text-accent-peach opacity-50 mb-4" />
              <p className="text-theme-primary opacity-70 mb-2 font-medium">Keranjang Anda kosong</p>
              <p className="text-sm text-theme-primary opacity-50">Tambahkan produk untuk mulai berbelanja</p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border-b border-accent-peach border-opacity-10 last:border-b-0 bg-white rounded-lg mx-2 mb-2">
                  <div className="relative w-16 h-16 bg-accent-peach bg-opacity-10 rounded-lg overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-800 truncate">{item.name}</h3>
                    <p className="text-sm text-accent-peach font-semibold">
                      {formatCurrency(item.priceAfterDiscount || item.price)}
                    </p>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-accent-peach bg-opacity-20 flex items-center justify-center text-accent-peach hover:bg-opacity-30 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium text-gray-800 min-w-[20px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-6 h-6 rounded-full bg-accent-peach bg-opacity-20 flex items-center justify-center text-accent-peach hover:bg-opacity-30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="sticky bottom-0 flex-shrink-0 border-t border-accent-peach border-opacity-20 p-4 bg-gradient-to-r from-bg-theme-card to-accent-peach bg-opacity-5 rounded-b-2xl mt-auto">
            {/* Total */}
            <div className="flex items-center justify-between mb-4 p-3 bg-white bg-opacity-50 rounded-xl">
              <span className="text-theme-primary font-semibold">Total ({state.totalItems} item)</span>
              <span className="text-xl font-bold text-accent-peach">
                {formatCurrency(state.totalPrice)}
              </span>
            </div>
            
            {/* Checkout Button */}
            <button
              onClick={handleWhatsAppCheckout}
              className="w-full bg-accent-mint text-on-accent py-3 px-4 rounded-xl font-semibold hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-soft"
            >
              <MessageCircle className="h-5 w-5" />
              Checkout via WhatsApp
            </button>
            
            {/* Clear Cart */}
            <button
              onClick={() => dispatch({ type: 'CLEAR_CART' })}
              className="w-full mt-2 text-theme-primary opacity-60 hover:opacity-100 hover:text-accent-peach text-sm py-2 transition-all duration-200 font-medium"
            >
              Kosongkan Keranjang
            </button>
          </div>
        )}
      </div>
    </>
  );
}