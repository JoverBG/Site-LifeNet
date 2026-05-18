<?php
require_once __DIR__ . '/../api/security.php';
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once __DIR__ . '/../api/db.php';

$successMessage = '';
$errorMessage   = '';

// Catálogo de sugestões (não salvas no banco, apenas para exibição)
$suggestions = [
    ['name' => 'WhatsApp',               'slug' => 'whatsapp',                 'icon' => 'fa-brands fa-whatsapp',             'color' => '#25D366'],
    ['name' => 'Instagram',              'slug' => 'instagram',                'icon' => 'fa-brands fa-instagram',            'color' => '#E1306C'],
    ['name' => 'Facebook',               'slug' => 'facebook',                 'icon' => 'fa-brands fa-facebook',             'color' => '#1877F2'],
    ['name' => 'YouTube',                'slug' => 'youtube',                  'icon' => 'fa-brands fa-youtube',              'color' => '#FF0000'],
    ['name' => 'Netflix',                'slug' => 'netflix',                  'icon' => 'fa-solid fa-film',                  'color' => '#E50914'],
    ['name' => 'TikTok',                 'slug' => 'tiktok',                   'icon' => 'fa-brands fa-tiktok',               'color' => '#69C9D0'],
    ['name' => 'Telegram',               'slug' => 'telegram',                 'icon' => 'fa-brands fa-telegram',             'color' => '#2AABEE'],
    ['name' => 'Google',                 'slug' => 'google',                   'icon' => 'fa-brands fa-google',               'color' => '#4285F4'],
    ['name' => 'Nubank',                 'slug' => 'nubank',                   'icon' => 'fa-solid fa-credit-card',           'color' => '#8A05BE'],
    ['name' => 'Steam',                  'slug' => 'steam',                    'icon' => 'fa-brands fa-steam',                'color' => '#00ADEE'],
    ['name' => 'Spotify',                'slug' => 'spotify',                  'icon' => 'fa-brands fa-spotify',              'color' => '#1DB954'],
    ['name' => 'Twitch',                 'slug' => 'twitch',                   'icon' => 'fa-brands fa-twitch',               'color' => '#9146FF'],
    ['name' => 'Discord',                'slug' => 'discord',                  'icon' => 'fa-brands fa-discord',              'color' => '#5865F2'],
    ['name' => 'X / Twitter',            'slug' => 'twitter',                  'icon' => 'fa-brands fa-x-twitter',            'color' => '#FFFFFF'],
    ['name' => 'OpenAI / ChatGPT',       'slug' => 'openai-chatgpt',           'icon' => 'fa-solid fa-robot',                 'color' => '#10A37F'],
    ['name' => 'iFood',                  'slug' => 'ifood',                    'icon' => 'fa-solid fa-utensils',              'color' => '#EA1D2C'],
    ['name' => 'Shopee',                 'slug' => 'shopee',                   'icon' => 'fa-solid fa-bag-shopping',          'color' => '#EE4D2D'],
    ['name' => 'Mercado Livre',          'slug' => 'mercadolivre',             'icon' => 'fa-solid fa-tag',                   'color' => '#FFE600'],
    ['name' => 'AliExpress',             'slug' => 'aliexpress',               'icon' => 'fa-solid fa-cart-shopping',         'color' => '#FF4747'],
    ['name' => 'PlayStation Network',    'slug' => 'playstation-network',      'icon' => 'fa-brands fa-playstation',          'color' => '#003087'],
    ['name' => 'Xbox Live',              'slug' => 'xbox-live',                'icon' => 'fa-brands fa-xbox',                 'color' => '#107C10'],
    ['name' => 'Roblox',                 'slug' => 'roblox',                   'icon' => 'fa-solid fa-cube',                  'color' => '#FF3E3E'],
    ['name' => 'League of Legends',      'slug' => 'league-of-legends',        'icon' => 'fa-solid fa-gamepad',               'color' => '#F4C030'],
    ['name' => 'Valorant',               'slug' => 'valorant',                 'icon' => 'fa-solid fa-gun',                   'color' => '#FF4655'],
    ['name' => 'Microsoft 365 / Outlook', 'slug' => 'microsoft-365',          'icon' => 'fa-brands fa-microsoft',            'color' => '#EB3C00'],
    ['name' => 'Gmail / Google Drive',   'slug' => 'gmail',                    'icon' => 'fa-solid fa-envelope',              'color' => '#EA4335'],
    ['name' => 'Prime Video',            'slug' => 'amazon-prime-video',       'icon' => 'fa-solid fa-clapperboard',          'color' => '#00A8E1'],
    ['name' => 'Globo Play',             'slug' => 'globoplay',                'icon' => 'fa-solid fa-tv',                    'color' => '#E11D3F'],
    ['name' => 'Disney+',                'slug' => 'disney-plus',              'icon' => 'fa-solid fa-video',                 'color' => '#113CCF'],
    ['name' => 'HBO Max',                'slug' => 'hbo-max',                  'icon' => 'fa-solid fa-masks-theater',         'color' => '#5822B4'],
    ['name' => 'Pinterest',              'slug' => 'pinterest',                'icon' => 'fa-brands fa-pinterest',            'color' => '#BD081C'],
    ['name' => 'Caixa Econômica',        'slug' => 'caixa',                    'icon' => 'fa-solid fa-building-columns',      'color' => '#005CA9'],
    ['name' => 'Banco do Brasil',        'slug' => 'banco-do-brasil',          'icon' => 'fa-solid fa-building-columns',      'color' => '#FCFD04'],
    ['name' => 'Itaú',                   'slug' => 'itau',                     'icon' => 'fa-solid fa-building-columns',      'color' => '#EC7000'],
    ['name' => 'Bradesco',               'slug' => 'bradesco',                 'icon' => 'fa-solid fa-building-columns',      'color' => '#CC2229'],
    ['name' => 'Santander',              'slug' => 'santander',                'icon' => 'fa-solid fa-building-columns',      'color' => '#EC0000'],
    ['name' => 'Banco Inter',            'slug' => 'banco-inter',              'icon' => 'fa-solid fa-piggy-bank',            'color' => '#FF6B00'],
    ['name' => 'Claro',                  'slug' => 'claro-internet',           'icon' => 'fa-solid fa-signal',                'color' => '#E8001D'],
    ['name' => 'Vivo',                   'slug' => 'vivo',                     'icon' => 'fa-solid fa-mobile-screen',         'color' => '#660099'],
    ['name' => 'TIM',                    'slug' => 'tim',                      'icon' => 'fa-solid fa-signal',                'color' => '#004B92'],
    ['name' => 'Correios',               'slug' => 'correios',                 'icon' => 'fa-solid fa-truck',                 'color' => '#FFE600'],
];

