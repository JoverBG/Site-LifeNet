<?php
// api/status_oficial.php
// Status publicado pela própria empresa (página oficial de status), usado por
// services_status.php junto com o teste de resposta feito da rede LifeNet.
//
// O teste de resposta só vê se o site do serviço abre. Falhas parciais (login,
// mensagens, pagamento) não aparecem nele. A página oficial mostra o incidente
// quando a empresa confirma o problema.
//
// Não é um endpoint: acessar direto não devolve nada.

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    http_response_code(404);
    exit;
}

/**
 * Fontes oficiais por slug (o mesmo slug do admin / Downdetector).
 * - statuspage: páginas no formato Atlassian Statuspage (/api/v2/summary.json)
 * - google:     painel do Google Workspace, filtrado pelos produtos listados
 *
 * Só entra aqui quem publica status de forma pública e legível por máquina.
 * WhatsApp/Instagram/Facebook, YouTube, Netflix, bancos, Pix e operadoras NÃO
 * publicam (o metastatus.com da Meta cobre só produtos de empresa).
 */
const STATUS_OFICIAL_FONTES = [
    'discord'        => ['type' => 'statuspage', 'base' => 'https://discordstatus.com',        'label' => 'Discord'],
    'openai-chatgpt' => ['type' => 'statuspage', 'base' => 'https://status.openai.com',        'label' => 'OpenAI'],
    'twitch'         => ['type' => 'statuspage', 'base' => 'https://status.twitch.com',        'label' => 'Twitch'],
    'fortnite'       => ['type' => 'statuspage', 'base' => 'https://status.epicgames.com',     'label' => 'Epic Games'],
    'epic-games'     => ['type' => 'statuspage', 'base' => 'https://status.epicgames.com',     'label' => 'Epic Games'],
    'mercado-pago'   => ['type' => 'statuspage', 'base' => 'https://status.mercadopago.com',   'label' => 'Mercado Pago'],
    'zoom'           => ['type' => 'statuspage', 'base' => 'https://www.zoomstatus.com',       'label' => 'Zoom'],
    'gmail'          => ['type' => 'google', 'products' => ['Gmail', 'Google Drive'],          'label' => 'Google'],
];

const STATUS_OFICIAL_GOOGLE_URL  = 'https://www.google.com/appsstatus/dashboard/incidents.json';
const STATUS_OFICIAL_GOOGLE_PAGE = 'https://www.google.com/appsstatus/dashboard/';
const STATUS_OFICIAL_CACHE       = __DIR__ . '/../data/status_oficial_cache.json';
const STATUS_OFICIAL_TTL         = 120;  // segundos entre consultas às páginas oficiais
const STATUS_OFICIAL_MAX_AGE     = 900;  // se a consulta falhar, usa o último resultado até 15 min

/** URL a consultar para uma fonte (várias fontes podem dividir a mesma URL). */
function status_oficial_url(array $fonte): string
{
    return $fonte['type'] === 'google'
        ? STATUS_OFICIAL_GOOGLE_URL
        : rtrim($fonte['base'], '/') . '/api/v2/summary.json';
}

/** Página que a pessoa abre para ver o detalhe. */
function status_oficial_page(array $fonte): string
{
    return $fonte['type'] === 'google' ? STATUS_OFICIAL_GOOGLE_PAGE : rtrim($fonte['base'], '/');
}

/**
 * Interpreta a resposta de uma fonte.
 * Devolve ['level' => 'ok'|'minor'|'major', 'title' => ?string] ou null se não deu pra ler.
 */
