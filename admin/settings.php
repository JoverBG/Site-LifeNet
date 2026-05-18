<?php
require_once __DIR__ . '/../api/security.php';
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once __DIR__ . '/../api/db.php';

$successMessage = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Valida o Token CSRF
    check_csrf();

    // Process form
    $settingsToUpdate = [
        'whatsapp_number', 'instagram_link',
        'customer_portal_link', 'contact_email', 'contact_address', 'speedtest_url'
    ];

    $stmt = $db->prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    
    foreach ($settingsToUpdate as $key) {
        if (isset($_POST[$key])) {
            $stmt->execute([$key, $_POST[$key]]);
        }
    }
    
    // Process Logo Uploads
    $logos = ['logo_top', 'logo_footer'];
    $allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];
    
    foreach ($logos as $logoKey) {
        if (isset($_FILES[$logoKey]) && $_FILES[$logoKey]['error'] === UPLOAD_ERR_OK) {
            $targetDir = __DIR__ . "/../uploads/";
            $fileExtension = strtolower(pathinfo($_FILES[$logoKey]["name"], PATHINFO_EXTENSION));
            
            // Validação de Extensão (Segurança Crucial contra RCE)
            if (!in_array($fileExtension, $allowedExtensions)) {
                $errorLogo = "Formato de arquivo inválido para o logotipo. Apenas imagens são permitidas.";
                continue;
            }
            
            // Validação extra por Tipo MIME de Imagem
            $mimeType = mime_content_type($_FILES[$logoKey]["tmp_name"]);
            if (strpos($mimeType, 'image/') !== 0) {
                $errorLogo = "Arquivo rejeitado: o conteúdo enviado não é uma imagem válida.";
                continue;
            }

            // Certifica de que a pasta uploads existe
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }

            $newFileName = $logoKey . "_" . time() . "." . $fileExtension;
            $targetFile = $targetDir . $newFileName;
            
            if (move_uploaded_file($_FILES[$logoKey]["tmp_name"], $targetFile)) {
                $imagePath = "uploads/" . $newFileName;
                $stmt->execute([$imagePath, $logoKey]);
            }
        }
    }
    
    
    // Troca de Senha
    if (!empty($_POST['new_password'])) {
        $newPass = password_hash($_POST['new_password'], PASSWORD_DEFAULT);
        $stmt = $db->prepare("UPDATE users SET password = ?, email = ? WHERE username = ?");
        $stmt->execute([$newPass, $_POST['admin_email'], $_SESSION['admin_user']]);
        $successMessage = "Configurações e Senha atualizadas!";
    } else {
        $stmt = $db->prepare("UPDATE users SET email = ? WHERE username = ?");
        $stmt->execute([$_POST['admin_email'], $_SESSION['admin_user']]);
        $successMessage = "Configurações salvas com sucesso!";
    }
}

// Buscar dados do usuário logado
$stmt = $db->prepare("SELECT email FROM users WHERE username = ?");
$stmt->execute([$_SESSION['admin_user']]);
$adminUser = $stmt->fetch(PDO::FETCH_ASSOC);

