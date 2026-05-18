<?php
require_once __DIR__ . '/../api/security.php';
require_once __DIR__ . '/../api/db.php';

// Limite de Tentativas (Bloqueio contra Brute Force)
$maxAttempts = 5;
$lockTime = 300; // 5 minutos em segundos

if (isset($_SESSION['lock_time']) && time() < $_SESSION['lock_time']) {
    $remaining = ceil(($_SESSION['lock_time'] - time()) / 60);
    $error = "Muitas tentativas malsucedidas. Acesso bloqueado por mais $remaining minuto(s).";
} else {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Valida o Token CSRF no login para evitar ataques de login forçado
        check_csrf();
        
        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';
        
        $stmt = $db->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            // Sucesso no login - Limpa tentativas malsucedidas
            unset($_SESSION['login_attempts']);
            unset($_SESSION['lock_time']);
            
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_user'] = $user['username'];
            header('Location: index.php');
            exit;
        } else {
            // Falha no login - Incrementa tentativas
            $_SESSION['login_attempts'] = ($_SESSION['login_attempts'] ?? 0) + 1;
            if ($_SESSION['login_attempts'] >= $maxAttempts) {
                $_SESSION['lock_time'] = time() + $lockTime;
                $error = "Muitas tentativas malsucedidas. Acesso bloqueado por 5 minutos.";
            } else {
                $attemptsLeft = $maxAttempts - $_SESSION['login_attempts'];
                $error = "Usuário ou senha incorretos! Resta(m) $attemptsLeft tentativa(s).";
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - LifeNet Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-[#050b14] h-screen flex items-center justify-center font-sans antialiased">
    <div class="bg-[#0a1122] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-white mb-2">LifeNet <span class="text-[#007BFF]">Admin</span></h1>
            <p class="text-gray-400 text-sm">Acesse o painel de controle</p>
        </div>
        
        <?php if (isset($error)): ?>
            <div class="bg-red-500/20 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-6 text-center">
                <?php echo $error; ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="login.php" class="space-y-6">
            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
            <div>
                <label class="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Usuário</label>
                <div class="relative">
                    <input type="text" name="username" required class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#007BFF] transition pl-10">
                    <i class="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                </div>
            </div>
            <div>
                <label class="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Senha de Acesso</label>
                <div class="relative">
                    <input type="password" name="password" required class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#007BFF] transition pl-10">
                    <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                </div>
            </div>
            
            <button type="submit" class="w-full bg-[#007BFF] hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition shadow-[0_0_15px_rgba(0,123,255,0.4)] uppercase tracking-widest text-sm">
                Entrar
            </button>

            <div class="text-center mt-6">
                <a href="forgot_password.php" class="text-gray-500 hover:text-white text-xs transition uppercase tracking-widest font-bold">Esqueci minha senha</a>
            </div>
        </form>
    </div>
</body>
</html>
