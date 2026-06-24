<?php
// api/db.php
// Conexão com o banco de dados SQLite

/**
 * Formata a velocidade de um plano em valor + unidade.
 * >= 1000 vira GIGA (1000->"1", 1500->"1.5", 2000->"2"); abaixo disso, MEGA.
 * Retorna ['value' => string, 'unit' => 'MEGA'|'GIGA'].
 */
function formatSpeed($speed) {
    $n = (int) preg_replace('/\D/', '', (string) $speed);
    if ($n >= 1000) {
        $val = rtrim(rtrim(number_format($n / 1000, 1, '.', ''), '0'), '.');
        return ['value' => $val, 'unit' => 'GIGA'];
    }
    return ['value' => (string) $n, 'unit' => 'MEGA'];
}

$dbPath = __DIR__ . '/../data/database.sqlite';
$dataDir = __DIR__ . '/../data';

// Cria o diretório de dados se não existir
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

try {
    $db = new PDO('sqlite:' . $dbPath);
    // Configura o PDO para lançar exceções em caso de erro
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Cria as tabelas se elas não existirem
    
    // Tabela de Configurações Gerais
    $db->exec("CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )");

    // Tabela de Planos
    $db->exec("CREATE TABLE IF NOT EXISTS plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        speed TEXT NOT NULL,
        price TEXT NOT NULL,
        popular INTEGER DEFAULT 0,
        best_seller INTEGER DEFAULT 0,
        custom_badge TEXT DEFAULT '',
        custom_badge_color TEXT DEFAULT '#007BFF',
        benefits TEXT NOT NULL
    )");

    // Tabela de Cobertura (Cidades/Bairros)
    $db->exec("CREATE TABLE IF NOT EXISTS coverage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location_name TEXT NOT NULL,
        neighborhood TEXT
    )");

    // Tabela para Logs de Speedtest
    $db->exec("CREATE TABLE IF NOT EXISTS speedtests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_address TEXT,
        city TEXT,
        region TEXT,
        latitude REAL,
        longitude REAL,
        download_speed TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Tabela para Logs de Busca de Cobertura
    $db->exec("CREATE TABLE IF NOT EXISTS coverage_searches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        search_query TEXT,
        ip_address TEXT,
        city TEXT,
        region TEXT,
        latitude REAL,
        longitude REAL,
        found INTEGER, -- 1 se encontrou cobertura, 0 se não
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Tabela para as imagens do Carrossel do Topo
    $db->exec("CREATE TABLE IF NOT EXISTS carousel_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_path TEXT NOT NULL,
        display_order INTEGER DEFAULT 0
    )");


    // Tabela de Serviços Monitorados (Status do Site)
    $db->exec("CREATE TABLE IF NOT EXISTS site_services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        icon TEXT NOT NULL,
        color TEXT DEFAULT '#007BFF',
        url TEXT NOT NULL,
        display_order INTEGER DEFAULT 0
    )");

    // Tabela para Usuários Admin
    $db->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT,
        password TEXT NOT NULL,
        reset_token TEXT,
        token_expiry DATETIME
    )");

    // Inserir usuário padrão se não existir (admin / admin123)
    $stmt = $db->query("SELECT COUNT(*) FROM users");
    if ($stmt->fetchColumn() == 0) {
        $hash = password_hash('admin123', PASSWORD_DEFAULT);
        $db->prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)")->execute(['admin', $hash, 'admin@seusite.com.br']);
    }

    // Inserir configurações padrão caso a tabela esteja vazia
    $stmt = $db->query("SELECT COUNT(*) FROM settings");
    if ($stmt->fetchColumn() == 0) {
        $defaultSettings = [
            ['whatsapp_number', '5566992928124'],
            ['instagram_link', 'https://www.instagram.com/lifenetmt/'],
            ['logo_top', 'img/logotopo.png'],
            ['logo_footer', 'img/logorodape.png']
        ];

        $insertStmt = $db->prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
        foreach ($defaultSettings as $setting) {
            $insertStmt->execute($setting);
        }
    }

    // Migração: Adicionar coluna neighborhood se não existir
    try {
        $db->exec("ALTER TABLE coverage ADD COLUMN neighborhood TEXT");
    } catch (Exception $e) {
        // Coluna já existe ou erro ignorável
    }

    // Migração: Adicionar coluna download_speed se não existir
    try {
        $db->exec("ALTER TABLE speedtests ADD COLUMN download_speed TEXT");
    } catch (Exception $e) { }

    // Migração: Adicionar colunas best_seller, custom_badge e custom_badge_color se não existirem
    try {
        $db->exec("ALTER TABLE plans ADD COLUMN best_seller INTEGER DEFAULT 0");
    } catch (Exception $e) { }
    try {
        $db->exec("ALTER TABLE plans ADD COLUMN custom_badge TEXT DEFAULT ''");
    } catch (Exception $e) { }
    try {
        $db->exec("ALTER TABLE plans ADD COLUMN custom_badge_color TEXT DEFAULT '#007BFF'");
    } catch (Exception $e) { }

    // Migração 2FA: colunas em users + tabela de backup codes
    try { $db->exec("ALTER TABLE users ADD COLUMN totp_secret TEXT"); } catch (Exception $e) { }
    try { $db->exec("ALTER TABLE users ADD COLUMN totp_enabled INTEGER DEFAULT 0"); } catch (Exception $e) { }
    $db->exec("CREATE TABLE IF NOT EXISTS totp_backup_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        code_hash TEXT NOT NULL,
        used_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Tabela de Visitas (analytics caseiro de acesso ao site)
    // IP real vem do beacon client-side (o servidor só enxerga o CCR edge 10.10.20.5)
    $db->exec("CREATE TABLE IF NOT EXISTS page_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_address TEXT,
        city TEXT,
        region TEXT,
        latitude REAL,
        longitude REAL,
        path TEXT,
        referrer TEXT,
        user_agent TEXT,
        is_bot INTEGER DEFAULT 0,
        visitor_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    // Índices p/ consultas do painel (por data e por visitante)
    try { $db->exec("CREATE INDEX IF NOT EXISTS idx_pv_created ON page_views(created_at)"); } catch (Exception $e) { }
    try { $db->exec("CREATE INDEX IF NOT EXISTS idx_pv_visitor ON page_views(visitor_id)"); } catch (Exception $e) { }

} catch(PDOException $e) {
    die("Erro ao conectar com o banco de dados: " . $e->getMessage());
}
?>
