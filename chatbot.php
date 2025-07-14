<?php

require 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$apiKey = $_ENV['GEMINI_API_KEY'];

if (!$apiKey || trim($apiKey) === '') {
    http_response_code(500);
    echo json_encode(['error' => 'La clave de API no está configurada en el servidor.']);
    exit;
}

// Ya no hay datos de prueba, ahora lee la entrada real desde la petición web.
$raw_input = file_get_contents('php://input');
error_log("Raw input: " . $raw_input);
$data = json_decode($raw_input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Error al decodificar JSON: ' . json_last_error_msg()]);
    exit;
}

$chatHistory = $data['history'] ?? null;

// Si no hay historial, no se puede procesar.
if (empty($chatHistory)) {
    http_response_code(400);
    echo json_encode(['error' => 'No se recibió historial de chat.']);
    exit;
}

$apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={$apiKey}";

$payload = [
    'contents' => $chatHistory,
    // Puedes ajustar la configuración si lo deseas
    'generationConfig' => [
        'temperature' => 0.7,
        'topP' => 1,
        'topK' => 1,
        'maxOutputTokens' => 2048,
    ],
];

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpcode == 200) {
    header('Content-Type: application/json');
    echo $response;
} else {
    http_response_code($httpcode);
    echo json_encode([
        'error_script' => 'Error en la comunicación con la API de Gemini',
        'http_code' => $httpcode,
        'api_response_details' => json_decode($response)
    ]);
}
?>
