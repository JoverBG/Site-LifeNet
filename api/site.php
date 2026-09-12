<?php
// GET /api/site.php — tudo que a home precisa numa chamada só
// (settings + planos + cobertura + carrossel). Status dos serviços fica
// separado em services_status.php porque é lento (sonda a rede).
require_once __DIR__ . '/_json.php';
json_begin(60);
json_run(function () use ($db) {
    $settings = read_settings($db);
    return [
        'settings'     => $settings,
        'plans'        => read_plans($db, $settings['whatsapp_number']),
        'coverage'     => read_coverage($db),
        'carousel'     => read_carousel($db),
        'generated_at' => gmdate('c'),
    ];
});
