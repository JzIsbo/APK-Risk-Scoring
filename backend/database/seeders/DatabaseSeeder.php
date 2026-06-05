<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Users
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@risk.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Analis Risiko',
            'email' => 'analyst@risk.com',
            'password' => bcrypt('password'),
            'role' => 'analyst',
        ]);

        User::create([
            'name' => 'Manajemen User',
            'email' => 'management@risk.com',
            'password' => bcrypt('password'),
            'role' => 'management',
        ]);

        // 2. Seed Risk Parameters
        $parameters = [
            [
                'key' => 'dti',
                'name' => 'Rasio Utang (Debt to Income - DTI)',
                'weight' => 25.00,
                'criteria' => [
                    ['min' => 0, 'max' => 29.99, 'score' => 20, 'level' => 'Low'],
                    ['min' => 30, 'max' => 49.99, 'score' => 50, 'level' => 'Medium'],
                    ['min' => 50, 'max' => 9999, 'score' => 90, 'level' => 'High'],
                ]
            ],
            [
                'key' => 'payment_delay',
                'name' => 'Keterlambatan Pembayaran (Hari)',
                'weight' => 25.00,
                'criteria' => [
                    ['min' => 0, 'max' => 5, 'score' => 10, 'level' => 'Low'],
                    ['min' => 6, 'max' => 30, 'score' => 40, 'level' => 'Medium'],
                    ['min' => 31, 'max' => 9999, 'score' => 90, 'level' => 'High'],
                ]
            ],
            [
                'key' => 'credit_score',
                'name' => 'Skor Kredit',
                'weight' => 20.00,
                'criteria' => [
                    ['min' => 700, 'max' => 850, 'score' => 10, 'level' => 'Low'], // Credit score usually 300-850. Higher is better, so higher score gets LOW risk.
                    ['min' => 550, 'max' => 699, 'score' => 50, 'level' => 'Medium'],
                    ['min' => 0, 'max' => 549, 'score' => 95, 'level' => 'High'], // Lower credit score gets HIGH risk.
                ]
            ],
            [
                'key' => 'age',
                'name' => 'Usia Debitur',
                'weight' => 15.00,
                'criteria' => [
                    ['min' => 0, 'max' => 24, 'score' => 80, 'level' => 'High'],
                    ['min' => 25, 'max' => 54, 'score' => 25, 'level' => 'Low'],
                    ['min' => 55, 'max' => 150, 'score' => 45, 'level' => 'Medium'],
                ]
            ],
            [
                'key' => 'co_burden',
                'name' => 'Rasio Beban CO (%)',
                'weight' => 15.00,
                'criteria' => [
                    ['min' => 0, 'max' => 19.99, 'score' => 15, 'level' => 'Low'],
                    ['min' => 20, 'max' => 39.99, 'score' => 45, 'level' => 'Medium'],
                    ['min' => 40, 'max' => 100, 'score' => 85, 'level' => 'High'],
                ]
            ],
        ];

        foreach ($parameters as $param) {
            \App\Models\RiskParameter::create($param);
        }

        // 3. Seed Populations
        // We will seed a variety of data to make our charts interesting.
        $names = [
            'Budi Santoso', 'Siti Aminah', 'Rudi Hermawan', 'Dewi Lestari', 'Joko Widodo',
            'Slamet Riyadi', 'Kartini', 'Indah Permata', 'Agus Setiawan', 'Eko Prasetyo',
            'Rina Wijaya', 'Hendra Gunawan', 'Mega Utami', 'Aditya Putra', 'Sri Wahyuni',
            'Fajar Nugroho', 'Wulan Dari', 'Dedi Mulyadi', 'Ani Suryani', 'Taufik Hidayat',
            'Yusuf Mansur', 'Lilis Karlina', 'Bambang Pamungkas', 'Retno Marsudi', 'Prabowo Subianto',
            'Tri Rismaharini', 'Ganjar Pranowo', 'Anies Baswedan', 'Basuki Tjahaja', 'Gibran Rakabuming'
        ];

        $periods = ['2026-01', '2026-02', '2026-03', '2026-04'];
        $statuses = ['No Order', 'Active', 'Settled'];
        $co_classes = ['PR-1', 'PR-2', 'PR-3'];
        $patterns = ['L3', 'L4', 'L5'];
        $ambc_classes = ['PS-1', 'PS-2', 'PS-3', 'PS-4'];

        foreach ($names as $idx => $name) {
            // Generate some logical values
            $dti = rand(10, 75); // 10% to 75%
            $delay = rand(0, 90); // 0 to 90 days delay
            $credit = rand(450, 800); // 450 to 800 credit score
            $age = rand(19, 65); // 19 to 65 years old
            $co = rand(5, 60); // 5% to 60% load

            $period = $periods[$idx % count($periods)];
            $status = $statuses[$idx % count($statuses)];
            $co_class = $co_classes[$idx % count($co_classes)];
            $pattern = $patterns[$idx % count($patterns)];
            $ambc = $ambc_classes[$idx % count($ambc_classes)];

            \App\Models\Population::create([
                'name' => $name,
                'dti' => $dti,
                'payment_delay' => $delay,
                'credit_score' => $credit,
                'age' => $age,
                'co_burden' => $co,
                'status' => $status,
                'co_class' => $co_class,
                'payment_pattern' => $pattern,
                'ps_ambc' => $ambc,
                'period' => $period,
            ]);
        }

        // 4. Seed Settings
        \App\Models\Setting::create(['key' => 'risk_low_threshold', 'value' => '40']);
        \App\Models\Setting::create(['key' => 'risk_medium_threshold', 'value' => '70']);
    }
}
