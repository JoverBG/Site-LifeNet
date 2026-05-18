<?php
session_start();
require_once __DIR__ . '/../api/db.php';

$message = '';
$error = '';
$token = $_GET['token'] ?? '';

if (empty($token)) {
    header('Location: login.php');
    exit;
}

// Verificar se o token é válido e não expirou
$stmt = $db->prepare("SELECT * FROM users WHERE reset_token = ? AND token_expiry > CURRENT_TIMESTAMP");
$stmt->execute([$token]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    $error = "Token inválido ou expirado!";
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $user) {
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm_password'] ?? '';
    
    if ($password === $confirm) {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $db->prepare("UPDATE users SET password = ?, reset_token = NULL, token_expiry = NULL WHERE id = ?");
        $stmt->execute([$hash, $user['id']]);
        
        $message = "Senha redefinida com sucesso! Você já pode <a href='login.php' class='text-blue-500 underline'>fazer login</a>.";
    } else {
        $error = "As senhas não coincidem!";
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinir Senha - LifeNet Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-[#050b14] h-screen flex items-center justify-center font-sans antialiased">
    <div class="bg-[#0a1122] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-white mb-2">Nova <span class="text-[#007BFF]">Senha</span></h1>
            <p class="text-gray-400 text-sm">Defina sua nova senha de acesso</p>
        </div>
        
        <?php if ($message): ?>
            <div class="bg-green-500/20 border border-green-500/50 text-green-500 p-4 rounded-lg text-sm mb-6 text-center">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>
        <?php if ($error): ?>
            <div class="bg-red-500/20 border border-red-500/50 text-red-500 p-4 rounded-lg text-sm mb-6 text-center">
                <?php echo $error; ?>
            </div>
        <?php endif; ?>

        <?php if ($user && !$message): ?>
        <form method="POST" action="reset_password.php?token=<?php echo htmlspecialchars($token); ?>" class="space-y-6">
            <div>
                <label class="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Nova Senha</label>
                <input type="password" name="password" required class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#007BFF] transition">
            </div>
            <div>
                <label class="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Confirmar Senha</label>
                <input type="password" name="confirm_password" required class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#007BFF] transition">
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
