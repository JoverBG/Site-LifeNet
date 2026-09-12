<?php
// GET /api/cobertura.php — cidades/bairros atendidos
require_once __DIR__ . '/_json.php';
json_begin(60);
json_run(fn() => ['coverage' => read_coverage($db)]);
