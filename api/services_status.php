<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: max-age=120');

require_once __DIR__ . '/db.php';

// Busca serviços do banco de dados
$rows = $db->query("SELECT * FROM site_services ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);

// Se banco vazio, usa fallback padrão (primeiros 10 mais comuns)
if (empty($rows)) {
    $rows = [
        ['name' => 'YouTube',   'slug' => 'youtube',   'icon' => 'fa-brands fa-youtube',   'color' => '#FF0000', 'url' => 'https://www.youtube.com'],
        ['name' => 'WhatsApp',  'slug' => 'whatsapp',  'icon' => 'fa-brands fa-whatsapp',  'color' => '#25D366', 'url' => 'https://web.whatsapp.com'],
        ['name' => 'Instagram', 'slug' => 'instagram', 'icon' => 'fa-brands fa-instagram', 'color' => '#E1306C', 'url' => 'https://www.instagram.com'],
        ['name' => 'Facebook',  'slug' => 'facebook',  'icon' => 'fa-brands fa-facebook',  'color' => '#1877F2', 'url' => 'https://www.facebook.com'],
        ['name' => 'Netflix',   'slug' => 'netflix',   'icon' => 'fa-solid fa-film',       'color' => '#E50914', 'url' => 'https://www.netflix.com'],
        ['name' => 'TikTok',    'slug' => 'tiktok',    'icon' => 'fa-brands fa-tiktok',    'color' => '#69C9D0', 'url' => 'https://www.tiktok.com'],
        ['name' => 'Telegram',  'slug' => 'telegram',  'icon' => 'fa-brands fa-telegram',  'color' => '#2AABEE', 'url' => 'https://web.telegram.org'],
        ['name' => 'Google',    'slug' => 'google',    'icon' => 'fa-brands fa-google',    'color' => '#4285F4', 'url' => 'https://www.google.com'],
        ['name' => 'Twitch',    'slug' => 'twitch',    'icon' => 'fa-brands fa-twitch',    'color' => '#9146FF', 'url' => 'https://www.twitch.tv'],
        ['name' => 'Spotify',   'slug' => 'spotify',   'icon' => 'fa-brands fa-spotify',   'color' => '#1DB954', 'url' => 'https://open.spotify.com'],
    ];
}

// Verifica todos em paralelo via curl_multi
$mh         = curl_multi_init();
$handles    = [];
$startTimes = [];

foreach ($rows as $i => $svc) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $svc['url'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 6,
        CURLOPT_CONNECTTIMEOUT => 4,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS      => 3,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_USERAGENT      => 'Mozilla/5.0 (compatible; LifeNetMonitor/1.0)',
        CURLOPT_NOBODY         => true,
    ]);
    $handles[$i]    = $ch;
    $startTimes[$i] = microtime(true);
    curl_multi_add_handle($mh, $ch);
}

$running = null;
do {
    curl_multi_exec($mh, $running);
    curl_multi_select($mh, 0.1);
} while ($running > 0);

$results = [];
foreach ($rows as $i => $svc) {
    $ch       = $handles[$i];
    $ms       = round((microtime(true) - $startTimes[$i]) * 1000);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $errno    = curl_errno($ch);
    curl_multi_remove_handle($mh, $ch);
    curl_close($ch);

    if ($errno !== 0 || $httpCode === 0 || $httpCode >= 500) {
        $status = 'offline';
    } elseif ($ms > 3500) {
        $status = 'slow';
    } else {
        $status = 'online';
    }

    $results[] = [
        'name'   => $svc['name'],
        'slug'   => $svc['slug'],
        'icon'   => $svc['icon'],
        'color'  => $svc['color'],
        'status' => $status,
    ];
}

curl_multi_close($mh);

// Divide em páginas de 10
$pages = array_chunk($results, 10);

echo json_encode([
    'pages'      => $pages,
    'total'      => count($results),
    'checked_at' => date('H:i:s'),
]);
?>
