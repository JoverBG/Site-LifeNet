<?php
// api/telegram.php
// Envio de mensagens pelo bot do Telegram (o mesmo bot do painel/monitor do site).
// Usado pela recuperação de senha do admin: o link vai SÓ pro chat configurado
// no servidor, nunca aparece na tela nem vai pra um destino digitado no formulário.
//
// Configuração FORA do webroot e fora do git, com as mesmas chaves do monitor
// (/opt/lifebot-painel/.env na VPS):
//
//   /etc/lifenett/telegram.env   (dono root:www-data, modo 640)
//     PAINEL_TELEGRAM_BOT_TOKEN=123456:ABC...
//     PAINEL_TELEGRAM_CHAT_ID=123456789
//
// Não é um endpoint: acessar direto não devolve nada.

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    http_response_code(404);
    exit;
}

const TELEGRAM_ENV_FILE = '/etc/lifenett/telegram.env';

/** Lê token e chat do arquivo de configuração. Devolve null se faltar algo. */
function telegram_config(): ?array
{
    if (!is_readable(TELEGRAM_ENV_FILE)) return null;
    $cfg = [];
    foreach (file(TELEGRAM_ENV_FILE, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) continue;
        [$k, $v] = explode('=', $line, 2);
        $cfg[trim($k)] = trim(trim($v), "\"'");
    }
    $token = $cfg['PAINEL_TELEGRAM_BOT_TOKEN'] ?? '';
    $chat  = $cfg['PAINEL_TELEGRAM_CHAT_ID'] ?? '';
    return ($token !== '' && $chat !== '') ? ['token' => $token, 'chat' => $chat] : null;
}

/**
 * Manda uma mensagem (HTML do Telegram: <b>, <i>, <code>, <a>) pro chat configurado.
 * Devolve true se o Telegram aceitou.
 */
function telegram_send(string $html): bool
{
    $cfg = telegram_config();
    if (!$cfg) {
        error_log('telegram: ' . TELEGRAM_ENV_FILE . ' ausente ou incompleto');
        return false;
    }
    $ch = curl_init('https://api.telegram.org/bot' . $cfg['token'] . '/sendMessage');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query([
            'chat_id'                  => $cfg['chat'],
            'text'                     => $html,
            'parse_mode'               => 'HTML',
            'disable_web_page_preview' => 'true',
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_CONNECTTIMEOUT => 5,
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $ok = $code === 200 && (json_decode((string) $body, true)['ok'] ?? false) === true;
    if (!$ok) error_log("telegram: envio falhou (HTTP $code)"); // sem o corpo: pode ecoar o token
    return $ok;
}
