<?php
// api/totp.php
// TOTP RFC 6238 — implementação nativa, sem dependências externas.
// HMAC-SHA1 + base32 (RFC 4648).

/**
 * Gera um secret base32 aleatório.
 * 20 bytes = 160 bits (recomendado pelo RFC 4226).
 */
function totp_generate_secret($bytes = 20) {
    return totp_base32_encode(random_bytes($bytes));
}

/**
 * Encode bytes em base32 (RFC 4648, sem padding).
 */
function totp_base32_encode($raw) {
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $bits = '';
    foreach (str_split($raw) as $b) {
        $bits .= str_pad(decbin(ord($b)), 8, '0', STR_PAD_LEFT);
    }
    $out = '';
    foreach (str_split($bits, 5) as $chunk) {
        $chunk = str_pad($chunk, 5, '0');
        $out .= $alphabet[bindec($chunk)];
    }
    return $out;
}

/**
 * Decode base32 (RFC 4648) → raw bytes. Ignora espaços e padding.
 */
function totp_base32_decode($b32) {
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $b32 = strtoupper(preg_replace('/[^A-Z2-7]/', '', $b32));
    $bits = '';
    foreach (str_split($b32) as $c) {
        $pos = strpos($alphabet, $c);
        if ($pos === false) continue;
        $bits .= str_pad(decbin($pos), 5, '0', STR_PAD_LEFT);
    }
    $bytes = '';
    foreach (str_split($bits, 8) as $byte) {
        if (strlen($byte) < 8) break;
        $bytes .= chr(bindec($byte));
    }
    return $bytes;
}

/**
 * Calcula o código TOTP para um timestamp específico.
 */
function totp_code($secret_b32, $time = null, $step = 30, $digits = 6) {
    $time = $time ?? time();
    $counter = (int) floor($time / $step);
    $bin_counter = pack('J', $counter); // 8 bytes big-endian (PHP 7.0+)
    $key = totp_base32_decode($secret_b32);
    $hash = hash_hmac('sha1', $bin_counter, $key, true);
    $offset = ord($hash[19]) & 0xf;
    $code = ((ord($hash[$offset]) & 0x7f) << 24
          | (ord($hash[$offset + 1]) & 0xff) << 16
          | (ord($hash[$offset + 2]) & 0xff) << 8
          | (ord($hash[$offset + 3]) & 0xff))
          % (10 ** $digits);
    return str_pad((string) $code, $digits, '0', STR_PAD_LEFT);
}

/**
 * Verifica código com tolerância de ±$window passos (cada step = 30s).
 * Janela=1 → aceita o código atual, o anterior e o próximo (defesa contra clock drift).
 */
function totp_verify($secret_b32, $code, $window = 1, $step = 30, $digits = 6) {
    $code = preg_replace('/\s/', '', $code ?? '');
    if (!ctype_digit($code) || strlen($code) !== $digits) return false;
    $now = time();
    for ($i = -$window; $i <= $window; $i++) {
        if (hash_equals(totp_code($secret_b32, $now + $i * $step, $step, $digits), $code)) {
            return true;
        }
    }
    return false;
}

/**
 * URI otpauth:// pra QR code do app authenticator.
 */
function totp_uri($secret_b32, $account, $issuer = 'LifeNet Admin') {
    return "otpauth://totp/"
        . rawurlencode($issuer) . ":" . rawurlencode($account)
        . "?secret=" . rawurlencode($secret_b32)
        . "&issuer=" . rawurlencode($issuer)
        . "&algorithm=SHA1&digits=6&period=30";
}

/**
 * Gera N backup codes (cada um com 8 dígitos).
 * Retorna [array de codes em texto plano, array de hashes pra salvar no DB].
 */
function totp_generate_backup_codes($n = 6) {
    $plain = [];
    $hashes = [];
    for ($i = 0; $i < $n; $i++) {
        $c = str_pad((string) random_int(0, 99999999), 8, '0', STR_PAD_LEFT);
        $plain[] = $c;
        $hashes[] = password_hash($c, PASSWORD_DEFAULT);
    }
    return [$plain, $hashes];
}
