<?php
require_once __DIR__ . '/../api/security.php';
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once __DIR__ . '/../api/db.php';

// Buscar logs de speedtest
$speedtests = $db->query("SELECT * FROM speedtests ORDER BY created_at DESC LIMIT 100")->fetchAll(PDO::FETCH_ASSOC);

// Buscar logs de cobertura
$searches = $db->query("SELECT * FROM coverage_searches ORDER BY created_at DESC LIMIT 100")->fetchAll(PDO::FETCH_ASSOC);

// Totalizadores
$totalSpeed = $db->query("SELECT COUNT(*) FROM speedtests")->fetchColumn();
$totalSearch = $db->query("SELECT COUNT(*) FROM coverage_searches")->fetchColumn();
$foundSearch = $db->query("SELECT COUNT(*) FROM coverage_searches WHERE found = 1")->fetchColumn();

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics e Mapas - LifeNet Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        #map { height: 500px; border-radius: 1.5rem; border: 1px solid rgba(255,255,255,0.05); z-index: 10; }
        .leaflet-container { background: #050b14; }
        .leaflet-tile { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
    </style>
</head>
<body class="bg-[#050b14] text-gray-200 font-sans antialiased min-h-screen flex">
    
    <!-- Sidebar -->
    <?php require_once __DIR__ . '/sidebar.php'; ?>

    <!-- Main Content -->
    <main class="flex-1 p-8 overflow-y-auto">
        <header class="flex justify-between items-center mb-10">
            <div>
                <h1 class="text-3xl font-bold text-white mb-1">Mapa de Calor e Logs</h1>
                <p class="text-gray-400 text-sm">Visualize de onde vêm os cliques e pesquisas de cobertura.</p>
            </div>
            <div class="flex gap-4">
                <div class="bg-white/5 border border-white/5 px-4 py-2 rounded-xl text-center">
                    <p class="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Buscas Totais</p>
                    <p class="text-xl font-black text-white"><?php echo $totalSearch; ?></p>
                </div>
                <div class="bg-white/5 border border-white/5 px-4 py-2 rounded-xl text-center">
                    <p class="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Conversão Cobertura</p>
                    <p class="text-xl font-black text-green-500"><?php echo $totalSearch > 0 ? round(($foundSearch/$totalSearch)*100) : 0; ?>%</p>
                </div>
            </div>
        </header>

        <!-- Mapa -->
        <div class="bg-[#0a1122] border border-white/5 rounded-3xl p-6 mb-10 shadow-2xl">
            <div id="map"></div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Últimas Pesquisas -->
            <div class="bg-[#0a1122] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                <div class="bg-white/5 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                    <h3 class="text-sm font-black text-gray-400 tracking-widest uppercase">Últimas Pesquisas de Cobertura</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="text-[10px] uppercase tracking-widest text-gray-500 bg-white/5">
                            <tr>
                                <th class="px-6 py-3">Endereço/Query</th>
                                <th class="px-6 py-3">Localização</th>
                                <th class="px-6 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/5">
                            <?php foreach($searches as $s): ?>
                                <tr class="hover:bg-white/5 transition">
                                    <td class="px-6 py-4">
                                        <p class="text-sm font-bold text-white"><?php echo htmlspecialchars($s['search_query']); ?></p>
                                        <p class="text-[10px] text-gray-500 font-mono"><?php echo $s['ip_address']; ?></p>
                                    </td>
                                    <td class="px-6 py-4">
                                        <p class="text-xs text-gray-400"><?php echo htmlspecialchars($s['city']); ?>, <?php echo $s['region']; ?></p>
                                    </td>
                                    <td class="px-6 py-4 text-center">
                                        <?php if ($s['found']): ?>
                                            <span class="bg-green-500/20 text-green-500 px-2 py-1 rounded text-[10px] font-bold uppercase">Encontrado</span>
                                        <?php else: ?>
                                            <span class="bg-red-500/20 text-red-500 px-2 py-1 rounded text-[10px] font-bold uppercase">Não Atendido</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Últimos Speedtests -->
            <div class="bg-[#0a1122] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                <div class="bg-white/5 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                    <h3 class="text-sm font-black text-gray-400 tracking-widest uppercase">Últimos Cliques no Speedtest</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="text-[10px] uppercase tracking-widest text-gray-500 bg-white/5">
                            <tr>
                                <th class="px-6 py-3">IP</th>
                                <th class="px-6 py-3">Localização</th>
                                <th class="px-6 py-3 text-right">Data</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/5">
                            <?php foreach($speedtests as $st): ?>
                                <tr class="hover:bg-white/5 transition">
                                    <td class="px-6 py-4">
                                        <p class="text-sm font-bold text-white"><?php echo $st['ip_address']; ?></p>
                                    </td>
                                    <td class="px-6 py-4">
                                        <p class="text-xs text-gray-400"><?php echo htmlspecialchars($st['city']); ?>, <?php echo $st['region']; ?></p>
                                    </td>
                                    <td class="px-6 py-4 text-right text-[10px] text-gray-500">
                                        <?php echo date('d/m H:i', strtotime($st['created_at'])); ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>

    <script>
        // Inicializar o mapa
        var map = L.map('map').setView([-15.793889, -47.882778], 4);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Ícones Customizados
        var iconBlue = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
        var iconOrange = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
        var iconRed = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });

        // Adicionar marcadores de Speedtest (Azul)
        <?php foreach($speedtests as $st): if($st['latitude'] != 0): ?>
            L.marker([<?php echo $st['latitude']; ?>, <?php echo $st['longitude']; ?>], {icon: iconBlue})
             .addTo(map)
             .bindPopup("<b>Speedtest</b><br><?php echo $st['city']; ?><br><?php echo $st['ip_address']; ?>");
        <?php endif; endforeach; ?>

        // Adicionar marcadores de Cobertura (Laranja se achou, Vermelho se não)
        <?php foreach($searches as $s): if($s['latitude'] != 0): ?>
            L.marker([<?php echo $s['latitude']; ?>, <?php echo $s['longitude']; ?>], {icon: <?php echo $s['found'] ? 'iconOrange' : 'iconRed'; ?>})
             .addTo(map)
             .bindPopup("<b>Busca: <?php echo htmlspecialchars($s['search_query']); ?></b><br><?php echo $s['city']; ?><br><?php echo $s['found'] ? 'Atendido' : 'Não Atendido'; ?>");
        <?php endif; endforeach; ?>

        // Auto-zoom para os pontos
        var group = new L.featureGroup(Object.values(map._layers).filter(l => l instanceof L.Marker));
        if (group.getLayers().length > 0) {
            map.fitBounds(group.getBounds().pad(0.1));
        }
    </script>
</body>
</html>
