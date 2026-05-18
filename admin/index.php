<?php
require_once __DIR__ . '/../api/security.php';
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

require_once __DIR__ . '/../api/db.php';

// Busca configurações atuais
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
    <title>Dashboard - LifeNet Admin</title>
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
                <h1 class="text-3xl font-bold text-white mb-1">Painel Administrativo</h1>
                <p class="text-gray-400 text-sm">Bem-vindo de volta, <span class="text-[#007BFF] font-bold"><?php echo htmlspecialchars($_SESSION['admin_user'] ?? 'Admin'); ?></span>!</p>
            </div>
            <a href="../" target="_blank" class="bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl border border-white/10 transition text-sm font-medium">
                <i class="fa-solid fa-arrow-up-right-from-square mr-2"></i> Ver Site
            </a>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Cards de Resumo -->
            <div class="bg-[#0a1122] border border-white/5 p-6 rounded-2xl shadow-lg">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <p class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Planos Cadastrados</p>
                        <h3 class="text-3xl font-black text-white">
                            <?php 
                                $count = $db->query("SELECT COUNT(*) FROM plans")->fetchColumn();
                                echo $count;
                            ?>
                        </h3>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-[#007BFF]/20 flex items-center justify-center text-[#007BFF]"><i class="fa-solid fa-wifi"></i></div>
                </div>
            </div>

            <div class="bg-[#0a1122] border border-white/5 p-6 rounded-2xl shadow-lg">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <p class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Testes de Velocidade</p>
                        <h3 class="text-3xl font-black text-white">
                            <?php 
                                $count = $db->query("SELECT COUNT(*) FROM speedtests")->fetchColumn();
                                echo $count;
                            ?>
                        </h3>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500"><i class="fa-solid fa-gauge-high"></i></div>
                </div>
            </div>

            <div class="bg-[#0a1122] border border-white/5 p-6 rounded-2xl shadow-lg">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <p class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Serviços Monitorados</p>
                        <h3 class="text-3xl font-black text-white">
                            <?php 
                                $count = $db->query("SELECT COUNT(*) FROM site_services")->fetchColumn();
                                echo $count;
                            ?>
                        </h3>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500"><i class="fa-solid fa-heart-pulse"></i></div>
                </div>
            </div>
        </div>

        <div class="mt-10 bg-[#0a1122] border border-white/5 rounded-2xl p-8 shadow-lg">
            <h2 class="text-xl font-bold text-white mb-4">Próximos Passos</h2>
            <p class="text-gray-400 mb-6">Para começar a gerenciar seu site, utilize o menu lateral para configurar as informações iniciais.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="settings.php" class="bg-[#050b14] border border-white/5 p-5 rounded-xl hover:border-blue-500/50 transition group flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <i class="fa-solid fa-phone text-blue-500 text-2xl group-hover:scale-110 transition"></i>
                        <div>
                            <h4 class="font-bold text-white">Contatos e Logos</h4>
                            <p class="text-xs text-gray-500">Configure WhatsApp e Instagram</p>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-right text-gray-600"></i>
                </a>
                <a href="services.php" class="bg-[#050b14] border border-white/5 p-5 rounded-xl hover:border-pink-500/50 transition group flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <i class="fa-solid fa-heart-pulse text-pink-500 text-2xl group-hover:scale-110 transition"></i>
                        <div>
                            <h4 class="font-bold text-white">Serviços Monitorados</h4>
                            <p class="text-xs text-gray-500">Escolha os serviços do site</p>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-right text-gray-600"></i>
                </a>
            </div>
        </div>
    </main>
</body>
</html>
