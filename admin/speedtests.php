<?php
require_once __DIR__ . '/../api/security.php';
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once __DIR__ . '/../api/db.php';

// Limpar histórico se solicitado
if (isset($_POST['clear_history'])) {
    // Valida Token CSRF
    check_csrf();

    $db->exec("DELETE FROM speedtests");
    $successMessage = "Histórico limpo com sucesso!";
}

// Buscar histórico (últimos 100)
$history = $db->query("SELECT * FROM speedtests ORDER BY created_at DESC LIMIT 100")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Histórico de Testes - LifeNet Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body class="bg-[#050b14] text-gray-200 font-sans antialiased min-h-screen flex">
    
    <!-- Sidebar -->
    <?php require_once __DIR__ . '/sidebar.php'; ?>

    <!-- Main Content -->
    <main class="flex-1 p-8 overflow-y-auto">
        <header class="flex justify-between items-center mb-10">
            <div>
                <h1 class="text-3xl font-bold text-white mb-1">Histórico de Speedtest</h1>
                <p class="text-gray-400 text-sm">Acompanhe quantos clientes iniciaram o teste de velocidade.</p>
            </div>
            <form id="clearForm" method="POST">
                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                <input type="hidden" name="clear_history" value="1">
                <button type="button" onclick="confirmClear()" class="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-5 py-2.5 rounded-xl border border-red-500/20 transition text-sm font-medium">
                    <i class="fa-solid fa-trash-can mr-2"></i> Limpar Tudo
                </button>
            </form>
        </header>

        <?php if (isset($successMessage)): ?>
            <div class="bg-green-500/20 border border-green-500/50 text-green-500 p-4 rounded-xl mb-6"><i class="fa-solid fa-circle-check"></i> <?php echo $successMessage; ?></div>
        <?php endif; ?>

        <div class="bg-[#0a1122] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
            <table class="w-full text-left">
                <thead class="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-widest">
                    <tr>
                        <th class="px-6 py-4">Data e Hora</th>
                        <th class="px-6 py-4">Endereço IP</th>
                        <th class="px-6 py-4">Localização</th>
                        <th class="px-6 py-4">Resultado</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    <?php if (count($history) === 0): ?>
                        <tr>
                            <td colspan="3" class="px-6 py-10 text-center text-gray-500 italic">Nenhum teste registrado ainda.</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach($history as $test): ?>
                            <tr class="hover:bg-white/5 transition">
                                <td class="px-6 py-4 text-sm text-white"><?php echo date('d/m/Y H:i:s', strtotime($test['created_at'])); ?></td>
                                <td class="px-6 py-4 text-sm text-gray-400 font-mono"><?php echo htmlspecialchars($test['ip_address']); ?></td>
                                <td class="px-6 py-4 text-sm text-gray-400"><?php echo htmlspecialchars($test['city'] . ' - ' . $test['region']); ?></td>
                                <td class="px-6 py-4">
                                    <span class="bg-green-500/10 text-green-500 text-xs font-bold px-3 py-1 rounded-lg border border-green-500/20"><?php echo htmlspecialchars($test['download_speed'] ?? '---'); ?></span>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </main>
    <script>
        function confirmClear() {
            Swal.fire({
                title: 'Limpar Histórico?',
                text: "Esta ação apagará todos os registros de testes permanentemente!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#3b82f6',
                confirmButtonText: 'Sim, limpar tudo!',
                cancelButtonText: 'Cancelar',
                background: '#0a1122',
                color: '#fff'
            }).then((result) => {
                if (result.isConfirmed) {
                    document.getElementById('clearForm').submit();
                }
            })
        }
    </script>
</body>
</html>
