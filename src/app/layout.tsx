import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from '@/contexts/CartContext';
import FloatingCart from '@/components/FloatingCart';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Toko Siska - Tas Berkualitas Tinggi",
  description: "Temukan koleksi tas berkualitas tinggi dengan desain modern dan harga terjangkau di Toko Siska. Tas wanita, tas pria, dan aksesoris fashion terbaik.",
  keywords: "tas, tas wanita, tas pria, tas berkualitas, fashion, aksesoris, toko online",
  authors: [{ name: "Toko Siska" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Toko Siska - Tas Berkualitas Tinggi",
    description: "Temukan koleksi tas berkualitas tinggi dengan desain modern dan harga terjangkau di Toko Siska.",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased page-transition`}
        suppressHydrationWarning={true}
      >
        <CartProvider>
          {children}
          <FloatingCart />
        </CartProvider>
      </body>
    </html>
  );
}
