# SistaBag E-Store 🛍️

Sebuah aplikasi e-commerce modern yang dibangun dengan Next.js 15, MongoDB, dan Tailwind CSS. Aplikasi ini menyediakan platform lengkap untuk toko online dengan fitur admin dashboard, manajemen produk, kategori, dan promo.

## ✨ Fitur Utama

- 🏪 **Storefront Modern**: Interface yang responsif dan user-friendly
- 👨‍💼 **Admin Dashboard**: Panel admin lengkap untuk manajemen toko
- 📦 **Manajemen Produk**: CRUD produk dengan upload gambar
- 🏷️ **Sistem Kategori**: Organisasi produk yang terstruktur
- 🎯 **Manajemen Promo**: Sistem diskon dan promosi
- 🔐 **Autentikasi Admin**: Sistem login yang aman
- 📱 **Responsive Design**: Optimized untuk semua device
- 🎨 **Modern UI**: Desain minimalis dengan skema warna pastel pink

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB dengan Mongoose
- **Authentication**: JWT
- **File Upload**: Cloudinary
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📋 Prerequisites

Sebelum menjalankan aplikasi, pastikan Anda memiliki:

- Node.js 18+ 
- MongoDB database (local atau cloud)
- Cloudinary account (untuk upload gambar)
- Git

## 🛠️ Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/kangdidittt-svg/estoresistabag.git
   cd estoresistabag
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` dan isi dengan konfigurasi Anda:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
   JWT_SECRET=your-jwt-secret-key-here
   ADMIN_SECRET_TOKEN=your-super-secret-admin-token-here
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

4. **Setup admin user**
   ```bash
   node scripts/setup-admin.js
   ```

5. **Seed database (optional)**
   ```bash
   node scripts/seed.js
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

   Buka [http://localhost:3008](http://localhost:3008) di browser Anda.

## 🌐 Deploy ke Vercel

### Persiapan Deployment

1. **Push ke GitHub** (jika belum)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin master
   ```

2. **Setup Vercel Account**
   - Daftar di [vercel.com](https://vercel.com)
   - Connect dengan GitHub account Anda

### Deployment Steps

1. **Import Project**
   - Klik "New Project" di Vercel dashboard
   - Pilih repository `estoresistabag`
   - Klik "Import"

2. **Configure Environment Variables**
   Di Vercel dashboard, tambahkan environment variables berikut:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-jwt-secret
   ADMIN_SECRET_TOKEN=your-admin-token
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

3. **Deploy**
   - Klik "Deploy"
   - Tunggu proses build selesai
   - Aplikasi akan tersedia di URL yang diberikan Vercel

### Post-Deployment

1. **Setup Admin User di Production**
   ```bash
   # Update MONGODB_URI di scripts/setup-admin.js ke production database
   node scripts/setup-admin.js
   ```

2. **Test Aplikasi**
   - Akses URL production
   - Test fitur utama
   - Login ke admin dashboard di `/admin/login`

## 📁 Struktur Project

```
src/
├── app/
│   ├── admin/           # Admin dashboard pages
│   ├── api/             # API routes
│   ├── categories/      # Categories page
│   ├── products/        # Products pages
│   ├── promos/          # Promos page
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Homepage
├── lib/
│   ├── auth.ts          # Authentication utilities
│   ├── mongodb.ts       # Database connection
│   └── utils.ts         # Helper functions
├── models/              # MongoDB models
└── middleware.ts        # Next.js middleware
```

## 🔧 Scripts Available

- `npm run dev` - Jalankan development server
- `npm run build` - Build aplikasi untuk production
- `npm run start` - Jalankan production server
- `npm run lint` - Jalankan ESLint

## 🎨 Customization

### Mengubah Tema Warna
Edit file `src/app/globals.css` dan update kelas Tailwind CSS di komponen.

### Menambah Fitur Baru
1. Buat model di `src/models/`
2. Buat API routes di `src/app/api/`
3. Buat pages di `src/app/`
4. Update admin dashboard jika diperlukan

## 🐛 Troubleshooting

### Build Errors
- Pastikan semua environment variables sudah diset
- Check MongoDB connection
- Verify Cloudinary configuration

### Deployment Issues
- Check Vercel function logs
- Verify environment variables di Vercel dashboard
- Ensure database is accessible from Vercel

## 📞 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

1. Check dokumentasi Next.js: [nextjs.org/docs](https://nextjs.org/docs)
2. Check Vercel docs: [vercel.com/docs](https://vercel.com/docs)
3. Create issue di GitHub repository

## 📄 License

MIT License - lihat file LICENSE untuk detail.

---

**Happy Coding! 🚀**
