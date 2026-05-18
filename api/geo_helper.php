<?php
// api/geo_helper.php
function getGeoData($ip) {
    if ($ip === '127.0.0.1' || $ip === '::1') {
        // Mock data for local testing
        return [
            'city' => 'Localhost',
            'region' => 'Dev',
            'lat' => -15.793889,
            'lon' => -47.882778
        ];
    }

    try {
        $url = "http://ip-api.com/json/{$ip}";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        $response = curl_exec($ch);
        curl_close($ch);
        
        $data = json_decode($response, true);
        if ($data && $data['status'] === 'success') {
            return [
                'city' => $data['city'] ?? 'Desconhecido',
                'region' => $data['regionName'] ?? '',
                'lat' => $data['lat'] ?? 0,
                'lon' => $data['lon'] ?? 0
            ];
        }
    } catch (Exception $e) {}

    return ['city' => 'Desconhecido', 'region' => '', 'lat' => 0, 'lon' => 0];
}
?>
