# 🚀 Deploy Laravel ke Vercel — Panduan Lengkap

## Arsitektur

```
Vercel (PHP Serverless)
    ↕
Laravel Monolith (Blade + Session Cookie)
    ↕
Cloud MySQL (PlanetScale / Aiven / Railway)
```

---

## Prasyarat

1. Akun **[Vercel](https://vercel.com)** (gratis)
2. Database **MySQL cloud** — pilih salah satu:
   - **[PlanetScale](https://planetscale.com)** — MySQL serverless, gratis tier ada
   - **[Aiven](https://aiven.io)** — MySQL managed, free trial
   - **[Railway](https://railway.app)** — MySQL + hosting, gratis tier terbatas
3. Repo GitHub dengan project ini

---

## Langkah 1 — Siapkan Database Cloud

### Opsi A: PlanetScale (Rekomendasi)
1. Buat akun di [planetscale.com](https://planetscale.com)
2. Create database → pilih region Asia (Singapore)
3. Create branch `main` → klik **Connect** → pilih **Laravel**
4. Salin nilai: `host`, `username`, `password`, `database`

### Opsi B: Aiven
1. Buat akun di [aiven.io](https://aiven.io)
2. Create Service → MySQL → Free plan
3. Salin connection details dari dashboard

---

## Langkah 2 — Import Project ke Vercel

1. Login ke [vercel.com](https://vercel.com)
2. Klik **Add New Project** → **Import Git Repository**
3. Pilih repo `apk-risk-score`
4. **Jangan ubah** Root Directory (biarkan `/`)
5. **Framework Preset**: pilih **Other**
6. Klik **Deploy** (akan gagal dulu, kita set env vars dulu)

---

## Langkah 3 — Set Environment Variables di Vercel

Buka **Project Settings → Environment Variables**, tambahkan:

| Key | Value |
|-----|-------|
| `APP_NAME` | `APK Risk Score` |
| `APP_KEY` | *(generate: `php artisan key:generate --show`)* |
| `APP_URL` | `https://nama-project-anda.vercel.app` |
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | *(dari PlanetScale/Aiven)* |
| `DB_PORT` | `3306` |
| `DB_DATABASE` | *(nama database)* |
| `DB_USERNAME` | *(username)* |
| `DB_PASSWORD` | *(password)* |
| `SESSION_DRIVER` | `cookie` |
| `SESSION_ENCRYPT` | `true` |
| `CACHE_STORE` | `array` |
| `LOG_CHANNEL` | `stderr` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `VERCEL` | `1` |

> ⚠️ **Penting**: Untuk generate `APP_KEY`, jalankan di lokal:
> ```bash
> php artisan key:generate --show
> ```
> Salin hasilnya (format: `base64:xxx...`)

---

## Langkah 4 — Redeploy

Setelah env vars diset:
1. Buka tab **Deployments**
2. Klik titik tiga (**...**) di deployment terbaru
3. Klik **Redeploy**

---

## Langkah 5 — Jalankan Migrations

Karena Vercel serverless tidak bisa menjalankan `php artisan migrate` interaktif, ada beberapa cara:

### Cara A: Via Vercel CLI (Rekomendasi)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Pull env vars ke lokal
vercel env pull .env.production.local

# Jalankan migrate dengan env production
php artisan migrate --env=production.local --force
```

### Cara B: Tambahkan di Build Command (Otomatis)
Edit `vercel.json`, ubah `buildCommand` menjadi:
```
composer install --no-dev --optimize-autoloader --no-interaction && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan migrate --force
```

> ⚠️ Hati-hati: Opsi B akan jalankan migrate setiap deploy!

### Cara C: Langsung dari lokal dengan DB cloud
```bash
# Edit .env lokal sementara pakai DB cloud
php artisan migrate --force
```

---

## Langkah 6 — Buat User Admin Pertama

Setelah migrate, buat user admin via tinker dari lokal:
```bash
php artisan tinker
```
```php
\App\Models\User::create([
    'name'     => 'Administrator',
    'email'    => 'admin@example.com',
    'password' => bcrypt('password_aman_anda'),
    'role'     => 'admin',
]);
```

---

## ✅ Verifikasi

Setelah deploy berhasil, buka URL Vercel Anda dan pastikan:
- [ ] Halaman login muncul
- [ ] Login berhasil masuk dashboard
- [ ] Data dari database tampil
- [ ] Fitur tambah populasi berfungsi
- [ ] Export laporan berfungsi

---

## 🔧 Troubleshooting

### Error 500 setelah deploy
- Cek **Vercel → Deployments → Functions → Logs**
- Pastikan `APP_KEY` sudah diset
- Pastikan `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD` benar

### Session tidak persisten
- Pastikan `SESSION_DRIVER=cookie` dan `SESSION_ENCRYPT=true`
- Untuk multi-domain, set `SESSION_DOMAIN=.vercel.app`

### File upload/export tidak berfungsi
- Vercel tidak punya persistent storage
- Untuk export Excel: pastikan write ke `/tmp` — sudah dikonfigurasi otomatis

### "No application encryption key"
- `APP_KEY` belum diset di Vercel env vars

---

## Catatan Penting

| Fitur | Status di Vercel |
|-------|-----------------|
| Blade views | ✅ Berfungsi |
| Session login | ✅ Cookie-based |
| Database queries | ✅ Via cloud MySQL |
| Export Excel | ✅ Via `/tmp` |
| File upload | ⚠️ Sementara (hilang setelah request) |
| Queue jobs | ❌ Gunakan `QUEUE_CONNECTION=sync` |
| Storage::disk() | ⚠️ Read dari project, write ke `/tmp` |
