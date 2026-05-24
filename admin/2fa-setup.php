<?php
require_once __DIR__ . '/../api/security.php';
require_once __DIR__ . '/../api/db.php';
require_once __DIR__ . '/../api/totp.php';

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

$user_username = $_SESSION['admin_user'];
$stmt = $db->prepare("SELECT id, totp_enabled FROM users WHERE username = ?");
$stmt->execute([$user_username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
$user_id = (int) $user['id'];

$message = null;
$message_type = null;
$show_backup_codes = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $action = $_POST['action'] ?? '';

    if ($action === 'enable') {
        $secret = $_SESSION['setup_secret'] ?? null;
        $code = preg_replace('/\s/', '', $_POST['code'] ?? '');
        if ($secret && totp_verify($secret, $code)) {
            $db->prepare("UPDATE users SET totp_secret = ?, totp_enabled = 1 WHERE id = ?")
               ->execute([$secret, $user_id]);
            [$plain, $hashes] = totp_generate_backup_codes(6);
            $db->prepare("DELETE FROM totp_backup_codes WHERE user_id = ?")->execute([$user_id]);
            $ins = $db->prepare("INSERT INTO totp_backup_codes (user_id, code_hash) VALUES (?, ?)");
            foreach ($hashes as $h) $ins->execute([$user_id, $h]);
            unset($_SESSION['setup_secret']);
            $message = "2FA habilitado com sucesso! Guarde os backup codes abaixo — eles só aparecem agora.";
            $message_type = "success";
            $show_backup_codes = $plain;
            $user['totp_enabled'] = 1;
        } else {
            $message = "Código inválido. Verifique se a hora do seu celular está sincronizada e tente de novo.";
            $message_type = "error";
        }
    } elseif ($action === 'disable') {
        $pass = $_POST['password'] ?? '';
        $code = preg_replace('/\s/', '', $_POST['code'] ?? '');
        $stmt = $db->prepare("SELECT password, totp_secret FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (password_verify($pass, $row['password']) && totp_verify($row['totp_secret'], $code)) {
            $db->prepare("UPDATE users SET totp_secret = NULL, totp_enabled = 0 WHERE id = ?")
               ->execute([$user_id]);
            $db->prepare("DELETE FROM totp_backup_codes WHERE user_id = ?")->execute([$user_id]);
            $message = "2FA desabilitado.";
            $message_type = "success";
            $user['totp_enabled'] = 0;
        } else {
            $message = "Senha ou código inválido.";
            $message_type = "error";
        }
    } elseif ($action === 'regen_codes') {
        $code = preg_replace('/\s/', '', $_POST['code'] ?? '');
        $stmt = $db->prepare("SELECT totp_secret FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $sec = $stmt->fetchColumn();
        if ($sec && totp_verify($sec, $code)) {
            [$plain, $hashes] = totp_generate_backup_codes(6);
            $db->prepare("DELETE FROM totp_backup_codes WHERE user_id = ?")->execute([$user_id]);
            $ins = $db->prepare("INSERT INTO totp_backup_codes (user_id, code_hash) VALUES (?, ?)");
            foreach ($hashes as $h) $ins->execute([$user_id, $h]);
            $show_backup_codes = $plain;
            $message = "Backup codes regenerados. Os antigos foram invalidados.";
            $message_type = "success";
        } else {
            $message = "Código TOTP inválido.";
            $message_type = "error";
        }
    }
}

// Conta backup codes disponíveis
$backup_remaining = 0;
if (!empty($user['totp_enabled'])) {
    $stmt = $db->prepare("SELECT COUNT(*) FROM totp_backup_codes WHERE user_id = ? AND used_at IS NULL");
    $stmt->execute([$user_id]);
    $backup_remaining = (int) $stmt->fetchColumn();
}

// Se não está habilitado, gera secret temporário pra mostrar QR
if (empty($user['totp_enabled'])) {
    if (empty($_SESSION['setup_secret'])) {
        $_SESSION['setup_secret'] = totp_generate_secret();
    }
    $setup_secret = $_SESSION['setup_secret'];
    $uri = totp_uri($setup_secret, $user_username);
    $qr_url = "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=" . urlencode($uri);
}

$currentPage = '2fa';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Segurança 2FA — LifeNet Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-[#050b14] min-h-screen font-sans antialiased text-white flex">
<?php include __DIR__ . '/sidebar.php'; ?>
<main class="flex-1 p-8 overflow-auto">
    <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold mb-2"><i class="fa-solid fa-shield-halved text-[#007BFF] mr-2"></i>Autenticação de Dois Fatores</h1>
        <p class="text-gray-400 mb-8">Proteja sua conta exigindo um código do app authenticator no login.</p>

        <?php if ($message): ?>
            <div class="<?= $message_type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/20 border-red-500/50 text-red-400' ?> border p-4 rounded-lg mb-6">
                <?= esc($message) ?>
            </div>
        <?php endif; ?>

        <?php if ($show_backup_codes): ?>
            <div class="bg-yellow-500/10 border border-yellow-500/40 p-6 rounded-2xl mb-8">
                <h2 class="text-xl font-bold mb-3"><i class="fa-solid fa-key text-yellow-400 mr-2"></i>Seus Backup Codes</h2>
                <p class="text-sm text-gray-300 mb-4">Guarde estes códigos em local seguro (cofre de senhas, papel guardado). Cada um funciona <strong>uma única vez</strong>. Use se perder acesso ao authenticator.</p>
                <div class="grid grid-cols-2 gap-3 font-mono text-lg">
                    <?php foreach ($show_backup_codes as $c): ?>
                        <div class="bg-[#050b14] border border-white/10 rounded p-3 text-center"><?= esc($c) ?></div>
                    <?php endforeach; ?>
                </div>
                <p class="text-xs text-gray-500 mt-4">Esta lista <strong>não aparece novamente</strong>. Imprima ou salve agora.</p>
            </div>
        <?php endif; ?>

        <?php if (empty($user['totp_enabled'])): ?>
            <div class="bg-[#0a1122] border border-white/10 rounded-2xl p-8">
                <h2 class="text-xl font-bold mb-4">Habilitar 2FA</h2>
                <ol class="text-gray-300 space-y-3 mb-6 text-sm leading-relaxed list-decimal list-inside">
                    <li>Instale um app authenticator no celular: <em>Google Authenticator</em>, <em>Authy</em>, <em>1Password</em>, <em>Bitwarden</em>, etc.</li>
                    <li>Escaneie o QR code abaixo (ou digite o secret manualmente).</li>
                    <li>Digite o código de 6 dígitos que o app gerar pra confirmar.</li>
                </ol>
                <div class="flex flex-col md:flex-row gap-8 items-center mb-6">
                    <img src="<?= esc_attr($qr_url) ?>" alt="QR Code 2FA" class="bg-white rounded-lg p-2 shrink-0">
                    <div class="flex-1 w-full">
                        <label class="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Secret manual (se o QR não funcionar)</label>
                        <div class="bg-[#050b14] border border-white/10 rounded-lg p-3 font-mono text-sm break-all select-all"><?= esc(chunk_split($setup_secret, 4, ' ')) ?></div>
                    </div>
                </div>
                <form method="POST" class="space-y-4">
                    <input type="hidden" name="csrf_token" value="<?= esc($_SESSION['csrf_token']) ?>">
                    <input type="hidden" name="action" value="enable">
                    <div>
                        <label class="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Código de confirmação (6 dígitos do app)</label>
                        <input type="text" name="code" inputmode="numeric" autocomplete="one-time-code" required pattern="[0-9 ]{6,7}" maxlength="7" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white text-center text-xl tracking-widest focus:outline-none focus:border-[#007BFF]">
                    </div>
                    <button type="submit" class="bg-[#007BFF] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition uppercase tracking-widest text-sm">
                        <i class="fa-solid fa-shield-halved mr-2"></i>Ativar 2FA
                    </button>
                </form>
            </div>
        <?php else: ?>
            <div class="bg-green-500/10 border border-green-500/40 p-6 rounded-2xl mb-6">
                <h2 class="text-xl font-bold mb-2"><i class="fa-solid fa-shield-halved text-green-400 mr-2"></i>2FA está ativo</h2>
                <p class="text-sm text-gray-300">A próxima vez que você fizer login vai exigir o código do authenticator.</p>
                <p class="text-sm text-gray-400 mt-2">Backup codes restantes: <strong><?= $backup_remaining ?></strong> de 6.</p>
            </div>

            <?php if ($backup_remaining <= 2): ?>
                <div class="bg-[#0a1122] border border-white/10 rounded-2xl p-8 mb-6">
                    <h2 class="text-xl font-bold mb-2"><i class="fa-solid fa-rotate text-yellow-400 mr-2"></i>Regenerar backup codes</h2>
                    <p class="text-sm text-gray-400 mb-4">Você está com poucos backup codes restantes. Pra gerar 6 códigos novos (os antigos viram inválidos), confirme com seu código TOTP atual:</p>
                    <form method="POST" class="space-y-4">
                        <input type="hidden" name="csrf_token" value="<?= esc($_SESSION['csrf_token']) ?>">
                        <input type="hidden" name="action" value="regen_codes">
                        <input type="text" name="code" inputmode="numeric" autocomplete="one-time-code" required pattern="[0-9]{6}" maxlength="6" placeholder="000000" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white text-center text-xl tracking-widest focus:outline-none focus:border-[#007BFF]">
                        <button type="submit" class="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-xl transition uppercase tracking-widest text-sm">Regenerar</button>
                    </form>
                </div>
            <?php endif; ?>

            <div class="bg-[#0a1122] border border-white/10 rounded-2xl p-8">
                <h2 class="text-xl font-bold mb-4">Desabilitar 2FA</h2>
                <p class="text-sm text-gray-400 mb-4">Confirme com sua senha e código atual:</p>
                <form method="POST" class="space-y-4">
                    <input type="hidden" name="csrf_token" value="<?= esc($_SESSION['csrf_token']) ?>">
                    <input type="hidden" name="action" value="disable">
                    <div>
                        <label class="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Senha</label>
                        <input type="password" name="password" required class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#007BFF]">
                    </div>
                    <div>
                        <label class="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Código TOTP atual (6 dígitos)</label>
                        <input type="text" name="code" inputmode="numeric" autocomplete="one-time-code" required pattern="[0-9]{6}" maxlength="6" placeholder="000000" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white text-center text-xl tracking-widest focus:outline-none focus:border-[#007BFF]">
                    </div>
                    <button type="submit" class="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition uppercase tracking-widest text-sm">
                        <i class="fa-solid fa-shield-slash mr-2"></i>Desabilitar 2FA
                    </button>
                </form>
            </div>
        <?php endif; ?>
    </div>
</main>
</body>
</html>
