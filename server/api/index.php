<?php
declare(strict_types=1);

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
    echo json_encode(['error' => "Database connection failed: " . $e->getMessage()], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    exit();
}
