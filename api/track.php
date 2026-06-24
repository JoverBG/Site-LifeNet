<?php
// api/track.php
// Registra uma visita ao site. O IP REAL chega no corpo da requisição
// (capturado no navegador do visitante via api.ipify.org), porque o nginx
// só enxerga o IP do CCR edge (10.10.20.5) por causa do hairpin masquerade.
// A geolocalização continua server-side, reusando o geo_helper (ip-api.com).

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'msg' => 'method not allowed']);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/geo_helper.php';

// Corpo JSON (enviado por fetch/sendBeacon). Limita tamanho contra abuso.
$raw = file_get_contents('php://input', false, null, 0, 8192);
$in  = json_decode($raw, true);
if (!is_array($in)) { $in = []; }

// IP real reportado pelo cliente — só aceita IP público válido.
// Se inválido/ausente, cai no REMOTE_ADDR (será o CCR, mas não quebra).
$clientIp = filter_var(
    $in['ip'] ?? '',
    FILTER_VALIDATE_IP,
    FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
);
$ip = $clientIp ?: ($_SERVER['REMOTE_ADDR'] ?? '');

$ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 400);

// Filtro de bot por User-Agent (metade do tráfego é scanner/crawler).
$isBot = preg_match(
    '/bot|crawl|spider|slurp|scan|curl|wget|python|go-http|java|libwww|headless|phantom|zgrab|censys|masscan|palo ?alto|expanse|nmap/i',
    $ua
) ? 1 : 0;

$path = substr($in['path'] ?? '/', 0, 300);
$ref  = substr($in['referrer'] ?? '', 0, 400);
$vid  = preg_replace('/[^A-Za-z0-9\-]/', '', substr($in['vid'] ?? '', 0, 64));

// Geolocaliza o IP real (server-side). Bots não geram chamada externa.
$geo = $isBot
    ? ['city' => '', 'region' => '', 'lat' => 0, 'lon' => 0]
    : getGeoData($ip);

try {
    $stmt = $db->prepare(
        "INSERT INTO page_views
            (ip_address, city, region, latitude, longitude, path, referrer, user_agent, is_bot, visitor_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $ip,
        $geo['city'],
        $geo['region'],
        $geo['lat'],
        $geo['lon'],
        $path,
        $ref,
        $ua,
        $isBot,
        $vid,
    ]);
    echo json_encode(['status' => 'ok']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error']);
}
