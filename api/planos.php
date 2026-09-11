<?php
// GET /api/planos.php — planos com velocidade já formatada (GIGA/MEGA) e link do WhatsApp
require_once __DIR__ . '/_json.php';
json_begin(60);
$settings = read_settings($db);
json_out(['plans' => read_plans($db, $settings['whatsapp_number'])]);
