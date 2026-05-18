<?php
ob_start();
require_once __DIR__ . '/../api/security.php';
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once __DIR__ . '/../api/db.php';

$successMessage = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['location'])) {
    // Valida o Token CSRF
    check_csrf();

    $location = trim($_POST['location']);
    $neighborhood = trim($_POST['neighborhood'] ?? '');
    if (!empty($location)) {
        $stmt = $db->prepare("INSERT INTO coverage (location_name, neighborhood) VALUES (?, ?)");
        $stmt->execute([$location, $neighborhood]);
        header('Location: coverage.php?success=1');
        exit;
    }
}

// Deletar Local (Suporta POST e GET para máxima compatibilidade)
if (isset($_POST['delete_id']) || isset($_GET['delete_id'])) {
    // Valida Token CSRF
    $token = $_POST['csrf_token'] ?? $_GET['csrf_token'] ?? '';
    if (empty($token) || !isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        die('Erro de Segurança: Token de validação CSRF inválido ou expirado.');
    }

    $id = isset($_POST['delete_id']) ? (int)$_POST['delete_id'] : (int)$_GET['delete_id'];
    $stmt = $db->prepare("DELETE FROM coverage WHERE id = ?");
    $stmt->execute([$id]);
    header('Location: coverage.php?success=1');
    exit;
}

if (isset($_GET['success'])) {
    $successMessage = "Operação realizada com sucesso!";
}

$coverages = $db->query("SELECT * FROM coverage ORDER BY location_name ASC")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cobertura - LifeNet Admin</title>
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
                <h1 class="text-3xl font-bold text-white mb-1">Locais de Cobertura</h1>
                <p class="text-gray-400 text-sm">Gerencie as cidades e bairros atendidos pela sua rede.</p>
            </div>
        </header>

        <?php if ($successMessage): ?>
            <div class="bg-green-500/20 border border-green-500/50 text-green-500 p-4 rounded-xl mb-6"><i class="fa-solid fa-circle-check"></i> <?php echo $successMessage; ?></div>
        <?php endif; ?>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
            <!-- Tabela de Cobertura -->
            <div class="space-y-4">
                <div class="bg-[#0a1122] border border-white/5 rounded-2xl overflow-hidden">
                    <div class="p-6 border-b border-white/5">
                        <h3 class="text-lg font-bold text-white"><i class="fa-solid fa-map-location-dot text-green-500 mr-2"></i> Locais Cadastrados</h3>
                    </div>
                    
                    <?php if (count($coverages) === 0): ?>
                        <div class="p-8 text-center text-gray-500">
                            Nenhum local cadastrado.
                        </div>
                    <?php else: ?>
                        <ul class="divide-y divide-white/5">
                            <?php foreach($coverages as $cov): ?>
                                <li class="flex items-center justify-between p-4 hover:bg-white/5 transition">
                                    <div class="flex items-center gap-3">
                                        <i class="fa-solid fa-location-dot text-gray-600"></i>
                                        <span class="text-white font-medium"><?php echo htmlspecialchars($cov['location_name']); ?></span>
                                        <?php if ($cov['neighborhood']): ?>
                                            <span class="text-gray-500 text-sm">- <?php echo htmlspecialchars($cov['neighborhood']); ?></span>
                                        <?php endif; ?>
                                    </div>
                                    <a href="javascript:void(0);" 
                                       onclick="confirmDelete('<?php echo $cov['id']; ?>', '<?php echo htmlspecialchars($cov['location_name']); ?>')"
                                       style="cursor: pointer; z-index: 99; position: relative;"
                                       class="text-red-500 hover:text-red-400 p-2 bg-red-500/10 rounded-lg border border-red-500/20 shadow-sm">
                                        <i class="fa-solid fa-trash"></i>
                                    </a>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Formulário -->
            <div>
                <form method="POST" action="coverage.php" class="bg-[#0a1122] border border-white/5 rounded-2xl p-6 sticky top-8">
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                    <h3 class="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">Adicionar Local</h3>
                    
                    <div class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-400 text-xs font-bold uppercase mb-2">Cidade</label>
                                <input type="text" name="location" required placeholder="Ex: Pontal do Araguaia" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500 transition">
                            </div>
                            <div>
                                <label class="block text-gray-400 text-xs font-bold uppercase mb-2">Bairro</label>
                                <input type="text" name="neighborhood" placeholder="Ex: Centro" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500 transition">
                            </div>
                        </div>
                        <p class="text-[10px] text-gray-500 mt-2 leading-relaxed">O sistema verificará tanto a cidade quanto o bairro quando o cliente buscar.</p>
                    </div>
                        
                        <div class="pt-2">
                            <button type="submit" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition shadow-[0_0_15px_rgba(34,197,94,0.4)] text-sm uppercase">Adicionar Cobertura</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </main>
    <script>
        function confirmDelete(id, name) {
            Swal.fire({
                title: 'Remover Local?',
                text: "Você está prestes a remover: " + name,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sim, remover!',
                cancelButtonText: 'Cancelar',
                background: '#0a1122',
                color: '#fff'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '?delete_id=' + id + '&csrf_token=<?php echo $_SESSION['csrf_token']; ?>';
                }
            })
        }
    </script>
</body>
</html>
