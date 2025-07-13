<?php
$apiKey = getenv('GEMINI_API_KEY');

if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'La clave de API no está configurada en el servidor.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$chatHistory = $data['history'];

$apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={$apiKey}";

$payload = [
    'contents' => $chatHistory,
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
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
]);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpcode == 200) {
    header('Content-Type: application/json');
    echo $response;
} else {
    http_response_code($httpcode);
    echo json_encode(['error' => 'Error en la comunicación con la API de Gemini']);
}
?>