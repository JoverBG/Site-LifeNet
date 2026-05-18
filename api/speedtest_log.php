<?php
// api/speedtest_log.php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/geo_helper.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $ip = $_SERVER['REMOTE_ADDR'];
    $geo = getGeoData($ip);
    
    $speed = $_POST['speed'] ?? 'N/A';
    
    $stmt = $db->prepare("INSERT INTO speedtests (ip_address, city, region, latitude, longitude, download_speed) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $ip, 
        $geo['city'], 
        $geo['region'], 
        $geo['lat'], 
        $geo['lon'],
        $speed
    ]);
    
    echo json_encode(["status" => "success"]);
}
?>
