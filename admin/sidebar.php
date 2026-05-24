<?php
// Sidebar compartilhada — inclua com: require_once __DIR__ . '/sidebar.php';
// Passe $currentPage = 'nome_da_pagina' antes de incluir.
$currentPage = $currentPage ?? '';
function sidebarLink($href, $icon, $label, $current) {
    $active = (basename($_SERVER['PHP_SELF']) === $href);
    $cls = $active ? 'bg-[#007BFF]/10 text-[#007BFF] font-medium' : 'hover:bg-white/5 text-gray-400 hover:text-white';
    echo "<a href=\"$href\" class=\"block py-2.5 px-4 rounded-xl $cls transition text-sm\"><i class=\"$icon w-6\"></i> $label</a>\n";
}
?>
<aside class="w-64 bg-[#0a1122] border-r border-white/5 hidden md:flex flex-col shrink-0">
    <div class="p-6 border-b border-white/5 text-center">
        <h2 class="text-xl font-black text-white">LifeNet <span class="text-[#007BFF]">Admin</span></h2>
    </div>
    <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <?php sidebarLink('index.php', 'fa-solid fa-house', 'Início', $currentPage); ?>

        <p class="text-[10px] text-gray-600 font-bold uppercase tracking-widest px-4 pt-4 pb-1">Site</p>
        <?php sidebarLink('settings.php',  'fa-solid fa-gear',          'Configurações',       $currentPage); ?>
        <?php sidebarLink('carousel.php',  'fa-solid fa-images',        'Carrossel Topo',      $currentPage); ?>
        <?php sidebarLink('plans.php',     'fa-solid fa-wifi',          'Planos',              $currentPage); ?>
        <?php sidebarLink('coverage.php',  'fa-solid fa-map-location-dot', 'Cobertura',        $currentPage); ?>
        <?php sidebarLink('services.php',  'fa-solid fa-heart-pulse',   'Serviços Monitorados',$currentPage); ?>

        <p class="text-[10px] text-gray-600 font-bold uppercase tracking-widest px-4 pt-4 pb-1">Dados</p>
        <?php sidebarLink('analytics.php', 'fa-solid fa-chart-pie',     'Analytics & Mapas',   $currentPage); ?>
        <?php sidebarLink('speedtests.php','fa-solid fa-gauge-high',    'Histórico Testes',    $currentPage); ?>

        <p class="text-[10px] text-gray-600 font-bold uppercase tracking-widest px-4 pt-4 pb-1">Conta</p>
        <?php sidebarLink('2fa-setup.php', 'fa-solid fa-shield-halved', 'Segurança / 2FA',     $currentPage); ?>
    </nav>
    <div class="p-4 border-t border-white/5">
        <a href="logout.php" class="block py-3 px-4 rounded-xl hover:bg-red-500/10 text-red-500 transition text-center font-bold text-sm uppercase tracking-widest">
            <i class="fa-solid fa-arrow-right-from-bracket mr-2"></i> Sair
        </a>
    </div>
</aside>
