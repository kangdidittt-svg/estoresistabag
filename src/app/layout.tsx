import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from '@/contexts/CartContext';
import FloatingCart from '@/components/FloatingCart';
import PWAInstaller from '@/components/PWAInstaller';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Store Siska - Tas Berkualitas Tinggi",
  description: "Temukan koleksi tas berkualitas tinggi dengan desain modern dan harga terjangkau di E-Store Siska. Tas wanita, tas pria, dan aksesoris fashion terbaik.",
  keywords: "tas, tas wanita, tas pria, tas berkualitas, fashion, aksesoris, toko online",
  authors: [{ name: "E-Store Siska" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  manifest: "/manifest.json",
  themeColor: "#FF9E9E",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "E-Store Siska",
  },
  openGraph: {
    title: "E-Store Siska - Tas Berkualitas Tinggi",
    description: "Temukan koleksi tas berkualitas tinggi dengan desain modern dan harga terjangkau di E-Store Siska.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FF9E9E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="E-Store Siska" />
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased page-transition`}
        suppressHydrationWarning={true}
      >
        <CartProvider>
          {children}
          <FloatingCart />
          <PWAInstaller />
        </CartProvider>
      </body>
    </html>
  );
}
