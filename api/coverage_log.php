<?php
// api/coverage_log.php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/geo_helper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $query = $input['query'] ?? '';
    $found = $input['found'] ?? 0;
    
    $ip = $_SERVER['REMOTE_ADDR'];
    $geo = getGeoData($ip);
    
    $stmt = $db->prepare("INSERT INTO coverage_searches (search_query, ip_address, city, region, latitude, longitude, found) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $query,
        $ip,
        $geo['city'],
        $geo['region'],
        $geo['lat'],
        $geo['lon'],
        $found
    ]);
    
    echo json_encode(["status" => "success"]);
}
?>
