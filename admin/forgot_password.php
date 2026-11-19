<?php
// Recuperação de senha do admin.
// O link de redefinição vai SÓ pro Telegram do responsável (chat fixo, configurado
// no servidor em /etc/lifenett/telegram.env — ver api/telegram.php). Nunca aparece
// na tela: antes, sem servidor de e-mail, a página exibia o link pra quem pedisse.
require_once __DIR__ . '/../api/security.php';
require_once __DIR__ . '/../api/db.php';
require_once __DIR__ . '/../api/telegram.php';

const RESET_TTL      = 1800; // link vale 30 min
const RESET_COOLDOWN = 120;  // no máximo 1 envio a cada 2 min (pra ninguém encher o Telegram)
const RESET_ORIGIN   = 'https://lifenett.com.br'; // fixo: não confiar no Host da requisição

$sent  = false;
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    check_csrf();
    $username = trim((string) ($_POST['username'] ?? ''));

    // Limite global, guardado em data/ (bloqueado no nginx), vale pra qualquer visitante
    $stampFile = __DIR__ . '/../data/reset_last_sent';
    $last = (int) @file_get_contents($stampFile);

    if ($username === '') {
        $error = 'Informe o usuário.';
    } elseif (time() - $last < RESET_COOLDOWN) {
        // Mesma resposta do sucesso: não revela nada; só não dispara outra mensagem
        $sent = true;
    } else {
        $stmt = $db->prepare('SELECT id, username FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            @file_put_contents($stampFile, (string) time());

            $token = bin2hex(random_bytes(32));
            // No banco fica só o hash: quem ler o SQLite não consegue usar o link
            $db->prepare('UPDATE users SET reset_token = ?, token_expiry = ? WHERE id = ?')
               ->execute([hash('sha256', $token), (string) (time() + RESET_TTL), $user['id']]);

            $link = RESET_ORIGIN . '/admin/reset_password.php?token=' . $token;
            $ip   = $_SERVER['REMOTE_ADDR'] ?? '?';
            $when = (new DateTime('now', new DateTimeZone('America/Cuiaba')))->format('d/m H:i');
            $h    = fn($s) => htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');

            $ok = telegram_send(
                "🔑 <b>Redefinição de senha — painel lifenett.com.br</b>\n"
                . "Usuário: <code>{$h($user['username'])}</code>\n"
                . "Pedido às {$h($when)} do IP <code>{$h($ip)}</code>\n\n"
                . "<a href=\"{$h($link)}\">Definir nova senha</a> (vale 30 min, uma vez só)\n\n"
                . "Não foi você? Ignore: sem o link a senha não muda."
            );
            if (!$ok) {
                // Não deixa um token válido pra trás se a mensagem não saiu
                $db->prepare('UPDATE users SET reset_token = NULL, token_expiry = NULL WHERE id = ?')->execute([$user['id']]);
                @unlink($stampFile);
                $error = 'Não foi possível enviar pelo Telegram agora. Tente de novo em instantes ou peça a redefinição pelo servidor.';
            } else {
                $sent = true;
            }
        } else {
            $sent = true; // usuário inexistente: mesma resposta, sem revelar
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Senha - LifeNet Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-[#050b14] h-screen flex items-center justify-center font-sans antialiased">
    <div class="bg-[#0a1122] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-white mb-2">Recuperar <span class="text-[#007BFF]">Senha</span></h1>
            <p class="text-gray-400 text-sm">O link para criar uma nova senha é enviado ao Telegram do responsável pelo painel.</p>
        </div>

        <?php if ($sent): ?>
            <div class="bg-green-500/20 border border-green-500/50 text-green-400 p-4 rounded-lg text-sm mb-6 text-center">
                <i class="fa-brands fa-telegram mr-1"></i>
                Se o usuário existir, o link foi enviado para o Telegram do responsável. Ele vale por 30 minutos.
            </div>
        <?php endif; ?>
        <?php if ($error): ?>
            <div class="bg-red-500/20 border border-red-500/50 text-red-500 p-4 rounded-lg text-sm mb-6 text-center">
                <?php echo esc($error); ?>
            </div>
        <?php endif; ?>

        <?php if (!$sent): ?>
        <form method="POST" action="forgot_password.php" class="space-y-6">
            <input type="hidden" name="csrf_token" value="<?php echo esc($_SESSION['csrf_token']); ?>">
            <div>
                <label class="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Usuário</label>
                <input type="text" name="username" required autocomplete="username" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#007BFF] transition">
            </div>

            <button type="submit" class="w-full bg-[#007BFF] hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition uppercase tracking-widest text-sm">
                <i class="fa-brands fa-telegram mr-1"></i> Enviar link pelo Telegram
            </button>
        </form>
        <?php endif; ?>
        <div class="text-center mt-6">
            <a href="login.php" class="text-gray-500 hover:text-white text-xs transition uppercase tracking-widest font-bold">Voltar ao Login</a>
        </div>
    </div>
</body>
</html>