function status_oficial_parse(array $fonte, string $body): ?array
{
    $d = json_decode($body, true);
    if (!is_array($d)) return null;

    if ($fonte['type'] === 'statuspage') {
        $indicator = $d['status']['indicator'] ?? null;
        if (!is_string($indicator)) return null;
        $level = ['none' => 'ok', 'minor' => 'minor', 'major' => 'major', 'critical' => 'major'][$indicator] ?? 'ok';

        // Incidente aberto mais grave (o summary.json só lista os não resolvidos)
        $title = null;
        $rank  = ['critical' => 3, 'major' => 2, 'minor' => 1, 'none' => 0];
        $best  = -1;
        foreach ($d['incidents'] ?? [] as $inc) {
            if (!is_array($inc) || in_array($inc['status'] ?? '', ['resolved', 'postmortem'], true)) continue;
            $r = $rank[$inc['impact'] ?? 'none'] ?? 0;
            if ($r > $best && !empty($inc['name'])) { $best = $r; $title = (string) $inc['name']; }
        }
        if ($level === 'ok' && $title === null) return ['level' => 'ok', 'title' => null];
        if ($level === 'ok') $level = 'minor'; // incidente aberto sem mudar o indicador geral
        return ['level' => $level, 'title' => $title ?? ($d['status']['description'] ?? null)];
    }

    if ($fonte['type'] === 'google') {
        if (!array_is_list($d)) return null;
        $level = 'ok';
        $title = null;
        foreach ($d as $inc) {
            if (!is_array($inc) || !empty($inc['end'])) continue; // já encerrado
            $names = array_column($inc['affected_products'] ?? [], 'title');
            if (!array_intersect($names, $fonte['products'])) continue;
            $impact = $inc['status_impact'] ?? '';
            if ($impact === 'SERVICE_INFORMATION') continue; // aviso, não falha
            $this_level = $impact === 'SERVICE_OUTAGE' ? 'major' : 'minor';
            if ($level !== 'major') {
                $level = $this_level;
                $title = implode(' / ', array_intersect($names, $fonte['products']));
            }
        }
        return ['level' => $level, 'title' => $title];
    }

    return null;
}

/**
 * Status oficial de cada slug pedido que tenha fonte conhecida.
 * Usa cache em disco (data/, bloqueado no nginx) pra não consultar as empresas a
 * cada visita; consulta em paralelo só as fontes vencidas.
 *
 * @param string[] $slugs
 * @return array<string, array{level:string,title:?string,url:string,source:string}>
 */
function status_oficial(array $slugs): array
{
    $fontes = array_intersect_key(STATUS_OFICIAL_FONTES, array_flip($slugs));
    if (!$fontes) return [];

    $cache = [];
    if (is_readable(STATUS_OFICIAL_CACHE)) {
        $cache = json_decode((string) @file_get_contents(STATUS_OFICIAL_CACHE), true) ?: [];
    }
    $now = time();

    // URLs vencidas (várias fontes podem dividir a mesma URL, ex.: Epic)
    $stale = [];
    foreach ($fontes as $fonte) {
        $url = status_oficial_url($fonte);
        if (($cache[$url]['at'] ?? 0) + STATUS_OFICIAL_TTL < $now) $stale[$url] = true;
    }

    if ($stale) {
        $mh = curl_multi_init();
        $hs = [];
        foreach (array_keys($stale) as $url) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 5,
                CURLOPT_CONNECTTIMEOUT => 3,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS      => 2,
                CURLOPT_USERAGENT      => 'Mozilla/5.0 (compatible; LifeNetMonitor/1.0)',
                CURLOPT_HTTPHEADER     => ['Accept: application/json'],
            ]);
            $hs[$url] = $ch;
            curl_multi_add_handle($mh, $ch);
        }
        do {
            curl_multi_exec($mh, $running);
            curl_multi_select($mh, 0.1);
        } while ($running > 0);

        foreach ($hs as $url => $ch) {
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $body = curl_multi_getcontent($ch);
            curl_multi_remove_handle($mh, $ch);
            curl_close($ch);
            if ($code === 200 && is_string($body) && $body !== '') {
                // Guarda o corpo cru: cada fonte que usa a URL interpreta do seu jeito
                $cache[$url] = ['at' => $now, 'body' => $body];
            }
        }
        curl_multi_close($mh);

        // Gravação atômica (várias visitas podem chegar juntas)
        $tmp = STATUS_OFICIAL_CACHE . '.' . getmypid() . '.tmp';
        if (@file_put_contents($tmp, json_encode($cache)) !== false) {
            @rename($tmp, STATUS_OFICIAL_CACHE);
        } else {
            @unlink($tmp);
        }
    }

    $out = [];
    foreach ($fontes as $slug => $fonte) {
        $url = status_oficial_url($fonte);
        $hit = $cache[$url] ?? null;
        if (!$hit || $hit['at'] + STATUS_OFICIAL_MAX_AGE < $now) continue; // sem dado recente: não opina
        $parsed = status_oficial_parse($fonte, $hit['body']);
        if (!$parsed) continue;
        $out[$slug] = $parsed + ['url' => status_oficial_page($fonte), 'source' => $fonte['label']];
    }
    return $out;
}
