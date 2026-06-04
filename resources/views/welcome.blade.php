<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Risk Dashboard - Real-Time Debtor Analytics</title>
    <meta name="description" content="Platform monitoring dan analisis risiko kredit debitur berbasis real-time scoring dengan visualisasi data interaktif.">

    <!-- Custom CSS -->
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    <!-- FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <script>
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.documentElement.classList.add('light-theme');
        }
    </script>

    <style>
        /* ── PREMIUM BACKGROUND SYSTEM ───────────────────────── */
        body {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            overflow-x: hidden;
        }

        /* Animated gradient orb layer */
        .bg-orbs {
            position: fixed;
            inset: 0;
            z-index: -3;
            pointer-events: none;
            overflow: hidden;
        }

        .bg-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(70px);
            animation: driftOrb 20s ease-in-out infinite;
            mix-blend-mode: screen;
        }

        /* Dark mode orbs */
        .bg-orb-1 { width: 600px; height: 600px; top: -150px; left: -150px; background: radial-gradient(circle, rgba(0,114,255,0.5), transparent 70%); animation-duration: 22s; }
        .bg-orb-2 { width: 500px; height: 500px; top: 20%; right: -100px; background: radial-gradient(circle, rgba(139,92,246,0.45), transparent 70%); animation-duration: 18s; animation-delay: -5s; }
        .bg-orb-3 { width: 400px; height: 400px; bottom: 10%; left: 30%; background: radial-gradient(circle, rgba(0,240,255,0.3), transparent 70%); animation-duration: 25s; animation-delay: -10s; }
        .bg-orb-4 { width: 350px; height: 350px; bottom: -80px; right: 20%; background: radial-gradient(circle, rgba(236,72,153,0.3), transparent 70%); animation-duration: 19s; animation-delay: -7s; }

        /* Light mode — richer, more colorful orbs */
        .light-theme .bg-orb-1 { background: radial-gradient(circle, rgba(37,99,235,0.25), transparent 70%); filter: blur(90px); }
        .light-theme .bg-orb-2 { background: radial-gradient(circle, rgba(124,58,237,0.2), transparent 70%); filter: blur(90px); }
        .light-theme .bg-orb-3 { background: radial-gradient(circle, rgba(6,182,212,0.2), transparent 70%); filter: blur(90px); }
        .light-theme .bg-orb-4 { background: radial-gradient(circle, rgba(236,72,153,0.15), transparent 70%); filter: blur(90px); }

        @keyframes driftOrb {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(40px, -60px) scale(1.08); }
            50% { transform: translate(-30px, 30px) scale(0.94); }
            75% { transform: translate(20px, 50px) scale(1.04); }
        }

        /* Grid mesh overlay */
        .bg-grid {
            position: fixed;
            inset: 0;
            z-index: -2;
            pointer-events: none;
            background-image:
                linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
            background-size: 50px 50px;
        }

        .light-theme .bg-grid {
            background-image:
                linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px);
        }

        /* Spotlight vignette */
        .bg-spotlight {
            position: fixed;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            background: radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, rgba(6,9,25,0.6) 100%);
        }

        .light-theme .bg-spotlight {
            background: radial-gradient(ellipse 100% 70% at 50% 0%, rgba(224,231,255,0.8) 0%, transparent 60%);
        }

        /* Floating geometric shapes */
        .bg-shapes {
            position: fixed;
            inset: 0;
            z-index: -2;
            pointer-events: none;
            overflow: hidden;
        }

        .shape {
            position: absolute;
            border-radius: 12px;
            opacity: 0;
            animation: floatShape 30s ease-in-out infinite;
        }

        .shape-1 {
            width: 60px; height: 60px;
            top: 15%; left: 10%;
            background: linear-gradient(135deg, rgba(0,114,255,0.15), rgba(139,92,246,0.1));
            border: 1px solid rgba(0,114,255,0.2);
            transform: rotate(12deg);
            animation-delay: 0s;
        }
        .shape-2 {
            width: 40px; height: 40px;
            top: 60%; left: 5%;
            background: linear-gradient(135deg, rgba(0,240,255,0.1), transparent);
            border: 1px solid rgba(0,240,255,0.2);
            border-radius: 50%;
            animation-delay: -8s;
        }
        .shape-3 {
            width: 80px; height: 80px;
            top: 25%; right: 8%;
            background: linear-gradient(135deg, rgba(139,92,246,0.12), transparent);
            border: 1px solid rgba(139,92,246,0.2);
            transform: rotate(-20deg);
            animation-delay: -15s;
        }
        .shape-4 {
            width: 50px; height: 50px;
            bottom: 20%; right: 12%;
            background: linear-gradient(135deg, rgba(236,72,153,0.1), transparent);
            border: 1px solid rgba(236,72,153,0.2);
            border-radius: 50%;
            animation-delay: -22s;
        }
        .shape-5 {
            width: 30px; height: 30px;
            top: 45%; right: 25%;
            background: linear-gradient(135deg, rgba(16,185,129,0.1), transparent);
            border: 1px solid rgba(16,185,129,0.2);
            transform: rotate(45deg);
            animation-delay: -5s;
        }

        .light-theme .shape { opacity: 0; }
        .light-theme .shape-1 { opacity: 1; border-color: rgba(37,99,235,0.15); background: rgba(37,99,235,0.06); }
        .light-theme .shape-2 { opacity: 1; border-color: rgba(6,182,212,0.15); background: rgba(6,182,212,0.05); }
        .light-theme .shape-3 { opacity: 1; border-color: rgba(124,58,237,0.15); background: rgba(124,58,237,0.06); }
        .light-theme .shape-4 { opacity: 1; border-color: rgba(236,72,153,0.12); background: rgba(236,72,153,0.04); }
        .light-theme .shape-5 { opacity: 1; border-color: rgba(16,185,129,0.15); background: rgba(16,185,129,0.05); }

        @keyframes floatShape {
            0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.7; }
            33% { transform: translate(15px, -25px) rotate(8deg); opacity: 1; }
            66% { transform: translate(-10px, 15px) rotate(-5deg); opacity: 0.6; }
        }

        /* ── HEADER ──────────────────────────────────────────── */
        .welcome-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.25rem 5%;
            border-bottom: 1px solid var(--border-color);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            background: rgba(6, 9, 25, 0.4);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .light-theme .welcome-header {
            background: rgba(255, 255, 255, 0.6);
            border-bottom-color: rgba(37,99,235,0.1);
        }

        /* ── HERO ────────────────────────────────────────────── */
        .hero-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 5rem 1.5rem 3rem;
            max-width: 880px;
            margin: 0 auto;
            gap: 1.5rem;
        }

        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 18px;
            border-radius: 30px;
            background: rgba(0,114,255,0.12);
            border: 1px solid rgba(0,114,255,0.3);
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--color-cyan);
            letter-spacing: 0.5px;
            text-transform: uppercase;
            backdrop-filter: blur(10px);
        }

        .light-theme .hero-badge {
            background: rgba(37,99,235,0.08);
            border-color: rgba(37,99,235,0.25);
            color: var(--color-blue);
        }

        .hero-title {
            font-family: var(--font-display);
            font-size: clamp(2.2rem, 5vw, 3.5rem);
            font-weight: 800;
            line-height: 1.15;
            background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 60%, #67e8f9 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .light-theme .hero-title {
            background: linear-gradient(135deg, #0f172a 0%, #2563eb 60%, #0891b2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .hero-subtitle {
            font-size: 1.1rem;
            color: var(--text-secondary);
            max-width: 600px;
            line-height: 1.7;
        }

        .hero-cta-group {
            display: flex;
            gap: 14px;
            flex-wrap: wrap;
            justify-content: center;
            margin-top: 0.5rem;
        }

        .btn-ghost {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.15);
            color: var(--text-secondary);
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 0.9rem;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: var(--transition-smooth);
        }
        .btn-ghost:hover {
            background: rgba(255,255,255,0.1);
            color: #ffffff;
        }

        .light-theme .btn-ghost {
            background: rgba(255,255,255,0.7);
            border-color: rgba(0,0,0,0.1);
            color: var(--text-secondary);
        }

        /* Stats strip */
        .stats-strip {
            display: flex;
            gap: 2rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 1rem;
        }

        .stat-item {
            text-align: center;
        }

        .stat-number {
            font-family: var(--font-display);
            font-size: 1.6rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--color-cyan), var(--color-blue));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .light-theme .stat-number {
            background: linear-gradient(135deg, var(--color-blue), var(--color-purple));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .stat-label {
            font-size: 0.72rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
        }

        /* ── FEATURES GRID ───────────────────────────────────── */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
            gap: 1.25rem;
            width: 100%;
            max-width: 1100px;
            margin: 2rem auto 4rem;
            padding: 0 5%;
        }

        .feature-card {
            text-align: left;
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 1.5rem;
            border-radius: 20px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            backdrop-filter: blur(15px);
            transition: var(--transition-smooth);
            position: relative;
            overflow: hidden;
        }

        .feature-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 2px;
            background: var(--fc-accent, var(--color-cyan));
            opacity: 0;
            transition: var(--transition-smooth);
        }

        .feature-card:hover {
            transform: translateY(-4px);
            border-color: rgba(255,255,255,0.12);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .feature-card:hover::before {
            opacity: 1;
        }

        .light-theme .feature-card:hover {
            box-shadow: 0 20px 40px rgba(37,99,235,0.1);
            border-color: rgba(37,99,235,0.15);
        }

        .feature-icon {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.3rem;
        }

        /* ── FOOTER ──────────────────────────────────────────── */
        .welcome-footer {
            text-align: center;
            padding: 1.5rem;
            border-top: 1px solid var(--border-color);
            font-size: 0.78rem;
            color: var(--text-muted);
        }
    </style>
</head>
<body>

    <!-- ░░ LAYERED BACKGROUNDS ░░ -->
    <div class="bg-orbs">
        <div class="bg-orb bg-orb-1"></div>
        <div class="bg-orb bg-orb-2"></div>
        <div class="bg-orb bg-orb-3"></div>
        <div class="bg-orb bg-orb-4"></div>
    </div>
    <div class="bg-grid"></div>
    <div class="bg-spotlight"></div>
    <div class="bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
    </div>

    <!-- ░░ HEADER ░░ -->
    <header class="welcome-header">
        <div class="brand-section" style="margin-bottom: 0;">
            <div class="brand-icon">
                <i class="fa-solid fa-chart-line" style="color: #060919; font-size: 1.2rem;"></i>
            </div>
            <div>
                <h1 class="brand-name" style="font-size: 1.1rem;">RISK DASHBOARD</h1>
                <span class="brand-subname" style="font-size: 0.68rem;">Monitoring & Analytics</span>
            </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
            <!-- Theme Toggle -->
            <button id="theme-toggle" style="cursor: pointer; padding: 7px 14px; border-radius: 20px; font-size: 0.8rem; display: flex; align-items: center; gap: 6px; border: 1px solid var(--border-color); background: rgba(255,255,255,0.04); color: var(--text-secondary); transition: var(--transition-smooth);">
                <i id="theme-toggle-icon" class="fa-solid fa-sun" style="color: var(--color-cyan);"></i>
                <span id="theme-toggle-text">Light Mode</span>
            </button>

            @if (Route::has('login'))
                @auth
                    <a href="{{ url('/dashboard') }}" class="btn btn-primary" style="padding: 8px 20px; border-radius: 20px; font-size: 0.85rem;">
                        Dashboard <i class="fa-solid fa-arrow-right"></i>
                    </a>
                @else
                    <a href="{{ route('login') }}" class="btn btn-primary" style="padding: 8px 20px; border-radius: 20px; font-size: 0.85rem;">
                        Masuk <i class="fa-solid fa-right-to-bracket"></i>
                    </a>
                @endauth
            @endif
        </div>
    </header>

    <!-- ░░ HERO ░░ -->
    <main class="hero-section">
        <div class="hero-badge">
            <i class="fa-solid fa-circle-dot" style="animation: pulse 2s infinite;"></i>
            v2.0 · Real-Time Scoring Engine
        </div>

        <h2 class="hero-title">
            Skoring Risiko Real-Time<br>& Analisis Debitur
        </h2>

        <p class="hero-subtitle">
            Platform modern untuk memantau, menganalisis, dan memproyeksikan tingkat risiko kredit debitur berdasarkan DTI, Keterlambatan Pembayaran, Skor Kredit, dan Beban CO secara instan.
        </p>

        <div class="hero-cta-group">
            @auth
                <a href="{{ url('/dashboard') }}" class="btn btn-primary" style="padding: 13px 32px; font-size: 0.95rem; border-radius: 12px;">
                    Buka Dashboard <i class="fa-solid fa-arrow-right"></i>
                </a>
            @else
                <a href="{{ route('login') }}" class="btn btn-primary" style="padding: 13px 32px; font-size: 0.95rem; border-radius: 12px;">
                    Mulai Sekarang <i class="fa-solid fa-right-to-bracket"></i>
                </a>
                <a href="#features" class="btn-ghost">
                    <i class="fa-solid fa-circle-play"></i> Lihat Fitur
                </a>
            @endauth
        </div>

        <!-- Stats -->
        <div class="stats-strip">
            <div class="stat-item">
                <div class="stat-number">4+</div>
                <div class="stat-label">Parameter Scoring</div>
            </div>
            <div class="stat-item" style="border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); padding: 0 2rem;">
                <div class="stat-number">Real-Time</div>
                <div class="stat-label">Kalkulasi Skor</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">Excel & PDF</div>
                <div class="stat-label">Export Laporan</div>
            </div>
        </div>
    </main>

    <!-- ░░ FEATURES ░░ -->
    <section class="features-grid" id="features">
        <div class="feature-card" style="--fc-accent: var(--color-cyan);">
            <div class="feature-icon" style="background: rgba(0,240,255,0.1); color: var(--color-cyan); border: 1px solid rgba(0,240,255,0.2);">
                <i class="fa-solid fa-bolt"></i>
            </div>
            <div>
                <h4 style="font-family: var(--font-display); font-size: 1rem; font-weight: 700; margin-bottom: 6px;">Real-Time Scoring</h4>
                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.6;">Skor risiko terhitung seketika saat data disimpan atau diubah menggunakan model scoring berbobot dinamis.</p>
            </div>
        </div>

        <div class="feature-card" style="--fc-accent: var(--color-purple);">
            <div class="feature-icon" style="background: rgba(139,92,246,0.1); color: var(--color-purple); border: 1px solid rgba(139,92,246,0.2);">
                <i class="fa-solid fa-chart-pie"></i>
            </div>
            <div>
                <h4 style="font-family: var(--font-display); font-size: 1rem; font-weight: 700; margin-bottom: 6px;">Tren & Pola Bayar</h4>
                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.6;">Visualisasi tren prioritas CO, pola pembayaran debitur, dan distribusi PS AMBC dengan grafik interaktif.</p>
            </div>
        </div>

        <div class="feature-card" style="--fc-accent: var(--color-medium);">
            <div class="feature-icon" style="background: rgba(245,158,11,0.1); color: var(--color-medium); border: 1px solid rgba(245,158,11,0.2);">
                <i class="fa-solid fa-sliders"></i>
            </div>
            <div>
                <h4 style="font-family: var(--font-display); font-size: 1rem; font-weight: 700; margin-bottom: 6px;">Threshold Dinamis</h4>
                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.6;">Ubah bobot parameter dan batas klasifikasi risiko secara dinamis, sistem menghitung ulang seluruh data otomatis.</p>
            </div>
        </div>

        <div class="feature-card" style="--fc-accent: var(--color-low);">
            <div class="feature-icon" style="background: rgba(16,185,129,0.1); color: var(--color-low); border: 1px solid rgba(16,185,129,0.2);">
                <i class="fa-solid fa-file-excel"></i>
            </div>
            <div>
                <h4 style="font-family: var(--font-display); font-size: 1rem; font-weight: 700; margin-bottom: 6px;">Import & Ekspor</h4>
                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.6;">Import debitur massal via Excel, ekspor laporan rapi terformat spreadsheet dan dokumen cetak PDF.</p>
            </div>
        </div>
    </section>

    <!-- ░░ FOOTER ░░ -->
    <footer class="welcome-footer">
        <p>&copy; {{ date('Y') }} Risk Scoring Dashboard · Built with Laravel 12 · Premium Glassmorphism UI</p>
    </footer>

    <style>
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }
    </style>

    <script>
        // Theme Toggle
        const themeToggle = document.getElementById('theme-toggle');
        const themeToggleIcon = document.getElementById('theme-toggle-icon');
        const themeToggleText = document.getElementById('theme-toggle-text');

        function applyThemeUI(theme) {
            if (theme === 'light') {
                document.documentElement.classList.add('light-theme');
                themeToggleIcon.className = 'fa-solid fa-moon';
                themeToggleIcon.style.color = 'var(--color-purple)';
                themeToggleText.innerText = 'Dark Mode';
            } else {
                document.documentElement.classList.remove('light-theme');
                themeToggleIcon.className = 'fa-solid fa-sun';
                themeToggleIcon.style.color = 'var(--color-cyan)';
                themeToggleText.innerText = 'Light Mode';
            }
        }

        applyThemeUI(localStorage.getItem('theme') || 'dark');

        themeToggle.addEventListener('click', () => {
            const current = localStorage.getItem('theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', next);
            applyThemeUI(next);
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', e => {
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
            });
        });
    </script>
</body>
</html>
