<?php
ob_start();
require_once __DIR__ . '/../api/security.php';
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once __DIR__ . '/../api/db.php';

$successMessage = '';
$errorMessage = '';

// Adicionar Plano
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add') {
    // Valida o Token CSRF
    check_csrf();

    $name = $_POST['name'] ?? '';
    $speed = $_POST['speed'] ?? '';
    $price = $_POST['price'] ?? '';
    $popular = isset($_POST['popular']) ? 1 : 0;
    $best_seller = isset($_POST['best_seller']) ? 1 : 0;
    $custom_badge = trim($_POST['custom_badge'] ?? '');
    $custom_badge_color = trim($_POST['custom_badge_color'] ?? '#007BFF');
    $benefits = $_POST['benefits'] ?? ''; // Pode ser salvo como lista separada por vírgula

    if ($name && $speed && $price) {
        $stmt = $db->prepare("INSERT INTO plans (name, speed, price, popular, best_seller, custom_badge, custom_badge_color, benefits) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$name, $speed, $price, $popular, $best_seller, $custom_badge, $custom_badge_color, $benefits]);
        header('Location: plans.php?success=1');
        exit;
    } else {
        $errorMessage = "Preencha os campos obrigatórios!";
    }
}

// Deletar Plano (Suporta POST e GET para máxima compatibilidade)
if (isset($_POST['delete_id']) || isset($_GET['delete_id'])) {
    // Valida Token CSRF
    $token = $_POST['csrf_token'] ?? $_GET['csrf_token'] ?? '';
    if (empty($token) || !isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        die('Erro de Segurança: Token de validação CSRF inválido ou expirado.');
    }

    $id = isset($_POST['delete_id']) ? (int)$_POST['delete_id'] : (int)$_GET['delete_id'];
    $stmt = $db->prepare("DELETE FROM plans WHERE id = ?");
    $stmt->execute([$id]);
    header('Location: plans.php?success=1');
    exit;
}

if (isset($_GET['success'])) {
    $successMessage = "Operação realizada com sucesso!";
}

