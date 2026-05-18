<?php
header('Content-Type: text/html; charset=UTF-8');
// Busca configurações do banco de dados SQLite
require_once __DIR__ . '/api/db.php';
$stmt = $db->query("SELECT * FROM settings");
$settings = [];
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $settings[$row['key']] = $row['value'];
}

$whatsapp = $settings['whatsapp_number'] ?? '5566992928124';
$instagram = $settings['instagram_link'] ?? 'https://www.instagram.com/lifenetmt/';
$logo_top = $settings['logo_top'] ?? 'img/logotopo.png';
$logo_footer = $settings['logo_footer'] ?? 'img/logorodape.png';
$portal_link = $settings['customer_portal_link'] ?? 'https://lifenetgo.sgp.net.br/central';
$email = $settings['contact_email'] ?? 'suporte@lifenett.com.br';
$address = $settings['contact_address'] ?? 'Pontal do Araguaia - Mato Grosso / MT';
$speedtest_url = $settings['speedtest_url'] ?? 'https://www.speedtest.net/pt';

// Busca Planos
$plans = $db->query("SELECT * FROM plans ORDER BY id ASC")->fetchAll(PDO::FETCH_ASSOC);

// Busca Coberturas
$coverages = $db->query("SELECT * FROM coverage ORDER BY location_name ASC")->fetchAll(PDO::FETCH_ASSOC);

