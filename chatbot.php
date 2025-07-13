<?php
// Lee la API key de una variable de entorno (más seguro)
$apiKey = getenv('GEMINI_API_KEY');

// Obtiene el historial de la conversación desde la solicitud POST
$data = json_decode(file_get_contents('php://input'), true);
$chatHistory = $data['history'];

// URL de la API de Gemini
$apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={$apiKey}";

// Payload para la API
$payload = [
    'contents' => $chatHistory,
    'generationConfig' => [
        'temperature' => 0.7,
        'topP' => 1,
        'topK' => 1,
        'maxOutputTokens' => 2048,
    ],
];

// Configuración de la solicitud cURL
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
]);

// Ejecuta la solicitud y obtiene la respuesta
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Devuelve la respuesta de la API al cliente
if ($httpcode == 200) {
    header('Content-Type: application/json');
    echo $response;
} else {
    // Manejo de errores
    http_response_code($httpcode);
    echo json_encode(['error' => 'Error en la comunicación con la API de Gemini']);
}
?>
