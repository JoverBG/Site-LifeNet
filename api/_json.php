<?php
// api/_json.php
// Helpers compartilhados pelos endpoints JSON de LEITURA do site
// (Fase 1 da migração pra Next.js: o PHP vira backend, o admin continua
// gravando no SQLite e estes endpoints só expõem o que o index.php já lê).
//
// Não é um endpoint: acessar direto não devolve nada.

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    http_response_code(404);
    exit;
}

// Sinaliza pro db.php que a saída tem que ser JSON (erro de conexão vira 500 JSON, não HTML)
define('LIFENET_JSON_API', true);
require_once __DIR__ . '/db.php';

// Origem pública FIXA: não confiar no Host da requisição (qualquer Host chega no vhost)
// nem no IP interno usado pelo Next na revalidação.
const SITE_PUBLIC_ORIGIN = 'https://lifenett.com.br';
const DEFAULT_WHATSAPP   = '5566992299589';

/**
 * Prepara a resposta: só GET/HEAD, JSON, CORS liberado pra leitura
 * (o front Next roda em outra origem durante o desenvolvimento) e
 * cache curto — o conteúdo vem do admin e muda pouco.
 */
function json_begin(int $maxAge = 60): void {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, HEAD, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Cache-Control: public, max-age=' . $maxAge);
    header('X-Content-Type-Options: nosniff');

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
    if ($method !== 'GET' && $method !== 'HEAD') {
        header('Allow: GET, HEAD, OPTIONS');
        json_error(405, 'method not allowed');
    }
}

function json_out($data): void {
    try {
        $body = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE | JSON_THROW_ON_ERROR);
    } catch (Throwable $e) {
        error_log('api json_out: ' . $e->getMessage());
        json_error(500, 'encode failed');
    }
    echo $body;
    exit;
}

/** Roda o leitor dentro de try/catch: erro de banco vira 500 JSON (o Next mantém a versão anterior). */
function json_run(callable $fn): void {
    try {
        json_out($fn());
    } catch (Throwable $e) {
        error_log('api ' . basename($_SERVER['SCRIPT_FILENAME'] ?? '') . ': ' . $e->getMessage());
        json_error(500, 'internal error');
    }
}

function json_error(int $code, string $msg): void {
    http_response_code($code);
    header('Cache-Control: no-store');
    echo json_encode(['error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Número de WhatsApp como o wa.me exige: só dígitos, com DDI.
 * O admin aceita "66 9 9229-9589" (sem 55) e o index.php usa cru; aqui
 * normaliza e prefixa 55 quando vier só DDD+número (10 ou 11 dígitos).
 */
function whatsapp_digits(string $raw): string {
    $d = ltrim(preg_replace('/\D/', '', $raw), '0'); // DDI/DDD nunca começam com 0 (tronco)
    if ($d === '') {
        return DEFAULT_WHATSAPP;
    }
    $len = strlen($d);
    if ($len === 10 || $len === 11) {
        $d = '55' . $d;
    }
    return $d;
}

/** Caminho relativo do webroot (img/x.png) → URL absoluta. Já absoluto passa direto. */
function abs_url(string $path): string {
    if ($path === '' || preg_match('#^https?://#i', $path)) {
        return $path;
    }
    return SITE_PUBLIC_ORIGIN . '/' . ltrim($path, '/');
}

// ---- Leitores (mesmas consultas e mesmos defaults do index.php) ----

/** Só as chaves que o site público usa; nada além disso sai daqui. */
function read_settings(PDO $db): array {
    $defaults = [
        'whatsapp_number'      => DEFAULT_WHATSAPP,
        'instagram_link'       => 'https://www.instagram.com/lifenetmt/',
        'logo_top'             => 'img/logotopo.png',
        'logo_footer'          => 'img/logorodape.png',
        'customer_portal_link' => 'https://lifenetgo.sgp.net.br/central',
        'contact_email'        => 'suporte@lifenett.com.br',
        'contact_address'      => 'Pontal do Araguaia - Mato Grosso / MT',
        'speedtest_url'        => 'https://www.speedtest.net/pt',
    ];
    $out = $defaults;
    $stmt = $db->query("SELECT key, value FROM settings");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if (array_key_exists($row['key'], $defaults) && $row['value'] !== null && $row['value'] !== '') {
            $out[$row['key']] = $row['value'];
        }
    }
    $out['logo_top_url']    = abs_url($out['logo_top']);
    $out['logo_footer_url'] = abs_url($out['logo_footer']);
    $out['whatsapp_digits'] = whatsapp_digits($out['whatsapp_number']);
    $out['whatsapp_link']   = 'https://wa.me/' . $out['whatsapp_digits'];
    return $out;
}

function read_plans(PDO $db, string $whatsapp): array {
    $rows = $db->query("SELECT * FROM plans ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);
    $out = [];
    foreach ($rows as $p) {
        $spd = formatSpeed($p['speed']);
        $label = $spd['value'] . ' ' . $spd['unit'];
        $benefits = array_values(array_filter(array_map('trim', explode(',', (string)($p['benefits'] ?? ''))), 'strlen'));
        $out[] = [
            'id'                 => (int)$p['id'],
            'name'               => $p['name'],
            'speed_mbps'         => (int)preg_replace('/\D/', '', (string)$p['speed']),
            'speed'              => ['value' => $spd['value'], 'unit' => $spd['unit'], 'label' => $label],
            'price'              => $p['price'],
            'popular'            => (int)$p['popular'] === 1,
            'best_seller'        => (int)($p['best_seller'] ?? 0) === 1,
            'custom_badge'       => (string)($p['custom_badge'] ?? ''),
            'custom_badge_color' => (string)($p['custom_badge_color'] ?? '#007BFF'),
            'benefits'           => $benefits,
            // Mesmo texto do botão "Assinar Agora" do index.php
            'whatsapp_link'      => 'https://wa.me/' . whatsapp_digits($whatsapp)
                . '?text=' . rawurlencode('Olá! Quero assinar o plano ' . $label . ' por R$ ' . $p['price'] . '.'),
        ];
    }
    return $out;
}

function read_coverage(PDO $db): array {
    $rows = $db->query("SELECT id, location_name, neighborhood FROM coverage ORDER BY location_name ASC")->fetchAll(PDO::FETCH_ASSOC);
    return array_map(fn($c) => [
        'id'            => (int)$c['id'],
        'location_name' => $c['location_name'],
        'neighborhood'  => $c['neighborhood'] ?? '',
    ], $rows);
}

function read_carousel(PDO $db): array {
    $rows = $db->query("SELECT id, image_path, display_order FROM carousel_images ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);
    return array_map(fn($i) => [
        'id'            => (int)$i['id'],
        'image_path'    => $i['image_path'],
        'url'           => abs_url($i['image_path']),
        'display_order' => (int)$i['display_order'],
    ], $rows);
}
