<?php
declare(strict_types=1);

require_once __DIR__ . '/Database.php';

class BibleAPI {
    // PHP 8 Constructor Property Promotion + Dependency Injection
    public function __construct(private readonly Database $db) {
        $this->setHeaders();
    }

    private function sendResponse(int $status, array|object $data = [], ?string $error = null): never {
        http_response_code($status);
        $response = $error !== null ? ['error' => $error] : $data;
        echo json_encode($response, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        exit();
    }

    private function setHeaders(): void {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, OPTIONS");
        header("Content-Type: application/json; charset=UTF-8");
        header("Cache-Control: public, max-age=86400, immutable");

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }

    public function handleRequest(): void {
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            $this->sendResponse(405, error: "Method Not Allowed");
        }

        $basePath = '/api';
        $requestUri = explode('?', $_SERVER['REQUEST_URI'], 2)[0];
        
        $routePos = strpos($requestUri, $basePath);
        $route = $routePos !== false ? substr($requestUri, $routePos + strlen($basePath)) : '/';
        $route = $route ?: '/';

        $parts = explode('/', trim($route, '/'));

        match ($parts[0]) {
            'search' => $this->search(),
            'books' => isset($parts[1]) ? $this->getBooksTranslation($parts[1]) : $this->getBooks(),
            'verses' => $this->getVerses(),
            default => $this->sendResponse(404, error: "Endpoint not found"),
        };
    }

    private function search(): void {
        $term = trim($_GET['query'] ?? '');
        $whereClauses = [];
        $queryParams = [];

        $this->addInFilter('canon', $_GET['canon'] ?? null, $whereClauses, $queryParams);
        $this->addInFilter('bookUsfm', $_GET['books'] ?? null, $whereClauses, $queryParams);
        $this->addInFilter('translation', $_GET['translations'] ?? null, $whereClauses, $queryParams);

        $matchChapter = preg_match('/^(\w+)\s+(\d+)$/', $term, $mc);
        $matchBookChapterVerse = preg_match('/^(\w+)\s+(\d+)(?::|\s+)(\d+)$/', $term, $mbcv);
        $matchChapterVerseOnly = preg_match('/^(\d+):(\d+)$/', $term, $mcvo);

        if ($matchBookChapterVerse) {
            $whereClauses[] = "Verses_fts MATCH ? AND chapter=? AND verse=?";
            array_push($queryParams, "bookName:{$mbcv[1]}*", $mbcv[2], $mbcv[3]);
        } elseif ($matchChapterVerseOnly) {
            $whereClauses[] = "chapter=? AND verse=?";
            array_push($queryParams, $mcvo[1], $mcvo[2]);
        } elseif ($matchChapter) {
            $whereClauses[] = "Verses_fts MATCH ? AND chapter=?";
            array_push($queryParams, "bookName:{$mc[1]}*", $mc[2]);
        } elseif ($term !== '') {
            $formattedTerm = implode(" OR ", explode(" ", $term));
            $whereClauses[] = "Verses_fts MATCH ?";
            $queryParams[] = "{$formattedTerm}*";
        }

        $WHERE = $whereClauses ? "WHERE " . implode(" AND ", $whereClauses) : "";
        $tableName = $matchChapterVerseOnly ? "Verses" : "Verses_fts";

        $selectClause = "*";
        $orderByClause = "bookNumber";
        
        if ($matchChapter || (!$matchChapterVerseOnly && $term !== '')) {
            $selectClause = "*, bm25(Verses_fts, 20, 0, 15, 10, 5, 15, 20, 5) as score";
            $orderByClause = $matchChapter ? "bookName, verse" : "score";
        }

        $countQuery = "SELECT COUNT(*) FROM $tableName $WHERE";
        $stmtCount = $this->db->connection->prepare($countQuery);
        $stmtCount->execute($queryParams);
        $count = $stmtCount->fetchColumn();

        $queryParams[] = 120; // LIMIT
        $query = "SELECT $selectClause FROM $tableName $WHERE ORDER BY $orderByClause LIMIT ?";
        $stmt = $this->db->connection->prepare($query);
        $stmt->execute($queryParams);
        $verses = $stmt->fetchAll();

        $this->sendResponse(200, data: [
            "count" => (int)$count,
            "verses" => $verses
        ]);
    }

    private function getBooks(): void {
        $stmt = $this->db->connection->query("SELECT * FROM Books");
        $this->sendResponse(200, data: $stmt->fetchAll());
    }

    private function getBooksTranslation(string $translation): void {
        $stmt = $this->db->connection->prepare("SELECT * FROM Books WHERE translation = ?");
        $stmt->execute([$translation]);
        $this->sendResponse(200, data: $stmt->fetchAll());
    }

    private function getVerses(): void {
        $bookUsfm = $_GET['bookUsfm'] ?? null;
        $chapter = $_GET['chapter'] ?? null;
        $translation = $_GET['translation'] ?? null;

        if (!$bookUsfm || !$chapter || !$translation) {
            $this->sendResponse(400, error: "Missing required query parameters: bookUsfm, chapter, translation");
        }

        $stmt = $this->db->connection->prepare("SELECT * FROM Verses WHERE translation = ? AND bookUsfm = ? AND chapter = ?");
        $stmt->execute([$translation, $bookUsfm, $chapter]);
        
        $this->sendResponse(200, data: $stmt->fetchAll());
    }

    private function addInFilter(string $column, ?string $value, array &$whereClauses, array &$queryParams): void {
        if (!$value) return;
        $items = array_filter(explode(",", $value));
        if (empty($items)) return;

        $placeholders = implode(",", array_fill(0, count($items), "?"));
        $whereClauses[] = "$column IN ($placeholders)";
        array_push($queryParams, ...$items);
    }
}