// ADICIONAR serviço
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add') {
    // Valida o Token CSRF
    check_csrf();
    $name  = trim($_POST['name']  ?? '');
    $slug  = trim($_POST['slug']  ?? '');
    $icon  = trim($_POST['icon']  ?? '');
    $color = trim($_POST['color'] ?? '#007BFF');
    $url   = trim($_POST['url']   ?? '');

    if ($name && $slug && $icon && $url) {
        $stmt = $db->prepare("INSERT INTO site_services (name, slug, icon, color, url, display_order) VALUES (?, ?, ?, ?, ?, (SELECT COALESCE(MAX(display_order),0)+1 FROM site_services))");
        $stmt->execute([$name, $slug, $icon, $color, $url]);
        $successMessage = "Serviço \"$name\" adicionado!";
    } else {
        $errorMessage = "Preencha todos os campos.";
    }
    header('Location: services.php?success=' . urlencode($successMessage));
    exit;
}

// ADICIONAR a partir da sugestão
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_suggestion') {
    // Valida o Token CSRF
    check_csrf();
    $idx = (int)$_POST['idx'];
    if (isset($suggestions[$idx])) {
        $s    = $suggestions[$idx];
        $urls = [
            'youtube' => 'https://www.youtube.com', 'whatsapp' => 'https://web.whatsapp.com',
            'instagram' => 'https://www.instagram.com', 'facebook' => 'https://www.facebook.com',
            'netflix' => 'https://www.netflix.com', 'tiktok' => 'https://www.tiktok.com',
            'telegram' => 'https://web.telegram.org', 'google' => 'https://www.google.com',
            'twitch' => 'https://www.twitch.tv', 'spotify' => 'https://open.spotify.com',
            'twitter' => 'https://www.x.com', 'discord' => 'https://discord.com',
            'amazon' => 'https://www.amazon.com.br', 'mercadolivre' => 'https://www.mercadolivre.com.br',
            'nubank' => 'https://www.nubank.com.br', 'steam' => 'https://store.steampowered.com',
            'amazon-prime-video' => 'https://www.primevideo.com', 'globoplay' => 'https://globoplay.globo.com',
            'bradesco' => 'https://banco.bradesco', 'banco-inter' => 'https://www.bancointer.com.br',
            'claro-internet' => 'https://www.claro.com.br', 'vivo' => 'https://www.vivo.com.br',
            'openai-chatgpt' => 'https://chat.openai.com', 'ifood' => 'https://www.ifood.com.br',
        ];
        $url = $urls[$s['slug']] ?? 'https://' . $s['slug'] . '.com';
        // Verifica se já existe
        $exists = $db->prepare("SELECT id FROM site_services WHERE slug = ?");
        $exists->execute([$s['slug']]);
        if ($exists->fetch()) {
            header('Location: services.php?error=' . urlencode("Serviço \"{$s['name']}\" já está na lista!"));
        } else {
            $stmt = $db->prepare("INSERT INTO site_services (name, slug, icon, color, url, display_order) VALUES (?, ?, ?, ?, ?, (SELECT COALESCE(MAX(display_order),0)+1 FROM site_services))");
            $stmt->execute([$s['name'], $s['slug'], $s['icon'], $s['color'], $url]);
            header('Location: services.php?success=' . urlencode("Serviço \"{$s['name']}\" adicionado!"));
        }
        exit;
    }
}

