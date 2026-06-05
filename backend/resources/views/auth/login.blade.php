<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Masuk Aplikasi - Risk Scoring Dashboard</title>

    <!-- Custom CSS -->
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    <!-- FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <script>
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') document.documentElement.classList.add('light-theme');
    </script>

    <style>
        /* ── FULLSCREEN SPLIT LAYOUT ──── */
        body {
            display: flex;
            min-height: 100vh;
            overflow: hidden;
        }

        /* ── LEFT PANEL — Branding visual ── */
        .login-left {
            flex: 1;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 3rem;
            overflow: hidden;
        }

        /* Dark: deep dark navy with orbs. Light: vibrant blue/indigo */
        .login-left-bg {
            position: absolute;
            inset: 0;
            z-index: 0;
            background: linear-gradient(145deg, #050b1a 0%, #0a1535 50%, #0d0f30 100%);
        }
        .light-theme .login-left-bg {
            background: linear-gradient(145deg, #1e3a8a 0%, #2563eb 40%, #4f46e5 75%, #7c3aed 100%);
        }

        /* Orbs inside left panel */
        .left-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
            pointer-events: none;
            animation: driftOrb 20s ease-in-out infinite;
        }
        .left-orb-1 {
            width: 350px; height: 350px;
            top: -100px; left: -100px;
            background: radial-gradient(circle, rgba(0,114,255,0.6), transparent 70%);
            animation-delay: 0s;
        }
        .left-orb-2 {
            width: 280px; height: 280px;
            bottom: -60px; right: -60px;
            background: radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%);
            animation-delay: -7s;
        }
        .left-orb-3 {
            width: 200px; height: 200px;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle, rgba(0,240,255,0.2), transparent 70%);
            animation-delay: -14s;
        }
        .light-theme .left-orb-1 { background: radial-gradient(circle, rgba(255,255,255,0.25), transparent 70%); }
        .light-theme .left-orb-2 { background: radial-gradient(circle, rgba(167,139,250,0.4), transparent 70%); }
        .light-theme .left-orb-3 { background: radial-gradient(circle, rgba(255,255,255,0.1), transparent 70%); }

        @keyframes driftOrb {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -40px) scale(1.06); }
            66% { transform: translate(-20px, 25px) scale(0.95); }
        }

        /* Grid mesh on left panel */
        .left-grid {
            position: absolute;
            inset: 0;
            background-image:
                linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
            background-size: 40px 40px;
            pointer-events: none;
        }

        /* Floating shapes on left */
        .left-shape {
            position: absolute;
            border-radius: 14px;
            border: 1px solid rgba(255,255,255,0.12);
            background: rgba(255,255,255,0.04);
            backdrop-filter: blur(4px);
            pointer-events: none;
            animation: floatShape 25s ease-in-out infinite;
        }
        .ls-1 { width:70px;height:70px; top:18%;left:12%; transform:rotate(12deg); animation-delay:0s; }
        .ls-2 { width:45px;height:45px; top:65%;left:8%; border-radius:50%; animation-delay:-8s; }
        .ls-3 { width:55px;height:55px; top:30%;right:10%; transform:rotate(-18deg); animation-delay:-16s; }
        .ls-4 { width:35px;height:35px; bottom:22%;right:18%; border-radius:50%; animation-delay:-4s; }

        @keyframes floatShape {
            0%,100%{ transform:translate(0,0) rotate(var(--r,0deg)); opacity:.7; }
            50%{ transform:translate(12px,-18px) rotate(calc(var(--r,0deg) + 8deg)); opacity:1; }
        }

        /* Left content */
        .left-content {
            position: relative;
            z-index: 2;
            text-align: center;
            max-width: 360px;
        }

        .left-brand-icon {
            width: 72px;
            height: 72px;
            background: linear-gradient(135deg, rgba(0,240,255,0.8), rgba(0,114,255,0.8));
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2rem;
            color: #ffffff;
            box-shadow: 0 0 40px rgba(0,114,255,0.4), 0 0 80px rgba(0,114,255,0.15);
        }
        .light-theme .left-brand-icon {
            background: rgba(255,255,255,0.2);
            box-shadow: 0 0 40px rgba(255,255,255,0.3);
        }

        .left-title {
            font-family: var(--font-display);
            font-size: 2rem;
            font-weight: 800;
            color: #ffffff;
            line-height: 1.2;
            margin-bottom: 0.75rem;
        }

        .left-subtitle {
            font-size: 0.9rem;
            color: rgba(255,255,255,0.65);
            line-height: 1.6;
            margin-bottom: 2.5rem;
        }
        .light-theme .left-subtitle { color: rgba(255,255,255,0.8); }

        /* Feature pills on left panel */
        .feature-pills {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .feature-pill {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(255,255,255,0.07);
            border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 10px 16px;
            text-align: left;
        }
        .light-theme .feature-pill {
            background: rgba(255,255,255,0.15);
            border-color: rgba(255,255,255,0.25);
        }

        .pill-icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.95rem;
            flex-shrink: 0;
        }

        .pill-text strong {
            display: block;
            font-size: 0.85rem;
            font-weight: 600;
            color: #ffffff;
        }
        .pill-text span {
            font-size: 0.75rem;
            color: rgba(255,255,255,0.55);
        }
        .light-theme .pill-text span { color: rgba(255,255,255,0.7); }

        /* ── RIGHT PANEL — Login form ── */
        .login-right {
            width: 480px;
            min-width: 420px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 3rem 3.5rem;
            position: relative;
            overflow-y: auto;
        }

        /* Dark: slightly elevated panel. Light: pure white */
        .login-right {
            background: rgba(8, 14, 38, 0.9);
            border-left: 1px solid rgba(255,255,255,0.06);
        }
        .light-theme .login-right {
            background: rgba(255, 255, 255, 0.95);
            border-left: 1px solid rgba(37,99,235,0.1);
            box-shadow: -20px 0 60px rgba(37,99,235,0.08);
        }

        /* Right panel subtle orb */
        .right-orb {
            position: absolute;
            width: 300px; height: 300px;
            top: -80px; right: -80px;
            background: radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 0;
        }
        .light-theme .right-orb {
            background: radial-gradient(circle, rgba(37,99,235,0.06), transparent 70%);
        }

        .login-form-wrap {
            position: relative;
            z-index: 1;
        }

        .login-greeting {
            margin-bottom: 2rem;
        }

        .login-greeting h2 {
            font-family: var(--font-display);
            font-size: 1.6rem;
            font-weight: 800;
            margin-bottom: 6px;
        }

        .login-greeting p {
            font-size: 0.85rem;
            color: var(--text-secondary);
        }

        .input-wrapper {
            position: relative;
        }
        .input-wrapper i {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            font-size: 0.85rem;
            pointer-events: none;
        }
        .input-wrapper input {
            padding-left: 40px;
        }

        /* Demo chips */
        .demo-chips {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-top: 1.5rem;
        }

        .demo-chip {
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border-color);
            padding: 8px 6px;
            border-radius: 10px;
            cursor: pointer;
            text-align: center;
            font-size: 0.7rem;
            color: var(--text-secondary);
            transition: var(--transition-smooth);
        }
        .demo-chip:hover {
            border-color: var(--color-cyan);
            color: var(--text-primary);
            background: rgba(0,240,255,0.05);
            transform: translateY(-1px);
        }
        .light-theme .demo-chip { background: rgba(37,99,235,0.03); }
        .light-theme .demo-chip:hover {
            border-color: var(--color-blue);
            background: rgba(37,99,235,0.07);
        }

        /* Back link */
        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.8rem;
            color: var(--text-muted);
            text-decoration: none;
            margin-bottom: 2rem;
            transition: var(--transition-smooth);
        }
        .back-link:hover { color: var(--text-secondary); }

        /* Theme toggle button */
        .theme-btn {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 6px 12px;
            font-size: 0.78rem;
            color: var(--text-muted);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: var(--transition-smooth);
            z-index: 10;
        }
        .theme-btn:hover { color: var(--text-primary); background: rgba(255,255,255,0.08); }

        /* Responsive */
        @media (max-width: 768px) {
            .login-left { display: none; }
            .login-right { width: 100%; min-width: unset; padding: 2rem 1.5rem; }
            body { overflow-y: auto; }
        }
    </style>
