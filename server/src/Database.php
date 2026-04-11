<?php
declare(strict_types=1);

class Database {
    public readonly PDO $connection;

    public function __construct(string $dbPath) {
        $this->connection = new PDO(
            dsn: "sqlite:" . $dbPath, 
            options: [
                PDO::ATTR_PERSISTENT => true,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
            ]
        );
        // Enable Write-Ahead Logging (WAL) for significantly better concurrent read performance
        $this->connection->exec('PRAGMA journal_mode = WAL;');
        // Optimize cache and synchronous mode for faster queries
        $this->connection->exec('PRAGMA synchronous = NORMAL;');
        $this->connection->exec('PRAGMA cache_size = -20000;'); // ~20MB
    }
}
