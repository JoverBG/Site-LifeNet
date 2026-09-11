<?php
// GET /api/carrossel.php — banners do topo, em ordem, com URL absoluta
require_once __DIR__ . '/_json.php';
json_begin(60);
json_out(['images' => read_carousel($db)]);
