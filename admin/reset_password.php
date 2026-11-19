<?php
// Definição da nova senha a partir do link enviado pelo Telegram (forgot_password.php).
// O banco guarda só o sha256 do token e a validade em segundos desde 1970
// (comparada aqui no PHP: evita a diferença de fuso entre PHP e SQLite).
// A 2FA, se estiver ligada, continua valendo: quem tiver só o link não entra.
require_once __DIR__ . '/../api/security.php';
require_once __DIR__ . '/../api/db.php';

const MIN_PASSWORD = 10;

$message = '';
$error   = '';
$token   = (string) ($_GET['token'] ?? '');

if (!preg_match('/^[0-9a-f]{64}$/', $token)) {
    header('Location: login.php');
    exit;
}

$stmt = $db->prepare('SELECT id, username, token_expiry FROM users WHERE reset_token = ?');
$stmt->execute([hash('sha256', $token)]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !ctype_digit((string) $user['token_expiry']) || (int) $user['token_expiry'] < time()) {
    $user  = null;
    $error = 'Link inválido ou expirado. Peça um novo em "Esqueci minha senha".';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $user) {
    check_csrf();
    $password = (string) ($_POST['password'] ?? '');
    $confirm  = (string) ($_POST['confirm_password'] ?? '');

    if (mb_strlen($password) < MIN_PASSWORD) {
        $error = 'A senha precisa ter pelo menos ' . MIN_PASSWORD . ' caracteres.';
    } elseif ($password !== $confirm) {
        $error = 'As senhas não coincidem!';
    } else {
        // Uso único: o token some junto com a troca
        $db->prepare('UPDATE users SET password = ?, reset_token = NULL, token_expiry = NULL WHERE id = ?')
           ->execute([password_hash($password, PASSWORD_DEFAULT), $user['id']]);
        $message = 'Senha redefinida com sucesso! Você já pode fazer login.';
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="referrer" content="no-referrer">
    <title>Redefinir Senha - LifeNet Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-[#050b14] h-screen flex items-center justify-center font-sans antialiased">
    <div class="bg-[#0a1122] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-white mb-2">Nova <span class="text-[#007BFF]">Senha</span></h1>
            <p class="text-gray-400 text-sm"><?php echo $user && !$message ? 'Usuário <strong class="text-white">' . esc($user['username']) . '</strong>' : 'Defina sua nova senha de acesso'; ?></p>
        </div>

        <?php if ($message): ?>
            <div class="bg-green-500/20 border border-green-500/50 text-green-500 p-4 rounded-lg text-sm mb-6 text-center">
                <?php echo esc($message); ?>
            </div>
        <?php endif; ?>
        <?php if ($error): ?>
            <div class="bg-red-500/20 border border-red-500/50 text-red-500 p-4 rounded-lg text-sm mb-6 text-center">
                <?php echo esc($error); ?>
            </div>
        <?php endif; ?>

        <?php if ($user && !$message): ?>
        <form method="POST" action="reset_password.php?token=<?php echo esc_attr($token); ?>" class="space-y-6">
            <input type="hidden" name="csrf_token" value="<?php echo esc_attr($_SESSION['csrf_token']); ?>">
            <div>
                <label class="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Nova Senha (mín. <?php echo MIN_PASSWORD; ?> caracteres)</label>
                <input type="password" name="password" required minlength="<?php echo MIN_PASSWORD; ?>" autocomplete="new-password" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#007BFF] transition">
            </div>
            <div>
                <label class="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Confirmar Senha</label>
                <input type="password" name="confirm_password" required minlength="<?php echo MIN_PASSWORD; ?>" autocomplete="new-password" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#007BFF] transition">
            </div>

            <button type="submit" class="w-full bg-[#007BFF] hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition uppercase tracking-widest text-sm">
                Redefinir Senha
            </button>
        </form>
        <?php endif; ?>

        <div class="text-center mt-6">
            <a href="login.php" class="text-gray-500 hover:text-white text-xs transition uppercase tracking-widest font-bold">Voltar ao Login</a>
        </div>
    </div>
</body>
</html>
