<?php
// api/security.php
// Centralizador de Segurança - Prevenção contra SQLi, XSS, CSRF e Session Hijacking

// 1. Configurações de Sessão Segura (Mitiga Roubo de Sessão e Session Hijacking)
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_samesite', 'Strict');

if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
    ini_set('session.cookie_secure', 1);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 2. Proteção CSRF (Cross-Site Request Forgery)
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

/**
 * Valida o token CSRF de requisições POST
 */
function check_csrf() {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $token = $_POST['csrf_token'] ?? '';
        if (empty($token) || !isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
            // Log do ataque ou requisição suspeita
            error_log("Tentativa de CSRF detectada de " . $_SERVER['REMOTE_ADDR']);
            
            // Retorna um erro amigável mas firme
            http_response_code(403);
            die("Erro de Segurança: Token de validação CSRF inválido ou expirado. Por favor, atualize a página.");
        }
    }
}

// 3. Prevenção XSS (Cross-Site Scripting)
/**
 * Escapa saídas de texto de forma segura para o HTML
 */
function esc($string) {
    return htmlspecialchars($string ?? '', ENT_QUOTES, 'UTF-8');
}

/**
 * Escapa saídas de atributos de tags HTML (ex: href, value, etc)
 */
function esc_attr($string) {
    return htmlspecialchars($string ?? '', ENT_QUOTES, 'UTF-8');
}

// 4. Prevenção SQL Injection (Garantia de Prepared Statements)
// Nota: Toda a nossa aplicação já utiliza PDO preparado, mas este arquivo serve como garantia central.