// Fetch current settings
$stmt = $db->query("SELECT * FROM settings");
$settings = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $settings[$row['key']] = $row['value'];
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurações - LifeNet Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-[#050b14] text-gray-200 font-sans antialiased min-h-screen flex">
    
    <!-- Sidebar -->
    <?php require_once __DIR__ . '/sidebar.php'; ?>

    <!-- Main Content -->
    <main class="flex-1 p-8 overflow-y-auto">
        <header class="flex justify-between items-center mb-10">
            <div>
                <h1 class="text-3xl font-bold text-white mb-1">Configurações Gerais</h1>
                <p class="text-gray-400 text-sm">Gerencie os links e integrações do site.</p>
            </div>
            <a href="../" target="_blank" class="bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 transition text-sm font-medium">
                <i class="fa-solid fa-arrow-up-right-from-square mr-2"></i> Ver Site
            </a>
        </header>

        <?php if ($successMessage): ?>
            <div class="bg-green-500/20 border border-green-500/50 text-green-500 p-4 rounded-xl mb-8 flex items-center gap-3">
                <i class="fa-solid fa-circle-check"></i> <?php echo $successMessage; ?>
            </div>
        <?php endif; ?>

        <?php if (isset($errorLogo)): ?>
            <div class="bg-red-500/20 border border-red-500/50 text-red-500 p-4 rounded-xl mb-8 flex items-center gap-3">
                <i class="fa-solid fa-triangle-exclamation"></i> <?php echo $errorLogo; ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="settings.php" enctype="multipart/form-data" class="bg-[#0a1122] border border-white/5 rounded-2xl p-8 shadow-lg max-w-4xl">
            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
            
            <h3 class="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4"><i class="fa-solid fa-address-book text-[#007BFF] mr-2"></i> Contato e Redes Sociais</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div>
                    <label class="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Número do WhatsApp</label>
                    <input type="text" name="whatsapp_number" value="<?php echo htmlspecialchars($settings['whatsapp_number'] ?? ''); ?>" placeholder="Ex: 5566992928124" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#007BFF] transition">
                    <p class="text-[10px] text-gray-500 mt-1">Apenas números, inclua código do país (55) e DDD.</p>
                </div>
                <div>
                    <label class="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Link do Instagram</label>
                    <input type="text" name="instagram_link" value="<?php echo htmlspecialchars($settings['instagram_link'] ?? ''); ?>" placeholder="https://instagram.com/seu_perfil" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#007BFF] transition">
                </div>
                <div>
                    <label class="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">E-mail de Contato</label>
                    <input type="email" name="contact_email" value="<?php echo htmlspecialchars($settings['contact_email'] ?? ''); ?>" placeholder="suporte@empresa.com.br" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#007BFF] transition">
                </div>
                <div>
                    <label class="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Área do Cliente (Link)</label>
                    <input type="text" name="customer_portal_link" value="<?php echo htmlspecialchars($settings['customer_portal_link'] ?? ''); ?>" placeholder="https://central.seu-provedor.com.br" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#007BFF] transition">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Endereço da Empresa</label>
                    <input type="text" name="contact_address" value="<?php echo htmlspecialchars($settings['contact_address'] ?? ''); ?>" placeholder="Rua Exemplo, 123 - Centro - Cidade/UF" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#007BFF] transition">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Link do Teste de Velocidade</label>
                    <input type="text" name="speedtest_url" value="<?php echo htmlspecialchars($settings['speedtest_url'] ?? 'https://www.speedtest.net/pt'); ?>" placeholder="https://www.speedtest.net/pt" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#007BFF] transition">
                </div>
            </div>

            <h3 class="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4 mt-10"><i class="fa-solid fa-user-shield text-red-500 mr-2"></i> Segurança da Conta</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <label class="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">E-mail do Administrador</label>
                    <input type="email" name="admin_email" value="<?php echo htmlspecialchars($adminUser['email'] ?? ''); ?>" required class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#007BFF] transition">
                    <p class="text-[10px] text-gray-500 mt-1">Usado para recuperação de senha.</p>
                </div>
                <div>
                    <label class="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Nova Senha (deixe vazio para manter)</label>
                    <input type="password" name="new_password" placeholder="********" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#007BFF] transition">
                </div>
            </div>

            <h3 class="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4"><i class="fa-solid fa-image text-purple-500 mr-2"></i> Logotipos</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div>
                    <label class="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Logo do Topo</label>
                    <div class="flex items-center gap-4">
                        <img src="../<?php echo htmlspecialchars($settings['logo_top'] ?? 'img/logotopo.png'); ?>" class="h-12 bg-white/5 p-2 rounded-lg">
                        <input type="file" name="logo_top" class="text-xs text-gray-500">
                    </div>
                </div>
                <div>
                    <label class="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Logo do Rodapé</label>
                    <div class="flex items-center gap-4">
                        <img src="../<?php echo htmlspecialchars($settings['logo_footer'] ?? 'img/logorodape.png'); ?>" class="h-12 bg-white/5 p-2 rounded-lg">
                        <input type="file" name="logo_footer" class="text-xs text-gray-500">
                    </div>
                </div>
            </div>

            <div class="flex justify-end pt-4 border-t border-white/10">
                <button type="submit" class="bg-[#007BFF] hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition shadow-[0_0_15px_rgba(0,123,255,0.4)]">
                    Salvar Alterações
                </button>
            </div>
        </form>
    </main>
</body>
</html>
