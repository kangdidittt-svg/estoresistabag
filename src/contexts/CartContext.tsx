'use client';

import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import Toast from '@/components/ui/Toast';

interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  priceAfterDiscount?: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + 1, action.payload.stock);
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: newQuantity }
            : item
        );
        
        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = updatedItems.reduce((sum, item) => 
          sum + (item.priceAfterDiscount || item.price) * item.quantity, 0
        );
        
        return {
          ...state,
          items: updatedItems,
          totalItems,
          totalPrice
        };
      } else {
        const newItem = { ...action.payload, quantity: 1 };
        const updatedItems = [...state.items, newItem];
        
        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = updatedItems.reduce((sum, item) => 
          sum + (item.priceAfterDiscount || item.price) * item.quantity, 0
        );
        
        return {
          ...state,
          items: updatedItems,
          totalItems,
          totalPrice,
          isOpen: true
        };
      }
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => 
        sum + (item.priceAfterDiscount || item.price) * item.quantity, 0
      );
      
      return {
        ...state,
        items: updatedItems,
        totalItems,
        totalPrice
      };
    }
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: action.payload.id });
      }
      
      const updatedItems = state.items.map(item => {
        if (item.id === action.payload.id) {
          const newQuantity = Math.min(action.payload.quantity, item.stock);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      
      const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedItems.reduce((sum, item) => 
        sum + (item.priceAfterDiscount || item.price) * item.quantity, 0
      );
      
      return {
        ...state,
        items: updatedItems,
        totalItems,
        totalPrice
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
    
    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen
      };
    
    case 'OPEN_CART':
      return {
        ...state,
        isOpen: true
      };
    
    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false
      };
    
    case 'LOAD_CART': {
      const totalItems = action.payload.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = action.payload.reduce((sum, item) => 
        sum + (item.priceAfterDiscount || item.price) * item.quantity, 0
      );
      
      return {
        ...state,
        items: action.payload,
        totalItems,
        totalPrice
      };
    }
    
    default:
      return state;
  }
}

const initialState: CartState = {
  items: [],
  isOpen: false,
  totalItems: 0,
  totalPrice: 0
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({ message: '', type: 'success', isVisible: false });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Utility function to clean up localStorage
  const cleanupLocalStorage = () => {
    try {
      // Remove old cart data if it exists
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cart_backup_') || key.startsWith('old_cart_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Check localStorage usage
      let totalSize = 0;
      keys.forEach(key => {
        totalSize += localStorage.getItem(key)?.length || 0;
      });
      
      // If localStorage is getting full (over 3MB), clean up
      if (totalSize > 3 * 1024 * 1024) {
        console.warn('localStorage getting full, cleaning up...');
        // Keep only essential data
        const cartData = localStorage.getItem('cart');
        localStorage.clear();
        if (cartData) {
          localStorage.setItem('cart', cartData);
        }
      }
    } catch (error) {
      console.error('Error cleaning localStorage:', error);
    }
  };

  // Optimize cart data for storage
  const optimizeCartData = (items: CartItem[]) => {
    return items.map(item => ({
      id: item.id,
      name: item.name.substring(0, 100), // Limit name length
      slug: item.slug,
      price: item.price,
      priceAfterDiscount: item.priceAfterDiscount,
      image: item.image,
      quantity: item.quantity,
      stock: item.stock
    }));
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    // Clean up localStorage on app start
    cleanupLocalStorage();
    
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        // If cart data is corrupted, clear it
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      // Optimize data before saving
      const optimizedItems = optimizeCartData(state.items);
      const cartData = JSON.stringify(optimizedItems);
      
      // Check if data size is reasonable (less than 4MB to be safe)
      if (cartData.length > 4 * 1024 * 1024) {
        console.warn('Cart data too large, clearing oldest items');
        // Keep only the last 30 items if cart is too large
         const reducedItems = optimizedItems.slice(-30);
        localStorage.setItem('cart', JSON.stringify(reducedItems));
        // Update state to match what was actually saved
        dispatch({ type: 'LOAD_CART', payload: reducedItems });
      } else {
        localStorage.setItem('cart', cartData);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
         console.warn('localStorage quota exceeded, clearing cart data');
         showToast('Keranjang terlalu penuh, beberapa item lama telah dihapus', 'info');
         try {
          // Clear cart data and try to save a minimal version
          localStorage.removeItem('cart');
          // Keep only the last 5 items
           const minimalItems = optimizeCartData(state.items.slice(-5));
          localStorage.setItem('cart', JSON.stringify(minimalItems));
          // Update state to match what was actually saved
          dispatch({ type: 'LOAD_CART', payload: minimalItems });
        } catch (secondError) {
          console.error('Failed to save even minimal cart data:', secondError);
           showToast('Gagal menyimpan keranjang, data telah direset', 'error');
           // Clear everything if we still can't save
           localStorage.removeItem('cart');
           dispatch({ type: 'CLEAR_CART' });
        }
      } else {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [state.items]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export type { CartItem };