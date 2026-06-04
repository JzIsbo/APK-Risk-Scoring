<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title') - Risk Dashboard</title>
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    
    <!-- FontAwesome for Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Chart.js for visualizations -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <script>
        // Immediate script to prevent page flash
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            document.documentElement.classList.add('light-theme');
        }
    </script>
</head>
<body>
    <div class="app-container">
        <!-- Sidebar Navigation -->
        <aside class="sidebar">
            <div class="brand-section">
                <div class="brand-icon">
                    <i class="fa-solid fa-chart-line" style="color: #060919; font-size: 1.25rem;"></i>
                </div>
                <div>
                    <h1 class="brand-name">RISK DASHBOARD</h1>
                    <span class="brand-subname">Monitoring & Analytics</span>
                </div>
            </div>

            <nav style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
                <ul class="menu-items">
                    <li class="menu-item {{ Request::routeIs('dashboard') ? 'active' : '' }}">
                        <a href="{{ route('dashboard') }}">
                            <i class="fa-solid fa-chart-simple"></i>
                            <span>Dashboard</span>
                        </a>
                    </li>
                </ul>

                <span class="menu-title">Menu Utama</span>
                <ul class="menu-items">
                    @if(in_array(auth()->user()->role, ['admin', 'analyst']))
                    <li class="menu-item {{ Request::routeIs('populasi.index') ? 'active' : '' }}">
                        <a href="{{ route('populasi.index') }}">
                            <i class="fa-solid fa-users"></i>
                            <span>Populasi</span>
                        </a>
                    </li>
                    @endif
                    <li class="menu-item {{ Request::routeIs('risk-analysis.*') ? 'active' : '' }}">
                        <a href="{{ route('risk-analysis.index') }}">
                            <i class="fa-solid fa-magnifying-glass-chart"></i>
                            <span>Risk Analysis</span>
                        </a>
                    </li>
                    <li class="menu-item {{ Request::routeIs('trend-prioritas.index') ? 'active' : '' }}">
                        <a href="{{ route('trend-prioritas.index') }}">
                            <i class="fa-solid fa-chart-line"></i>
                            <span>Trend Prioritas</span>
                        </a>
                    </li>
                    <li class="menu-item {{ Request::routeIs('pola-bayar.index') ? 'active' : '' }}">
                        <a href="{{ route('pola-bayar.index') }}">
                            <i class="fa-solid fa-receipt"></i>
                            <span>Pola Bayar</span>
                        </a>
                    </li>
                    <li class="menu-item {{ Request::routeIs('alerts.index') ? 'active' : '' }}">
                        <a href="{{ route('alerts.index') }}">
                            <i class="fa-solid fa-bell"></i>
                            <span>Alert & Notifikasi</span>
                        </a>
                    </li>
                    <li class="menu-item {{ Request::routeIs('laporan.index') ? 'active' : '' }}">
                        <a href="{{ route('laporan.index') }}">
                            <i class="fa-solid fa-file-lines"></i>
                            <span>Laporan</span>
                        </a>
                    </li>
                </ul>

                <span class="menu-title">Konfigurasi</span>
                <ul class="menu-items">
                    @if(auth()->user()->role === 'admin')
                    <li class="menu-item {{ Request::routeIs('parameter.index') ? 'active' : '' }}">
                        <a href="{{ route('parameter.index') }}">
                            <i class="fa-solid fa-sliders"></i>
                            <span>Parameter Risk</span>
                        </a>
                    </li>
                    <li class="menu-item {{ Request::routeIs('data-master.index') ? 'active' : '' }}">
                        <a href="{{ route('data-master.index') }}">
                            <i class="fa-solid fa-database"></i>
                            <span>Data Master</span>
                        </a>
                    </li>
                    <li class="menu-item {{ Request::routeIs('users.index') ? 'active' : '' }}">
                        <a href="{{ route('users.index') }}">
                            <i class="fa-solid fa-user-gear"></i>
                            <span>Pengguna</span>
                        </a>
                    </li>
                    <li class="menu-item {{ Request::routeIs('settings.index') ? 'active' : '' }}">
                        <a href="{{ route('settings.index') }}">
                            <i class="fa-solid fa-gear"></i>
                            <span>Pengaturan</span>
                        </a>
                    </li>
                    @endif
                </ul>
            </nav>

            <!-- Bottom User Section matching screenshot -->
            <div class="sidebar-footer" style="margin-top: auto; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--border-color); padding-top: 15px;">
                <div class="sidebar-user" style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); padding: 10px 12px; border-radius: 12px; display: flex; align-items: center; gap: 10px; width: 100%;">
                    <div class="user-avatar" style="width: 32px; height: 32px; background: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 0.8rem;">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <div class="user-info" style="flex: 1; overflow: hidden; text-align: left;">
                        <div class="user-name" style="font-size: 0.85rem; font-weight: 600; color: #ffffff; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;" title="{{ auth()->user()->name }}">{{ auth()->user()->name }}</div>
                        <div class="user-role" style="font-size: 0.75rem; color: var(--text-muted); text-transform: capitalize;">
                            @if(auth()->user()->role === 'admin')
                                Administrator
                            @elseif(auth()->user()->role === 'analyst')
                                Analis Risiko
                            @else
                                Manajemen
                            @endif
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-down" style="font-size: 0.7rem; color: var(--text-muted);"></i>
                </div>
                
                <div class="menu-item" style="list-style: none;">
                    <form action="{{ route('logout') }}" method="POST" id="logout-form" style="display: none;">
                        @csrf
                    </form>
                    <a href="#" onclick="event.preventDefault(); document.getElementById('logout-form').submit();" style="display: flex; align-items: center; gap: 14px; padding: 10px 12px; color: var(--text-secondary); text-decoration: none; font-size: 0.9rem; border-radius: 12px; font-weight: 600; transition: var(--transition-smooth);">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        <span>Keluar</span>
                    </a>
                </div>
            </div>
        </aside>

        <!-- Main Content Section -->
        <main class="main-content">
            <!-- Top Header Bar -->
            <header class="top-header">
                <div>
                    <h2 class="page-title">@yield('header_title')</h2>
                    <p class="page-subtitle">@yield('header_subtitle')</p>
                </div>
                <div class="header-actions">
                    <button id="theme-toggle" class="glass-card" style="cursor: pointer; padding: 8px 16px; border-radius: 10px; font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 8px; border: 1px solid var(--border-color); background: rgba(255,255,255,0.03);">
                        <i id="theme-toggle-icon" class="fa-solid fa-sun" style="color: var(--color-cyan);"></i>
                        <span id="theme-toggle-text">Light Mode</span>
                    </button>
                    <div class="glass-card" style="padding: 8px 16px; border-radius: 10px; font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 8px;">
                        <i class="fa-regular fa-calendar"></i>
                        <span id="live-clock">Loading waktu...</span>
                    </div>
                </div>
            </header>

            <!-- Alerts -->
            @if(session('success'))
                <div class="alert alert-success">
                    <i class="fa-solid fa-circle-check"></i>
                    <span>{{ session('success') }}</span>
                </div>
            @endif

            @if($errors->any())
                <div class="alert alert-danger">
                    <i class="fa-solid fa-circle-xmark"></i>
                    <div>
                        @foreach($errors->all() as $error)
                            <p>{{ $error }}</p>
                        @endforeach
                    </div>
                </div>
            @endif

            <!-- Main Yield -->
            @yield('content')
        </main>
    </div>

    <!-- Script for Live Clock & Theme Toggle -->
    <script>
        function updateClock() {
            const now = new Date();
            const options = { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };
            document.getElementById('live-clock').innerText = now.toLocaleString('id-ID', options).replace(/\./g, ':');
        }
        setInterval(updateClock, 1000);
        updateClock();

        // Theme Toggle Script
        const themeToggle = document.getElementById('theme-toggle');
        const themeToggleIcon = document.getElementById('theme-toggle-icon');
        const themeToggleText = document.getElementById('theme-toggle-text');
        
        const currentTheme = localStorage.getItem('theme') || 'dark';
        if (currentTheme === 'light') {
            document.documentElement.classList.add('light-theme');
            if (themeToggleIcon) {
                themeToggleIcon.className = 'fa-solid fa-moon';
                themeToggleIcon.style.color = 'var(--color-purple)';
            }
            if (themeToggleText) {
                themeToggleText.innerText = 'Dark Mode';
            }
        } else {
            document.documentElement.classList.remove('light-theme');
            if (themeToggleIcon) {
                themeToggleIcon.className = 'fa-solid fa-sun';
                themeToggleIcon.style.color = 'var(--color-cyan)';
            }
            if (themeToggleText) {
                themeToggleText.innerText = 'Light Mode';
            }
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                if (document.documentElement.classList.contains('light-theme')) {
                    document.documentElement.classList.remove('light-theme');
                    localStorage.setItem('theme', 'dark');
                } else {
                    document.documentElement.classList.add('light-theme');
                    localStorage.setItem('theme', 'light');
                }
                window.location.reload();
            });
        }
    </script>

    @yield('scripts')
</body>
</html>
