<?php
// Local development router for PHP built-in web server
$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

// If the file exists (like an image or CSS), serve it directly
if (file_exists(__DIR__ . $path) && is_file(__DIR__ . $path)) {
    return false; 
}

// If the request starts with /api, route it to our index.php
if (strpos($path, '/api') === 0) {
    require __DIR__ . '/api/index.php';
    return true;
}

// Otherwise, fallback (404)
http_response_code(404);
echo "Not Found";