</head>
<body>

    <!-- ░░ LEFT PANEL ░░ -->
    <div class="login-left">
        <div class="login-left-bg"></div>
        <div class="left-grid"></div>

        <!-- Orbs -->
        <div class="left-orb left-orb-1"></div>
        <div class="left-orb left-orb-2"></div>
        <div class="left-orb left-orb-3"></div>

        <!-- Shapes -->
        <div class="left-shape ls-1" style="--r:12deg;"></div>
        <div class="left-shape ls-2"></div>
        <div class="left-shape ls-3" style="--r:-18deg;"></div>
        <div class="left-shape ls-4"></div>

        <!-- Content -->
        <div class="left-content">
            <div class="left-brand-icon">
                <i class="fa-solid fa-chart-line"></i>
            </div>
            <h1 class="left-title">Risk Scoring<br>Dashboard</h1>
            <p class="left-subtitle">Platform analisis risiko kredit debitur berbasis real-time scoring dengan visualisasi data yang komprehensif.</p>

            <div class="feature-pills">
                <div class="feature-pill">
                    <div class="pill-icon" style="background:rgba(0,240,255,0.15);color:#00f0ff;">
                        <i class="fa-solid fa-bolt"></i>
                    </div>
                    <div class="pill-text">
                        <strong>Real-Time Scoring</strong>
                        <span>Kalkulasi otomatis berbasis 4 parameter</span>
                    </div>
                </div>
                <div class="feature-pill">
                    <div class="pill-icon" style="background:rgba(139,92,246,0.15);color:#a78bfa;">
                        <i class="fa-solid fa-chart-pie"></i>
                    </div>
                    <div class="pill-text">
                        <strong>Analisis Visual</strong>
                        <span>Grafik interaktif tren & distribusi risiko</span>
                    </div>
                </div>
                <div class="feature-pill">
                    <div class="pill-icon" style="background:rgba(16,185,129,0.15);color:#34d399;">
                        <i class="fa-solid fa-file-excel"></i>
                    </div>
                    <div class="pill-text">
                        <strong>Import & Ekspor</strong>
                        <span>Excel import massal & laporan PDF</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ░░ RIGHT PANEL ░░ -->
    <div class="login-right">
        <div class="right-orb"></div>

        <!-- Theme toggle -->
        <button id="theme-toggle" class="theme-btn">
            <i id="theme-toggle-icon" class="fa-solid fa-sun"></i>
            <span id="theme-toggle-text">Light Mode</span>
        </button>

        <div class="login-form-wrap">
            <!-- Back link -->
            <a href="{{ url('/') }}" class="back-link">
                <i class="fa-solid fa-arrow-left"></i> Kembali ke Beranda
            </a>

            <!-- Greeting -->
            <div class="login-greeting">
                <h2>Selamat Datang 👋</h2>
                <p>Silakan masuk untuk mengakses data dan analisis risiko debitur</p>
            </div>

            <!-- Error message -->
            @if($errors->any())
                <div class="alert alert-danger" style="margin-bottom: 1.25rem; font-size: 0.85rem; border-radius: 12px;">
                    <i class="fa-solid fa-circle-xmark"></i>
                    <span>{{ $errors->first() }}</span>
                </div>
            @endif

            <!-- Form -->
            <form action="{{ route('login') }}" method="POST">
                @csrf

                <div class="form-group">
                    <label class="form-label" for="email">Alamat Email</label>
                    <div class="input-wrapper">
                        <i class="fa-regular fa-envelope"></i>
                        <input type="email" name="email" id="email" class="form-control"
                               placeholder="nama@perusahaan.com"
                               value="{{ old('email') }}" required autofocus>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 1.5rem;">
                    <label class="form-label" for="password">Kata Sandi</label>
                    <div class="input-wrapper">
                        <i class="fa-solid fa-lock"></i>
                        <input type="password" name="password" id="password" class="form-control"
                               placeholder="••••••••" required>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center; padding:13px; border-radius:12px; font-size:0.95rem;">
                    Masuk Aplikasi &nbsp;<i class="fa-solid fa-arrow-right"></i>
                </button>
            </form>

            <!-- Demo accounts -->
            <div style="margin-top: 1.75rem; padding-top: 1.25rem; border-top: 1px solid var(--border-color);">
                <p style="font-size: 0.7rem; color: var(--text-muted); text-align:center; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.8px;">
                    Demo cepat — klik untuk mengisi otomatis
                </p>
                <div class="demo-chips">
                    <div class="demo-chip" onclick="fillDemo('admin@risk.com')">
                        <strong style="display:block; margin-bottom:2px; color:var(--color-cyan);">
                            <i class="fa-solid fa-shield-halved"></i> Admin
                        </strong>
                        admin@risk.com
                    </div>
                    <div class="demo-chip" onclick="fillDemo('analyst@risk.com')">
                        <strong style="display:block; margin-bottom:2px; color:var(--color-purple);">
                            <i class="fa-solid fa-magnifying-glass-chart"></i> Analis
                        </strong>
                        analyst@risk.com
                    </div>
                    <div class="demo-chip" onclick="fillDemo('management@risk.com')">
                        <strong style="display:block; margin-bottom:2px; color:var(--color-low);">
                            <i class="fa-solid fa-user-tie"></i> Manajer
                        </strong>
                        management@risk.com
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Demo fill
        function fillDemo(email) {
            const emailEl = document.getElementById('email');
            const passEl  = document.getElementById('password');
            emailEl.value = email;
            passEl.value  = 'password';

            [emailEl, passEl].forEach(el => {
                el.style.transition = 'box-shadow 0.3s';
                el.style.boxShadow  = '0 0 0 2px var(--color-cyan)';
                setTimeout(() => el.style.boxShadow = '', 600);
            });
        }

        // Theme toggle
        const toggle     = document.getElementById('theme-toggle');
        const toggleIcon = document.getElementById('theme-toggle-icon');
        const toggleText = document.getElementById('theme-toggle-text');

        function applyTheme(theme) {
            if (theme === 'light') {
                document.documentElement.classList.add('light-theme');
                toggleIcon.className = 'fa-solid fa-moon';
                toggleIcon.style.color = 'var(--color-purple)';
                toggleText.innerText = 'Dark Mode';
            } else {
                document.documentElement.classList.remove('light-theme');
                toggleIcon.className = 'fa-solid fa-sun';
                toggleIcon.style.color = 'var(--color-cyan)';
                toggleText.innerText = 'Light Mode';
            }
        }

        applyTheme(localStorage.getItem('theme') || 'dark');

        toggle.addEventListener('click', () => {
            const next = (localStorage.getItem('theme') || 'dark') === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', next);
            applyTheme(next);
        });
    </script>
</body>
</html>
