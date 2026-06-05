# APK Risk Score — Deployment Guide

Aplikasi ini terdiri dari dua bagian yang di-deploy secara terpisah:

| Bagian | Teknologi | Platform Rekomendasi |
|---|---|---|
| **Frontend** | React + Vite SPA | **Vercel** (gratis) |
| **Backend** | Laravel 11 REST API | **Railway** atau **Render** (gratis) |

---

## 🗂️ Struktur Direktori

```
apk-risk-score/
├── frontend/     ← React + Vite (deploy ke Vercel)
└── backend/      ← Laravel API (deploy ke Railway/Render)
```

---

## 🚀 BAGIAN 1: Deploy Backend (Laravel) ke Railway

### Prasyarat
- Akun [Railway.app](https://railway.app) (gratis)
- Database MySQL — gunakan Railway MySQL plugin atau [PlanetScale](https://planetscale.com)

### Langkah-langkah

#### 1. Buat Project Baru di Railway
1. Login ke Railway → **New Project** → **Deploy from GitHub repo**
2. Pilih repository `apk-risk-score`
3. Atur **Root Directory** ke `/backend`
4. Railway akan otomatis mendeteksi `nixpacks.toml`

#### 2. Tambahkan Database MySQL
1. Di project Railway → klik **+ New** → **Database** → **MySQL**
2. Salin connection variables: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`

#### 3. Set Environment Variables
Di Railway Dashboard → Settings → Variables, tambahkan:

```env
APP_NAME=APK Risk Score
APP_ENV=production
APP_KEY=               # Generate: php artisan key:generate --show
APP_DEBUG=false
APP_URL=               # URL Railway otomatis (lihat setelah deploy)

DB_CONNECTION=mysql
DB_HOST=               # dari MySQL plugin Railway
DB_PORT=3306
DB_DATABASE=           # dari MySQL plugin
DB_USERNAME=           # dari MySQL plugin
DB_PASSWORD=           # dari MySQL plugin

FRONTEND_URL=          # URL Vercel frontend (isi setelah deploy frontend)

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=sync
LOG_CHANNEL=stderr
```

#### 4. Deploy
Railway akan otomatis build & deploy setiap push ke branch utama.

Setelah deploy berhasil, catat URL backend (contoh: `https://apk-risk-backend.up.railway.app`)

#### 5. Buat Admin User Pertama
Jalankan via Railway CLI atau Railway Console:
```bash
php artisan tinker
# Kemudian:
\App\Models\User::create([
    'name' => 'Administrator',
    'email' => 'admin@example.com',
    'password' => bcrypt('password123'),
    'role' => 'admin',
]);
```

---

## ▲ BAGIAN 2: Deploy Frontend (React) ke Vercel

### Prasyarat
- Akun [Vercel.com](https://vercel.com) (gratis)

### Langkah-langkah

#### 1. Import Project ke Vercel
1. Login ke Vercel → **Add New Project** → **Import Git Repository**
2. Pilih repository `apk-risk-score`
3. Atur **Root Directory** ke `frontend`
4. Vercel otomatis mendeteksi sebagai Vite project

#### 2. Set Environment Variables
Di Vercel → Project Settings → Environment Variables, tambahkan:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.up.railway.app/api` |

> ⚠️ Ganti URL dengan URL backend Railway/Render Anda yang sebenarnya!

#### 3. Deploy Settings (biarkan default)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### 4. Deploy
Klik **Deploy** — Vercel akan build dan deploy otomatis.

Setelah berhasil, catat URL frontend (contoh: `https://apk-risk-score.vercel.app`)

#### 5. Update FRONTEND_URL di Backend
Kembali ke Railway, update env var:
```
FRONTEND_URL=https://apk-risk-score.vercel.app
```

Kemudian **redeploy** backend agar CORS diperbarui.

---

## 🔧 Development Lokal

### Backend (Laravel)
```bash
cd backend
cp .env.example .env
php artisan key:generate
# Edit .env: set DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan migrate --seed
php artisan serve
# Backend berjalan di: http://localhost:8000
```

### Frontend (React + Vite)
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local: VITE_API_URL=http://localhost:8000/api
npm install
npm run dev
# Frontend berjalan di: http://localhost:5173
```

---

## 🔒 Pengaturan CORS

File `backend/config/cors.php` dikonfigurasi untuk mengizinkan:
- `http://localhost:5173` (Vite dev server)
- `https://*.vercel.app` (semua Vercel preview deployments)
- `FRONTEND_URL` env var (production URL spesifik)

---

## 📊 Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 19, Vite, Chart.js, Axios, React Router v7 |
| Backend | Laravel 11, PHP 8.3, Laravel Sanctum (Token Auth) |
| Database | MySQL 8 |
| Styling | Vanilla CSS (Glassmorphism Design) |
| Auth | Bearer Token via Laravel Sanctum |

---

## ⚠️ Catatan Penting

1. **Jangan push `.env`** ke Git — sudah ada di `.gitignore`
2. **APP_KEY** harus di-generate ulang untuk production: `php artisan key:generate --show`
3. **Database migrations** dijalankan otomatis saat deploy via `nixpacks.toml`
4. File `excel/PDF` export di Laporan memerlukan storage yang persistent — di Railway, gunakan volume atau S3
