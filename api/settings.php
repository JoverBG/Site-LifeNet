<?php
// GET /api/settings.php — configurações públicas do site (whatsapp, logos, links)
require_once __DIR__ . '/_json.php';
json_begin(60);
json_out(read_settings($db));
