<?php
require_once __DIR__ . '/../api/security.php';
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}
require_once __DIR__ . '/../api/db.php';

$successMessage = '';
$errorMessage = '';

// Upload de Nova Imagem
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['carousel_image'])) {
    // Valida o Token CSRF
    check_csrf();

    $targetDir = __DIR__ . "/../uploads/";
    $fileExtension = strtolower(pathinfo($_FILES["carousel_image"]["name"], PATHINFO_EXTENSION));
    
    // Extensões Permitidas (Segurança Crucial)
    $allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];
    if (!in_array($fileExtension, $allowedExtensions)) {
        $errorMessage = "Formato de arquivo inválido. Apenas imagens são permitidas.";
    } else {
        // Validação extra por Tipo MIME de Imagem
        $mimeType = mime_content_type($_FILES["carousel_image"]["tmp_name"]);
        if (strpos($mimeType, 'image/') !== 0) {
            $errorMessage = "Arquivo rejeitado: o conteúdo enviado não é uma imagem válida.";
        } else {
            // Certifica de que a pasta existe
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }

            $newFileName = "carousel_" . time() . "." . $fileExtension;
            $targetFile = $targetDir . $newFileName;
            
            if (move_uploaded_file($_FILES["carousel_image"]["tmp_name"], $targetFile)) {
                $imagePath = "uploads/" . $newFileName;
                $stmt = $db->prepare("INSERT INTO carousel_images (image_path) VALUES (?)");
                $stmt->execute([$imagePath]);
                $successMessage = "Imagem adicionada com sucesso!";
            } else {
                $errorMessage = "Erro ao mover o arquivo.";
            }
        }
    }
}

// Remover Imagem
if (isset($_GET['delete'])) {
    // Valida Token CSRF via GET para segurança na exclusão
    $token = $_GET['csrf_token'] ?? '';
    if (empty($token) || !isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        die('Erro de Segurança: Token de validação CSRF inválido ou expirado.');
    }
    
    $id = (int)$_GET['delete'];
    
    // Buscar caminho para apagar arquivo
    $stmt = $db->prepare("SELECT image_path FROM carousel_images WHERE id = ?");
    $stmt->execute([$id]);
    $path = $stmt->fetchColumn();
    
    if ($path && file_exists(__DIR__ . "/../" . $path)) {
        unlink(__DIR__ . "/../" . $path);
    }
    
    $stmt = $db->prepare("DELETE FROM carousel_images WHERE id = ?");
    $stmt->execute([$id]);
    $successMessage = "Imagem removida com sucesso!";
}

$images = $db->query("SELECT * FROM carousel_images ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Banner Carrossel - LifeNet Admin</title>
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
                <h1 class="text-3xl font-bold text-white mb-1">Banner Carrossel</h1>
                <p class="text-gray-400 text-sm">Gerencie as imagens que aparecem no topo do site.</p>
            </div>
        </header>

        <?php if ($successMessage): ?>
            <div class="bg-green-500/20 border border-green-500/50 text-green-500 p-4 rounded-xl mb-6"><i class="fa-solid fa-circle-check"></i> <?php echo $successMessage; ?></div>
        <?php endif; ?>
        <?php if ($errorMessage): ?>
            <div class="bg-red-500/20 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6"><i class="fa-solid fa-circle-xmark"></i> <?php echo $errorMessage; ?></div>
        <?php endif; ?>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Lista de Imagens -->
            <div class="lg:col-span-2 space-y-6">
                <h3 class="text-lg font-bold text-white mb-4">Imagens Atuais</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <?php if (count($images) === 0): ?>
                        <div class="col-span-2 bg-[#0a1122] border border-white/5 p-12 rounded-2xl text-center text-gray-500 italic">
                            Nenhum banner cadastrado. O site exibirá o padrão.
                        </div>
                    <?php endif; ?>
                    
                    <?php foreach($images as $img): ?>
                        <div class="bg-[#0a1122] border border-white/5 rounded-2xl overflow-hidden group relative">
                            <img src="../<?php echo htmlspecialchars($img['image_path']); ?>" class="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition">
                            <div class="p-4 flex justify-between items-center">
                                <span class="text-xs text-gray-500 font-mono">ID: <?php echo $img['id']; ?></span>
                                <a href="javascript:void(0);" onclick="confirmDelete('<?php echo $img['id']; ?>')" class="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition">
                                    <i class="fa-solid fa-trash"></i>
                                </a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Formulário de Upload -->
            <div>
                <form method="POST" enctype="multipart/form-data" class="bg-[#0a1122] border border-white/5 rounded-2xl p-8 sticky top-8">
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                    <h3 class="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4">Enviar Novo Banner</h3>
                    
                    <div class="space-y-6">
                        <div class="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-blue-500/50 transition cursor-pointer relative group">
                            <input type="file" name="carousel_image" required class="absolute inset-0 opacity-0 cursor-pointer">
                            <i class="fa-solid fa-cloud-arrow-up text-4xl text-gray-600 group-hover:text-blue-500 transition mb-3"></i>
                            <p class="text-sm text-gray-400">Clique para selecionar imagem</p>
                            <p class="text-[10px] text-gray-500 mt-2 font-semibold">Tamanho Recomendado: 1920x600px — Formatos: PNG, JPG, JPEG, WEBP, GIF, SVG</p>
                            <p class="text-[9px] text-blue-400 mt-1.5 font-bold">✨ O site redimensionará e adaptará a imagem automaticamente!</p>
                        </div>
                        
                        <button type="submit" class="w-full bg-[#007BFF] hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition shadow-[0_0_15px_rgba(0,123,255,0.4)] text-sm uppercase tracking-widest">
                            Subir Banner
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </main>
    <script>
        function confirmDelete(id) {
            Swal.fire({
                title: 'Remover Banner?',
                text: "Deseja excluir esta imagem do topo?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#3b82f6',
                confirmButtonText: 'Sim, excluir!',
                cancelButtonText: 'Cancelar',
                background: '#0a1122',
                color: '#fff'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '?delete=' + id + '&csrf_token=<?php echo $_SESSION['csrf_token']; ?>';
                }
            })
        }
    </script>
</body>
</html>
