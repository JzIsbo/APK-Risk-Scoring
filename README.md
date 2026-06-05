# 🛡️ APK Risk Scoring System

**Real-Time Debtor Risk Monitoring & Scoring Platform**

![Laravel](https://img.shields.io/badge/Laravel-13.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

Sistem pemantauan dan skoring risiko debitur secara real-time dengan arsitektur **decoupled** — Backend REST API (Laravel + Sanctum) dan Frontend SPA (React + Vite) dengan desain glassmorphism premium.

---

## ✨ Fitur Utama

- 📊 **Dashboard Interaktif** — KPI metrics, chart donut/bar/line/radar, dan 3×3 Risk Matrix yang dapat diklik
- 👥 **Debtor Population** — CRUD debitur, import Excel, preview & kalkulasi risk score otomatis
- 🔍 **Risk Analysis** — Analisis detail per debitur dengan radar chart & indikator risiko
- 📈 **Trend Prioritas** — Visualisasi tren prioritas risiko lintas periode
- 💳 **Pola Bayar** — Analisis pola pembayaran debitur
- 🔔 **Alerts & Notifikasi** — Sistem notifikasi untuk perubahan risiko debitur
- 📄 **Laporan** — Export Excel (PhpSpreadsheet) & Print PDF via browser
- ⚙️ **Admin Panel** — Parameter skoring, data master, user management, pengaturan sistem
- 🌗 **Dark / Light Theme** — Toggle tema dengan transisi halus
- 🔐 **Auth & RBAC** — Login berbasis token (Sanctum) dengan 3 role: Admin, Analyst, Management

---

## 🏗️ Arsitektur Proyek

```
APK-Risk-Scoring/
│
├── backend/                         # Laravel 13 REST API (Port 8000)
│   ├── app/Http/Controllers/Api/    # 12 API Controllers
│   ├── routes/api.php               # 34 REST endpoints
│   ├── database/migrations/         # Schema tabel
│   ├── database/seeders/            # Data awal (users, debitur, parameter)
│   ├── config/cors.php              # CORS configuration
│   └── .env                         # Environment variables
│
├── frontend/                        # React 19 + Vite 8 SPA (Port 5173)
│   ├── src/pages/                   # 14 halaman
│   ├── src/components/              # Layout & Auth Guard
│   ├── src/services/api.js          # Axios + Bearer token interceptor
│   └── src/index.css                # Glassmorphism design system
│
├── package.json                     # Script untuk menjalankan keduanya
└── README.md
```

---

## 📋 Prerequisites

Pastikan sudah terinstall di komputer kamu:

- **PHP** 8.3+ — [Download](https://php.net)
- **Composer** 2.x — [Download](https://getcomposer.org)
- **Node.js** 18+ — [Download](https://nodejs.org)
- **npm** 9+ — (termasuk dalam Node.js)
- **MySQL** 8.x — [Download](https://mysql.com)
- **Git** 2.x — [Download](https://git-scm.com)

> 💡 **Tip:** Jika menggunakan **XAMPP**, PHP dan MySQL sudah tersedia. Cukup install Node.js dan Composer.

---

## 🚀 Cara Cloning & Setup

### 1. Clone Repository

```bash
git clone https://github.com/Jzlsbo/APK-Risk-Scoring.git
cd APK-Risk-Scoring
```

### 2. Setup Backend (Laravel API)

```bash
# Masuk ke folder backend
cd backend

# Install PHP dependencies
composer install

# Salin file environment
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 3. Konfigurasi Database

Buka file `backend/.env` dan sesuaikan konfigurasi database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=risk_scoring_db
DB_USERNAME=root
DB_PASSWORD=
```

Lalu buat database dan jalankan migrasi + seeder:

```bash
# Buat database MySQL terlebih dahulu
# Melalui phpMyAdmin atau terminal MySQL:
# CREATE DATABASE risk_scoring_db;

# Jalankan migrasi & seeder
php artisan migrate --seed
```

> ⚠️ **Penting:** Flag `--seed` akan mengisi data awal termasuk akun login, parameter risiko, dan 30 data sample debitur.

### 4. Setup Frontend (React SPA)

```bash
# Kembali ke root project, lalu masuk ke frontend
cd ../frontend

# Install Node dependencies
npm install
```

### 5. Jalankan Aplikasi

**Opsi A — Jalankan keduanya sekaligus (Recommended):**

```bash
# Dari root project
cd ..
npm run dev
```

Perintah ini akan menjalankan:
- Backend API di `http://localhost:8000`
- Frontend SPA di `http://localhost:5173`

**Opsi B — Jalankan terpisah (2 terminal):**

Terminal 1 — Backend:

```bash
cd backend
php artisan serve
```

Terminal 2 — Frontend:

```bash
cd frontend
npm run dev
```

### 6. Buka di Browser

- **Frontend (SPA):** [http://localhost:5173](http://localhost:5173)
- **Backend (API):** [http://localhost:8000/api](http://localhost:8000/api)

---

## 🔑 Akun Default

Setelah menjalankan `php artisan migrate --seed`, tersedia 3 akun:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@risk.com` | `password` |
| Analyst | `analyst@risk.com` | `password` |
| Management | `management@risk.com` | `password` |

---

## 📡 API Endpoints

Semua endpoint berada di bawah prefix `/api` dan memerlukan Bearer token (kecuali login).

### Autentikasi

```
POST   /api/login                    → Login & dapatkan token
POST   /api/logout                   → Logout & revoke token
GET    /api/me                       → Data user yang sedang login
```

### Dashboard & Analisis

```
GET    /api/dashboard                → Metrics, chart data, matrix
POST   /api/dashboard/matrix-settings → Update pengaturan matrix
GET    /api/risk-analysis            → Daftar analisis risiko
GET    /api/risk-analysis/{id}       → Detail risiko debitur
GET    /api/trend-prioritas          → Data tren prioritas
GET    /api/pola-bayar               → Data pola pembayaran
```

### Debtor Population

```
GET    /api/populasi                 → Daftar debitur (paginated)
POST   /api/populasi                 → Tambah debitur baru
PUT    /api/populasi/{id}            → Update data debitur
DELETE /api/populasi/{id}            → Hapus debitur
POST   /api/populasi/preview         → Preview kalkulasi risk
POST   /api/populasi/recalculate     → Hitung ulang semua risk score
POST   /api/populasi/import          → Import data dari file Excel
```

### Laporan & Notifikasi

```
GET    /api/laporan                  → Data laporan
GET    /api/laporan/export           → Download file Excel
GET    /api/alerts                   → Daftar notifikasi
POST   /api/alerts/{id}/mark-read    → Tandai sudah dibaca
POST   /api/alerts/mark-all-read     → Tandai semua sudah dibaca
```

### Admin

```
GET    /api/parameter                → Daftar parameter skoring
POST   /api/parameter                → Update parameter skoring
GET    /api/data-master              → Daftar data master
POST   /api/data-master/co-class     → Tambah CO Class
POST   /api/data-master/payment-pattern → Tambah pola bayar
POST   /api/data-master/ps-ambc      → Tambah PS AMBC
POST   /api/data-master/status       → Tambah status
GET    /api/users                    → Daftar users
POST   /api/users                    → Tambah user baru
PUT    /api/users/{id}               → Update user
DELETE /api/users/{id}               → Hapus user
GET    /api/settings                 → Pengaturan sistem
POST   /api/settings                 → Update pengaturan
```

---

## 🛠️ Tech Stack

### Backend

- **Framework:** Laravel 13 (PHP 8.3+)
- **Auth:** Laravel Sanctum (Bearer Token)
- **Database:** MySQL 8
- **Excel:** PhpSpreadsheet 5.x
- **CORS:** Laravel CORS middleware

### Frontend

- **Library:** React 19
- **Bundler:** Vite 8
- **Routing:** React Router DOM 7
- **Charts:** Chart.js 4 + react-chartjs-2
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Styling:** Vanilla CSS (Glassmorphism design system)

---

## 🧪 Development Commands

**Reset database dengan data baru:**

```bash
cd backend
php artisan migrate:fresh --seed
```

**Lihat daftar route API:**

```bash
cd backend
php artisan route:list --path=api
```

**Build frontend untuk production:**

```bash
cd frontend
npm run build
```

Hasil build akan tersedia di `frontend/dist/`.

---

## 📁 Struktur Database

| Tabel | Deskripsi |
|-------|-----------|
| `users` | Data pengguna sistem (admin, analyst, management) |
| `populations` | Data debitur beserta parameter risiko |
| `risk_parameters` | Konfigurasi parameter & bobot skoring |
| `settings` | Pengaturan sistem (threshold risiko) |
| `personal_access_tokens` | Token autentikasi Sanctum |
| `cache` | Cache layer |
| `jobs` | Queue jobs |
| `sessions` | User sessions |

---

## 📝 Lisensi

Project ini dibuat untuk keperluan internal. Silakan sesuaikan lisensi sesuai kebutuhan.

---

**Dibuat dengan ❤️ menggunakan Laravel & React**