// REMOVER serviço
if (isset($_GET['delete'])) {
    // Valida Token CSRF
    $token = $_GET['csrf_token'] ?? '';
    if (empty($token) || !isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        die('Erro de Segurança: Token de validação CSRF inválido ou expirado.');
    }

    $id = (int)$_GET['delete'];
    $db->prepare("DELETE FROM site_services WHERE id = ?")->execute([$id]);
    header('Location: services.php?success=' . urlencode("Serviço removido."));
    exit;
}

if (isset($_GET['success'])) $successMessage = htmlspecialchars($_GET['success']);
if (isset($_GET['error']))   $errorMessage   = htmlspecialchars($_GET['error']);

// Buscar serviços ativos
$activeServices = $db->query("SELECT * FROM site_services ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);
$activeSlugs    = array_column($activeServices, 'slug');
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Serviços Monitorados - LifeNet Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body class="bg-[#050b14] text-gray-200 font-sans antialiased min-h-screen flex">

    <!-- Sidebar -->
    <?php require_once __DIR__ . '/sidebar.php'; ?>

    <!-- Main -->
    <main class="flex-1 p-8 overflow-y-auto">
        <header class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-3xl font-bold text-white mb-1">Serviços Monitorados</h1>
                <p class="text-gray-400 text-sm">Escolha quais serviços aparecem na seção de status do site.</p>
            </div>
            <span class="bg-blue-500/10 text-blue-400 text-xs font-bold px-4 py-2 rounded-xl border border-blue-500/20">
                <i class="fa-solid fa-list-check mr-1"></i> <?php echo count($activeServices); ?> ativos
            </span>
        </header>

        <?php if ($successMessage): ?>
        <div class="bg-green-500/20 border border-green-500/40 text-green-400 p-4 rounded-xl mb-6 flex items-center gap-3">
            <i class="fa-solid fa-circle-check"></i> <?php echo $successMessage; ?>
        </div>
        <?php endif; ?>
        <?php if ($errorMessage): ?>
        <div class="bg-red-500/20 border border-red-500/40 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
            <i class="fa-solid fa-circle-xmark"></i> <?php echo $errorMessage; ?>
        </div>
        <?php endif; ?>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">

            <!-- COLUNA ESQUERDA: Lista ativa -->
            <div class="xl:col-span-2 space-y-6">

                <!-- Serviços Ativos -->
                <div class="bg-[#0a1122] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                    <div class="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <h3 class="text-sm font-black text-gray-300 tracking-widest uppercase"><i class="fa-solid fa-circle-check text-green-500 mr-2"></i> Lista Ativa no Site</h3>
                        <span class="text-[10px] text-gray-500"><?php echo count($activeServices); ?> / ilimitado</span>
                    </div>

                    <?php if (empty($activeServices)): ?>
                    <div class="px-6 py-12 text-center text-gray-500 italic text-sm">
                        <i class="fa-solid fa-plus-circle text-3xl mb-3 block text-gray-700"></i>
                        Nenhum serviço adicionado ainda. Use as sugestões ao lado ou adicione um personalizado.
                    </div>
                    <?php else: ?>
                    <div class="divide-y divide-white/5">
                        <?php foreach($activeServices as $svc): ?>
                        <div class="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition group">
                            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                                 style="background:<?php echo htmlspecialchars($svc['color']); ?>22; color:<?php echo htmlspecialchars($svc['color']); ?>;">
                                <i class="<?php echo htmlspecialchars($svc['icon']); ?>"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-bold text-white"><?php echo htmlspecialchars($svc['name']); ?></p>
                                <p class="text-[10px] text-gray-500 font-mono truncate"><?php echo htmlspecialchars($svc['url']); ?></p>
                            </div>
                            <a href="https://downdetector.com.br/status/<?php echo urlencode($svc['slug']); ?>/" target="_blank"
                               class="text-[10px] text-blue-400 hover:text-blue-300 border border-blue-500/20 px-2 py-1 rounded-lg transition shrink-0">
                                Downdetector
                            </a>
                            <button onclick="confirmRemove(<?php echo $svc['id']; ?>, '<?php echo htmlspecialchars($svc['name']); ?>')"
                                    class="text-red-500 hover:text-red-400 hover:bg-red-500/10 w-8 h-8 rounded-lg flex items-center justify-center transition shrink-0">
                                <i class="fa-solid fa-trash-can text-sm"></i>
                            </button>
                        </div>
                        <?php endforeach; ?>
                    </div>
                    <?php endif; ?>
                </div>

                <!-- Sugestões -->
                <div class="bg-[#0a1122] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                    <div class="bg-white/5 px-6 py-4 border-b border-white/5">
                        <h3 class="text-sm font-black text-gray-300 tracking-widest uppercase"><i class="fa-solid fa-wand-magic-sparkles text-yellow-400 mr-2"></i> Sugestões para usar no Site</h3>
                        <p class="text-[11px] text-gray-500 mt-1">Clique em <strong class="text-gray-300">+ Adicionar</strong> para incluir direto na lista ativa.</p>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 p-6">
                        <?php foreach($suggestions as $i => $s):
                            $isActive = in_array($s['slug'], $activeSlugs);
                        ?>
                        <div class="flex items-center gap-3 bg-[#050b14]/60 border <?php echo $isActive ? 'border-green-500/20 opacity-50' : 'border-white/5 hover:border-white/20'; ?> rounded-xl p-3 transition">
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                 style="background:<?php echo $s['color']; ?>22; color:<?php echo $s['color']; ?>;">
                                <i class="<?php echo $s['icon']; ?>"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs font-bold text-white truncate"><?php echo $s['name']; ?></p>
                                <?php if ($isActive): ?>
                                <span class="text-[9px] text-green-500 font-bold">✓ Ativo</span>
                                <?php else: ?>
                                <form method="POST" class="mt-0.5">
                                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                                    <input type="hidden" name="action" value="add_suggestion">
                                    <input type="hidden" name="idx" value="<?php echo $i; ?>">
                                    <button type="submit" class="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition">+ Adicionar</button>
                                </form>
                                <?php endif; ?>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <!-- COLUNA DIREITA: Formulário personalizado -->
            <div>
                <form method="POST" class="bg-[#0a1122] border border-white/5 rounded-2xl p-6 sticky top-8 shadow-xl">
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                    <input type="hidden" name="action" value="add">
                    <h3 class="text-sm font-black text-gray-300 tracking-widest uppercase mb-6 border-b border-white/10 pb-4">
                        <i class="fa-solid fa-plus-circle text-[#007BFF] mr-2"></i> Adicionar Personalizado
                    </h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Nome do Serviço</label>
                            <input type="text" name="name" required placeholder="Ex: Minha Operadora" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-[#007BFF] transition">
                        </div>
                        <div>
                            <label class="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Slug no Downdetector</label>
                            <input type="text" name="slug" required placeholder="Ex: minha-operadora" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-[#007BFF] transition">
                            <p class="text-[9px] text-gray-500 mt-1">O que aparece na URL: downdetector.com.br/status/<strong>slug</strong>/</p>
                        </div>
                        <div>
                            <label class="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">URL para Verificação</label>
                            <input type="url" name="url" required placeholder="https://www.site.com.br" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-[#007BFF] transition">
                        </div>
                        <div>
                            <label class="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Ícone (FontAwesome)</label>
                            <input type="text" name="icon" required placeholder="fa-solid fa-signal" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-[#007BFF] transition">
                            <p class="text-[9px] text-gray-500 mt-1">Use classes do <a href="https://fontawesome.com/icons" target="_blank" class="text-blue-400">FontAwesome</a></p>
                        </div>
                        <div>
                            <label class="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Cor do Ícone</label>
                            <div class="flex gap-2 items-center">
                                <input type="color" name="color" value="#007BFF" class="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer">
                                <span class="text-xs text-gray-500">Escolha a cor do ícone</span>
                            </div>
                        </div>
                        <div class="pt-2">
                            <button type="submit" class="w-full bg-[#007BFF] hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition shadow-[0_0_15px_rgba(0,123,255,0.4)] text-sm uppercase">
                                <i class="fa-solid fa-plus mr-1"></i> Adicionar Serviço
                            </button>
                        </div>
                    </div>
                </form>
            </div>

        </div>
    </main>

    <script>
        function confirmRemove(id, name) {
            Swal.fire({
                title: 'Remover Serviço?',
                text: "\"" + name + "\" será removido da lista do site.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#3b82f6',
                confirmButtonText: 'Sim, remover!',
                cancelButtonText: 'Cancelar',
                background: '#0a1122',
                color: '#fff'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '?delete=' + id + '&csrf_token=<?php echo $_SESSION['csrf_token']; ?>';
                }
            });
        }
    </script>
</body>
</html>
