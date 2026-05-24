<?php
require_once __DIR__ . '/../api/security.php';
require_once __DIR__ . '/../api/db.php';
require_once __DIR__ . '/../api/totp.php';

// Só acessível se houver login parcial pendente (senha já validada)
if (empty($_SESSION['pending_2fa_user_id'])) {
    header('Location: login.php');
    exit;
}

$user_id = (int) $_SESSION['pending_2fa_user_id'];
$username = $_SESSION['pending_2fa_username'] ?? '';

// Rate-limit do 2FA (independente do limite de senha)
$maxAttempts = 5;
$lockTime = 300; // 5 min

if (isset($_SESSION['2fa_lock']) && time() < $_SESSION['2fa_lock']) {
    $remaining = ceil(($_SESSION['2fa_lock'] - time()) / 60);
    $error = "Muitas tentativas. Bloqueado por $remaining minuto(s).";
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $code = preg_replace('/[\s-]/', '', $_POST['code'] ?? '');

    $stmt = $db->prepare("SELECT totp_secret FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $secret = $stmt->fetchColumn();

    $valid = false;

    // Tenta como código TOTP (6 dígitos)
    if ($secret && totp_verify($secret, $code)) {
        $valid = true;
    }
    // Se não, tenta como backup code (8 dígitos)
    elseif (ctype_digit($code) && strlen($code) === 8) {
        $stmt = $db->prepare("SELECT id, code_hash FROM totp_backup_codes WHERE user_id = ? AND used_at IS NULL");
        $stmt->execute([$user_id]);
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $bc) {
            if (password_verify($code, $bc['code_hash'])) {
                $db->prepare("UPDATE totp_backup_codes SET used_at = CURRENT_TIMESTAMP WHERE id = ?")
                   ->execute([$bc['id']]);
                $valid = true;
                break;
            }
        }
    }

    if ($valid) {
        unset($_SESSION['2fa_attempts'], $_SESSION['2fa_lock']);
        unset($_SESSION['pending_2fa_user_id'], $_SESSION['pending_2fa_username']);
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_user'] = $username;
        // Regenera session ID após escalada de privilégio
        session_regenerate_id(true);
        header('Location: index.php');
        exit;
    } else {
        $_SESSION['2fa_attempts'] = ($_SESSION['2fa_attempts'] ?? 0) + 1;
        if ($_SESSION['2fa_attempts'] >= $maxAttempts) {
            $_SESSION['2fa_lock'] = time() + $lockTime;
            // Limpa estado parcial pra forçar relogin completo
            unset($_SESSION['pending_2fa_user_id'], $_SESSION['pending_2fa_username']);
            $error = "Muitas tentativas. Bloqueado por 5 minutos. Faça login de novo depois.";
        } else {
            $resta = $maxAttempts - $_SESSION['2fa_attempts'];
            $error = "Código inválido. Resta(m) $resta tentativa(s).";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificação 2FA — LifeNet Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-[#050b14] h-screen flex items-center justify-center font-sans antialiased">
    <div class="bg-[#0a1122] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-white mb-2"><i class="fa-solid fa-shield-halved text-[#007BFF] mr-2"></i>Verificação 2FA</h1>
            <p class="text-gray-400 text-sm">Digite o código de <strong>6 dígitos</strong> do seu app authenticator,<br>ou um <strong>backup code de 8 dígitos</strong>.</p>
        </div>

        <?php if (isset($error)): ?>
            <div class="bg-red-500/20 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-6 text-center">
                <?= esc($error) ?>
            </div>
        <?php endif; ?>

        <?php if (!empty($_SESSION['pending_2fa_user_id'])): ?>
        <form method="POST" action="login_2fa.php" class="space-y-6">
            <input type="hidden" name="csrf_token" value="<?= esc($_SESSION['csrf_token']) ?>">
            <div>
                <label class="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Código</label>
                <input type="text" name="code" inputmode="numeric" autocomplete="one-time-code" required autofocus pattern="[0-9 \-]+" maxlength="14" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white text-center text-2xl tracking-[0.4em] focus:outline-none focus:border-[#007BFF] transition">
            </div>
            <button type="submit" class="w-full bg-[#007BFF] hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition shadow-[0_0_15px_rgba(0,123,255,0.4)] uppercase tracking-widest text-sm">
                Verificar
            </button>
        </form>
        <?php endif; ?>

        <div class="text-center mt-6">
            <a href="logout.php" class="text-gray-500 hover:text-white text-xs transition uppercase tracking-widest font-bold">Cancelar / Sair</a>
        </div>
    </div>
</body>
</html>
