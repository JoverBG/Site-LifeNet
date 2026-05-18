<?php
session_start();
require_once __DIR__ . '/../api/db.php';

$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    
    $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        $token = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));
        
        $stmt = $db->prepare("UPDATE users SET reset_token = ?, token_expiry = ? WHERE id = ?");
        $stmt->execute([$token, $expiry, $user['id']]);
        
        $resetLink = "http://" . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . "/reset_password.php?token=" . $token;
        
        // Simulação de envio de e-mail (Tenta usar mail() mas avisa se falhar)
        $to = $email;
        $subject = "Recuperação de Senha - LifeNet Admin";
        $body = "Olá, você solicitou a recuperação de senha. Clique no link abaixo para redefinir:\n\n" . $resetLink;
        $headers = "From: no-reply@lifenett.com.br";
        
        if (@mail($to, $subject, $body, $headers)) {
            $message = "Um link de recuperação foi enviado para seu e-mail!";
        } else {
            // Se mail() falhar (comum em localhost), mostra o link para facilitar o teste
            $message = "Solicitação enviada! (Obs: Servidor de e-mail não configurado. Use este link: <a href='$resetLink' class='text-blue-500 underline'>Redefinir Senha</a>)";
        }
    } else {
        $error = "E-mail não encontrado!";
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
            <p class="text-gray-400 text-sm">Insira seu e-mail cadastrado</p>
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

        <form method="POST" action="forgot_password.php" class="space-y-6">
            <div>
                <label class="block text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">E-mail</label>
                <input type="email" name="email" required class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#007BFF] transition">
            </div>
            
            <button type="submit" class="w-full bg-[#007BFF] hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition uppercase tracking-widest text-sm">
                Enviar Link
            </button>
            <div class="text-center">
                <a href="login.php" class="text-gray-500 hover:text-white text-xs transition uppercase tracking-widest font-bold">Voltar ao Login</a>
            </div>
        </form>
    </div>
</body>
</html>