// Busca Banners do Carrossel
$carousel_imgs = $db->query("SELECT * FROM carousel_images ORDER BY display_order ASC")->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LifeNet Telecom | Conectando você ao futuro</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
    <style>
        .swiper-pagination-bullet {
            background-color: #fff !important;
            opacity: 0.4 !important;
        }

        .swiper-pagination-bullet-active {
            opacity: 1 !important;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: #050b14;
            color: #ffffff;
            scroll-behavior: smooth;
        }

        .bg-card {
            background: rgba(10, 17, 34, 0.85);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .text-glow-blue {
            text-shadow: 0 0 15px rgba(0, 123, 255, 0.7);
        }

        .text-glow-orange {
            text-shadow: 0 0 15px rgba(255, 140, 0, 0.7);
        }

        .border-glow-blue {
            box-shadow: 0 0 20px rgba(0, 123, 255, 0.3);
            border-color: #007BFF;
        }

        .border-glow-orange {
            box-shadow: 0 0 20px rgba(255, 140, 0, 0.3);
            border-color: #FF8C00;
        }

        .bg-orange-gradient {
            background:
                linear-gradient(90deg, #FF8C00 0%, #ff4b00 100%);
        }

        /* Animações GSAP (elementos começam invisíveis) */
        .gs-reveal {
            opacity: 0;
            transform: translateY(30px);
        }

        #particles-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.4;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.4s ease-out forwards;
        }
    </style>
</head>

<body class="antialiased overflow-x-hidden bg-[#050b14]">
    <!-- Fundo Fixo (Corrige esticamento no celular) -->
    <div
        class="fixed inset-0 w-full h-full bg-[url('img/fundo.png')] bg-cover bg-center bg-no-repeat -z-20 opacity-30 pointer-events-none">
    </div>
    <canvas id="particles-canvas"></canvas> <!-- Navbar -->
    <nav
        class="flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/10 bg-[#050b14]/90 backdrop-blur-md sticky top-0 z-50">
        <div class="flex items-center gap-2"> <img src="<?php echo htmlspecialchars($logo_top); ?>" alt="LifeNet Telecom"
                class="h-20 md:h-28 w-auto object-contain"
                onerror="this.outerHTML='<div class=\'text-xl font-bold italic tracking-tighter\'><span class=\'text-[#007BFF]\'>Life</span><span class=\'text-[#FF8C00]\'>Net</span></div>'">
        </div>
        <div class="hidden lg:flex gap-8 text-xs font-bold text-gray-300 uppercase tracking-widest"> <a href="#"
                class="text-[#007BFF] border-b-2 border-[#007BFF] pb-1">Início</a> <a href="#planos"
                class="hover:text-white transition">Planos</a> <a href="#cobertura" class="hover:text-white 
            transition">Cobertura</a> <a href="https://lifenetgo.sgp.net.br/central" target="_blank"
                class="hover:text-[#FF8C00] transition">Central do Assinante</a> <a href="#contato"
                class="hover:text-white transition">Contato</a>
        </div>
        <div class="flex items-center gap-4"> <a href="<?php echo htmlspecialchars($instagram); ?>" target="_blank"
                class="flex items-center gap-3 bg-[#1a1a1a] border border-white/10 px-6 py-3 rounded-full text-sm md:text-base font-bold transition hover:bg-gray-800 hidden sm:flex">
                <i class="fa-brands fa-instagram text-pink-500 text-xl"></i> Instagram
            </a> <a href="https://wa.me/<?php echo htmlspecialchars($whatsapp); ?>" target="_blank"
                class="flex items-center gap-3 bg-[#25D366] px-6 py-3 rounded-full text-sm md:text-base font-bold transition hover:bg-green-600 text-white shadow-[0_0_20px_rgba(37,211,102,0.4)]">
                <i class="fa-brands fa-whatsapp text-xl"></i> <span class="hidden sm:inline">WhatsApp</span> </a>

            <button id="mobile-menu-btn"
                class="lg:hidden text-white ml-3 text-3xl focus:outline-none hover:text-[#007BFF] transition">
                <i class="fa-solid fa-bars"></i>
            </button>
        </div>

        <!-- Menu Mobile Dropdown -->
        <div id="mobile-menu"
            class="hidden absolute top-full left-0 w-full bg-[#050b14]/95 backdrop-blur-xl border-b border-white/10 flex-col items-center py-8 gap-8 z-40 lg:hidden shadow-2xl">
            <a href="#" class="mobile-link text-[#007BFF] font-black text-lg tracking-widest uppercase">Início</a>
            <a href="#planos"
                class="mobile-link text-white hover:text-[#007BFF] font-black text-lg tracking-widest uppercase transition">Planos</a>
            <a href="#cobertura"
                class="mobile-link text-white hover:text-[#007BFF] font-black text-lg tracking-widest uppercase transition">Cobertura</a>
            <a href="<?php echo htmlspecialchars($portal_link); ?>" target="_blank"
                class="mobile-link text-[#FF8C00] font-black text-lg tracking-widest uppercase transition">Central do
                Assinante</a>
            <a href="#contato"
                class="mobile-link text-white hover:text-[#007BFF] font-black text-lg tracking-widest uppercase transition">Contato</a>
        </div>
    </nav>
    <div class="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12">
        <!-- Banner Promo (Carrossel) -->
        <div
            class="swiper bannerSwiper gs-reveal w-full rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(255,140,0,0.3)]">
            <div class="swiper-wrapper">
                <?php if (count($carousel_imgs) > 0): ?>
                    <?php foreach($carousel_imgs as $img): ?>
                        <div class="swiper-slide relative w-full h-[260px] md:h-[380px] lg:h-[450px] rounded-[2rem] overflow-hidden">
                            <a href="https://wa.me/<?php echo htmlspecialchars($whatsapp); ?>" target="_blank" class="block w-full h-full cursor-pointer hover:opacity-95 transition">
                                <img src="<?php echo htmlspecialchars($img['image_path']); ?>" alt="Banner Promoção" class="w-full h-full object-cover">
                            </a>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <!-- Fallback: Slide 1 Original -->
                    <div class="swiper-slide relative w-full h-[260px] md:h-[380px] lg:h-[450px] rounded-[2rem] overflow-hidden">
                        <a href="https://wa.me/<?php echo htmlspecialchars($whatsapp); ?>" target="_blank"
                            class="block w-full h-full cursor-pointer hover:opacity-95 transition">
                            <img src="img/Carrossel1.png" alt="Promoção" class="w-full h-full object-cover">
                        </a>
                    </div>
                <?php endif; ?>

                <!-- Slide 2 -->
                <div
                    class="swiper-slide relative w-full h-[260px] md:h-[380px] lg:h-[450px] bg-gradient-to-r from-blue-700 to-indigo-900 flex items-center justify-between px-8 md:px-20 rounded-[2rem]">
                    <div
                        class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none rounded-[2rem]">
                    </div>
                    <div class="z-20 flex flex-col items-center md:items-start text-center md:text-left">
                        <div class="text-6xl md:text-8xl font-black italic tracking-tighter text-white leading-none">600
                        </div>
                        <div class="text-3xl md:text-5xl font-black italic text-cyan-400">MEGA</div>
                        <div
                            class="bg-black/30 backdrop-blur-sm text-white text-[10px] font-bold px-4 py-1.5 mt-3 rounded-full uppercase tracking-[0.2em] inline-block">
                            Plano Gamer + TV</div>
                    </div>
                    <div class="z-20 text-center flex flex-col items-center hidden lg:flex">
                        <p class="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-[-12px]">Melhor oferta
                        </p>
                        <div class="flex items-start"> <span class="text-2xl font-bold mt-6 mr-1 text-white">R$</span>
                            <span class="text-[10rem] font-black text-cyan-400 drop-shadow-2xl leading-none">99</span>
                            <div class="flex flex-col text-left mt-6 ml-1">
                                <span class="text-3xl font-bold text-white leading-none">,99</span> <span
                                    class="text-2xl font-bold text-white">/mês</span>
                            </div>
                        </div>
                    </div>
                           <div class="z-20 hidden md:block"> <a
                            href="https://wa.me/<?php echo htmlspecialchars($whatsapp); ?>?text=Olá! Vi o banner de 600 Mega e quero assinar."
                            target="_blank"
                            class="bg-blue-600 hover:bg-blue-500 border-2 border-white text-white font-black italic text-xl px-10 py-5 rounded-full shadow-[0_0_30px_rgba(0,123,255,0.6)] transform hover:scale-105 transition block text-center leading-tight">ASSINE
                            JÁ SEM<br>SAIR DE CASA </a> </div>
                </div>
            </div>
            <!-- Paginação -->
            <div class="swiper-pagination"></div>
        </div> <!-- Seção Hero -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center gs-reveal">
            <div>
                <p class="text-[#007BFF] font-bold tracking-[0.3em] text-xs mb-4 uppercase">Internet Fibra Óptica</p>
                <h1 class="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] text-white">
                    Conexão que<br> transforma </h1>
                <p class="text-gray-400 text-lg mb-8 max-w-md leading-relaxed">Ultravelocidade, estabilidade e
                    atendimento que você merece. Conecte-se com o futuro com
                    a <span class="text-[#007BFF] font-bold">LifeNet</span>.</p>

                    <div class="flex flex-wrap items-center gap-4 mb-10"> <a href="#planos"
                        class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-10 rounded-xl flex items-center gap-2 transition shadow-[0_0_20px_rgba(0,123,255,0.4)] transform hover:-translate-y-1">
                        Ver Planos <i class="fa-solid fa-chevron-right text-xs"></i>
                    </a> <a href="https://wa.me/<?php echo htmlspecialchars($whatsapp); ?>" target="_blank"
                        class="bg-transparent border border-white/20 hover:bg-white/5 text-white font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 transition transform hover:-translate-y-1">
                        <i class="fa-brands fa-whatsapp text-green-500 text-xl"></i> Falar no WhatsApp
                    </a> </div>
                <div class="flex items-center gap-4">
                    <!-- Stats removidas a pedido do usuário -->
                </div>
            </div>
            <div class="relative flex justify-center items-center h-[350px] md:h-[450px]">
                <div class="absolute inset-0 bg-[#007BFF] 
                opacity-10 blur-[120px] rounded-full animate-pulse"></div> <!-- Imagem central simulada pela logo -->
                <img src="img/logo.png" alt="LifeNet"
                    class="w-72 md:w-96 object-contain drop-shadow-[0_0_40px_rgba(0,123,255,0.5)] transform hover:rotate-3 transition duration-700"
                    onerror="this.outerHTML='<i 
                class=\'fa-solid fa-atom text-[200px] text-[#007BFF] text-glow-blue\'></i>'">

                <!-- Card Suporte (Como na imagem) -->
                <div
                    class="absolute bottom-6 right-0 md:right-8 bg-[#0a1122]/95 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl z-20 w-64 border-glow-blue animate-[bounce_5s_infinite]">
                    <div class="flex justify-between items-start mb-3">
                        <p class="text-[#FF8C00] text-[10px] font-bold tracking-[0.2em] uppercase">Suporte Premium</p>
                        <i class="fa-solid fa-headset text-[#007BFF] text-2xl"></i>
                    </div>
                    <p class="text-4xl font-black mb-2">24h</p>
                    <p class="text-[11px] text-gray-400 leading-relaxed">Atendimento todos os dias via WhatsApp</p>
                </div>
            </div>
        </div> <!-- Barra de Benefícios -->
        <div class="gs-reveal bg-card rounded-3xl p-8 grid grid-cols-1 sm:grid-cols-2 
        lg:grid-cols-5 gap-8 border border-white/5">
            <div class="flex items-center gap-4 group cursor-default"> <i
                    class="fa-solid fa-bolt text-[#007BFF] text-4xl w-10 text-center text-glow-blue group-hover:scale-110 transition"></i>
                <div>
                    <h4 class="font-bold text-sm">Ultravelocidade</h4>
                    <p class="text-[10px] text-gray-500 uppercase 
                tracking-wider">Fibra Óptica</p>
                </div>
            </div>
            <div class="flex items-center gap-4 group cursor-default"> <i
                    class="fa-solid fa-shield-halved text-[#FF8C00] text-4xl w-10 text-center text-glow-orange group-hover:scale-110 transition"></i>
                <div>
                    <h4 class="font-bold text-sm">Estabilidade</h4>
                    <p class="text-[10px] text-gray-500 uppercase 
                tracking-wider">Sem Quedas</p>
                </div>
            </div>
            <div class="flex items-center gap-4 group cursor-default"> <i
                    class="fa-solid fa-headset text-[#007BFF] text-4xl w-10 text-center text-glow-blue group-hover:scale-110 transition"></i>
                <div>
                    <h4 class="font-bold text-sm">Suporte 24h</h4>
                    <p class="text-[10px] text-gray-500 uppercase 
                tracking-wider">Humanizado</p>
                </div>
            </div>
            <div class="flex items-center gap-4 group cursor-default"> <i
                    class="fa-solid fa-wifi text-[#FF8C00] text-4xl w-10 text-center text-glow-orange group-hover:scale-110 transition"></i>
                <div>
                    <h4 class="font-bold text-sm">Wi-Fi Grátis</h4>
                    <p class="text-[10px] text-gray-500 uppercase 
                tracking-wider">Dual-Band</p>
                </div>
            </div>
            <div class="flex items-center gap-4 group cursor-default"> <i
                    class="fa-solid fa-lock text-[#007BFF] text-4xl w-10 text-center text-glow-blue group-hover:scale-110 transition"></i>
                <div>
                    <h4 class="font-bold text-sm">Segurança</h4>
                    <p class="text-[10px] text-gray-500 uppercase 
                tracking-wider">Rede Blindada</p>
                </div>
            </div>
        </div> <!-- Seção de Planos -->
        <div id="planos" class="pt-10">
            <p class="text-center text-[#007BFF] font-bold text-xs tracking-[0.3em] uppercase mb-3 gs-reveal">Planos</p>
            <h2 class="text-center text-4xl md:text-5xl font-black mb-12 gs-reveal">Escolha o plano ideal para você
            </h2>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <?php if (count($plans) > 0): ?>
                    <?php foreach($plans as $plan): 
                        $isPopular = $plan['popular'] == 1;
                        $isBestSeller = ($plan['best_seller'] ?? 0) == 1;
                        $hasCustomBadge = !empty($plan['custom_badge']);
                        
                        $borderColorStyle = $isPopular ? 'border-color: #FF8C00;' : ($isBestSeller ? 'border-color: #22c55e;' : ($hasCustomBadge ? 'border-color: ' . htmlspecialchars($plan['custom_badge_color']) . ';' : 'border-color: #007BFF;'));
                        $glowColor = $isPopular ? 'rgba(255,140,0,0.3)' : ($isBestSeller ? 'rgba(34,197,94,0.3)' : ($hasCustomBadge ? htmlspecialchars($plan['custom_badge_color']) . '33' : 'rgba(0,123,255,0.3)'));
                        
                        $bgColorStyle = $isPopular ? 'background: linear-gradient(90deg, #FF8C00 0%, #ff4b00 100%);' : ($isBestSeller ? 'background-color: #22c55e;' : ($hasCustomBadge ? 'background-color: ' . htmlspecialchars($plan['custom_badge_color']) . ';' : 'background-color: #007BFF;'));
                        
                        $textColorStyle = $isPopular ? 'color: #FF8C00; text-shadow: 0 0 15px rgba(255, 140, 0, 0.7);' : ($isBestSeller ? 'color: #22c55e; text-shadow: 0 0 15px rgba(34, 197, 94, 0.7);' : ($hasCustomBadge ? 'color: ' . htmlspecialchars($plan['custom_badge_color']) . '; text-shadow: 0 0 15px ' . htmlspecialchars($plan['custom_badge_color']) . 'b3;' : 'color: #007BFF; text-shadow: 0 0 15px rgba(0, 123, 255, 0.7);'));
                        
                        $btnShadow = $isPopular ? 'box-shadow: 0 0 30px rgba(255,140,0,0.6);' : ($isBestSeller ? 'box-shadow: 0 0 20px rgba(34,197,94,0.5);' : ($hasCustomBadge ? 'box-shadow: 0 0 20px ' . htmlspecialchars($plan['custom_badge_color']) . 'b3;' : 'box-shadow: 0 0 20px rgba(0,123,255,0.5);'));
                        
                        $badgeText = '';
                        $badgeStyle = '';
                        if ($isPopular) {
                            $badgeText = 'Melhor Custo<br>Benefício';
                            $badgeStyle = 'background: linear-gradient(90deg, #FF8C00 0%, #ff4b00 100%);';
                        } else if ($isBestSeller) {
                            $badgeText = 'Mais<br>Vendido';
                            $badgeStyle = 'background-color: #22c55e;';
                        } else if ($hasCustomBadge) {
                            $badgeText = htmlspecialchars($plan['custom_badge']);
                            $badgeStyle = 'background-color: ' . htmlspecialchars($plan['custom_badge_color']) . ';';
                        } else {
                            $badgeText = 'Plano<br>Fibra';
                            $badgeStyle = 'background-color: #007BFF;';
                        }
                    ?>
                    <!-- Plano Dinâmico -->
                    <div class="gs-reveal bg-card border rounded-[2.5rem] p-10 relative flex flex-col justify-between transform lg:-translate-y-6 shadow-2xl hover:-translate-y-9 transition duration-500 z-10"
                         style="<?php echo $borderColorStyle; ?> box-shadow: 0 0 20px <?php echo $glowColor; ?>;">
                        <div class="absolute top-0 right-0 text-white text-[10px] font-black px-6 py-2.5 rounded-bl-2xl rounded-tr-[2.5rem] uppercase tracking-widest leading-tight text-center"
                             style="<?php echo $badgeStyle; ?>">
                            <?php echo $badgeText; ?>
                        </div>
                        <div class="text-center mt-6">
                            <div class="text-6xl font-black mb-2 tracking-tighter" style="<?php echo $textColorStyle; ?>"><?php echo htmlspecialchars($plan['speed']); ?><span class="text-xl" style="<?php echo $isPopular ? 'color:#FF8C00;' : ($isBestSeller ? 'color:#22c55e;' : ($hasCustomBadge ? 'color:'.htmlspecialchars($plan['custom_badge_color']).';' : 'color:#007BFF;')); ?>"> MEGA</span></div>
                            <p class="<?php echo $isPopular ? 'text-white' : ($isBestSeller ? 'text-green-500' : ($hasCustomBadge ? '' : 'text-[#007BFF]')); ?> text-xs font-bold tracking-[0.2em] mb-4 mt-6" style="<?php echo ($hasCustomBadge && !$isPopular && !$isBestSeller) ? 'color:' . htmlspecialchars($plan['custom_badge_color']) . ';' : ''; ?>">POR MÊS</p>
                            <div class="text-5xl font-black mb-3" style="<?php echo ($isPopular || $isBestSeller) ? 'color:#fff;' : ($hasCustomBadge ? 'color:'.htmlspecialchars($plan['custom_badge_color']).';' : 'color:#007BFF;'); ?>">R$ <?php echo htmlspecialchars($plan['price']); ?></div>
                            <p class="text-yellow-500 text-[11px] font-bold uppercase tracking-widest"><?php echo htmlspecialchars($plan['name']); ?></p>
                        </div>
                        <div class="flex justify-center gap-6 my-10"> 
                            <i class="fa-solid fa-wifi text-2xl" style="<?php echo $isPopular ? 'color: #FF8C00; text-shadow: 0 0 15px rgba(255, 140, 0, 0.7);' : ($isBestSeller ? 'color:#22c55e;' : ($hasCustomBadge ? 'color:'.htmlspecialchars($plan['custom_badge_color']).';' : 'color: #007BFF; text-shadow: 0 0 15px rgba(0, 123, 255, 0.7);')); ?>"></i> 
                            <i class="fa-solid fa-bolt text-yellow-500 text-2xl"></i> 
                            <i class="fa-solid fa-gamepad text-2xl" style="<?php echo $isPopular ? 'color: #FF8C00; text-shadow: 0 0 15px rgba(255, 140, 0, 0.7);' : ($isBestSeller ? 'color:#22c55e;' : ($hasCustomBadge ? 'color:'.htmlspecialchars($plan['custom_badge_color']).';' : 'color: #007BFF; text-shadow: 0 0 15px rgba(0, 123, 255, 0.7);')); ?>"></i> 
                            <i class="fa-solid fa-tv text-2xl" style="<?php echo $isPopular ? 'color: #FF8C00; text-shadow: 0 0 15px rgba(255, 140, 0, 0.7);' : ($isBestSeller ? 'color:#22c55e;' : ($hasCustomBadge ? 'color:'.htmlspecialchars($plan['custom_badge_color']).';' : 'color: #007BFF; text-shadow: 0 0 15px rgba(0, 123, 255, 0.7);')); ?>"></i>
                        </div> 
                        <a href="https://wa.me/<?php echo htmlspecialchars($whatsapp); ?>?text=Olá! Quero assinar o plano <?php echo htmlspecialchars($plan['speed']); ?> MEGA por R$ <?php echo htmlspecialchars($plan['price']); ?>." target="_blank" class="w-full text-white font-black py-5 rounded-2xl transition text-center block text-xl" style="<?php echo $bgColorStyle; ?> <?php echo $btnShadow; ?>">Assinar Agora</a>
                    </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <div class="gs-reveal bg-card border border-white/10 rounded-[2.5rem] p-10 col-span-2 text-center flex items-center justify-center">
                        <p class="text-gray-400">Nenhum plano cadastrado no momento. Verifique com nossa equipe.</p>
                    </div>
                <?php endif; ?>

                <!-- Lista de Benefícios (Lateral) -->
                <div
                    class="gs-reveal relative bg-card border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-center">
                    <div
                        class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#050b14] px-6 py-2 rounded-full border border-white/5 shadow-2xl z-10">
                        <p class="text-[#007BFF] font-bold text-[11px] tracking-[0.3em] uppercase m-0">Benefícios</p>
                    </div>
                    <div class="space-y-8 pt-2">
                        <div class="flex 
                        items-start gap-5 group">
                            <div
                                class="w-12 h-12 rounded-2xl bg-[#007BFF]/10 flex items-center justify-center flex-shrink-0 text-[#007BFF] border border-[#007BFF]/20 group-hover:scale-110 transition">
                                <i class="fa-solid fa-calendar-check text-xl"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-sm">Mensalidade
                                    Pré-paga</h4>
                                <p class="text-[11px] text-gray-500 mt-1 leading-relaxed">Controle total dos seus
                                    gastos, sem surpresas no final do mês.</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-5 group">
                            <div
                                class="w-12 h-12 rounded-2xl bg-[#FF8C00]/10 flex items-center justify-center flex-shrink-0 text-[#FF8C00] border border-[#FF8C00]/20 group-hover:scale-110 transition">
                                <i class="fa-solid fa-screwdriver-wrench text-xl"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-sm">Instalação Gratuita</h4>
                                <p class="text-[11px] text-gray-500 mt-1 leading-relaxed">Toda a infraestrutura por
                                    nossa conta para sua conexão brilhar.</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-5 group">
                            <div
                                class="w-12 h-12 rounded-2xl bg-[#007BFF]/10 flex items-center justify-center flex-shrink-0 text-[#007BFF] border border-[#007BFF]/20 group-hover:scale-110 transition">
                                <i class="fa-solid fa-unlock-keyhole text-xl"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-sm">Sem Fidelidade</h4>
                                <p class="text-[11px] text-gray-500 mt-1 leading-relaxed">Fique conosco pela qualidade,
                                    não por contrato.</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-5 group">
                            <div
                                class="w-12 h-12 rounded-2xl bg-[#FF8C00]/10 flex items-center justify-center flex-shrink-0 text-[#FF8C00] border border-[#FF8C00]/20 group-hover:scale-110 transition">
                                <img src="img/icone-roteador.png" alt="Roteador" class="w-8 h-8 object-contain">
                            </div>
                            <div>
                                <h4 class="font-bold text-sm">Roteador em Comodato</h4>
                                <p class="text-[11px] text-gray-500 mt-1 leading-relaxed">Equipamento de alta qualidade
                                    para sua conexão.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div> <!-- Rodapé de Cards (Velocímetro, Cobertura, Atendimento) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 gs-reveal">

            <!-- Velocímetro -->
            <div
                class="bg-card border border-white/5 rounded-[2rem] p-8 text-center flex flex-col justify-between items-center group h-full">
                <div>
                    <h3 class="font-bold text-xl mb-1 text-white">Teste sua velocidade</h3>
                    <p class="text-[10px] text-gray-500 uppercase tracking-widest mb-6">Real-time performance</p>
                </div>

                <div class="relative w-48 h-28 overflow-hidden mb-4">
                    <div id="speed-meter"
                        class="absolute top-0 left-0 w-48 h-48 border-[18px] border-[#0a1122] border-t-[#FF8C00] border-l-[#007BFF] rounded-full rotate-45 transition-transform duration-1000">
                    </div>
                    <div class="absolute bottom-2 left-0 w-full 
                    text-center">
                        <div id="speed-val" class="text-4xl font-black text-glow-blue">0.00</div>
                        <div class="text-[10px] text-gray-500 font-bold uppercase">Mbps</div>
                    </div>
                </div>
                <a href="https://www.speedtest.net/pt" target="_blank" id="btn-speed"
                    class="w-full bg-[#007BFF] hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition shadow-[0_0_15px_rgba(0,123,255,0.4)] text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                    <i class="fa-solid fa-play text-[10px]"></i> Iniciar Teste
                </a>
            </div> <!-- Cobertura -->
            <div id="cobertura"
                class="bg-card border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between group h-full">
                <div>
                    <h3 class="font-bold text-xl mb-1 text-white">Nossa cobertura</h3>
                    <p class="text-[12px] text-gray-400 mb-6 font-medium">Confira se sua região está atendida</p>
                </div>
                <div
                    class="flex-grow flex items-center justify-center mb-6 transition duration-500 drop-shadow-[0_0_30px_rgba(0,123,255,0.4)]">
                    <!-- Imagem do Mapa -->
                    <img src="img/mapa.png" alt="Mapa de Cobertura"
                        class="w-full max-h-36 object-contain hover:scale-105 transition-transform duration-500">
                </div>
                <div class="relative">
                    <input id="input-cobertura" type="text" placeholder="Digite sua cidade ou bairro"
                        class="w-full bg-transparent border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-white/30 transition text-white placeholder-gray-500">
                    <button id="btn-cobertura"
                        class="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-[#007BFF] transition focus:outline-none">
                        <i class="fa-solid fa-magnifying-glass text-lg"></i>
                    </button>
                </div>
            </div> <!-- Atendimento Rápido -->
            <div id="contato"
                class="bg-card border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between h-full">
                <div>
                    <h3 class="font-bold text-xl mb-1 text-white">Atendimento rápido</h3>
                    <p class="text-[10px] text-gray-500 uppercase tracking-widest mb-6">Suporte
                        direto</p>
                </div>
                <div class="space-y-4"> <a href="https://wa.me/<?php echo htmlspecialchars($whatsapp); ?>" target="_blank"
                        class="flex items-center justify-between bg-[#050b14] border border-white/5 p-5 rounded-2xl hover:border-[#25D366]/50 hover:shadow-[0_0_20px_rgba(37,211,102,0.1)] transition group">
                        <div class="flex items-center gap-4">
                            <i class="fa-brands fa-whatsapp text-4xl text-[#25D366] group-hover:scale-110 transition"></i>
                            <div>
                                <h4 class="font-bold text-sm">WhatsApp</h4>
                                <p class="text-[11px] text-gray-500">Suporte Comercial</p>
                            </div>
                        </div>
                        <div class="w-9 h-9 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition">
                            <i class="fa-solid fa-arrow-right text-xs"></i>
                        </div>
                    </a> <a href="<?php echo htmlspecialchars($instagram); ?>" target="_blank"
                        class="flex items-center justify-between bg-[#050b14] border border-white/5 p-5 rounded-2xl hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.1)] transition group">
                        <div class="flex items-center gap-4"> 
                            <i class="fa-brands fa-instagram text-4xl text-pink-500 group-hover:scale-110 transition"></i>
                            <div>
                                <h4 class="font-bold text-sm">Instagram</h4>
                                <p class="text-[11px] text-gray-500">Siga nosso perfil</p>
                            </div>
                        </div>
                        <div class="w-9 h-9 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition">
                            <i class="fa-solid fa-arrow-right text-xs"></i>
                        </div>
                    </a> </div>
            </div>
        </div>

        <!-- Status dos Serviços via Downdetector -->
        <div class="mt-8 bg-card border border-white/5 rounded-[2rem] p-8 gs-reveal shadow-2xl relative overflow-hidden">
            <div class="absolute top-0 left-1/4 w-[350px] h-[250px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none"></div>
            <div class="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-purple-600/4 blur-[100px] rounded-full pointer-events-none"></div>

            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
                <div>
                    <h3 class="font-bold text-2xl text-white mb-1">Status dos Serviços</h3>
                    <p class="text-sm text-gray-400">Verifique se os principais serviços estão funcionando normalmente</p>
                </div>
                <a href="https://downdetector.com.br/" target="_blank" rel="noopener"
                   class="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl transition text-xs font-bold text-gray-300 hover:text-white whitespace-nowrap">
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    Ver tudo no Downdetector
                </a>
            </div>

            <!-- Swiper Carrossel de Serviços -->
            <div class="swiper servicesSwiper relative z-10" id="services-swiper-wrapper">
                <div class="swiper-wrapper" id="service-slides">
                    <!-- Skeleton inicial (1 slide com 10 placeholders) -->
                    <div class="swiper-slide">
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            <?php for($s=0;$s<10;$s++): ?>
                            <div class="animate-pulse bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-4 h-52">
                                <div class="w-28 h-28 rounded-2xl bg-white/10"></div>
                                <div class="h-3 w-20 bg-white/10 rounded"></div>
                                <div class="h-2.5 w-14 bg-white/5 rounded"></div>
                            </div>
                            <?php endfor; ?>
                        </div>
                    </div>
                </div>
                <!-- Navegação -->
                <div class="swiper-button-prev services-prev !text-white !w-9 !h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition after:!text-sm"></div>
                <div class="swiper-button-next services-next !text-white !w-9 !h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition after:!text-sm"></div>
                <!-- Paginação -->
                <div class="swiper-pagination services-pagination !bottom-0 mt-4"></div>
            </div>

            <p class="text-center text-[11px] text-gray-600 mt-8 relative z-10" id="service-footer">
                <i class="fa-solid fa-circle-notch fa-spin mr-1"></i> Verificando status dos serviços...
            </p>
        </div>

        <!-- Estatísticas removidas a pedido do usuário -->
    </div> <!-- Footer -->
    <footer class="border-t 
    border-white/10 bg-[#050b14] pt-16 pb-10 mt-20 gs-reveal">
        <div class="max-w-7xl mx-auto px-6 md:px-12">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                <div> <img src="<?php echo htmlspecialchars($logo_footer); ?>" alt="LifeNet" class="h-14 mb-6" onerror="this.outerHTML='<div class=\'text-2xl font-bold italic mb-6\'><span class=\'text-[#007BFF]\'>Life</span><span 
                    class=\'text-[#FF8C00]\'>Net</span></div>'">
                    <p class="text-xs text-gray-500 leading-relaxed pr-6">Sua melhor escolha em conectividade. Fibra
                        Óptica real, alta performance e o atendimento humano que você sempre quis.</p>
                </div>
                <div>
                    <h4 class="font-bold text-xs uppercase tracking-[0.3em] text-gray-400 mb-6">Navegação</h4>
                    <ul class="text-xs text-gray-500 space-y-3">
                        <li><a href="#" class="hover:text-white transition">Início</a></li>
                        <li><a href="#planos" class="hover:text-white transition">Nossos
                                Planos</a></li>
                        <li><a href="#cobertura" class="hover:text-white transition">Cobertura</a></li>
                        <li><a href="<?php echo htmlspecialchars($portal_link); ?>" target="_blank"
                                class="hover:text-[#FF8C00] transition">Área do Cliente</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-xs uppercase tracking-[0.3em] text-gray-400 mb-6">Suporte</h4>
                    <ul class="text-xs text-gray-500 space-y-3">
                        <li><a href="<?php echo htmlspecialchars($portal_link); ?>" class="hover:text-white transition">- 2ª Via
                                de Boleto</a></li>
                        <li><a href="https://wa.me/<?php echo htmlspecialchars($whatsapp); ?>" class="hover:text-white transition">- Abrir
                                Chamado</a></li>
                        <li><a href="https://wa.me/<?php echo htmlspecialchars($whatsapp); ?>" class="hover:text-white transition">- Status da
                                Rede</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-xs uppercase tracking-[0.3em] text-gray-400 mb-6">Fale Conosco</h4>
                    <ul class="text-xs text-gray-500 space-y-4">
                        <li class="flex items-center gap-3"><i class="fa-brands fa-whatsapp text-[#25D366] text-lg"></i>
                            <?php echo htmlspecialchars($whatsapp); ?></li>
                        <li class="flex items-center gap-3"><i
                                class="fa-regular fa-envelope text-[#007BFF] text-lg"></i> <?php echo htmlspecialchars($email); ?></li>
                        <li class="flex items-start gap-3"><i
                                class="fa-solid fa-location-dot text-[#007BFF] text-lg mt-0.5"></i> <?php echo htmlspecialchars($address); ?></li>
                    </ul>
                </div>
            </div>
            <div
                class="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                <p>© 2026 LifeNet Telecom. Todos os direitos reservados.</p>
                <p class="mt-4 md:mt-0">Desenvolvido com ❤️ para
                    LifeNet MT</p>
            </div>
        </div>
    </footer> <!-- Botão Flutuante Fixo --> <a href="https://wa.me/<?php echo htmlspecialchars($whatsapp); ?>" target="_blank" class="fixed bottom-6 right-6 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(37,211,102,0.6)] hover:scale-110 transition z-[100] animate-bounce">
        <i class="fa-brands fa-whatsapp"></i> </a> <!-- SCRIPTS DE ANIMAÇÃO -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <script>
        // GSAP Revelar Elementos no Scroll
        gsap.registerPlugin(ScrollTrigger); gsap.utils.toArray('.gs-reveal').forEach(function (elem) {
            gsap.to(elem, {
                y: 0, opacity: 1, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: elem, start: "top 90%" }
            });
        });
        // Contadores Animados
        const counts = document.querySelectorAll('.count'); const startCounters = () => {
            counts.forEach(counter => {
                const target = +counter.getAttribute('data-val'); let current = 0; const step = target / 100; const update = () => {
                    current += step; if (current < target) {
                        counter.innerText =
                            Math.ceil(current); setTimeout(update, 15);
                    } else { counter.innerText = target; }
                };
                update();
            });
        };
        ScrollTrigger.create({ trigger: ".count", start: "top 90%", onEnter: startCounters });
        // Velocímetro Animado (Desativado temporariamente para o link externo)
        const btnSpeed = document.getElementById('btn-speed'); const speedVal = document.getElementById('speed-val'); const speedMeter = document.getElementById('speed-meter');
        if (btnSpeed) {
            btnSpeed.addEventListener('click', () => {
                btnSpeed.disabled = true; speedMeter.style.transform = 'rotate(210deg)'; speedVal.innerText = '---';

                const startTime = performance.now();
                const testFile = 'img/mapa.png?cache=' + startTime; // 2.6MB file
                
                fetch(testFile)
                    .then(resp => resp.blob())
                    .then(blob => {
                        const endTime = performance.now();
                        const duration = (endTime - startTime) / 1000;
                        const sizeInBits = blob.size * 8;
                        const speedInBps = sizeInBits / duration;
                        const measuredTarget = Math.min(950, (speedInBps / (1024 * 1024))); // Mbps

                        // Animação com o valor real medido
                        let current = 0; const durationAnim = 2000; const startAnim = performance.now();
                        requestAnimationFrame(function animate(time) {
                            let timeFrac = (time - startAnim) / durationAnim; 
                            if (timeFrac > 1) timeFrac = 1; 
                            let progress = 1 - Math.pow(1 - timeFrac, 3); 
                            let currentVal = progress * measuredTarget;
                            speedVal.innerText = currentVal.toFixed(2);
                            
                            // Mover o ponteiro (0 a 1000 Mbps mapeado para rotate(30deg) a rotate(330deg) aproximadamente)
                            let rotation = 30 + (currentVal / 1000) * 300;
                            speedMeter.style.transform = `rotate(${rotation}deg)`;

                            if (timeFrac < 1) requestAnimationFrame(animate); 
                            else {
                                btnSpeed.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Refazer'; 
                                btnSpeed.disabled = false;
                                
                                // Log do resultado REAL para o Admin
                                const formData = new FormData();
                                formData.append('speed', measuredTarget.toFixed(2) + ' Mbps');
                                fetch('api/speedtest_log.php', { method: 'POST', body: formData }).catch(() => {});
                            }
                        });
                    })
                    .catch(() => {
                        alert('Erro ao realizar teste de velocidade. Verifique sua conexão.');
                        btnSpeed.disabled = false;
                    });
            });
        }
        // Fundo de Partículas Tech
        const canvas = document.getElementById('particles-canvas'); const ctx = canvas.getContext('2d'); canvas.width = window.innerWidth; canvas.height = window.innerHeight; let particles = []; class Particle {
            constructor() {
                this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5; this.speedX = Math.random() * 0.4 - 0.2; this.speedY = Math.random() * 0.4 - 0.2; this.color = Math.random() > 0.5 ? '#007BFF' : '#FF8C00';
            }
            update() {
                this.x += this.speedX; this.y += this.speedY; if (this.x > canvas.width) this.x = 0; if (this.x < 0) this.x = canvas.width; if (this.y > canvas.height) this.y = 0; if (this.y < 0) this.y = canvas.height;
            }
            draw() {
                ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
            }
        }
        for (let i = 0; i < 90; i++) particles.push(new Particle()); function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animate);
        }
        animate(); window.addEventListener('resize', () => { canvas.width = innerWidth; canvas.height = innerHeight; }); </script>
    <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>
    <script>
        const bannerSwiper = new Swiper('.bannerSwiper', {
            loop: true,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        });

        // Script para o Menu Mobile
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileLinks = document.querySelectorAll('.mobile-link');

        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('flex');
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            } else {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            }
        });

        // Fechar menu ao clicar em um link
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('flex');
                mobileMenuBtn.querySelector('i').classList.remove('fa-xmark');
                mobileMenuBtn.querySelector('i').classList.add('fa-bars');
            });
        });

        // Script de Busca de Cobertura (Redirecionamento Zap)
        const btnCobertura = document.getElementById('btn-cobertura');
        const inputCobertura = document.getElementById('input-cobertura');

        function buscarCobertura() {
            const endereco = inputCobertura.value.trim();
            if (endereco === '') {
                alert('Por favor, digite sua cidade ou bairro.');
                return;
            }

            const mensagem = encodeURIComponent(`Olá! Gostaria de saber se tem disponibilidade de internet para: ${endereco}`);
            const link = `https://wa.me/<?php echo $whatsapp; ?>?text=${mensagem}`;
            
            // Log silencioso da tentativa
            fetch('api/coverage_log.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: endereco, found: 1 })
            }).catch(() => {});

            window.open(link, '_blank');
            inputCobertura.value = '';
        }

        btnCobertura.addEventListener('click', buscarCobertura);
        inputCobertura.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                buscarCobertura();
            }
        });

        // Status dos Serviços — carrossel com 10 por página
        async function loadServiceStatus() {
            const slidesContainer = document.getElementById('service-slides');
            const footer = document.getElementById('service-footer');
            if (!slidesContainer) return;

            try {
                const res  = await fetch('api/services_status.php');
                const data = await res.json();

                const cfg = {
                    online:  { dot: 'bg-green-500',  text: 'Normal',   label: 'text-green-400',  border: 'border-green-500/15',  glow: '' },
                    slow:    { dot: 'bg-yellow-400', text: 'Lentidão', label: 'text-yellow-400', border: 'border-yellow-400/20', glow: 'shadow-[0_0_12px_rgba(250,204,21,0.25)]' },
                    offline: { dot: 'bg-red-500',    text: 'Falha',    label: 'text-red-400',    border: 'border-red-500/40',   glow: 'shadow-[0_0_16px_rgba(239,68,68,0.3)]' },
                };

                function buildCard(svc) {
                    const st    = cfg[svc.status] || cfg.online;
                    const pulse = svc.status === 'online' ? 'animate-pulse' : '';
                    const badgeIcon = svc.status === 'offline' ? 'fa-triangle-exclamation' : 'fa-clock';
                    const badgeCls  = svc.status === 'offline' ? 'bg-red-500 text-white' : 'bg-yellow-400 text-black';
                    const badge     = svc.status !== 'online'
                        ? `<span class="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${badgeCls}"><i class="fa-solid ${badgeIcon}"></i></span>`
                        : '';
                    return `
                    <a href="https://downdetector.com.br/status/${svc.slug}/" target="_blank" rel="noopener"
                       class="group bg-[#050b14]/80 border ${st.border} ${st.glow} rounded-2xl p-5 flex flex-col items-center gap-4 transition duration-300 hover:-translate-y-1 hover:border-white/20 cursor-pointer">
                        <div class="relative w-28 h-28 rounded-2xl flex items-center justify-center text-5xl"
                             style="background:${svc.color}20; color:${svc.color};">
                            <i class="${svc.icon}"></i>
                            ${badge}
                        </div>
                        <span class="text-sm font-bold text-white group-hover:text-[#007BFF] transition text-center leading-tight">${svc.name}</span>
                        <div class="flex items-center gap-2">
                            <span class="w-2.5 h-2.5 rounded-full ${st.dot} ${pulse}"></span>
                            <span class="text-xs font-bold ${st.label}">${st.text}</span>
                        </div>
                    </a>`;
                }

                // Renderiza slides
                slidesContainer.innerHTML = '';
                data.pages.forEach(page => {
                    const cards = page.map(buildCard).join('');
                    slidesContainer.innerHTML += `
                    <div class="swiper-slide pb-10">
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            ${cards}
                        </div>
                    </div>`;
                });

                // Inicia o Swiper com autoplay
                new Swiper('.servicesSwiper', {
                    slidesPerView: 1,
                    spaceBetween: 20,
                    loop: true,
                    autoplay: {
                        delay: 5000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    },
                    navigation: {
                        nextEl: '.services-next',
                        prevEl: '.services-prev',
                    },
                    pagination: {
                        el: '.services-pagination',
                        clickable: true,
                        dynamicBullets: true,
                    },
                });

                // Rodapé de status
                if (footer) {
                    const hasIssues = data.pages.flat().some(s => s.status !== 'online');
                    const total     = data.total;
                    footer.innerHTML = hasIssues
                        ? `<i class="fa-solid fa-triangle-exclamation text-yellow-400 mr-1"></i> <span class="text-yellow-400 font-bold">Alguns serviços podem estar com instabilidade.</span> Última verificação: ${data.checked_at} &mdash; <a href="https://downdetector.com.br" target="_blank" class="text-[#007BFF] hover:underline">Ver Downdetector</a>`
                        : `<i class="fa-solid fa-circle-check text-green-500 mr-1"></i> Todos os ${total} serviços estão operacionais. Última verificação: ${data.checked_at} &mdash; <a href="https://downdetector.com.br" target="_blank" class="text-[#007BFF] hover:underline">Ver Downdetector</a>`;
                }

            } catch(e) {
                if (footer) footer.innerHTML = '<i class="fa-solid fa-circle-xmark text-red-400 mr-1"></i> Não foi possível verificar os serviços agora.';
                console.error(e);
            }
        }

        loadServiceStatus();

    </script>
</body>

</html>