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
    }
}
