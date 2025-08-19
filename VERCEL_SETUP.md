# Panduan Setup Environment Variables di Vercel

## Masalah: Website Vercel Menampilkan Halaman Putih

Halaman putih biasanya disebabkan oleh:
1. Environment variables tidak terset di Vercel
2. Error runtime karena koneksi database gagal
3. Missing dependencies atau build error

## Langkah-langkah Perbaikan:

### 1. Setup Environment Variables di Vercel Dashboard

Masuk ke [Vercel Dashboard](https://vercel.com/dashboard) → Pilih project `estoresistabag` → Settings → Environment Variables

Tambahkan environment variables berikut:

```
# Database (WAJIB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Authentication (WAJIB)
JWT_SECRET=your-jwt-secret-key-here-minimum-32-characters
ADMIN_SECRET_TOKEN=your-super-secret-admin-token-here

# Cloudinary (WAJIB untuk upload gambar)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Next.js Configuration
NEXT_PUBLIC_APP_URL=https://estoresistabag.vercel.app
NEXTAUTH_URL=https://estoresistabag.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-minimum-32-characters

# Production Environment
NODE_ENV=production
```

### 2. Cara Menambahkan Environment Variables:

1. **Key**: Nama variable (contoh: `MONGODB_URI`)
2. **Value**: Nilai variable (contoh: connection string MongoDB)
3. **Environment**: Pilih `Production`, `Preview`, dan `Development`
4. Klik **Save**

### 3. Redeploy Setelah Menambahkan Environment Variables

Setelah menambahkan semua environment variables:
1. Kembali ke tab **Deployments**
2. Klik **Redeploy** pada deployment terakhir
3. Atau push commit baru ke GitHub untuk trigger deployment otomatis

### 4. Cara Mendapatkan Nilai Environment Variables:

#### MongoDB URI:
- Masuk ke [MongoDB Atlas](https://cloud.mongodb.com/)
- Pilih cluster → Connect → Connect your application
- Copy connection string dan ganti `<password>` dengan password database

#### Cloudinary:
- Masuk ke [Cloudinary Dashboard](https://cloudinary.com/console)
- Copy `Cloud Name`, `API Key`, dan `API Secret`

#### JWT & Auth Secrets:
- Generate random string minimal 32 karakter
- Bisa menggunakan: `openssl rand -base64 32` atau online generator

### 5. Verifikasi Setup:

Setelah redeploy, cek:
1. Website tidak lagi menampilkan halaman putih
2. Bisa mengakses halaman admin: `https://estoresistabag.vercel.app/admin`
3. API endpoints berfungsi: `https://estoresistabag.vercel.app/api/products`

### 6. Debugging Jika Masih Error:

1. **Cek Function Logs di Vercel:**
   - Dashboard → Project → Functions tab
   - Lihat error logs untuk detail masalah

2. **Cek Runtime Logs:**
   - Dashboard → Project → Deployments → Klik deployment → View Function Logs

3. **Test API Endpoints:**
   ```bash
   curl https://estoresistabag.vercel.app/api/products
   ```

## Catatan Penting:

- ⚠️ **JANGAN** commit file `.env` ke GitHub
- ✅ Environment variables harus diset di Vercel Dashboard
- ✅ Pastikan MongoDB cluster mengizinkan koneksi dari semua IP (0.0.0.0/0) untuk Vercel
- ✅ Redeploy setelah menambahkan environment variables

## Kontak Support:

Jika masih ada masalah, cek:
1. Vercel Function Logs
2. MongoDB Atlas Network Access
3. Cloudinary API limits