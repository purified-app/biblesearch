<?php
declare(strict_types=1);

// Prevent PHP from outputting HTML/text warnings that break JSON responses
ini_set('display_errors', '0');
error_reporting(E_ALL);

require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/BibleAPI.php';

$dbPath = __DIR__ . '/../database/bible.db';

if (!file_exists($dbPath)) {
    http_response_code(500);
    echo json_encode(['error' => "Database file not found at " . $dbPath], JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    // Instantiate the database first
    $database = new Database($dbPath);

    // Pass the database instance into the API (Dependency Injection)
    $api = new BibleAPI($database);
    $api->handleRequest();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => "Database error: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => "Internal Server Error: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit();
}
