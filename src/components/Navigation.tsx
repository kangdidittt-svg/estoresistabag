'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Grid3X3, Star, Menu, X, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className = '' }: NavigationProps) {
  const { state, dispatch } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    {
      href: '/',
      label: 'Beranda',
      icon: ShoppingBag
    },
    {
      href: '/products',
      label: 'Produk',
      icon: ShoppingBag
    },
    {
      href: '/categories',
      label: 'Kategori',
      icon: Grid3X3
    },
    {
      href: '/promos',
      label: 'Promo',
      icon: Star
    }
  ];

  return (
    <header className={`bg-theme-header shadow-soft sticky top-0 z-50 border-b border-theme-primary border-opacity-20 transition-all duration-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="bg-accent-peach p-3 rounded-2xl group-hover:scale-105 transition-all duration-200">
                <ShoppingBag className="h-6 w-6 text-on-accent" />
              </div>
              <span className="text-xl font-bold text-accent-peach animate-fade-in">SistaBag</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 animate-fade-in animate-delay-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              
              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`font-medium transition-all duration-200 flex items-center space-x-1 ${
                    active 
                      ? 'text-accent-peach' 
                      : 'text-theme-primary hover:text-accent-peach'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            <div className="flex items-center space-x-2 ml-4">
              <button 
                onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                className="p-2 text-theme-primary hover:text-accent-peach hover:bg-accent-peach hover:bg-opacity-10 rounded-2xl transition-all duration-200 relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {state.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-peach text-on-accent text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {state.totalItems}
                  </span>
                )}
              </button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button 
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="p-2 text-theme-primary hover:text-accent-peach hover:bg-accent-peach hover:bg-opacity-10 rounded-2xl transition-all duration-200 relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {state.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-peach text-on-accent text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {state.totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-theme-primary hover:text-accent-peach hover:bg-accent-peach hover:bg-opacity-10 rounded-2xl transition-all duration-200"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-theme-primary border-opacity-20 bg-theme-card">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              
              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`flex items-center space-x-3 p-3 font-medium rounded-2xl transition-all duration-200 ${
                    active 
                      ? 'text-accent-peach bg-accent-peach bg-opacity-10' 
                      : 'text-theme-primary hover:text-accent-peach hover:bg-accent-peach hover:bg-opacity-10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}