// Buscar Planos
$plans = $db->query("SELECT * FROM plans ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Planos - LifeNet Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style></style>
</head>
<body class="bg-[#050b14] text-gray-200 font-sans antialiased min-h-screen flex">
    
    <!-- Sidebar -->
    <?php require_once __DIR__ . '/sidebar.php'; ?>

    <!-- Main Content -->
    <main class="flex-1 p-8 overflow-y-auto">
        <header class="flex justify-between items-center mb-10">
            <div>
                <h1 class="text-3xl font-bold text-white mb-1">Planos de Internet</h1>
                <p class="text-gray-400 text-sm">Gerencie os planos que aparecem no site.</p>
            </div>
        </header>

        <?php if ($successMessage): ?>
            <div class="bg-green-500/20 border border-green-500/50 text-green-500 p-4 rounded-xl mb-6"><i class="fa-solid fa-circle-check"></i> <?php echo $successMessage; ?></div>
        <?php endif; ?>
        <?php if ($errorMessage): ?>
            <div class="bg-red-500/20 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6"><i class="fa-solid fa-circle-xmark"></i> <?php echo $errorMessage; ?></div>
        <?php endif; ?>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Tabela de Planos Existentes -->
            <div class="lg:col-span-2 space-y-4">
                <h3 class="text-lg font-bold text-white mb-4">Planos Atuais</h3>
                
                <?php if (count($plans) === 0): ?>
                    <div class="bg-[#0a1122] border border-white/5 p-8 rounded-2xl text-center text-gray-500">
                        Nenhum plano cadastrado. Adicione um plano ao lado.
                    </div>
                <?php endif; ?>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <?php foreach($plans as $plan): 
                    $borderColor = $plan['popular'] ? 'border-orange-500/50 shadow-[0_0_15px_rgba(255,140,0,0.2)]' : (($plan['best_seller'] ?? 0) ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : (!empty($plan['custom_badge']) ? 'border-blue-500/50' : 'border-white/5'));
                    if (!empty($plan['custom_badge']) && !empty($plan['custom_badge_color'])) {
                        $borderColor = 'border-['.$plan['custom_badge_color'].']/50';
                    }
                ?>
                    <div class="bg-[#0a1122] border <?php echo $borderColor; ?> p-5 rounded-2xl relative" style="<?php echo (!empty($plan['custom_badge']) && !empty($plan['custom_badge_color'])) ? 'border-color: ' . htmlspecialchars($plan['custom_badge_color']) . '80;' : ''; ?>">
                        <?php if ($plan['popular']): ?>
                            <span class="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase">Destaque</span>
                        <?php endif; ?>
                        <?php if ($plan['best_seller'] ?? 0): ?>
                            <span class="absolute top-0 left-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-xl rounded-tl-2xl uppercase">Mais Vendido</span>
                        <?php endif; ?>
                        <?php if (!empty($plan['custom_badge'])): ?>
                            <span class="absolute top-0 right-0 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase" style="background-color: <?php echo htmlspecialchars($plan['custom_badge_color'] ?? '#007BFF'); ?>;">
                                <?php echo htmlspecialchars($plan['custom_badge']); ?>
                            </span>
                        <?php endif; ?>
                        
                        <div class="flex justify-between items-start mb-2">
                            <h4 class="text-2xl font-black text-white"><?php echo htmlspecialchars($plan['speed']); ?> <span class="text-xs text-blue-500">MEGA</span></h4>
                                <a href="javascript:void(0);" 
                                   onclick="confirmDelete('<?php echo $plan['id']; ?>', '<?php echo htmlspecialchars($plan['speed']); ?> MEGA')"
                                   style="cursor: pointer; z-index: 99; position: relative;"
                                   class="text-red-500 hover:text-red-400 bg-red-500/10 w-10 h-10 rounded-full flex items-center justify-center transition border border-red-500/20 shadow-lg">
                                    <i class="fa-solid fa-trash"></i>
                                </a>
                        </div>
                        <p class="text-[#007BFF] font-bold text-lg mb-2">R$ <?php echo htmlspecialchars($plan['price']); ?></p>
                        <p class="text-xs text-gray-400 uppercase tracking-widest font-bold mb-3"><?php echo htmlspecialchars($plan['name']); ?></p>
                        
                        <div class="flex gap-2 text-gray-500">
                            <i class="fa-solid fa-wifi"></i> <i class="fa-solid fa-gamepad"></i> <i class="fa-solid fa-tv"></i>
                        </div>
                    </div>
                <?php endforeach; ?>
                </div>
            </div>

            <!-- Formulário -->
            <div>
                <form method="POST" action="plans.php" class="bg-[#0a1122] border border-white/5 rounded-2xl p-6 sticky top-8">
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                    <input type="hidden" name="action" value="add">
                    <h3 class="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">Adicionar Novo Plano</h3>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-gray-400 text-xs font-bold uppercase mb-2">Nome do Plano</label>
                            <input type="text" name="name" required placeholder="Ex: Fibra Essencial" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#007BFF]">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-400 text-xs font-bold uppercase mb-2">Velocidade</label>
                                <input type="number" name="speed" required placeholder="Ex: 300" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#007BFF]">
                            </div>
                            <div>
                                <label class="block text-gray-400 text-xs font-bold uppercase mb-2">Preço (R$)</label>
                                <input type="text" name="price" required placeholder="Ex: 79,99" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#007BFF]">
                            </div>
                        </div>
                        
                        <div class="pt-2 flex flex-col gap-3">
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="popular" class="w-5 h-5 rounded border-white/10 bg-[#050b14] text-orange-500 focus:ring-orange-500 focus:ring-offset-[#0a1122]">
                                <span class="text-sm font-bold text-white">Marcar como Destaque</span>
                            </label>
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" name="best_seller" class="w-5 h-5 rounded border-white/10 bg-[#050b14] text-green-500 focus:ring-green-500 focus:ring-offset-[#0a1122]">
                                <span class="text-sm font-bold text-white">Marcar como Mais Vendido</span>
                            </label>
                        </div>

                        <!-- Etiqueta Customizada -->
                        <div class="pt-4 border-t border-white/5 space-y-4">
                            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest">Etiqueta Personalizada (Opcional)</h4>
                            <div>
                                <label class="block text-gray-400 text-[10px] font-bold uppercase mb-1">Texto da Etiqueta</label>
                                <input type="text" name="custom_badge" placeholder="Ex: Fibra Premium, 50% Off" class="w-full bg-[#050b14] border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#007BFF] text-sm">
                            </div>
                            <div>
                                <label class="block text-gray-400 text-[10px] font-bold uppercase mb-1.5">Cor da Etiqueta</label>
                                <div class="flex gap-3 items-center">
                                    <input type="color" name="custom_badge_color" value="#007BFF" class="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer">
                                    <span class="text-xs text-gray-500">Escolha a cor do badge</span>
                                </div>
                            </div>
                        </div>

                        <div class="pt-4">
                            <button type="submit" class="w-full bg-[#007BFF] hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition shadow-[0_0_15px_rgba(0,123,255,0.4)] text-sm uppercase">Adicionar Plano</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </main>
    <script>
        function confirmDelete(id, name) {
            Swal.fire({
                title: 'Excluir Plano?',
                text: "Você está prestes a remover o plano: " + name,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sim, excluir!',
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
